---
id: hallucination-context-conflict
title: 'Context-memory conflict: overriding provided context'
category: hallucination
severity: low
status: active
summary: >-
  In grounded/RAG settings, models sometimes override correct provided context
  with conflicting parametric (memorized) knowledge, producing answers
  ungrounded in the supplied source
tags:
  - rag
  - grounding
  - context
updated: '2026-06-18'
related: []
---

## Problem

In retrieval-augmented generation (RAG) and other grounded settings, a model is given source text in context and asked to answer from it. Context-memory conflict is the failure mode where the model's parametric ("memorized") knowledge contradicts the provided context, and the model sides with its memory instead of the supplied passage. The result looks fluent and confident but is not grounded in the source the user actually trusts.

This matters most when the ground truth has changed or is private. Examples: updated documentation, a corrected policy, a recently revised price, a numerical figure in an internal report, or a deliberately counterfactual test passage. The model "knows" the older or more common value from pretraining and silently overrides the correct, freshly retrieved one. It is worst when the context value is rare, surprising, or contradicts a strong statistical prior (a well-known entity's attribute, a famous date, a canonical definition), and when the conflicting context appears buried mid-document rather than at the start. The reverse error also exists — over-trusting wrong or adversarial context — so the goal is calibrated deference, not blind obedience.

Although typically lower-severity than fabricated citations, it quietly erodes the core promise of RAG: that grounding the model fixes staleness. A retrieval pipeline can fetch the right passage and the generator can still answer wrong.

## Current mitigations

- Prompt-level instructions that explicitly prioritize provided context ("answer only from the sources below; if the context conflicts with what you know, defer to the context").
- Grounded/cite-as-you-go prompting that forces span-level quotation or per-claim citation, so unsupported memory-based claims become visible and easier to catch.
- Faithfulness and attribution evaluation: NLI-based entailment checks between answer and source, and judge-style or reference-based metrics (e.g., RAGAS-style faithfulness/answer-relevance scoring, LLM-as-judge) to flag ungrounded spans.
- Counterfactual/knowledge-conflict stress tests that swap a context value for one contradicting parametric knowledge and measure how often the model follows the context.
- Training-side methods: instruction tuning and preference optimization (RLHF, DPO) on grounded-QA data, and context-faithfulness fine-tuning that rewards deference to provided evidence.
- Pipeline guardrails: post-hoc verification that re-checks each claim against retrieved chunks, abstention/"not in context" options, and surfacing citations to the user so a human can verify.

These reduce the rate substantially on clear cases but do not eliminate it, especially for rare or counterintuitive context values where the prior is strong.

## Open gaps

- No reliable, general control knob for context-versus-memory trust. Prompting helps but is brittle, and the right behavior is conditional (defer to trusted context, distrust adversarial context) rather than uniform.
- Faithfulness metrics catch unsupported claims but struggle with subtle conflicts where the answer is plausible and partially grounded, and they inherit the blind spots of the NLI or judge model used.
- Poor calibration: models rarely signal that an answer rests on memory rather than the supplied source, so the conflict is invisible at inference time.
- Mechanistic understanding is thin. Interpretability work (e.g., sparse autoencoders, attention/circuit analysis) has begun probing where retrieved tokens compete with stored facts, but there is no robust way to read out or steer which source won.
- Long-context dilution: as supplied context grows, adherence to specific in-context facts degrades, interacting with "lost in the middle" position effects.
- Multi-source conflict (two retrieved passages disagreeing, or context disagreeing with the conversation history/memory) is under-specified — it is unclear what correct behavior even is without provenance and recency signals.

## Watch (2027+)

Expect progress to come less from better prompts and more from training and architecture that make trust an explicit, conditioned variable. Likely directions include provenance- and recency-aware grounding (the model reasons about who said it and when, rather than treating all context as equally authoritative), faithfulness objectives baked into preference optimization, and inference-time steering informed by interpretability — identifying the internal features that mediate context-versus-memory competition and adjusting them directly. Calibrated abstention, where the model declines or flags low-grounding answers, would be a concrete sign of maturity.

Real progress would look like benchmarks that jointly measure deference to correct context, resistance to adversarial or wrong context, and honest abstention — with models holding up on rare and counterintuitive values and at long context lengths, not just easy cases. The harder, still-open target is conflict resolution across multiple disagreeing sources, which requires representations of trust and evidence that current systems largely lack.
