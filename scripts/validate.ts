/**
 * Validate the /issues data layer without building. Run in CI before the build
 * so content problems surface with a clear, dedicated error.
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadIssues, validateIssues } from "./lib/issues.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const issuesDir = join(root, "issues");

const issues = loadIssues(issuesDir);
const errors = validateIssues(issues);

if (errors.length) {
  console.error(`✗ ${errors.length} validation error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ ${issues.length} issue(s) valid.`);
