# AI Frontier Lab

A living, open catalogue of **real, current AI problems** — the concrete open
challenges practitioners and researchers are actually working on, not hype and
not doom. Each entry states the problem, the mitigations that exist today, the
gaps that remain, and a forward-looking **Watch (2027+)** outlook.

The catalogue spans hallucination, evaluation gaps, agent reliability, privacy,
cost & efficiency, security, alignment, robustness, data & provenance, and
governance.

## How it works

Everything is generated from a machine-readable data layer:

```
issues/<id>.md      one markdown file per problem (YAML frontmatter + 4 sections)
scripts/build.ts    static site generator (issues → /dist)
scripts/validate.ts schema + content validation
dist/issues.json    the full dataset, published for tools to consume
```

Each `issues/*.md` file looks like:

```markdown
---
id: hallucination-factual-fabrication
title: Factual fabrication in LLM outputs
category: hallucination
severity: high
status: active
summary: One-sentence, machine-readable description.
tags: [grounding, factuality, rag]
updated: 2026-06-18
related: [evaluation-benchmark-contamination]
---
## Problem
...
## Current mitigations
...
## Open gaps
...
## Watch (2027+)
...
```

The **build is the verification gate**. It refuses to ship if any entry fails
its schema, is missing a required section, contains a stub marker
(`TODO`/`TBD`/`placeholder`/…), or links to something that does not exist.

## Develop

```bash
npm install
npm run typecheck   # type-check the generator
npm run validate    # validate the /issues data layer
npm run build       # generate /dist
npm run serve       # preview at http://localhost:8080
```

## Contributing

Open a pull request that adds or edits **one** file under `/issues`. Keep claims
concrete and avoid fabricated statistics — qualitative and accurate beats
precise and invented.

## License

[MIT](./LICENSE). Reuse the data and the generator freely.
