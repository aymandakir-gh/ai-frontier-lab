---
id: agent-reliability-error-compounding
title: Error compounding over long task chains
category: agent-reliability
severity: high
status: active
summary: >-
  LLM agents accumulate small per-step errors over long task chains, so
  end-to-end success decays multiplicatively with horizon length and recovery is
  unreliable
tags:
  - agents
  - reliability
  - long-horizon
updated: '2026-06-18'
related:
  - agent-goal-drift-long-horizon
  - agent-reliability-recovery
  - agent-reliability-memory
---

## Problem

LLM agents execute tasks as chains of steps: plan, call a tool, read the result, decide the next action. Each step carries a nonzero chance of a mistake — a misread tool output, a hallucinated file path, a wrong assumption silently carried forward. Because steps are sequential and dependent, these errors compound roughly multiplicatively: even a high per-step reliability yields low end-to-end success once a task spans dozens or hundreds of steps. This is why agents look strong on short, well-scoped benchmarks but degrade sharply on long-horizon work.

The failure is rarely a single dramatic crash. More often an early error (a wrong intermediate value, a stale assumption, a partially-applied edit) propagates undetected, and later steps build on the corrupted state. Agents also tend to confabulate justification for their own prior actions rather than detect the inconsistency, so the chain drifts further from the goal. The problem is worst in open-ended, multi-tool, stateful settings — multi-step software engineering (`SWE-bench`), web and computer-use tasks, and realistic tool-use suites like `GAIA` and `WebArena` — where there is no clean reset and the environment accumulates side effects. Long context also degrades attention to early instructions ("lost in the middle"), compounding goal drift.

## Current mitigations

- **Decomposition and planning scaffolds** — ReAct, Plan-and-Solve, and Tree-of-Thoughts break work into smaller verifiable sub-steps, shortening the dependency chain that any one error can poison.
- **Self-verification and reflection** — Reflexion and self-critique loops let the agent check its own output and retry; useful but bounded by the model's ability to detect its own errors.
- **External verifiers and grounded feedback** — running tests, compilers, type checkers, or schema validators after each action gives a hard signal instead of relying on the model's self-judgment; this is the single most reliable error-arrest mechanism today.
- **Process reward models / step-level supervision** — scoring intermediate steps (not just final answers) to catch divergence early, drawing on process-supervision research.
- **Checkpointing and rollback** — snapshotting state (git commits, sandbox snapshots) so a detected error can be reverted rather than patched over.
- **Multi-agent and critic patterns** — a separate reviewer/critic model or voting across samples to catch errors a single rollout misses.
- **Human-in-the-loop gates** — approval checkpoints on high-impact or irreversible actions.

In practice these meaningfully raise success rates on bounded tasks, but they trade off cost and latency, and none make per-step reliability high enough that errors stop compounding on genuinely long horizons.

## Open gaps

- **Reliable self-detection of errors** — models remain poor at recognizing their own mistakes without an external ground-truth signal, so reflection loops can reinforce wrong beliefs.
- **Verifier coverage** — cheap, trustworthy verifiers exist for code and structured outputs but not for open-ended, judgment-heavy, or irreversible real-world actions.
- **No calibrated stop/escalate signal** — agents lack well-calibrated uncertainty to know when to halt, ask for help, or retry rather than confidently proceeding on a corrupted state.
- **Error-correlation across steps** — mitigations assume independent failures, but errors are correlated (a bad early assumption biases every later step), defeating sampling and voting.
- **State and memory integrity** — no robust mechanism to detect when accumulated environment state or long-context memory has silently diverged from the intended trajectory.
- **Evaluation** — benchmarks emphasize final-task pass/fail; partial-credit, recovery-rate, and horizon-length-scaling metrics are immature, so progress on compounding specifically is hard to measure.

## Watch (2027+)

Expect the strongest gains from training agents explicitly for recovery rather than only for first-try correctness: reinforcement learning over long multi-step trajectories with process-level and verifier-derived rewards, so models learn to detect divergence, backtrack, and re-plan as a first-class skill. Pairing this with better-calibrated uncertainty would let agents escalate or checkpoint at the right moments instead of confidently compounding. Cheaper, broader automated verifiers — including learned critics and formal or sandboxed checks for actions beyond code — would extend the one mechanism that reliably arrests error propagation today.

Real progress will be measurable, not anecdotal: success rates that decay gracefully (sub-multiplicatively) as horizon length grows, high recovery rates after an injected or natural error, and benchmarks that report performance as a function of task length and reversibility. The bar to watch for is an agent that can run for hundreds of dependent steps on stateful, partly-irreversible tasks and still reliably notice and undo its own mistakes — closing the gap between short-task and long-horizon reliability rather than just pushing the per-step number slightly higher.
