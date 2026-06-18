---
id: multimodal-hallucination
title: Multimodal hallucination in vision-language models
category: hallucination
severity: high
status: active
summary: Vision-language models describe objects, text, and relationships that are not in the image, defaulting to language priors when perception is uncertain.
tags: [multimodal, vision-language, grounding, perception, hallucination]
updated: 2026-06-18
related: [faithfulness-vs-grounding-in-rag, hallucination-factual-fabrication]
---
## Problem

Vision-language models (VLMs) take an image plus a prompt and produce text. When
the text asserts things the image does not contain — objects that are absent,
attributes that are wrong, spatial relationships that do not hold, or text that
was never in the picture — that is multimodal hallucination. It is the perceptual
analogue of textual fabrication, and it has the same dangerous property: the
output is fluent and confident regardless of whether the model actually saw what
it claims.

A recurring driver is *language prior dominance*. The vision encoder produces a
relatively coarse representation, and the much larger language model has strong
statistical expectations: kitchens contain stoves, streets contain cars, people
hold phones. When the visual signal is weak, ambiguous, or simply unattended, the
model fills the gap with what is usually true rather than what is shown. Object
hallucination (naming things that are not present) is the best-studied case, but
the family is broader: miscounting, inventing on-image text (OCR hallucination),
asserting false relations ("the dog is to the left of the cat"), and confidently
answering questions about regions the model never resolved.

The stakes rise as VLMs move into document understanding, medical imaging triage,
accessibility tools for blind users, robotics, and UI agents that act on what they
"see." A screen agent that hallucinates a button, or a captioning tool that
invents an object for a blind user, causes errors that are hard to catch precisely
because the consumer cannot independently check the image.

## Current mitigations

- **Object/relation-grounded evaluation.** Benchmarks such as POPE (polling-based
  object probing) and CHAIR-style metrics quantify how often a model names absent
  objects, making the failure measurable and trackable across releases.
- **Contrastive and preference fine-tuning.** Train against hallucinated negatives
  (RLHF/DPO with image-grounded rejections, or "hallucination-aware" instruction
  data) so the model is penalized for asserting unseen content.
- **Visual contrastive decoding.** Compare the model's distribution with and
  without the image (or with a degraded image) and suppress tokens that the image
  does not actually support, dampening language-prior takeover at decode time.
- **Higher-resolution / tiled encoding.** Feed more visual detail so fine text,
  small objects, and counts are actually resolvable rather than guessed.
- **Verification and grounding tools.** Route claims through detectors, OCR, or
  region-grounding ("point to where you see it") so assertions can be checked
  against explicit visual evidence.

## Open gaps

- **No reliable perceptual confidence.** VLMs lack a dependable internal signal
  for "I cannot resolve this region," so they answer instead of abstaining.
- **Relations, counting, and negation lag.** Even strong models handle "is there a
  cat?" far better than "how many," "where exactly," and "what is *not* present."
- **Video and temporal hallucination is worse.** Across frames, models invent
  actions, persistence of objects, and cause-effect that the footage never shows.
- **Evaluation is narrow.** Object-presence probes do not capture attribute,
  spatial, or OCR hallucination, so headline scores can overstate grounding.
- **Adversarial and out-of-distribution images.** Unusual layouts, doctored
  photos, and rare compositions trigger prior-driven errors that benchmarks built
  from natural images miss.

## Watch (2027+)

Expect grounding to be pushed earlier into the stack — stronger vision encoders,
region- and pixel-level supervision, and decoding that treats the image as the
authority rather than a weak hint — plus first-class perceptual uncertainty that
lets a model say "I can't make that out." Evaluation should broaden past object
presence to attributes, relations, counting, OCR, and temporal consistency, with
contamination-resistant and adversarial test sets. The highest-stakes frontier is
agentic vision: screen and robot agents that act on perception, where a
hallucinated element becomes a wrong action. A practical marker of progress will be
VLMs whose hallucination rate stays low on small objects, dense text, and
unusual scenes — not just on clean, prototypical images.

## Sources

- Li et al., "Evaluating Object Hallucination in Large Vision-Language Models (POPE)" — https://arxiv.org/abs/2305.10355
- Rohrbach et al., "Object Hallucination in Image Captioning (CHAIR)" — https://arxiv.org/abs/1809.02156
- Leng et al., "Mitigating Object Hallucinations in Large Vision-Language Models through Visual Contrastive Decoding" — https://arxiv.org/abs/2311.16922
- Liu et al., "Mitigating Hallucination in Large Multi-Modal Models via Robust Instruction Tuning (LRV-Instruction)" — https://arxiv.org/abs/2306.14565
- Guan et al., "HallusionBench: An Advanced Diagnostic Suite for Entangled Language Hallucination and Visual Illusion" — https://arxiv.org/abs/2310.14566
