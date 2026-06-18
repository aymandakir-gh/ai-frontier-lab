/**
 * Regression suite for the validator's negative cases.
 *
 * The build only ever sees valid content, so it never exercises the rejection
 * paths — a refactor could silently disable a check (no-stub, broken link,
 * schema) and every build would still pass. These tests feed known-bad input
 * and assert each violation is caught. No test framework; just assertions.
 */
import { validateIssues, type Issue } from "./lib/issues.ts";

const validBody = [
  `## Problem\n${"problem ".repeat(40)}`,
  `## Current mitigations\n- ${"mitigation ".repeat(20)}`,
  `## Open gaps\n- ${"gap ".repeat(20)}`,
  `## Watch (2027+)\n${"outlook ".repeat(30)}`,
].join("\n\n");

function makeIssue(o: Partial<Issue> = {}): Issue {
  const id = o.id ?? "test-entry";
  return {
    id,
    title: "Test entry",
    category: "security",
    severity: "high",
    status: "active",
    summary: "A valid one-line summary.",
    tags: ["test"],
    updated: "2026-06-18",
    related: [],
    body: validBody,
    raw: `---\nid: ${id}\n---\n${validBody}`,
    file: `${id}.md`,
    ...o,
  };
}

let passed = 0;
const failures: string[] = [];

/** Assert the validator output contains (or, with want=false, omits) a substring. */
function expect(name: string, issues: Issue[], needle: string, want = true): void {
  const errors = validateIssues(issues);
  const hit = errors.some((e) => e.includes(needle));
  if (hit === want) {
    passed++;
  } else {
    failures.push(`${name}: expected ${want ? "an error containing" : "NO error containing"} "${needle}"\n    got: ${JSON.stringify(errors)}`);
  }
}

// A clean, valid entry must produce no errors at all.
(() => {
  const errors = validateIssues([makeIssue()]);
  if (errors.length === 0) passed++;
  else failures.push(`valid entry: expected no errors, got ${JSON.stringify(errors)}`);
})();

expect("missing section", [makeIssue({ body: validBody.replace("## Open gaps", "## Nope") })], "missing required section");
expect("bad category", [makeIssue({ category: "nonsense" as Issue["category"] })], "category");
expect("bad severity", [makeIssue({ severity: "huge" as Issue["severity"] })], "severity");
expect("bad status", [makeIssue({ status: "maybe" as Issue["status"] })], "status");
expect("stub marker TODO", [makeIssue({ raw: `${validBody}\nTODO: finish this` })], 'stub marker "TODO"');
expect("stub marker placeholder", [makeIssue({ raw: `${validBody}\nplaceholder` })], 'stub marker "placeholder"');
expect("broken related", [makeIssue({ related: ["does-not-exist"] })], "does not resolve");
expect("self related", [makeIssue({ id: "x", related: ["x"] })], "lists itself");
expect("duplicate id", [makeIssue(), makeIssue()], "duplicate id");
expect("bad date", [makeIssue({ updated: "2026/06/18" })], '"updated" must be YYYY-MM-DD');
expect("id/filename mismatch", [makeIssue({ id: "abc", file: "xyz.md" })], "must match filename");
expect("non-slug id", [makeIssue({ id: "Not A Slug", file: "Not A Slug.md" })], "kebab-case slug");
expect("empty tags", [makeIssue({ tags: [] })], "at least one tag");
expect("thin body", [makeIssue({ body: "## Problem\n## Current mitigations\n## Open gaps\n## Watch (2027+)" })], "too thin");
expect("missing title", [makeIssue({ title: "" })], 'missing "title"');
// And a valid entry must NOT trip the stub scanner on legitimate prose.
expect("legit prose not flagged", [makeIssue({ raw: `${validBody}\nWe use to-do ledgers and reversible tokens.` })], "stub marker", false);

if (failures.length) {
  console.error(`✗ ${failures.length} test(s) failed, ${passed} passed:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ ${passed} validator tests passed.`);
