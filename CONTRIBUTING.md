# Contributing to AI Frontier Lab

Thanks for helping keep this catalogue accurate and current. The whole project
is generated from one data layer — `issues/*.md` — so contributing is mostly
about writing one good markdown file.

## The one rule

**One pull request adds or edits one entry** under `issues/`. Keep PRs focused;
that makes them easy to review and keeps the history clean.

## Anatomy of an entry

Each entry is a markdown file named `issues/<id>.md`, where `<id>` is a
kebab-case slug that also appears in the frontmatter. The frontmatter is a
machine-readable contract — its JSON Schema is published at
[`issues.schema.json`](https://aymandakir-gh.github.io/ai-frontier-lab/issues.schema.json).

```markdown
---
id: my-entry-id              # kebab-case; must equal the filename
title: A short, specific title
category: security           # one of the ten categories (see below)
severity: high               # low | medium | high | critical
status: active               # active | partially-mitigated | emerging
summary: One machine-readable sentence (≤ 240 chars).
tags: [a-tag, another-tag]   # at least one
updated: 2026-06-18          # YYYY-MM-DD
related: []                  # ids of related entries (must resolve)
---
## Problem
What concretely goes wrong, why it matters, and where it is worst.

## Current mitigations
- What practitioners do today, and how far it gets you.

## Open gaps
- What remains genuinely unsolved.

## Watch (2027+)
The forward-looking outlook: where this is heading and what would count as
real progress.
```

The four section headings are required, verbatim.

**Categories:** `hallucination`, `evaluation`, `agent-reliability`, `privacy`,
`cost`, `security`, `alignment`, `robustness`, `data`, `governance`.

## Quality bar

- **Be accurate.** Reference real, established techniques and benchmarks by
  name. **Do not fabricate statistics, paper titles, author names, or specific
  numbers** — qualitative and correct beats precise and invented.
- **Be concrete and neutral.** No hype, no doom, no marketing. Plain technical
  English.
- **No stubs.** The build rejects `TODO`/`TBD`/`placeholder`/`coming soon` and
  similarly incomplete markers.

## Before you open a PR

```bash
npm install
npm run validate   # schema, required sections, no stubs, resolvable links
npm run build      # generates dist/ and fails on any broken internal link
npm run serve      # preview at http://localhost:8080
```

If `validate` and `build` pass locally, CI will pass too — the build is
deterministic. CI runs `typecheck · validate · build` on every PR.

## License

By contributing you agree your work is licensed under the project's
[MIT License](./LICENSE).
