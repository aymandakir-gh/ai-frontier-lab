---
id: evaluation-agentic-task-eval
title: Evaluating long-horizon agentic tasks
category: evaluation
severity: high
status: active
summary: >-
  Long-horizon agentic tasks are hard to evaluate because reward is sparse and
  outcome-based, environments are non-reproducible, partial progress and process
  quality are hard to score, and benchmarks saturate or get contaminated quickly
tags:
  - agents
  - benchmarks
  - evaluation
updated: '2026-06-18'
related:
  - evaluation-benchmark-contamination
  - evaluation-capability-elicitation
  - evaluation-construct-validity
---

## Problem

Evaluating agents on long-horizon tasks—multi-step workflows that span many tool calls, file edits, web actions, or hours of interaction—is much harder than scoring a single model output. The natural signal is a sparse, binary, outcome-level reward (did the test suite pass, did the PR resolve the issue, did the booking complete), which collapses a long trajectory into one bit and hides where and why the agent failed. Two agents can reach the same final state through wildly different paths, one correct by luck and one robust, yet score identically. Conversely, an agent can make substantial real progress and score zero. This makes per-task variance high and rankings unstable across reruns.

It is worst in stateful, interactive, and open-ended settings: software engineering (`SWE-bench`), web and GUI agents (`WebArena`, `GAIA`), and computer-use tasks. These environments are non-deterministic (live sites change, flaky tests, model sampling), hard to reproduce, and expensive to run. Outcome checkers are brittle: a hidden test may not capture the spec, a string match may reject a valid answer, and reward hacking lets agents pass checks without doing the real task. Public benchmarks also saturate fast and leak into training data, so a rising score may reflect contamination rather than capability. And because trajectories are long, an LLM-as-judge must reason over huge transcripts, where it is least reliable.

## Current mitigations

- Outcome-based functional verification: hidden unit tests and execution-based checks (`SWE-bench`, `SWE-bench Verified`, code-execution harnesses) instead of text matching, giving an objective pass/fail signal.
- Sandboxed, containerized environments (Docker images, pinned dependencies, snapshotted web environments) to improve reproducibility and isolate side effects.
- Process- and trajectory-level scoring: rubric-based grading, step-level checkpoints, and `LLM-as-a-judge` over the trajectory to credit partial progress and assess reasoning quality, not just the endpoint.
- Process reward models (PRMs) and trajectory annotation to localize the first failing step rather than only the final outcome.
- Human expert evaluation and curated/filtered test sets (e.g. `SWE-bench Verified`'s human-validated subset) to remove unsolvable or mislabeled tasks.
- Multiple rollouts with `pass@k` / `pass^k` and averaging over seeds to quantify variance and reliability under stochasticity.
- Contamination controls: held-out and continuously refreshed task sets, private test splits, and time-gated tasks created after model training cutoffs.
- Cost- and budget-aware reporting: tracking tokens, tool calls, wall-clock time, and steps so capability is compared at matched compute.

These get you reliable coarse rankings and good regression detection on well-scoped tasks, but they remain narrow, expensive, and weak on open-ended or genuinely novel work.

## Open gaps

- No robust automatic credit assignment: pinpointing which step caused failure in a long trajectory is still largely manual or unreliable.
- Verifiers are brittle and gameable: writing checkers that fully capture intent without enabling reward hacking is unsolved, and judges drift on long transcripts.
- Reproducibility for live/interactive environments (real websites, external APIs, other agents) is poor; results are hard to replicate across labs and over time.
- Partial-progress and process-quality metrics lack agreed-upon, validated standards; rubric judging is noisy and hard to calibrate.
- Benchmark saturation and contamination outpace benchmark creation; few tasks probe horizons of many hours or days, or true multi-agent coordination.
- Safety and side-effect evaluation (irreversible actions, data exfiltration, unintended state changes) is rarely measured alongside task success.
- Construct validity is weak: high benchmark scores do not reliably predict real-world deployment performance, and cost/reliability are under-reported.

## Watch (2027+)

Expect a shift from static, outcome-only benchmarks toward living, harder-to-saturate evaluation: continuously refreshed task pools, private held-out suites, and tasks deliberately built past model cutoffs to blunt contamination. The most useful progress will be benchmarks that measure success as a function of task horizon and compute budget—reporting reliability (`pass^k`), cost, and time-to-completion rather than a single accuracy number—plus standardized, sandboxed environments that make agentic results reproducible across organizations. Verification itself becomes a research target: stronger process reward models, automated and adversarially-tested checkers, and step-level credit assignment that explains failures rather than only counting them.

Real progress would mean evaluations that predict deployed performance and surface unsafe or irreversible actions, judges validated against human experts on long trajectories, and shared infrastructure where a reported score can be independently rerun and trusted. The likely direction is co-evolution of agents and verifiers—using strong verifiers both to evaluate and to generate training signal—while guarding against the obvious failure mode where agents are optimized to satisfy imperfect checkers rather than to do the underlying work.
