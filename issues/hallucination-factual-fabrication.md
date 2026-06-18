---
id: hallucination-factual-fabrication
title: Factual fabrication in LLM outputs
category: hallucination
severity: high
status: active
summary: Language models state false facts — invented citations, quotes, APIs, and figures — fluently and confidently, with no built-in signal of uncertainty.
tags: [grounding, factuality, rag, calibration, citations]
updated: 2026-06-18
related: [evaluation-benchmark-contamination]
---
## Problem

Large language models generate text by predicting plausible continuations, not
by consulting a verified store of facts. When the training signal for "what
sounds right" diverges from "what is true," the model produces fluent, confident
falsehoods: fabricated paper titles and DOIs, misattributed quotes, non-existent
library functions, invented legal citations, and wrong-but-specific numbers.

The danger is not that models are wrong — every system is sometimes wrong — but
that the *form* of the output gives no signal of its reliability. A fabricated
citation is formatted exactly like a real one. This breaks the normal human
heuristic of trusting confident, well-structured prose, and it scales: a single
model serves millions of queries, so a systematic blind spot becomes a
systematic error.

Fabrication is worst in the long tail (rare entities, recent events, niche APIs),
under distribution shift, and when the prompt presupposes a false premise the
model is reluctant to contradict.

## Current mitigations

- **Retrieval-augmented generation (RAG).** Ground answers in retrieved
  documents so the model quotes sources instead of recalling them. Reduces
  fabrication on covered topics but introduces its own failure modes:
  retrieval misses, and the model can still ignore or misread retrieved context.
- **Citation and attribution.** Require the model to cite spans of source
  documents and verify that cited text actually supports the claim
  (attribution/NLI checks). Catches unsupported statements after the fact.
- **Abstention and calibration.** Train or prompt models to say "I don't know"
  and to expose confidence; sample-consistency methods (asking the same question
  several ways and checking agreement) flag low-confidence answers.
- **Tool use.** Route factual sub-questions to calculators, code execution,
  search, or databases — the model orchestrates rather than recalls.
- **Self-checking and verifier passes.** A second pass (or a separate model)
  critiques the draft, re-derives claims, or runs the generated code.

## Open gaps

- **No reliable intrinsic uncertainty.** Token probabilities are poorly
  calibrated for factuality, and post-hoc confidence is itself often
  hallucinated. There is no dependable internal "I might be making this up"
  signal.
- **Grounding is not faithfulness.** Even with correct documents in context,
  models paraphrase inaccurately, over-generalize, or cite the right source for
  the wrong claim.
- **Verification doesn't scale to open-ended claims.** Attribution works for
  extractive answers; it is far weaker for synthesis, reasoning chains, and
  claims with no single source.
- **Premise correction is socially hard.** Models trained to be helpful resist
  contradicting a confidently-wrong user, trading truth for agreeableness.

## Watch (2027+)

Expect uncertainty to become a first-class output rather than an afterthought:
models that natively emit calibrated confidence and abstain on the long tail,
trained against verifier reward rather than only human preference. Retrieval and
generation will fuse more tightly, with the model deciding *when* to retrieve and
treating its own parametric memory as one source among several to be checked.
The harder, longer-horizon problem is faithful synthesis — being right about
claims that no single document settles — which likely needs advances in
verification and reasoning, not just bigger models. A practical near-term marker
of progress: production systems that can quantify and report their own factual
error rate per domain, instead of presenting all answers with equal confidence.
