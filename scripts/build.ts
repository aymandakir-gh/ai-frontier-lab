/**
 * Static site generator for ai-frontier-lab.
 *
 * Reads the validated /issues data layer and emits a self-contained static site
 * into /dist: a filterable catalogue index, one page per issue, an about page,
 * and a machine-readable artifact (issues.json).
 *
 * The build is the verification gate: it loads issues through loadValidIssues
 * (which throws on any schema/section/stub/reference error) and then checks that
 * every internal link in the generated HTML resolves to a real output file.
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, rmSync, writeFileSync, copyFileSync, readdirSync, statSync } from "node:fs";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import {
  loadValidIssues,
  CATEGORIES,
  CATEGORY_LABELS,
  SEVERITIES,
  STATUSES,
  type Issue,
  type Category,
} from "./lib/issues.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const issuesDir = join(root, "issues");
const srcDir = join(root, "src");
const outDir = join(root, "dist");

const SITE_TITLE = "AI Frontier Lab";
const SITE_TAGLINE = "A living, open catalogue of real, current AI problems.";
const REPO_URL = "https://github.com/aymandakir-gh/ai-frontier-lab";
const SITE_URL = "https://aymandakir-gh.github.io/ai-frontier-lab";

const md = new MarkdownIt({ html: false, linkify: true, typographer: true }).use(anchor, {
  permalink: anchor.permalink.headerLink(),
});

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Split a body into a map of "## Heading" -> markdown under it. */
function splitSections(body: string): Map<string, string> {
  const out = new Map<string, string>();
  let current: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (current !== null) out.set(current, buf.join("\n").trim());
  };
  for (const line of body.split("\n")) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      flush();
      current = m[1]!;
      buf = [];
    } else if (current !== null) {
      buf.push(line);
    }
  }
  flush();
  return out;
}

/** Nav links shared by every page. `rel` is "" at the root, "../" under /issues. */
function navLinks(rel: string, active: string): string {
  return [
    ["index.html", "Catalogue"],
    ["frontier.html", "Frontier 2027+"],
    ["about.html", "About"],
  ]
    .map(([href, label]) => `<a href="${rel}${href}"${active === href ? ' aria-current="page"' : ""}>${label}</a>`)
    .join("");
}

function layout(opts: { title: string; description: string; rel: string; path: string; body: string; active?: string }): string {
  const base = opts.rel;
  const canonical = `${SITE_URL}/${opts.path}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)}</title>
<meta name="description" content="${esc(opts.description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(opts.title)}">
<meta property="og:description" content="${esc(opts.description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:site_name" content="${esc(SITE_TITLE)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(opts.title)}">
<meta name="twitter:description" content="${esc(opts.description)}">
<link rel="stylesheet" href="${base}styles.css">
</head>
<body>
<header class="site-header">
  <a class="brand" href="${base}index.html">AI&nbsp;Frontier&nbsp;Lab</a>
  <nav>${navLinks(base, opts.active ?? "")}</nav>
  <a class="repo" href="${REPO_URL}" rel="noopener">Source</a>
</header>
<main>
${opts.body}
</main>
<footer class="site-footer">
  <p>Open, MIT-licensed. Machine-readable data: <a href="${base}issues.json">issues.json</a>.
  Contributions welcome on <a href="${REPO_URL}" rel="noopener">GitHub</a>.</p>
</footer>
</body>
</html>`;
}

function badge(kind: string, value: string, label?: string): string {
  return `<span class="badge badge-${kind} badge-${kind}-${value}">${esc(label ?? value)}</span>`;
}

function issueCard(i: Issue): string {
  const tags = i.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  return `<article class="card" data-category="${i.category}" data-severity="${i.severity}" data-search="${esc((i.title + " " + i.summary + " " + i.tags.join(" ")).toLowerCase())}">
  <div class="card-meta">${badge("cat", i.category, CATEGORY_LABELS[i.category])}${badge("sev", i.severity)}</div>
  <h3><a href="issues/${i.id}.html">${esc(i.title)}</a></h3>
  <p>${esc(i.summary)}</p>
  <div class="tags">${tags}</div>
</article>`;
}

