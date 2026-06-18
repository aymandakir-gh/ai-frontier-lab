---
id: privacy-contextual-leakage
title: Contextual privacy leakage in RAG and assistants
category: privacy
severity: high
status: active
summary: >-
  RAG systems and assistants leak private context across users, sessions, and
  trust boundaries because retrieval, memory, and prompt assembly lack robust
  per-query access control and contextual integrity
tags:
  - rag
  - privacy
  - context
updated: '2026-06-18'
related: []
---

## Problem

Contextual privacy leakage occurs when a retrieval-augmented or assistant system surfaces information that was legitimately stored somewhere but was never appropriate to reveal in the current context. The canonical failures: a RAG pipeline retrieves a document the asking user is not authorized to see; a shared vector index returns chunks from another tenant or another employee's files; a long-lived memory or `KV-cache` carries content from a prior session or a different user into the current answer; or a system prompt containing secrets, internal policies, or other users' data gets regurgitated. The underlying issue is what Nissenbaum calls a breach of *contextual integrity* — data flowing to a recipient or for a purpose that violates the norms under which it was collected.

It matters because these systems concentrate access. An assistant indexing a whole organization's drive, email, and tickets effectively becomes a single query interface over everyone's data, and the LLM has no native notion of "who is allowed to read this." It worsens with shared or multi-tenant indexes, with agentic tool use (where a retrieved document can carry an injected instruction that exfiltrates other context), and with persistent memory features that blur session boundaries. Enterprise deployments over confidential corpora and consumer assistants with cross-session memory are the highest-risk settings.

## Current mitigations

- **Access-control-aware retrieval**: enforce per-user/per-tenant ACLs and document-level permissions at query time, filtering the candidate set *before* it reaches the model rather than trusting the LLM to withhold. Often implemented via metadata filters or per-tenant index partitioning.
- **Hard tenant isolation**: separate vector stores or namespaces per customer/tenant instead of one shared index, reducing cross-tenant retrieval entirely.
- **PII detection and redaction** at ingestion and at output (named-entity / pattern scanners, scrubbers) so sensitive fields are masked before indexing or before display.
- **Differential privacy** for the training/fine-tuning path (e.g. DP-SGD) to bound memorization, plus deduplication to reduce verbatim regurgitation — relevant when private data touches model weights rather than just the retrieval store.
- **Output guardrails and policy classifiers** that screen responses for leaked secrets, other-user identifiers, or system-prompt contents; combined with prompt-injection filtering on retrieved/tool content.
- **Red-teaming and membership-inference / extraction testing** to probe whether private context can be elicited; scoping memory with explicit retention windows and user-visible controls.

These get production systems reasonably far on the common cases — ACL-filtered retrieval and tenant isolation eliminate the most direct leaks. But they are largely perimeter defenses bolted around a model that itself has no reliable understanding of permissions or context norms.

## Open gaps

- **No contextual integrity inside the model**: the LLM cannot reason about who the recipient is or what the data's intended purpose was, so once a chunk is in context it may be combined and revealed in unanticipated ways.
- **Inference and aggregation leakage**: even with each retrieved document permitted, the model can synthesize or infer sensitive attributes (re-identification, deducing a salary or diagnosis) that no single source stated.
- **Stale or inconsistent ACLs**: permission changes, deletions, and the "right to be forgotten" propagate poorly into vector indexes and into anything baked into weights or `KV-cache`.
- **Agentic exfiltration**: indirect prompt injection in retrieved content can coerce the agent into leaking other context through tool calls; defenses remain incomplete.
- **Memory boundary erosion**: cross-session memory lacks principled rules for what should persist, to whom, and for how long.
- **Evaluation gap**: there is no widely accepted benchmark that measures contextual-privacy leakage in RAG/assistant settings the way `MMLU` or `SWE-bench` measure capability; assessment is ad hoc and red-team-driven.

## Watch (2027+)

Expect the strongest progress from treating privacy as an access-control and information-flow problem rather than a model-behavior problem: capability-scoped retrieval, query-time policy enforcement, and information-flow-control frameworks that taint retrieved content and constrain where it can flow, including through tool calls. Contextual-integrity-aware policies — encoding the recipient, purpose, and transmission norms attached to each datum — are a plausible direction, possibly aided by interpretability tools (e.g. `sparse autoencoders`) to detect when a model is about to surface tainted context. Real progress would also include standardized leakage benchmarks and adversarial suites that make contextual-privacy regression measurable across systems, plus practical, verifiable "forget" operations for both indexes and weights.

What would count as genuine advance, rather than incremental patching, is a deployable architecture where authorization and contextual norms are enforced deterministically outside the probabilistic model, the model operates only over an already-permitted, purpose-scoped context, and aggregation/inference risks are explicitly bounded — with auditable evidence rather than reliance on guardrails that the model can be talked around.
