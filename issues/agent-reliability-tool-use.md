---
id: agent-reliability-tool-use
title: Brittle and unsafe tool use
category: agent-reliability
severity: high
status: active
summary: >-
  LLM agents call tools unreliably and unsafely: malformed/hallucinated calls,
  poor error recovery, weak grounding in tool semantics, and
  prompt-injection-driven misuse of high-privilege actions
tags:
  - agents
  - tools
  - function-calling
updated: '2026-06-18'
related: []
---

## Problem

LLM agents increasingly act on the world through function calling and tool use (`MCP` servers, API wrappers, code execution, browser control). Two distinct failure modes dominate. The first is *brittleness*: models emit syntactically invalid arguments, hallucinate tool names or parameters that do not exist, pick the wrong tool, or supply plausible-but-wrong values (fabricated IDs, mismatched units, stale arguments copied from earlier context). When a call fails, agents often fail to recover — they retry the same broken call, ignore error payloads, or silently proceed as if the call succeeded. Reliability degrades sharply as the number of available tools grows and as tasks require long multi-step sequences, because a single misstep compounds. Multi-step benchmarks such as `GAIA`, `SWE-bench`, `WebArena`, `tau-bench`, and the Berkeley Function-Calling Leaderboard make this visible: per-step accuracy that looks acceptable collapses over long horizons.

The second mode is *unsafety*: tool use grants real-world side effects (sending email, moving money, deleting files, executing shell commands), so an erroneous or adversarially-induced call causes irreversible harm. This is worst where agents have broad, high-privilege tool access combined with untrusted input. Indirect prompt injection — malicious instructions embedded in a web page, document, or tool output — can hijack the agent into exfiltrating data or invoking destructive tools. The combination of brittle grounding and ambient authority is where the risk concentrates.

## Current mitigations

- **Constrained/structured decoding**: grammar- or schema-constrained generation (JSON Schema, function signatures) to guarantee syntactically valid, well-typed arguments and eliminate name hallucination at the parse level.
- **Tool-use fine-tuning and RL**: training on tool-call trajectories and reward signals to improve selection and argument grounding; reasoning-style models that plan before calling tend to recover better from errors.
- **Validation and feedback loops**: server-side argument validation, returning structured error messages, and `ReAct`/reflexion-style retry so the model sees and reacts to failures rather than ignoring them.
- **Permission scoping and human-in-the-loop**: least-privilege tool exposure, allow/deny lists, confirmation gates on irreversible actions, and dry-run/preview modes before commit.
- **Sandboxing and isolation**: running code-execution and browser tools in containers/VMs, network egress controls, and read-only credentials to bound blast radius.
- **Injection defenses**: separating trusted instructions from untrusted tool output, input sanitization, and the dual-LLM / privileged-vs-quarantined pattern that prevents tainted content from directly triggering privileged calls.
- **Retrieval over tool sets**: dynamically selecting a small relevant tool subset rather than exposing hundreds at once, which measurably improves selection accuracy.

These get production agents to "usually works on common paths," and confirmation gates meaningfully reduce catastrophic outcomes. They do not make agents reliable across long horizons or robust to determined adversaries.

## Open gaps

- **Long-horizon compounding**: no general method keeps multi-step task success high; per-step error rates accumulate and there is no reliable mid-trajectory self-correction.
- **Semantic grounding**: structured decoding guarantees valid *shapes*, not correct *meanings* — agents still pass wrong-but-valid arguments, and there is no robust way to verify intent matches the call.
- **Injection is unsolved**: no defense reliably stops indirect prompt injection; it remains an open, arguably fundamental, problem when untrusted content shares the context with privileged tools.
- **Error-recovery behavior**: agents lack a dependable policy for distinguishing transient from permanent failures, knowing when to retry, escalate, or abort.
- **Confirmation fatigue vs. autonomy**: human-in-the-loop trades safety for throughput; there is no principled, calibrated way to gate only the genuinely risky actions.
- **Evaluation gaps**: benchmarks are often saturable or non-representative of messy real tools (auth, rate limits, partial failures, stateful side effects), and safety/robustness evals lag capability evals.

## Watch (2027+)

Expect a shift from "the model decides everything" toward enforced runtime guarantees: typed tool contracts, capability-based security, information-flow controls that taint-track untrusted data, and policy engines that bound what an agent *can* do regardless of what it is persuaded to attempt. Real progress would be measurable robustness to indirect prompt injection under adversarial evaluation, and long-horizon task success that scales with steps rather than collapsing. Calibrated uncertainty on tool calls — agents that abstain or ask when unsure rather than confidently acting — and verifier or critic models that check calls before execution are plausible near-term gains.

The deeper open question is whether reliability comes mainly from better-trained models or from the surrounding system (sandboxes, contracts, formal guarantees). The likely answer is both, with the security and verification layer doing the heavy lifting for high-stakes actions. A credible milestone would be agents safely holding broad tool authority over untrusted inputs without a human gate — something no current approach achieves.
