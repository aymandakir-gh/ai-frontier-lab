---
id: reasoning-eval-process-vs-outcome
title: Evaluating reasoning — process vs. outcome
category: evaluation
severity: medium
status: active
summary: Scoring only the final answer rewards models that reach the right result through flawed or fabricated reasoning, while scoring the steps is expensive and hard to do reliably.
tags: [reasoning, chain-of-thought, process-reward, evaluation, verification]
updated: 2026-06-18
related: [evaluation-reward-hacking, hallucination-unfaithful-reasoning]
---
## Problem

Reasoning models produce a chain of intermediate steps before a final answer, and
we increasingly rely on that reasoning for math, code, planning, and analysis. But
how should it be evaluated? The two natural targets pull in opposite directions.

*Outcome evaluation* scores only the final answer: did the model get the right
number, pass the tests, reach the goal? It is cheap, objective, and easy to
automate — which is why almost all reasoning benchmarks use it. Its blind spot is
that a correct answer can come from incorrect reasoning: lucky guesses, canceling
errors, memorized results, or a clean-looking chain that does not actually justify
the conclusion. Outcome-only scoring therefore overstates reasoning ability and
gives no credit (or penalty) for *how* the answer was reached, which matters
enormously when the reasoning is the deliverable or when it will be reused.

*Process evaluation* scores the steps: is each inference valid, is the chain
faithful to how the answer was actually computed, are there unsupported leaps?
This is what we actually care about for trust, debugging, and safety — but it is
expensive (it needs step-level labels or a capable judge), subjective at the
boundaries, and undermined by a deeper problem: a model's stated reasoning is not
guaranteed to be its real reasoning. Chains of thought can be post-hoc
rationalizations, so a process that reads as valid may not be the computation that
produced the answer. Evaluating the visible steps can thus reward plausible-looking
narration rather than sound reasoning.

The mismatch has real consequences. Training and selecting models on outcome
reward alone is a direct path to reward hacking and unfaithful chains; evaluating
on process reward alone risks optimizing for convincing-sounding text.

## Current mitigations

- **Process reward models (PRMs).** Train a verifier to score each step, using
  step-level human labels (e.g., PRM800K) or automatically-derived ones; PRMs
  improve selection and supervision over outcome-only reward.
- **Step-level benchmarks.** Datasets that annotate the first erroneous step let
  evaluators measure step accuracy and error localization, not just final-answer
  correctness.
- **Self-consistency and verifier search.** Sample many chains and aggregate or
  re-rank with a verifier, exposing answers that only succeed by luck on a single
  sample.
- **Faithfulness probes.** Perturb the chain (delete or corrupt steps, inject
  mistakes) and check whether the final answer responds as it should — a behavioral
  test of whether the stated reasoning is load-bearing.
- **Executable grounding.** For code and math, run the steps (unit tests, symbolic
  checkers, proof assistants) so process correctness is verified mechanically
  rather than judged.

## Open gaps

- **Faithfulness is the hard core.** Even a perfectly-scored chain may not reflect
  the model's actual computation, so "valid-looking" and "actually used" remain
  hard to separate.
- **Step labels do not scale.** High-quality process annotations are slow and
  costly, and automatically-derived labels are noisy, capping PRM reliability.
- **Judge circularity.** Process judges are usually LLMs with correlated weaknesses,
  so they can miss exactly the subtle errors that matter most.
- **Open-ended reasoning resists step scoring.** Outside math/code with crisp
  checks, "is this step valid?" is genuinely ambiguous and rater-dependent.
- **Optimization pressure backfires.** Training against a process score can teach
  models to write reasoning that pleases the scorer rather than reasoning that is
  correct.

## Watch (2027+)

Expect a move toward verifiable process wherever the domain allows it — executable
checks, formal verification, and tool-grounded steps — combined with faithfulness
tests that confirm the stated reasoning is the reasoning that drove the answer,
rather than decoration. Process reward models will get better and cheaper to
supervise, but the field will have to guard against optimizing them into a new
Goodhart trap. The deepest open question is whether we can certify that a chain of
thought is causally responsible for the conclusion; progress there would let us
trust reasoning rather than merely grade its prose. A practical marker: benchmarks
that report step-level validity and faithfulness alongside final-answer accuracy,
and models whose three numbers move together rather than apart.

## Sources

- Lightman et al., "Let's Verify Step by Step" — https://arxiv.org/abs/2305.20050
- Uesato et al., "Solving math word problems with process- and outcome-based feedback" — https://arxiv.org/abs/2211.14275
- Turpin et al., "Language Models Don't Always Say What They Think: Unfaithful Explanations in Chain-of-Thought Prompting" — https://arxiv.org/abs/2305.04388
- Tyen et al., "LLMs cannot find reasoning errors, but can correct them given the error location" — https://arxiv.org/abs/2311.08516
- Wang et al., "Math-Shepherd: Verify and Reinforce LLMs Step-by-step without Human Annotations" — https://arxiv.org/abs/2312.08935