function renderIndex(issues: Issue[]): string {
  const byCat = new Map<Category, number>();
  for (const i of issues) byCat.set(i.category, (byCat.get(i.category) ?? 0) + 1);
  const catChips = CATEGORIES.filter((c) => byCat.has(c))
    .map(
      (c) =>
        `<button class="chip" data-filter-category="${c}">${esc(CATEGORY_LABELS[c])} <span class="count">${byCat.get(c)}</span></button>`,
    )
    .join("");
  const sevChips = SEVERITIES.map(
    (s) => `<button class="chip chip-sev" data-filter-severity="${s}">${esc(s)}</button>`,
  ).join("");
  const cards = issues
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(issueCard)
    .join("\n");

  return `<section class="hero">
  <h1>${esc(SITE_TITLE)}</h1>
  <p class="tagline">${esc(SITE_TAGLINE)}</p>
  <p class="lede">Every entry states the problem, what mitigations exist today, where the open gaps still are, and what to watch from 2027 onward. ${issues.length} entries and counting.</p>
</section>
<section class="controls">
  <input type="search" id="search" placeholder="Search ${issues.length} entries — title, summary, tags…" aria-label="Search entries" autocomplete="off">
  <div class="chips" role="group" aria-label="Filter by category"><button class="chip chip-all is-active" data-filter-category="">All</button>${catChips}</div>
  <div class="chips" role="group" aria-label="Filter by severity">${sevChips}</div>
</section>
<section id="results" class="grid">
${cards}
</section>
<p id="empty" class="empty" hidden>No entries match your filters.</p>
<script src="app.js" defer></script>`;
}

function renderIssue(i: Issue, byId: Map<string, Issue>): string {
  const tags = i.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  const related = i.related
    .map((r) => byId.get(r))
    .filter((x): x is Issue => Boolean(x))
    .map((r) => `<li><a href="${r.id}.html">${esc(r.title)}</a> <span class="muted">— ${esc(CATEGORY_LABELS[r.category])}</span></li>`)
    .join("");
  const relatedBlock = related
    ? `<section class="related"><h2>Related entries</h2><ul>${related}</ul></section>`
    : "";
  return `<article class="entry">
  <p class="crumb"><a href="../index.html">← All entries</a></p>
  <div class="card-meta">${badge("cat", i.category, CATEGORY_LABELS[i.category])}${badge("sev", i.severity)}${badge("status", i.status, i.status)}</div>
  <h1>${esc(i.title)}</h1>
  <p class="summary">${esc(i.summary)}</p>
  <div class="tags">${tags}</div>
  <div class="prose">
${md.render(i.body)}
  </div>
  ${relatedBlock}
  <p class="updated muted">Last updated ${esc(i.updated)} · <a href="../issues.json">data</a></p>
</article>`;
}

function renderAbout(issues: Issue[]): string {
  return `<section class="prose about">
<h1>About AI Frontier Lab</h1>
<p>${esc(SITE_TAGLINE)} It is a structured, citable map of where today's AI systems still fall short — not hype, not doom, just the concrete open problems practitioners and researchers are actually working on.</p>
<h2>How an entry is structured</h2>
<p>Each entry is one markdown file with machine-readable frontmatter and four sections:</p>
<ul>
  <li><strong>Problem</strong> — what goes wrong and why it matters.</li>
  <li><strong>Current mitigations</strong> — what practitioners do about it today, and how far it gets you.</li>
  <li><strong>Open gaps</strong> — what remains unsolved.</li>
  <li><strong>Watch (2027+)</strong> — the forward-looking outlook.</li>
</ul>
<h2>Data layer</h2>
<p>The site is generated from <code>/issues/*.md</code>. The full dataset is published as <a href="issues.json">issues.json</a>, and the frontmatter contract is published as a <a href="issues.schema.json">JSON Schema</a> — so the catalogue is consumable and validatable by tools, not just humans. The build refuses to ship if any entry fails its schema, is missing a section, contains a stub marker, or links to something that does not exist.</p>
<h2>Categories</h2>
<ul>${CATEGORIES.map((c) => `<li>${esc(CATEGORY_LABELS[c])}</li>`).join("")}</ul>
<h2>Contributing</h2>
<p>Add or improve an entry by opening a pull request that adds or edits one file under <code>/issues</code>. Keep claims concrete and avoid fabricated statistics. The current catalogue holds ${issues.length} entries.</p>
<h2>License</h2>
<p>MIT. Reuse the data and the generator freely.</p>
</section>`;
}

function renderFrontier(issues: Issue[]): string {
  const items = issues
    .map((i) => ({ i, watch: splitSections(i.body).get("Watch (2027+)") ?? "" }))
    .filter((x) => x.watch.length > 0)
    .sort((a, b) => a.i.title.localeCompare(b.i.title))
    .map(
      ({ i, watch }) => `<section class="frontier-item">
  <div class="card-meta">${badge("cat", i.category, CATEGORY_LABELS[i.category])}</div>
  <h2><a href="issues/${i.id}.html">${esc(i.title)}</a></h2>
  <div class="prose">${md.render(watch)}</div>
</section>`,
    )
    .join("\n");
  return `<section class="hero">
  <h1>Frontier — what to watch from 2027</h1>
  <p class="lede">The forward-looking outlook from every entry, gathered in one place: where each problem is likely heading, which bets might pay off, and what would count as real progress.</p>
</section>
${items}`;
}

