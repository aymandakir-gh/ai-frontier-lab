---
id: alignment-interpretability
title: The interpretability gap
category: alignment
severity: high
status: active
summary: >-
  Modern neural networks remain largely opaque; we cannot reliably read why a
  model produced an output, which blocks trustworthy auditing, debugging, and
  safety guarantees for high-stakes deployment
tags:
  - interpretability
  - mechanistic
  - transparency
updated: '2026-06-18'
related: []
---

## Problem

Frontier models are deployed as functional black boxes: we can observe inputs and outputs, but we cannot reliably explain why a given output was produced in terms of internal computation. A model can pass an eval, ship to production, and then fail in a correlated, surprising way (a jailbreak, a sycophantic agreement, a confidently wrong tool call) with no mechanism to inspect the internal reason. This matters because behavioral testing only covers the inputs you thought to test; without internal access you cannot distinguish a model that genuinely "knows" something from one that has learned a shortcut, nor detect a capability (or a deceptive disposition) that stays dormant until a trigger appears.

The gap is worst exactly where stakes are highest. In agentic and tool-using settings, errors compound across steps and post-hoc rationalizations are cheap, so a model's stated chain-of-thought is not guaranteed to be faithful to the computation that actually drove the action. Two structural features make this hard: superposition, where individual neurons encode many unrelated features, so no single unit has a clean meaning; and polysemanticity and distributed representation, where concepts are smeared across many components. As a result, attributions that look intuitive (an attention map, a salient token) often do not correspond to the causal mechanism.

## Current mitigations

- Sparse autoencoders (SAEs) and dictionary learning to decompose activations into more monosemantic, human-interpretable features, partially addressing superposition.
- Mechanistic interpretability via circuit analysis: activation patching, causal tracing, path patching, and ablations to establish which components causally drive a behavior, plus attribution graphs to trace feature interactions.
- Probing classifiers trained on hidden states to test whether a concept (truthfulness, refusal, a planned action) is linearly decodable.
- Logit lens and the broader `tuned-lens` family for reading intermediate-layer predictions.
- Activation steering / representation engineering, adding feature directions at inference to verify a feature is causal and to control behavior.
- Chain-of-thought monitoring and CoT faithfulness checks (e.g., perturbing the reasoning trace to see if the answer changes) for agentic and reasoning systems.
- SHAP, integrated gradients, and attention visualization as cheap, widely used but only suggestive feature-attribution baselines.

These get you real wins on narrow, well-scoped circuits and specific features, and steering provides a useful causal sanity check. But coverage is tiny relative to model size, results are labor-intensive and often model-specific, and almost none of it yet yields end-to-end guarantees about behavior.

## Open gaps

- No scalable path from feature-level findings to whole-model accounts; circuits are reverse-engineered one behavior at a time.
- SAEs leave significant reconstruction error, feature splitting/absorption issues, and no agreed metric for whether a learned feature is "the real" unit of computation.
- Faithfulness is unsolved: an explanation can be plausible and human-satisfying yet causally wrong, and CoT can be unfaithful or strategically misleading.
- Few quantitative, falsifiable evaluation standards for interpretability claims; much rests on qualitative case studies.
- Detecting deception, sandbagging, or dormant capabilities from internals remains unreliable, which is the safety-critical case.
- Interpretability of long-horizon agents, tool use, and multi-model systems lags far behind single-forward-pass analysis.

## Watch (2027+)

Expect a shift from artisanal, one-circuit-at-a-time studies toward automation: using models to label, validate, and stitch together features at scale, and toward training-time interpretability where models are built to be more decomposable rather than reverse-engineered afterward. Steering and feature-based monitoring are the most likely techniques to move from research demos into production guardrails, and shared benchmarks for SAE quality and circuit faithfulness should start to discipline the field, the way MMLU or SWE-bench disciplined capability claims.

Real progress would look like interpretability that earns operational trust: a monitor that catches a class of jailbreaks or deceptive actions before deployment with measurable, calibrated reliability; faithfulness metrics that practitioners actually report; and at least one frontier-scale behavior explained end to end with a causal account that predicts out-of-distribution failures. The honest baseline to watch against is whether internal-based methods ever beat strong behavioral red-teaming on catching unknown failures, that, more than any single visualization, is what would close the gap.
