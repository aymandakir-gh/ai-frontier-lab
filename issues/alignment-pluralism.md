---
id: alignment-pluralism
title: Whose values? Pluralistic alignment
category: alignment
severity: medium
status: active
summary: >-
  Aligning a single model to one fixed value set misrepresents the diversity of
  human values across cultures and individuals, and current preference-tuning
  methods bake in the majority or annotator viewpoint
tags:
  - values
  - pluralism
  - alignment
updated: '2026-06-18'
related: []
---

## Problem

Most deployed alignment pipelines optimize a model toward a single, aggregated notion of "helpful and harmless." Techniques like `RLHF` and `DPO` train against a reward signal derived from preference data, and that data is collected from a narrow pool of annotators under one rater guideline. The result is a model that encodes a particular value profile — often skewing toward the norms of the annotation vendor's labor pool, the lab's policy team, and the dominant language and culture in the training corpus. When such a model is asked about contested topics (politics, religion, bioethics, acceptable speech, family structure, end-of-life decisions), it produces answers that read as neutral but in fact embed specific normative commitments.

This matters because there is no single correct value to align to. Genuine disagreement among reasonable people is a permanent feature of human societies, not a bug to be averaged away. Majority-vote aggregation of preferences silently overrides minority views, and a globally deployed assistant exports one region's norms to users elsewhere. The harm is worst in high-stakes, value-laden, culturally variable domains and for underrepresented groups whose perspectives are diluted in preference data — and it is compounded when the same base model is reused everywhere, creating monoculture in the values that billions of interactions are filtered through.

## Current mitigations

- **Constitutional AI / explicit principle documents** — encoding values as a written, auditable set of principles rather than implicit annotator taste; makes the value commitments inspectable and editable.
- **System prompts and steerable personas** — letting deployers or users specify behavior at inference time so one base model can serve different value contexts.
- **Model specs / published behavior policies** — labs documenting intended default behavior so the embedded values are at least transparent and contestable.
- **Pluralistic preference modeling** — research directions that model distributions over preferences or condition reward models on annotator identity, rather than collapsing to a single scalar reward.
- **Distributional and disaggregated evaluation** — reporting per-group disagreement instead of average accuracy; benchmarks probing political leaning, cultural value coverage, and refusal patterns across topics.
- **Diverse and demographically broadened annotation pools**, plus disagreement-aware labeling that keeps rater disagreement as signal instead of discarding it.
- **Per-deployment fine-tuning and adapters** to localize behavior for a jurisdiction, organization, or community.

These get you transparency and some steerability, but they mostly relocate the decision rather than solve it: someone still writes the constitution, sets the defaults, and decides which steers are permitted.

## Open gaps

- No principled, legitimate way to decide *whose* values become the default when steering is absent or when users conflict with each other.
- Aggregating heterogeneous preferences into one reward is theoretically fraught; scalar reward models cannot represent incommensurable values without a chosen weighting.
- Steerability is double-edged — the same mechanism that serves pluralism enables persuasion, sycophancy, and easy ideological capture or jailbreaks.
- Hard to distinguish legitimate value pluralism from genuinely harmful content; "let the user pick" has limits that no current method draws cleanly.
- Evaluation is immature: most value benchmarks are Western-centric, English-centric, and easy to game; cross-cultural coverage is thin and translation introduces its own bias.
- Process legitimacy is unsolved — who participates, with what representation, and with what recourse — making current choices feel like private policy decisions rather than accountable ones.
- Tension with safety and legal constraints: some values cannot be honored simultaneously, and the model has no transparent way to surface or arbitrate the conflict.

## Watch (2027+)

Expect a shift from one-model-one-value toward explicitly conditioned and composable alignment: reward models and policies that take a declared value context as input, community- or jurisdiction-level adapters, and clearer separation between non-negotiable safety floors and an adjustable normative layer above them. Participatory methods — structured deliberation, citizens'-assembly-style input, and democratic-input pipelines feeding model specs — will likely move from pilots to recurring practice, and interpretability work may help locate and audit where value commitments actually live inside a model.

Real progress would look like: benchmarks that report calibrated disagreement across genuinely diverse populations rather than single accuracy numbers; steerability that is robust against manipulation while still honoring legitimate pluralism; and transparent, contestable governance over the default value profile, so the choice of "whose values" is made through an accountable process rather than buried in annotation guidelines. The unsolved core — legitimacy of the aggregation procedure — is a political and institutional problem as much as a technical one, and the credible direction is better mechanisms for choosing, not a claim to have found the right answer.
