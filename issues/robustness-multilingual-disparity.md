---
id: robustness-multilingual-disparity
title: Performance disparity across languages
category: robustness
severity: high
status: active
summary: >-
  Large language models perform substantially worse on non-English and
  especially low-resource languages, producing lower accuracy, weaker reasoning,
  and higher token costs that compound into fairness and access harms
tags:
  - multilingual
  - fairness
  - robustness
updated: '2026-06-18'
related:
  - robustness-adversarial-inputs
  - robustness-distribution-shift
  - robustness-prompt-sensitivity
---

## Problem

Large language and multimodal models deliver markedly uneven quality across languages. Performance is strongest in English and a handful of high-resource languages (e.g. Chinese, Spanish, French, German), degrades for mid-resource languages, and collapses for the long tail of low-resource and under-digitized languages such as many African, South Asian, and indigenous languages. The same model that reasons reliably in English may produce factual errors, broken grammar, code-switching artifacts, or refusals in Swahili, Amharic, Burmese, or Quechua. This shows up across capabilities at once: knowledge recall, multi-step reasoning, instruction following, safety behavior, and tool use all degrade together, and a common pattern is that the model internally "thinks" in English and translates, losing nuance and cultural grounding.

Why it matters: the gap is not cosmetic. It determines who can use these systems for education, healthcare triage, legal access, and government services. Safety is also unevenly distributed — guardrails trained largely on English are easier to bypass in lower-resource languages, so harmful content elicitation and jailbreaks succeed more often there. The disparity is worst exactly where digital text is scarcest, which correlates with already-marginalized populations, making it a fairness problem rather than a mere coverage gap.

A compounding, often-overlooked harm is tokenization inequity. Byte-pair and similar tokenizers are fit predominantly on English-heavy corpora, so non-Latin scripts and morphologically rich languages fragment into far more tokens per sentence. That inflates latency, shrinks the effective context window, and raises per-request cost for speakers of those languages — an economic penalty layered on top of the quality penalty.

## Current mitigations

- Multilingual pretraining and data balancing: deliberately upsampling non-English corpora, mining web-scale multilingual data (e.g. CommonCrawl-derived sets, OSCAR-style corpora), and oversampling low-resource languages to counteract the natural skew.
- Cross-lingual transfer and instruction tuning: SFT, RLHF, and DPO on translated or natively authored multilingual instruction data so alignment generalizes beyond English; methods like multilingual instruction tuning exploit shared representations.
- Translate-then-process pipelines: machine-translating queries into English, running inference, and translating back — a pragmatic boost that nonetheless erases cultural context and propagates MT errors.
- Tokenizer improvements: larger, more balanced vocabularies and script-aware tokenization to reduce token inflation for non-Latin scripts.
- Retrieval augmentation (RAG) over in-language corpora to inject local knowledge the base model lacks.
- Evaluation benchmarks to expose the gap: multilingual MMLU variants, FLORES / NLLB translation sets, XTREME, XNLI, Belebele, AfriMMLU/AfriBench-style efforts, and red-teaming across languages to surface safety asymmetries.

These get meaningful gains for high- and mid-resource languages, but for the true long tail they are bottlenecked by data scarcity and evaluation blind spots.

## Open gaps

- Genuine scarcity: many languages have little or no high-quality digital text, and synthetic or translated data inherits English framing and translationese rather than native pragmatics.
- Cultural and factual grounding: models lack local entities, idioms, legal/medical norms, and worldviews; "correct" answers are often anglocentric.
- Safety asymmetry: alignment and refusal behavior remain far weaker in low-resource languages, leaving an exploitable attack surface.
- Evaluation is thin and often itself translated, so benchmark scores overstate real competence; dialects, diglossia, and non-standard orthographies are barely measured.
- Tokenization fairness has no clean fix — vocabulary budget is finite, so improving one script can regress others.
- Dialectal and oral-tradition languages, plus low-resource ASR/TTS for speech interfaces, are largely unaddressed.

## Watch (2027+)

Expect progress to come less from raw scale and more from targeted data and architecture work: community-sourced and government-backed native corpora, better synthetic-data pipelines that preserve cultural grounding rather than translating from English, and morphology- or byte-level tokenization approaches that shrink the token-cost penalty. Regionally specialized and sovereign models — built by and for specific language communities — are likely to outperform general frontier models on their target languages and will pressure large labs to close gaps. Real progress would be measured by parity on natively authored (not translated) benchmarks, symmetric safety and refusal behavior across languages, and near-equal token efficiency across scripts.

The harder, slower frontier is the genuine long tail and oral languages, where the binding constraint is data that does not exist yet. Credible advances here will involve speech-first and multimodal collection, transfer from related languages, and honest reporting of per-language capability and safety rather than a single aggregate score. A field that routinely publishes disaggregated, native-language evaluations — and treats tokenization equity as a first-class metric — would signal the problem is being taken seriously rather than averaged away.
