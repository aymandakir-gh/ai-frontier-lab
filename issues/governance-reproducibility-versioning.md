---
id: governance-reproducibility-versioning
title: Reproducibility and silent model updates
category: governance
severity: medium
status: active
summary: >-
  Hosted models change behind stable API names without notice, breaking
  experiment reproducibility, eval baselines, and downstream prompt/agent
  pipelines
tags:
  - reproducibility
  - versioning
  - deprecation
updated: '2026-06-18'
related: []
---

## Problem

Most production AI now runs against hosted endpoints reached by a name such as a model alias or an `-latest` tag. The provider can change the weights, system prompt, safety filters, tokenizer, default sampling parameters, or serving stack behind that name at any time, often without a version bump and sometimes without an announcement. A prompt, agent, or evaluation harness that was validated one week can produce materially different outputs the next, even though nothing in the caller's code or configuration changed. This breaks the basic scientific assumption that a fixed input plus a fixed system yields a stable output distribution.

The damage is concentrated in a few places. Reproducibility of published results suffers because a paper that reports numbers against a hosted model usually cannot be re-run later: the snapshot may be deprecated and retired on a short timeline, and even dated snapshots are not guaranteed to be byte-for-byte stable across serving changes. Regression-sensitive pipelines suffer most: agent loops where small phrasing shifts change tool-call decisions, structured-output extraction where format drift breaks parsers, classifiers calibrated to a specific decision boundary, and LLM-as-judge eval setups where the judge itself silently moves. Nondeterminism compounds this; even at `temperature=0`, floating-point non-associativity, batching, and mixture-of-experts routing mean repeated calls are not bit-identical, so a real regression is hard to distinguish from noise.

It matters because teams increasingly treat model output as a dependency without a lockfile. Unlike a pinned package version with a content hash, a model alias offers no integrity guarantee, no changelog granularity, and no rollback once a snapshot is deprecated.

## Current mitigations

- Pinned dated snapshots: most major providers expose explicitly versioned model strings alongside floating aliases. Pinning to a dated snapshot and avoiding `-latest` removes the worst silent-swap surprises, but snapshots are still deprecated on a schedule and are not formally guaranteed bit-stable.
- Open-weight self-hosting: running open-weight models locally or in a controlled environment gives true version control via a fixed checkpoint and hash. This fully solves provenance but trades away frontier capability, scale, and operational simplicity.
- Determinism controls: setting `temperature=0`, fixing seeds where supported, and pinning `max_tokens` and stop sequences reduce variance. These help but do not deliver bit-exact reproducibility on hosted, batched, MoE-served models.
- Regression and eval gates in CI: golden-output snapshot tests, behavioral test suites, and continuous evals (often built on harnesses such as `lm-evaluation-harness`, HELM, or in-house eval sets) catch drift after the fact by re-running a fixed benchmark on each model update.
- Provenance and packaging conventions: model cards, dataset and pipeline tracking (MLflow, Weights & Biases, DVC), and content-addressed artifact stores capture what was used. They document provenance well for self-managed assets but cannot pin a remote model that the caller does not control.
- Output and config logging: persisting the exact model string, parameters, full prompts, and raw responses so that behavior changes are at least detectable and auditable later.

## Open gaps

- No integrity primitive for hosted models: there is no widely adopted equivalent of a lockfile hash or content-addressed identifier that lets a caller assert "I ran against exactly these weights and this serving config."
- Weak change signaling: deprecation timelines and changelogs rarely describe behavioral deltas at a granularity useful for regression triage, and routing or infrastructure changes that affect output may not be surfaced as version events at all.
- Reproducibility-at-rest: dated snapshots are time-limited, so archived experiments become unrunnable; there is no standard escrow or long-term replay guarantee for retired models.
- Drift versus noise: practitioners lack standard statistical tooling to separate a genuine provider-side regression from intrinsic serving nondeterminism, making alerts noisy and easy to dismiss.
- Cross-layer coupling: tokenizer, system-prompt, and safety-filter changes can shift behavior independently of the weights, and these layers are seldom versioned or disclosed together.

## Watch (2027+)

Expect the lockfile analogy to be taken more seriously. Real progress would look like provider-issued, content-addressed model identifiers with integrity guarantees, structured behavioral changelogs tied to version events, and contractual or technical replay windows long enough to support audits and published research. Procurement and regulatory pressure, including model-documentation and traceability expectations emerging from frameworks like the EU AI Act and standardized model-card practices, may push disclosure of when and how a served model changed.

On the tooling side, watch for maturing continuous-eval platforms that treat every silent update as a first-class regression event, paired with statistical drift detection that accounts for serving nondeterminism. The clearest signal of genuine improvement is mundane: a team able to re-run a year-old experiment against the exact served configuration and reproduce its results within a stated tolerance, rather than discovering the snapshot has been retired.
