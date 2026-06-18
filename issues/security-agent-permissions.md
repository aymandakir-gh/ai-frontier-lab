---
id: security-agent-permissions
title: Over-privileged agents and the confused deputy
category: security
severity: high
status: active
summary: >-
  LLM agents with broad standing tool and credential access can be steered by
  untrusted inputs (prompt injection) into misusing their privileges, a classic
  confused-deputy failure that current scoping and guardrails only partially
  contain
tags:
  - agents
  - permissions
  - security
updated: '2026-06-18'
related: []
---

## Problem

LLM agents are increasingly wired to real capabilities: shell access, code execution, browsing, email, calendars, payment APIs, internal databases, and MCP tool servers. To be useful they are usually granted broad, long-lived, ambient authority — an OAuth token, a service account, a session cookie, or filesystem and network access that persists across many turns. The agent then acts as a *deputy* carrying the user's (or an org's) privileges, while the data it processes comes from untrusted sources: web pages, retrieved documents, tool outputs, emails, issue trackers. This is a textbook *confused deputy* problem. Because the model does not reliably separate trusted instructions from untrusted content, attacker-controlled text in any ingested artifact can become an instruction the agent executes with its full privileges — the core mechanism behind indirect prompt injection.

Concretely, a malicious string in a fetched web page or a shared document can cause the agent to exfiltrate secrets, send email, open pull requests, run `rm`, make purchases, or call other tools and sub-agents that inherit the same authority. It matters because the blast radius scales with the agent's permissions, the damage is silent and fast, and multi-step autonomy means a single injected instruction can chain across many tools before any human reviews it.

It is worst where agents have write/side-effecting access, where they ingest content from the open web or shared inboxes, in multi-agent systems where authority propagates implicitly, and in MCP setups where a single connected server can see context meant for others or describe tools deceptively (tool-poisoning, rug-pull updates).

## Current mitigations

- **Least privilege and capability scoping**: narrow OAuth scopes, short-lived/just-in-time credentials, read-only by default, per-tool allowlists, and separate identities per agent so authority does not pool.
- **Human-in-the-loop confirmation** for high-impact or irreversible actions (spend, delete, send, deploy), often risk-tiered so only sensitive tools require approval.
- **Sandboxing and egress control**: containerized or VM execution, ephemeral workspaces, network/domain allowlists, and blocking outbound channels to limit exfiltration.
- **Input/output guardrails and prompt-injection classifiers** that screen tool outputs and retrieved content; structured separation of "instructions" vs "data" in the prompt and system-prompt hardening.
- **Architectural patterns** such as dual-LLM / privileged-vs-quarantined model splits, plan-then-act with a fixed action plan, and the *CaMeL*-style approach of deriving a capability-constrained program from trusted input only.
- **Observability and policy enforcement**: audit logs of every tool call, action-level policy engines / OPA-style gateways, rate limits, and red-teaming against injection and tool-misuse.

These measures meaningfully reduce risk and stop many opportunistic attacks, but they trade off autonomy for safety (approval fatigue), and none neutralizes prompt injection itself.

## Open gaps

- **No robust defense against prompt injection.** Classifiers and system prompts are bypassable; there is no reliable, model-level separation of trusted instructions from untrusted data, and no benchmark-saturating defense.
- **Trusted/untrusted provenance is not tracked through the context.** The model cannot tell which tokens are authoritative, so taint-tracking and information-flow control across tool calls remain largely unsolved in practice.
- **Authority delegation in multi-agent and MCP systems is implicit.** Sub-agents and chained tools inherit broad authority; there is no mature standard for least-privilege delegation, per-step scoping, or revocation.
- **Confirmation does not scale and degrades into rubber-stamping**; users cannot meaningfully review long action chains, and "ask only for risky actions" relies on correct, gameable risk classification.
- **Weak action-level identity and authorization.** Most infrastructure authorizes the human or app, not the specific agent action under a specific intent, making after-the-fact attribution and fine-grained policy hard.
- **Limited assurance and evaluation.** Sparse standardized benchmarks for agent security/injection robustness, and little formal guarantee that a sandbox or policy fully bounds an agent's reachable effects.

## Watch (2027+)

Expect a shift from prompt-level patching toward architectural and infrastructural containment: capability-based and information-flow designs (deriving constrained plans from trusted input, taint-tracking untrusted content), agent-specific identity and fine-grained, intent-scoped authorization at gateways, and maturing standards for least-privilege delegation and revocation across MCP and multi-agent stacks. Real progress would look like injection robustness that holds up under adaptive red-teaming on shared benchmarks, default deny-by-design sandboxes with provable egress bounds, and authorization that binds each tool call to a verified intent rather than ambient credentials.

The likely equilibrium is defense-in-depth where no single layer is trusted to stop injection, but containment, scoping, and monitoring keep blast radius small. The open question is whether containment can advance fast enough to safely match rising agent autonomy — or whether high-impact actions stay gated behind humans indefinitely. Watch for the first credible *non-bypassable* separation of data and instructions, and for whether regulators or platforms begin mandating action-level audit and authorization for agents handling money, code, or personal data.
