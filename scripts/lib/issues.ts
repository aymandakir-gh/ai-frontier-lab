/**
 * The data layer: load and validate every issue under /issues.
 *
 * Each issue is one markdown file with YAML frontmatter (machine-readable) plus
 * a body that must contain the four canonical sections. This module is the
 * single source of truth for the schema and is shared by `validate` and `build`,
 * so the site can never be generated from data that fails validation.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import matter from "gray-matter";

export const CATEGORIES = [
  "hallucination",
  "evaluation",
  "agent-reliability",
  "privacy",
  "cost",
  "security",
  "alignment",
  "robustness",
  "data",
  "governance",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const STATUSES = ["active", "partially-mitigated", "emerging"] as const;
export type Status = (typeof STATUSES)[number];

/** Human-readable labels for categories (used in nav, badges, filters). */
export const CATEGORY_LABELS: Record<Category, string> = {
  hallucination: "Hallucination",
  evaluation: "Evaluation gaps",
  "agent-reliability": "Agent reliability",
  privacy: "Privacy",
  cost: "Cost & efficiency",
  security: "Security",
  alignment: "Alignment",
  robustness: "Robustness",
  data: "Data & provenance",
  governance: "Governance",
};

export interface Issue {
  id: string;
  title: string;
  category: Category;
  severity: Severity;
  status: Status;
  summary: string;
  tags: string[];
  updated: string;
  related: string[];
  /** Markdown body (everything after the frontmatter). */
  body: string;
  /** Raw file contents, for stub-marker scanning. */
  raw: string;
  /** Source filename, for error messages. */
  file: string;
}

/** Section headings every entry must contain, in this order is not required but presence is. */
export const REQUIRED_SECTIONS = [
  "Problem",
  "Current mitigations",
  "Open gaps",
  "Watch (2027+)",
] as const;

const STUB_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\bTODO\b/i, label: "TODO" },
  { re: /\bTBD\b/i, label: "TBD" },
  { re: /\bFIXME\b/i, label: "FIXME" },
  { re: /\bXXX\b/, label: "XXX" },
  { re: /lorem ipsum/i, label: "lorem ipsum" },
  { re: /coming soon/i, label: "coming soon" },
  { re: /placeholder/i, label: "placeholder" },
  { re: /\.\.\.\s*stub/i, label: "...stub" },
  { re: /\bwrite me\b/i, label: "write me" },
];

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Load every issue file (no validation). Throws only on unreadable input. */
export function loadIssues(dir: string): Issue[] {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();
  const issues: Issue[] = [];
  for (const file of files) {
    const raw = readFileSync(join(dir, file), "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;
    issues.push({
      id: typeof fm.id === "string" ? fm.id : "",
      title: typeof fm.title === "string" ? fm.title : "",
      category: fm.category as Category,
      severity: fm.severity as Severity,
      status: fm.status as Status,
      summary: typeof fm.summary === "string" ? fm.summary : "",
      tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
      // YAML parses an unquoted `2026-06-18` into a Date; normalize back to the
      // YYYY-MM-DD string form so authors can write the natural date literal.
      updated:
        fm.updated instanceof Date
          ? fm.updated.toISOString().slice(0, 10)
          : typeof fm.updated === "string"
            ? fm.updated
            : String(fm.updated ?? ""),
      related: Array.isArray(fm.related) ? (fm.related as string[]) : [],
      body: parsed.content.trim(),
      raw,
      file: basename(file),
    });
  }
  return issues;
}

/**
 * Validate the whole set. Returns a list of human-readable errors (empty = OK).
 * Enforces the frontmatter schema, the required sections, referential integrity
 * of `related`, and a zero-stub-marker policy.
 */
export function validateIssues(issues: Issue[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const i of issues) {
    const where = i.file;
    const expectedFile = `${i.id}.md`;

    if (!i.id) errors.push(`${where}: missing "id"`);
    else if (!ID_RE.test(i.id)) errors.push(`${where}: id "${i.id}" must be a kebab-case slug`);
    else if (i.file !== expectedFile) errors.push(`${where}: id "${i.id}" must match filename (expected ${expectedFile})`);

    if (ids.has(i.id)) errors.push(`${where}: duplicate id "${i.id}"`);
    ids.add(i.id);

    if (!i.title) errors.push(`${where}: missing "title"`);
    if (!CATEGORIES.includes(i.category)) errors.push(`${where}: category "${i.category}" not in {${CATEGORIES.join(", ")}}`);
    if (!SEVERITIES.includes(i.severity)) errors.push(`${where}: severity "${i.severity}" not in {${SEVERITIES.join(", ")}}`);
    if (!STATUSES.includes(i.status)) errors.push(`${where}: status "${i.status}" not in {${STATUSES.join(", ")}}`);
    if (!i.summary) errors.push(`${where}: missing "summary"`);
    else if (i.summary.length > 240) errors.push(`${where}: summary too long (${i.summary.length} > 240 chars)`);
    if (!i.tags.length) errors.push(`${where}: at least one tag is required`);
    if (!DATE_RE.test(i.updated)) errors.push(`${where}: "updated" must be YYYY-MM-DD (got "${i.updated}")`);

    for (const section of REQUIRED_SECTIONS) {
      const re = new RegExp(`^##\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
      if (!re.test(i.body)) errors.push(`${where}: missing required section "## ${section}"`);
    }

    // Each section should carry real content, not just a heading.
    if (i.body.replace(/^#.*$/gm, "").trim().length < 400) {
      errors.push(`${where}: body is too thin to be a researched entry (<400 chars of prose)`);
    }

    for (const { re, label } of STUB_PATTERNS) {
      if (re.test(i.raw)) errors.push(`${where}: contains stub marker "${label}"`);
    }
  }

  // Referential integrity: every `related` id must resolve to a real entry.
  for (const i of issues) {
    for (const rel of i.related) {
      if (!ids.has(rel)) errors.push(`${i.file}: related id "${rel}" does not resolve to an existing issue`);
      if (rel === i.id) errors.push(`${i.file}: issue lists itself in "related"`);
    }
  }

  return errors;
}

/** Load + validate; throw a single aggregated error if anything is wrong. */
export function loadValidIssues(dir: string): Issue[] {
  const issues = loadIssues(dir);
  const errors = validateIssues(issues);
  if (errors.length) {
    throw new Error(`Issue validation failed (${errors.length} error(s)):\n  - ${errors.join("\n  - ")}`);
  }
  return issues;
}
