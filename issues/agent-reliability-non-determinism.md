---
id: agent-reliability-non-determinism
title: Output non-determinism and flaky behaviour
category: agent-reliability
severity: low
status: active
summary: >-
  Identical prompts yield different LLM/agent outputs run-to-run from sampling,
  batching, and floating-point nondeterminism, breaking reproducibility,
  caching, and tests
tags:
  - non-determinism
  - sampling
  - reliability
updated: '2026-06-18'
related: []
---

## Problem

The same prompt sent to the same model can produce different outputs on different runs. The most familiar cause is stochastic decoding: any `temperature > 0` samples from the token distribution, so two calls diverge. But the harder, less obvious problem is that outputs vary even at `temperature = 0` with a fixed seed. Production inference servers batch requests together, and the contents of a batch change which kernels and reduction orders the hardware uses. Floating-point addition is not associative, so different reduction orders give slightly different logits, and a single flipped top token early in generation cascades into a wholly different completion. Mixture-of-experts routing, speculative decoding, prompt-cache hits versus misses, and parallel tensor reductions across GPUs add further sources of run-to-run variance that callers cannot see or control.

This matters because non-determinism breaks the assumptions software is built on. Caching and memoization become unreliable; regression tests turn flaky and get muted, eroding trust in CI; A/B comparisons and evaluation runs produce noise that swamps the effect being measured; and debugging a one-off failure is hard when you cannot reproduce it. In multi-step agents the effect compounds: a small early difference changes which tool is called, which changes all downstream context, so trajectories that should be identical diverge into different outcomes.

It is worst in agentic and tool-using systems where errors accumulate over long horizons, in evaluation and benchmarking pipelines where reproducibility is the whole point, and in regulated or audited settings where "why did the system do this" must be answerable. It is least troublesome in single-shot creative generation, where variation is often desirable.

## Current mitigations

- Greedy decoding (`temperature = 0`, or `top_k = 1`): removes sampling-induced variance and is the cheapest first step, but does not eliminate hardware- and batching-level non-determinism and can degrade quality on tasks that benefit from sampling.
- Fixed seeds and reproducibility flags: many APIs expose a `seed` parameter and return a system fingerprint; libraries offer deterministic-algorithm switches. These help within a fixed stack but break across hardware, driver, library-version, or server-config changes, and are best-effort rather than guaranteed.
- Batch-invariant / deterministic kernels: recent work shows that forcing reduction order to be independent of batch composition can make `temperature = 0` inference bitwise-reproducible. This is the most principled fix but costs throughput and is not yet default in mainstream serving stacks.
- Structured / constrained decoding (JSON schema enforcement, grammar-constrained generation, function-calling APIs): narrows the output space so formatting at least is stable, even when wording varies.
- Robust evaluation and self-consistency: running multiple samples and aggregating (majority vote, pass@k, averaging over seeds) treats variance as a measurable quantity rather than trying to remove it.
- Test design that tolerates variance: asserting on semantic properties, schemas, or LLM-as-judge rubrics instead of exact strings, plus snapshot/golden-trajectory recording and replay for agents.

## Open gaps

- No portable determinism guarantee across providers, model versions, hardware generations, or driver/library updates; reproducibility silently lapses when any of these change.
- Deterministic kernels carry a real throughput cost, so serving providers rarely enable them, and most hosted APIs give callers no determinism guarantee at all.
- Provider-side opacity: batching policy, routing, quantization, and silent model updates are invisible to callers, so even a fixed `seed` cannot guarantee identical results.
- Quantifying acceptable variance is unsolved: there is no standard way to set thresholds for "close enough" outputs or to separate meaningful regressions from sampling noise in CI.
- Long-horizon agent reproducibility lacks tooling; capturing and faithfully replaying a full trajectory (including tool outputs and timing) is still ad hoc.
- Evaluation cost: properly accounting for variance demands many repeated runs, which is expensive and often skipped, producing benchmark numbers that do not replicate.

## Watch (2027+)

The clearest path to progress is determinism becoming a first-class, opt-in product feature of inference platforms rather than a research curiosity: batch-invariant kernels offered as a supported serving mode, explicit reproducibility contracts tied to a versioned model-and-stack fingerprint, and clear documentation of what is and is not guaranteed. Real progress would look like a caller being able to request bitwise-reproducible `temperature = 0` output and get it across a stated hardware and software envelope, with any change to that envelope surfaced explicitly.

In parallel, expect the testing and evaluation ecosystem to mature around variance rather than against it: standard harnesses that report results with confidence intervals over repeated seeds, agent frameworks with built-in trajectory record-and-replay, and conventions for tolerance-based assertions. The likely steady state is a split: latency-sensitive, high-throughput traffic stays non-deterministic by default, while audited, evaluated, or regression-tested workloads run on a determinism mode accepting lower throughput in exchange for reproducibility. The marker of genuine advance is when "I cannot reproduce this run" stops being an accepted excuse for production AI systems.
