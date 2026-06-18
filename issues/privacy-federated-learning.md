---
id: privacy-federated-learning
title: Federated learning and its privacy limits
category: privacy
severity: medium
status: active
summary: >-
  Federated learning keeps raw data local but leaks private information through
  model updates, requiring extra defenses like DP and secure aggregation that
  trade off utility
tags:
  - federated-learning
  - privacy
  - differential-privacy
updated: '2026-06-18'
related: []
---

## Problem

Federated learning (FL) trains a shared model across many clients (phones, hospitals, banks) by exchanging model updates instead of raw data. The intuition is that keeping data on-device is inherently private. In practice, the gradients and weight updates clients send are derived from their data and carry recoverable information about it. This is the core gap: data localization is not the same as privacy.

Concretely, several attack classes work against vanilla FL. Gradient inversion (sometimes called deep leakage from gradients) can reconstruct recognizable training examples, including images and text tokens, from a single update, especially with small batch sizes and large per-example signal. Membership inference can determine whether a specific record was in a client's data. Property inference can extract aggregate attributes of a client's distribution that the client never intended to reveal. A malicious or curious central server is the strongest adversary because it sees every client's individual update before aggregation.

This matters most where FL is actually deployed for sensitive data: mobile keyboards and on-device personalization, cross-silo settings in healthcare and finance, and any cross-device setup with many participants and weak per-client trust. The cross-device regime is also where defenses are hardest, because clients are numerous, intermittent, and resource-constrained, so the heavyweight cryptographic and noise-based protections that would close the gap are the most expensive to run.

## Current mitigations

- Secure aggregation: cryptographic protocols (masking-based secure aggregation, and threshold/homomorphic variants) let the server see only the summed update across many clients, never an individual one. This blunts server-side inversion of a single client but does not protect against information leaking through the aggregate itself, and adds communication and dropout-handling overhead.
- Differential privacy: DP-SGD with gradient clipping and calibrated noise, applied either client-side (local DP) or to the aggregate (central/distributed DP), gives a formal `(epsilon, delta)` bound on what any output reveals about a record or client. User-level (client-level) DP is the meaningful unit in FL. Local DP is strong but usually destroys utility at useful epsilons; central DP needs a trusted aggregator or must be combined with secure aggregation.
- Combining DP with secure aggregation (the "distributed DP" line) removes the trusted-server assumption while keeping a central-DP-like privacy/utility tradeoff; discrete Gaussian / Skellam mechanisms make this work over secure-aggregation's modular arithmetic.
- Trusted execution environments (TEEs) on the server or clients to shield updates during aggregation, used in some production stacks as a pragmatic alternative or complement to crypto.
- Engineering hardening that raises the cost of inversion without formal guarantees: larger batches and cohort sizes, less frequent and quantized/compressed updates, and update sparsification.

These get practitioners meaningfully far: a system with user-level central DP plus secure aggregation has both a formal guarantee and no single-update exposure. The catch is that achieving small epsilon at production-quality utility typically requires very large client populations.

## Open gaps

- Real deployments often run with privacy budgets (`epsilon`) far larger than what the formal guarantee meaningfully protects, chosen to preserve accuracy. Interpreting and honestly reporting these epsilons remains unsettled.
- No agreed accounting for the cumulative privacy loss across many training rounds, continual retraining, model release, and downstream fine-tuning of the same client base.
- Robustness and privacy interact badly: defenses against poisoning/backdoors often need to inspect individual updates, which conflicts with secure aggregation and DP that hide them.
- Personalization and FL for large models (on-device LLM fine-tuning) strain current defenses; high-dimensional updates make gradient inversion easier and noise more costly.
- Heterogeneous, non-IID clients make user-level DP noise hit minority clients hardest, raising fairness questions that are not addressed by a single global epsilon.
- Verifiability: clients usually cannot confirm the server actually applied the promised noise or aggregation, and auditing real epsilon empirically (vs. claimed) is immature.

## Watch (2027+)

Expect the credible frontier to be distributed-DP systems where secure aggregation removes the trusted-server assumption and user-level DP provides the formal bound, deployed at population scales large enough to make small epsilons compatible with useful accuracy. Real progress would look like end-to-end systems that report tight, auditable user-level epsilons under honest accounting across the full retraining lifecycle, rather than nominal guarantees with epsilons too large to mean much, plus practical empirical auditing tools that let a third party estimate the privacy actually delivered.

The harder open question is FL for large on-device models and agents, where update dimensionality and continual adaptation amplify leakage and noise costs. Watch for whether composition of secure aggregation, DP, and TEEs can also accommodate poisoning defenses and per-client fairness without each guarantee undermining the others. Standardized benchmarks for leakage (gradient inversion and membership inference) measured against stated epsilons would be a strong signal the field is converging on claims that hold up.
