---
id: security-data-poisoning
title: Training-data and supply-chain poisoning
category: security
severity: high
status: active
summary: >-
  Adversaries inject malicious examples into pretraining corpora, fine-tuning
  data, RLHF feedback, or model/dependency supply chains to implant backdoors,
  biases, or degraded behavior that survive into deployed models
tags:
  - poisoning
  - supply-chain
  - data
updated: '2026-06-18'
related: []
---

## Problem

Modern models are trained on web-scale corpora and increasingly on third-party fine-tuning datasets, human-feedback pipelines, and externally hosted weights. Each of these is an attack surface. In *data poisoning*, an adversary inserts crafted examples so the model learns an attacker-chosen behavior: a *backdoor* that misclassifies or jailbreaks only when a trigger phrase appears, a subtle bias, or degraded performance on a target topic. Research has shown that injecting a small, near-constant number of poisoned documents can implant a backdoor regardless of total corpus size, which means the absolute cost to an attacker does not necessarily grow with model scale. Because much pretraining data comes from snapshotted web crawls, "split-view" and "frontrunning" attacks let someone alter content at URLs after they are listed for crawling, or buy expired domains that appear in known datasets.

*Supply-chain poisoning* is the adjacent, often easier path: a tampered checkpoint on a model hub, a malicious serialized weights file (e.g. a pickle payload that executes on load), a trojaned dependency in the training or serving stack, or a compromised RLHF/annotation vendor whose label noise nudges reward models. It matters most where provenance is weakest and stakes are high: foundation models trained on uncurated crawl data, retrieval corpora and RAG indexes that ingest live untrusted documents, code models that can be steered to emit insecure snippets, and any fine-tuning-as-a-service pipeline accepting user-supplied data. Backdoors are dangerous precisely because they are dormant on standard evaluations and only fire on the trigger.

## Current mitigations

- Data provenance and integrity: content-hashing of crawl snapshots, signed/pinned dataset versions, and immutable manifests to defeat split-view and frontrunning attacks.
- Supply-chain hardening: `safetensors` instead of pickle to block arbitrary-code-execution on weight load, signed artifacts and SBOMs, hash-pinned dependencies, and scanning of hub uploads.
- Data filtering and curation: dedup, quality classifiers, perplexity/outlier filtering, and PII/CSAM scrubbing remove some obviously crafted or anomalous samples.
- Poison/backdoor detection: activation-clustering, spectral signatures, and influence-function or training-data-attribution methods to flag suspicious examples or trace a behavior to its source.
- Trigger discovery and robustification: red-teaming and automated trigger search, plus fine-pruning and fine-tuning on clean data to attenuate (not always remove) implanted backdoors.
- RLHF pipeline controls: annotator vetting, redundancy and agreement checks, and reward-model audits to limit feedback poisoning.
- Deployment-side defenses: input sanitization, retrieved-document trust scoring, and output guardrails to blunt RAG-index and prompt-borne poisoning.

These help, but mostly raise cost rather than guarantee safety; most detectors assume you know roughly what the trigger or anomaly looks like.

## Open gaps

- No scalable certified defense: there is no practical method that *proves* a web-scale model is free of backdoors, and clean-label poisons can match the statistics of legitimate data, evading outlier filters.
- Detection is trigger-shaped: many defenses degrade against unknown, rare, or semantically natural triggers and against poisons distributed across many benign-looking documents.
- Web-scale provenance is incomplete: crawled data is mutable and rarely end-to-end signed, so most pretraining corpora cannot be fully attested.
- Persistence through alignment: some backdoors and "sleeper" behaviors survive safety fine-tuning and RLHF, and can even be reinforced by it.
- Downstream and transitive risk: poison in a base model or a shared dataset propagates to every derivative; closed-weight models give downstream users almost no ability to audit training data.
- Cost asymmetry: defenders must clean everything; attackers need only a tiny, cheap foothold, and detection at corpus scale is expensive.

## Watch (2027+)

Expect provenance to move from best-effort to default: signed datasets, attested training pipelines, and emerging C2PA-style content-credential and watermarking schemes extending toward training data, so that "where did this token come from" becomes auditable. Model hubs will likely converge on mandatory safe serialization, artifact signing, and automated poison scanning as table stakes, mirroring how software supply-chain security matured after high-profile dependency compromises. Real progress would mean detection methods that find backdoors *without* prior knowledge of the trigger, and defenses with formal robustness guarantees that hold at realistic scale.

The harder frontier is agentic and continual-learning systems that ingest live web and tool outputs, where the line between data poisoning and prompt injection blurs and the corpus is never frozen. Credible advances here would include standardized poisoning benchmarks and third-party audits reported alongside capability scores, training-data-attribution that is cheap enough to run routinely, and interpretability tools (for example sparse autoencoders) that can localize and excise an implanted behavior rather than merely suppress it on the eval set.
