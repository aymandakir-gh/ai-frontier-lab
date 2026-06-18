---
id: hallucination-overconfidence
title: Overconfidence and poor calibration
category: hallucination
severity: high
status: active
summary: >-
  LLMs frequently express high confidence in wrong answers, with verbalized and
  token-level confidence poorly tracking actual correctness, especially after
  RLHF and on out-of-distribution or reasoning-heavy tasks
tags:
  - calibration
  - confidence
  - uncertainty
updated: '2026-06-18'
related: []
---

## Problem

Large language models routinely state wrong answers in the same fluent, assured tone they use for correct ones. The core failure is poor *calibration*: the model's expressed confidence — whether read from token probabilities or from verbalized statements like "I'm certain" — does not track the empirical probability that the answer is right. A well-calibrated system that says "90% confident" across many questions should be correct about 90% of the time; deployed chat models often are not, and the gap widens on harder or out-of-distribution inputs.

This matters because confidence is the signal humans and downstream systems use to decide when to trust output, escalate to a person, or stop. Overconfident hallucinations in medical, legal, and financial settings get acted on; in agentic pipelines, an overconfident wrong step propagates silently through later tool calls. The problem is worst in long-form generation (where a single answer bundles many claims of differing reliability), in reasoning chains (a confident-sounding chain-of-thought can rationalize a wrong final answer), and on questions just outside training coverage. Notably, base models are often better calibrated on multiple-choice tasks than their RLHF'd counterparts: preference tuning that rewards helpful, decisive-sounding answers tends to flatten the model's internal uncertainty into uniform confidence, and sycophancy compounds it.

## Current mitigations

- **Verbalized confidence and self-evaluation**: prompting the model to output a probability or to answer "P(True)" on its own response. Cheap and sometimes useful, but the numbers are coarse and themselves miscalibrated, especially post-RLHF.
- **Logprob-based scoring**: using token-level probabilities or sequence likelihood as a confidence proxy. Works reasonably for single-token MCQA answers; weak for free-form text where surface probability conflates fluency with correctness.
- **Sampling-based consistency**: self-consistency, semantic entropy, and ensemble disagreement — sample multiple answers and measure agreement. Semantic entropy in particular detects confabulations well by clustering answers by meaning, at the cost of many extra generations.
- **Post-hoc calibration**: temperature scaling, Platt scaling, and conformal prediction to produce sets/intervals with coverage guarantees. Effective on fixed-format classification; harder to apply to open-ended generation.
- **Training-time approaches**: calibration-aware fine-tuning, teaching models to abstain or say "I don't know," and RLHF/DPO reward signals that penalize confident errors. Reduces but does not eliminate overconfidence and can over-trigger refusals.
- **Grounding and verification**: RAG plus citation/attribution checking, and LLM-as-judge or separate verifier models to flag low-support claims. Shifts the question from "is the model sure" to "is the claim supported," which is often more tractable.

## Open gaps

- No reliable calibration for **long-form, multi-claim** generation; most metrics (ECE, Brier, AUROC) and benchmarks assume a single scorable answer.
- **RLHF degrades calibration** and there is no standard recipe that preserves helpfulness while keeping confidence honest.
- Confidence and uncertainty are entangled: models rarely distinguish *aleatoric* (genuinely ambiguous question) from *epistemic* (model doesn't know) uncertainty, which call for different actions.
- **Distribution shift** breaks calibration silently; a model tuned to be calibrated in-domain gives no warning when inputs move outside it.
- Sampling-based methods (semantic entropy, self-consistency) are accurate but **expensive**, scaling poorly to agentic loops with many steps.
- Weak interpretability link: token probabilities and internal activations are imperfect proxies for the model's actual "belief," and we lack a validated readout of internal confidence.
- Evaluation is fragmented — no widely adopted calibration benchmark for agents or tool use comparable to MMLU/GAIA/SWE-bench for capability.

## Watch (2027+)

Expect calibration to move from a post-hoc add-on toward a first-class training objective, with reward models and preference data that explicitly score *appropriate* confidence and reward well-placed abstention rather than decisiveness. Interpretability work — probing internal representations and sparse-autoencoder features that correlate with truthfulness or uncertainty — is the most promising route to a cheap, real-time confidence readout that does not require resampling, and progress would look like a probe that reliably predicts error on out-of-distribution inputs without per-task retuning.

Real progress would be measurable and decision-relevant: standardized calibration benchmarks for long-form and agentic settings, confidence that degrades gracefully and visibly under distribution shift, and abstention behavior that improves end-to-end task outcomes (fewer confident errors acted on) rather than just lowering an aggregate calibration metric. The likely near-term win is selective prediction — systems that know when to defer to a human or a verifier — well before models achieve honest fine-grained probabilities across open-ended generation.
