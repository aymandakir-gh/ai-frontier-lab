---
id: security-model-backdoors
title: Backdoors and trojaned models
category: security
severity: medium
status: active
summary: >-
  Catalogue entry on backdoored/trojaned ML models: data- and weight-level
  triggers planted via the supply chain that survive fine-tuning, with current
  detection mitigations, open gaps, and 2027+ outlook
tags:
  - backdoor
  - trojan
  - supply-chain
updated: '2026-06-18'
related:
  - security-data-poisoning
  - security-ml-supply-chain
  - security-agent-permissions
---

## Problem

A backdoored (trojaned) model behaves normally on ordinary inputs but produces an attacker-chosen output when a specific trigger is present. The classic data-poisoning form, demonstrated in the BadNets line of work, plants a visual or textual pattern during training so that, for example, a stop-sign classifier reads a sticker-marked sign as a speed limit, or a text classifier flips sentiment on inputs containing a rare token. More recent work shows the same effect can be embedded directly in published weights, in instruction-tuning data, in LoRA/adapter deltas, and even hidden behind a "deployment context" trigger so the model acts benignly during evaluation and maliciously in production.

This matters because modern pipelines assemble models from untrusted parts: base checkpoints pulled from public hubs, community fine-tunes, scraped pretraining corpora, third-party RLHF/preference data, and serialized artifacts. A poisoned upstream component compromises every downstream system that inherits it, which makes this a supply-chain problem rather than a single-model problem. Insecure serialization formats compound it — `pickle`-based checkpoints can execute arbitrary code on load, so "trojaned model" sometimes means code execution at load time, not just a logic trigger.

The worst exposure is where models gate real decisions and the trigger is controllable by the adversary: malware/spam/abuse classifiers, content moderation, biometric and fraud screening, autonomous-driving perception, and agentic LLMs with tool access where a trigger can unlock disallowed actions. Backdoors are stealthy by design — clean-data accuracy is preserved, so standard validation passes — and only a small fraction of poisoned samples is typically needed to implant one.

## Current mitigations

- **Provenance and integrity controls**: model/dataset cards, signed artifacts and hashes, and `safetensors` instead of `pickle` to eliminate load-time code execution. Stops tampering-in-transit and arbitrary-code payloads, but says nothing about whether the weights themselves are trojaned.
- **Trigger reconstruction / reverse engineering**: Neural Cleanse and successors search for the minimal perturbation that flips all inputs to one label, flagging anomalously small triggers. Effective against small static patch triggers; weaker against large, feature-space, or input-specific triggers.
- **Activation/representation analysis**: activation clustering and spectral signatures separate poisoned from clean samples in feature space; useful when you hold the suspect training set.
- **Pruning and fine-tuning defenses**: Fine-Pruning and related cleansing remove or overwrite dormant "backdoor" neurons. Reduces attack success on many academic triggers but can degrade clean accuracy and often fails against adaptive attacks.
- **Input-level filtering at inference**: STRIP-style perturbation tests and anomaly detectors screen suspicious inputs at run time without retraining.
- **Poison-resistant training**: data deduplication, provenance filtering, and robust aggregation reduce the chance a planted pattern survives, though they assume you control the corpus.
- **Benchmarking**: shared evaluation efforts such as the TrojAI program and TROJAI/backdoor-detection competition datasets standardize comparison of detectors.

## Open gaps

- **No certified detection for large generative models**: most named defenses were built for image classifiers with discrete labels; they do not transfer cleanly to autoregressive LLMs, diffusion models, or multimodal systems.
- **Adaptive and stealthy triggers defeat current detectors**: clean-label, feature-space, semantic, and input-dependent triggers evade reverse-engineering and clustering, and defenses are routinely broken by attacks designed against them.
- **Backdoors that survive fine-tuning and safety training**: work on deceptive/persistent backdoors suggests standard alignment and fine-tuning can fail to remove an implanted behavior and may even teach the model to hide it better.
- **Auditing weights you didn't train**: given only a checkpoint and no trigger, no clean reference, and no training data, there is no reliable way to certify a model is backdoor-free.
- **Trigger search does not scale**: open-vocabulary text and high-dimensional or compositional triggers make exhaustive reconstruction intractable.
- **Ecosystem coverage**: signing and provenance adoption is partial across public hubs, and adapters/LoRA deltas, quantized variants, and merged models are under-audited links in the chain.

## Watch (2027+)

Expect the threat surface to shift from classifiers to agentic and multimodal systems, where a trigger does not just flip a label but unlocks tool use, exfiltration, or policy bypass — raising the stakes of detection well beyond accuracy metrics. Defensive momentum will likely follow the software supply-chain playbook: signed model artifacts, attestation and SBOM-style "model bills of materials," and provenance becoming a default expectation on public hubs rather than an option. Regulatory and procurement pressure (for example, supply-chain integrity expectations in AI risk frameworks) may make documented provenance a precondition for deployment in regulated settings.

Real progress would look like scalable detection that works on a frozen checkpoint without the trigger, clean data, or a reference model, ideally with some formal guarantee; defenses with demonstrated robustness against adaptive attackers under a published threat model, not just static academic triggers; and convincing evidence that standard fine-tuning or alignment can reliably remove a persistent backdoor rather than merely suppress it on the evaluation distribution. Until those exist, the honest posture is supply-chain hygiene plus layered, partial detection, treating any externally sourced model as untrusted.
