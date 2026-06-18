---
id: synthetic-data-model-collapse
title: Synthetic data and model collapse
category: data
severity: medium
status: emerging
summary: As AI-generated text floods the web and training pipelines lean on synthetic data, models trained on model output risk losing diversity and degrading over generations unless real data is preserved.
tags: [synthetic-data, model-collapse, data-quality, distribution, training]
updated: 2026-06-18
related: [data-provenance-and-licensing, robustness-distribution-shift]
---
## Problem

The supply of high-quality human text is finite, while the appetite of frontier
training runs is not. Two trends push training toward synthetic (model-generated)
data: deliberate use of synthetic data to fill gaps and teach skills, and
unavoidable contamination of the web with AI-generated content that future crawls
will scrape. Both raise the same risk: training models on the output of models.

The failure mode is *model collapse*. When a model learns from another model's
samples rather than from the real distribution, it tends to over-represent the
common, high-probability modes and under-represent the tails. Successive
generations amplify this: rare events, minority dialects, unusual styles, and
long-tail facts thin out and eventually disappear, while the model's outputs become
more uniform, more confidently average, and less faithful to the true distribution.
Variance shrinks first (the tails go), then the mean itself can drift. The model
forgets that the rare things ever existed, because nothing in its training signal
still represents them.

This matters beyond a research curiosity. The public web — the substrate of
pretraining — is increasingly AI-written, so even "real" crawls are partly
synthetic and hard to filter. Synthetic data is also genuinely useful (it can teach
reasoning, cover scarce domains, and avoid privacy issues), so the answer is not
simply "never use it." The hard part is using it without quietly eroding the
diversity and tail coverage that make models robust and broadly knowledgeable —
and detecting that erosion before it shows up as degraded real-world behavior.

## Current mitigations

- **Preserve and anchor on real data.** Keep a substantial fraction of verified
  human data in every training mix; analyses suggest accumulating real data
  alongside synthetic (rather than replacing it) avoids the worst collapse.
- **Provenance and AI-content filtering.** Track data origin and attempt to detect
  and down-weight machine-generated text in crawls, so synthetic contamination is
  bounded — though reliable detection is itself unsolved.
- **Quality, diversity, and verification gates.** Curate synthetic data with
  filtering, deduplication, difficulty/diversity sampling, and correctness checks
  (e.g., executable verification for code/math) rather than training on raw model
  output.
- **Grounded generation.** Produce synthetic data conditioned on real sources,
  tools, or environments so it injects genuine signal instead of recycling the
  model's priors.
- **Distributional monitoring.** Track output diversity, tail coverage, and
  calibration across model generations to catch shrinking variance early.

## Open gaps

- **AI-content detection is unreliable.** There is no dependable way to identify and
  filter machine-generated text at web scale, so contamination of pretraining data
  is hard to prevent.
- **No agreed safe ratio.** How much synthetic data, of what quality, is safe in a
  mix is empirical and task-dependent; there is no principled threshold.
- **Collapse is gradual and easy to miss.** Tail loss may not show on standard
  benchmarks until it manifests as brittleness or lost knowledge in deployment.
- **Curated synthetic data still narrows.** Even filtered synthetic data can encode
  the source model's blind spots and stylistic biases, subtly homogenizing
  successors.
- **Provenance does not survive the web.** Once content is published, copied, and
  re-scraped, origin labels are lost, undermining filtering at the point it matters.

## Watch (2027+)

Expect data curation to become as important as model architecture, with explicit
mixing policies that bound synthetic content, durable provenance signals, and
distributional monitors that watch for shrinking diversity across model
generations. Synthetic data will be increasingly grounded — generated against
tools, simulators, and verified sources so it adds real signal — rather than free
sampling from a prior. The open systemic question is the health of the public web
as a training substrate as AI text saturates it; preserving access to verified
human data and to tail diversity may become a strategic concern. A practical marker
of progress: training pipelines that demonstrably maintain tail coverage and output
diversity over successive model generations, instead of regressing toward a blander
mean.

## Sources

- Shumailov et al., "The Curse of Recursion: Training on Generated Data Makes Models Forget (Model Collapse)" — https://arxiv.org/abs/2305.17493
- Shumailov et al., "AI models collapse when trained on recursively generated data" (Nature, 2024) — https://www.nature.com/articles/s41586-024-07566-y
- Gerstgrasser et al., "Is Model Collapse Inevitable? Breaking the Curse of Recursion by Accumulating Real and Synthetic Data" — https://arxiv.org/abs/2404.01413
- Dohmatob et al., "A Tale of Tails: Model Collapse as a Change of Scaling Laws" — https://arxiv.org/abs/2402.07043
- Briesch et al., "Large Language Models Suffer From Their Own Output: An Analysis of the Self-Consuming Training Loop" — https://arxiv.org/abs/2311.16822