/** Verify every internal (relative, non-anchor) link in generated HTML resolves. */
function checkLinks(pages: Array<{ path: string; html: string }>, outputFiles: Set<string>): string[] {
  const errors: string[] = [];
  for (const { path, html } of pages) {
    const dir = dirname(path);
    const hrefs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]!);
    for (const href of hrefs) {
      if (/^(https?:)?\/\//.test(href) || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("data:")) {
        continue;
      }
      const clean = href.split("#")[0]!.split("?")[0]!;
      if (!clean) continue;
      const target = join(dir, clean);
      if (!outputFiles.has(target)) {
        errors.push(`${path.replace(outDir + "/", "")}: broken internal link "${href}"`);
      }
    }
  }
  return errors;
}

function listFiles(dir: string, acc: Set<string>): void {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) listFiles(p, acc);
    else acc.add(p);
  }
}

function main(): void {
  const issues = loadValidIssues(issuesDir);
  const byId = new Map(issues.map((i) => [i.id, i]));

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, "issues"), { recursive: true });

  const pages: Array<{ path: string; html: string }> = [];
  const write = (rel: string, html: string) => {
    const path = join(outDir, rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, html);
    pages.push({ path, html });
  };

  write(
    "index.html",
    layout({ title: `${SITE_TITLE} — current AI problems`, description: SITE_TAGLINE, rel: "", path: "index.html", active: "index.html", body: renderIndex(issues) }),
  );
  write(
    "frontier.html",
    layout({ title: `Frontier 2027+ — ${SITE_TITLE}`, description: "The forward-looking outlook across every catalogued AI problem.", rel: "", path: "frontier.html", active: "frontier.html", body: renderFrontier(issues) }),
  );
  write(
    "about.html",
    layout({ title: `About — ${SITE_TITLE}`, description: "How the AI Frontier Lab catalogue is structured.", rel: "", path: "about.html", active: "about.html", body: renderAbout(issues) }),
  );
  for (const i of issues) {
    write(
      `issues/${i.id}.html`,
      layout({ title: `${i.title} — ${SITE_TITLE}`, description: i.summary, rel: "../", path: `issues/${i.id}.html`, body: renderIssue(i, byId) }),
    );
  }

  const dataset = issues.map((i) => ({
    id: i.id,
    title: i.title,
    category: i.category,
    severity: i.severity,
    status: i.status,
    summary: i.summary,
    tags: i.tags,
    related: i.related,
    updated: i.updated,
    url: `issues/${i.id}.html`,
    watch_2027: splitSections(i.body).get("Watch (2027+)") ?? "",
  }));
  writeFileSync(join(outDir, "issues.json"), JSON.stringify({ generated: dataset.length, entries: dataset }, null, 2));
  // Lightweight index for client-side / external search tooling.
  writeFileSync(
    join(outDir, "search-index.json"),
    JSON.stringify(
      dataset.map(({ id, title, category, severity, summary, tags, url }) => ({ id, title, category, severity, summary, tags, url })),
    ),
  );

  // Published JSON Schema for an entry's frontmatter — derived from the same
  // enums the validator uses, so the contract can never drift from the build.
  const schema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `${SITE_URL}/issues.schema.json`,
    title: "AI Frontier Lab issue frontmatter",
    description: "Frontmatter contract for one /issues/*.md entry.",
    type: "object",
    required: ["id", "title", "category", "severity", "status", "summary", "tags", "updated"],
    additionalProperties: false,
    properties: {
      id: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
      title: { type: "string", minLength: 1 },
      category: { enum: [...CATEGORIES] },
      severity: { enum: [...SEVERITIES] },
      status: { enum: [...STATUSES] },
      summary: { type: "string", minLength: 1, maxLength: 240 },
      tags: { type: "array", minItems: 1, items: { type: "string" } },
      updated: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
      related: { type: "array", items: { type: "string" } },
    },
  };
  writeFileSync(join(outDir, "issues.schema.json"), JSON.stringify(schema, null, 2));

  copyFileSync(join(srcDir, "styles.css"), join(outDir, "styles.css"));
  copyFileSync(join(srcDir, "app.js"), join(outDir, "app.js"));
  writeFileSync(join(outDir, ".nojekyll"), "");

  // Discoverability: a sitemap of every generated page + a permissive robots.txt.
  const urls = pages
    .map((p) => `${SITE_URL}/${p.path.replace(outDir + "/", "")}`)
    .sort()
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join("\n");
  writeFileSync(
    join(outDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  writeFileSync(join(outDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  const outputFiles = new Set<string>();
  listFiles(outDir, outputFiles);
  const linkErrors = checkLinks(pages, outputFiles);
  if (linkErrors.length) {
    console.error(`✗ ${linkErrors.length} broken internal link(s):`);
    for (const e of linkErrors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`✓ Built ${pages.length} page(s) from ${issues.length} issue(s) → dist/`);
}

main();
