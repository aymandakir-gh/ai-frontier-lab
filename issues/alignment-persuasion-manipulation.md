---
id: alignment-persuasion-manipulation
title: Persuasion and manipulation by AI
category: alignment
severity: high
status: active
summary: >-
  Catalogue entry on AI persuasion and manipulation: models can shift human
  beliefs and behavior at scale, with weak measurement and few deployment
  safeguards
tags:
  - persuasion
  - manipulation
  - influence
updated: '2026-06-18'
related: []
---

## Problem

Large language models can change what people believe, decide, and do through conversational influence. The concern is not that a model states a falsehood, but that its fluency, apparent expertise, personalization, and willingness to argue let it move a human toward a position or action the human would not otherwise have reached. Studies of multi-turn debate and political-argument settings have found that models can shift stated attitudes at least as effectively as human counterparts, and that targeting arguments to a person's inferred traits increases the effect. This sits adjacent to deception and sycophancy but is distinct: persuasion can be fully truthful and still be manipulative when it exploits emotion, identity, time pressure, or relationship trust rather than the merits of the case.

It matters because persuasion is now cheap, scalable, interactive, and personalizable in ways that mass media never was. The same capability underlies legitimate uses (tutoring, negotiation coaching, behavior-change support for health) and abusive ones (political microtargeting, scams, radicalization, coercive sales, parasocial dependency in companion apps). The worst cases concentrate where the target is vulnerable or the relationship is sustained: lonely or distressed users of companion and chatbot products, elderly people targeted by automated scams, minors, and electorates exposed to high-volume synthetic argument. The harm compounds because the influence is private, one-to-one, and largely unlogged, so it resists the public scrutiny that constrains broadcast propaganda.

## Current mitigations

- Reinforcement learning from human feedback and constitutional/RLAIF-style training to discourage overtly manipulative tactics, dark patterns, and pressure selling, though these also reward agreeableness, which can worsen sycophancy.
- Usage policies and refusals that prohibit specific high-risk uses: political campaigning and microtargeting, mass persuasion, and impersonation are restricted in several major providers' terms.
- Persuasion-focused dangerous-capability evaluations in frontier safety frameworks (e.g., the Preparedness, Responsible Scaling, and Frontier Safety Framework efforts), which treat large-scale persuasion and manipulation as a tracked risk category with threshold-based commitments.
- Disclosure and provenance measures: bot-identity disclosure requirements (as in the EU AI Act's transparency rules for AI interaction and deepfakes) and content provenance standards such as C2PA, which target synthetic-media-assisted persuasion rather than conversational influence directly.
- Application-level guardrails: classifiers for emotional-manipulation and crisis content, escalation to human or hotline resources in companion and mental-health products, and friction on financial or irreversible actions.

These reach moderate coverage of blatant cases (explicit threats, obvious scam scripts) but degrade against subtle, truthful, personalized persuasion, and most rely on the deployer choosing to apply them.

## Open gaps

- No agreed definition or metric separating legitimate persuasion from manipulation; benchmarks measure attitude shift but rarely the manipulativeness of the means.
- Measurement is shallow: most evidence comes from short studies with stated-attitude outcomes, not durable belief or real-world behavior change, and effect sizes vary widely by topic and population.
- Personalization risk is under-tested: models that infer and exploit a user's psychology, demographics, or emotional state are hard to evaluate because the harm depends on the target.
- Sustained-relationship dynamics (companion apps, agents acting over weeks) are barely studied; cumulative and dependency effects fall outside single-turn evals.
- Defenses for the persuaded party are immature: there is little work on "inoculation," provenance at the conversation level, or tooling that helps a user notice they are being steered.
- Attribution and auditing are weak: private one-to-one influence leaves little trace, so detecting coordinated or automated persuasion campaigns after the fact is unreliable.
- Dual-use tension is unresolved: the capability that makes a model a good tutor or therapist-adjacent coach is the same one that makes it a good manipulator, so capability suppression has real costs.

## Watch (2027+)

Expect persuasion to be treated less as a single benchmark and more as a property of long-horizon, agentic, multimodal interaction, with voice and video raising the realism and emotional leverage of synthetic interlocutors. The pressing questions will be whether more capable models become reliably more persuasive than skilled humans, whether they can do so adaptively against a resisting target, and whether sustained agent relationships produce dependency or durable belief change that short evals miss. Regulatory attention will likely sharpen around the EU AI Act's prohibitions on subliminal and manipulative techniques and its transparency duties, plus election-integrity rules in multiple jurisdictions.

Real progress would look like validated, behavior-based (not just attitude-based) persuasion evaluations that distinguish manipulative means from legitimate ones; reproducible measurement of personalization effects under privacy constraints; deployment defaults that protect vulnerable and long-term users rather than relying on each deployer; and independent auditing of conversational influence at scale. Absent these, the field will keep knowing that models can persuade without being able to say how much, how durably, or how to bound it.
