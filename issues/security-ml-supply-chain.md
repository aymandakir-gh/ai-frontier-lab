---
id: security-ml-supply-chain
title: 'The ML supply chain: weights, hubs, dependencies'
category: security
severity: high
status: active
summary: >-
  Modern AI systems are assembled from third-party weights, model hubs, and deep
  dependency trees, creating a software-style supply chain with weak provenance,
  unsafe serialization formats, and trojan/data-poisoning risks
tags:
  - supply-chain
  - weights
  - security
updated: '2026-06-18'
related:
  - security-agent-permissions
  - security-data-poisoning
  - security-model-backdoors
---

## Problem

Most teams do not train the models they ship. They download pretrained weights from public hubs, fine-tune adapters, pull in inference and training libraries, and wire everything together with package managers. This recreates the classic software supply chain problem in a setting with far weaker provenance guarantees: a model artifact is an opaque tensor blob whose training data, training code, and modification history are usually unverifiable. You cannot diff weights the way you diff source, and a backdoored checkpoint can behave identically to a clean one on every test you run while misbehaving on a chosen trigger.

The concrete failure modes are well documented. Legacy serialization formats are the sharpest edge: PyTorch `.bin`/`.pt` files and anything backed by Python `pickle` execute arbitrary code on load, so a malicious checkpoint is effectively a remote code execution payload that runs the moment someone calls `torch.load`. Beyond format-level RCE, there is weight poisoning and trojaning (triggers baked into the model during training or fine-tuning), data poisoning of the pretraining or instruction corpus, and typosquatted or namespace-confused models and packages on hubs and registries. It is worst where models are pulled dynamically at runtime from public repos without pinning, where `trust_remote_code=True` runs arbitrary repo code, and in long transitive dependency chains (CUDA libraries, tokenizers, serving stacks) that few teams audit.

## Current mitigations

- **Safe serialization**: defaulting to `safetensors` instead of `pickle`-based formats, eliminating load-time code execution for the weights themselves.
- **Malware/pickle scanning**: hub-side and CI scanners (e.g. `picklescan`-style tooling, ClamAV, vendor model scanners) that flag dangerous opcodes and known-bad payloads before load.
- **Provenance and signing**: model and artifact signing with Sigstore/cosign, SLSA provenance attestations, and emerging model cards plus SBOM/AI-BOM efforts to record components and lineage.
- **Pinning and integrity**: pinning models and packages by commit hash or content digest, hash verification, lockfiles, and private mirrors/registries instead of pulling `latest` from the open internet.
- **Isolation**: loading untrusted models in sandboxed/network-isolated environments, and refusing `trust_remote_code=True` for unaudited repos.
- **Dependency hygiene**: SCA tools (Dependabot, `pip-audit`, OSV scanners) and vulnerability databases applied to the ML stack, plus gated/curated internal model catalogues.

Together these largely close the load-time RCE gap and catch known-bad artifacts and vulnerable dependencies. That is real progress, but it mostly verifies *who shipped a file unchanged*, not *what the model actually does*.

## Open gaps

- **Behavioral backdoors are not detectable by scanning.** A signed, `safetensors`, malware-free checkpoint can still contain a trigger-activated trojan; there is no reliable, general method to certify a set of weights is clean.
- **No semantic provenance.** Signatures attest the bit-for-bit artifact, not the training data, compute, or fine-tuning steps that produced it. "Verified publisher" is not "verified safe."
- **Data poisoning at web scale.** Pretraining corpora are too large to vet; poisoning a small fraction of crawled data can implant durable behaviors, and after the fact the contribution is essentially untraceable.
- **Fine-tuning and merging laundering.** LoRA adapters, quantization, and model merging can introduce or obscure malicious behavior while breaking upstream signatures and provenance links.
- **Deep transitive dependencies.** GPU kernels, custom CUDA ops, and serving frameworks remain under-audited and can carry their own RCE and integrity risks independent of the weights.
- **Sparse adoption.** AI-BOM, signing, and attestation standards exist but are inconsistently produced and rarely verified end to end by downstream consumers.

## Watch (2027+)

Expect provenance to become table stakes rather than optional: signed weights with SLSA-style build attestations, machine-readable AI-BOMs that chain base model to fine-tunes to deployed artifact, and hub policies that quarantine or block unsigned and `pickle`-format uploads. The harder and more valuable frontier is behavioral assurance — methods that say something trustworthy about what a model will do, not just where the file came from. Watch for progress in backdoor and trojan detection (trigger reconstruction, weight forensics), poisoning-resistant training and data attribution that can trace a behavior back to training examples, and interpretability tools such as sparse autoencoders maturing enough to audit for hidden triggers at scale.

Real progress would look like a downstream team being able to ingest a third-party checkpoint and obtain, automatically, both a verifiable provenance chain and a meaningful behavioral safety certificate — with reproducible-training and content-addressed model registries making "rebuild and verify" routine. Until detection of behavioral compromise catches up to artifact-integrity tooling, the supply chain will stay defensible at the file layer and largely unverified at the behavior layer.
