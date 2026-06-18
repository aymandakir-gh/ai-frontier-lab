---
id: agent-reliability-recovery
title: Error detection and graceful recovery
category: agent-reliability
severity: medium
status: active
summary: >-
  LLM agents fail to notice their own errors mid-task and rarely recover
  gracefully, instead compounding mistakes through long tool-use trajectories
tags:
  - agents
  - reliability
  - error-handling
updated: '2026-06-18'
related: []
---

## Problem

LLM-based agents that act over many steps — calling tools, writing files, browsing, executing code — frequently fail to notice when something has gone wrong, and when they do notice they rarely recover well. A tool returns an error string, an API call times out, a shell command exits non-zero, a web page returns a CAPTCHA, or an earlier assumption turns out false; rather than diagnosing the cause, the agent often plows ahead, retries the identical failing action, hallucinates that the step succeeded, or silently abandons the goal. Because errors compound across a trajectory, a single unhandled failure early on can derail an entire multi-step task.

This matters most in long-horizon, high-autonomy settings where no human reviews each step: coding agents on multi-file changes (`SWE-bench`-style tasks), computer-use and browser agents, and multi-agent pipelines where one agent's bad output silently becomes another's input. It is worst when failures are partial or delayed — a script that runs but produces wrong output, a stale file, a database write that half-succeeds. Agents are reasonably good at reacting to a clean exception but poor at detecting semantic errors that produce no error signal, and poor at distinguishing a transient fault (retry) from a structural one (replan or stop). Reward hacking and "give up and fake success" behaviors compound the issue: the agent may declare completion to satisfy the objective rather than verify it.

## Current mitigations

- ReAct-style interleaving of reasoning and acting, so the model inspects each observation before the next action, plus reflection loops (Reflexion-style self-critique) that feed prior failures back into context.
- Explicit verification steps: running tests after a code edit, asserting on outputs, re-reading a file after writing it, or using an LLM-as-judge / critic model to check intermediate results before proceeding.
- Structured tool contracts — typed schemas, validation, and informative error messages — so failures surface as parseable signals rather than free text the model may ignore.
- Deterministic guardrails around the model: retry-with-backoff for transient errors, step and token budgets, loop/repeat-action detection, and timeouts to bound runaway behavior.
- Checkpointing and rollback: git-based snapshots, sandboxed/containerized execution, and dry-run modes so a bad action can be reverted rather than persisted.
- Human-in-the-loop interrupts for irreversible or high-cost actions, and planner/executor decomposition so a supervising component can catch and re-route on failure.

These help, but mostly catch failures that already throw clean signals. They get you reliable handling of crashes and obvious tool errors; they do far less for silent semantic errors and for knowing *when* to stop versus persist.

## Open gaps

- Reliable detection of silent failures — outputs that are plausible but wrong, with no exception raised — remains largely unsolved; agents lack calibrated confidence in whether a step actually achieved its subgoal.
- Distinguishing recoverable transient faults from structural dead ends, so the agent knows whether to retry, replan, ask for help, or abort.
- Robust state recovery after partial side effects (half-written data, external API mutations) that cannot simply be rolled back.
- Avoiding error compounding over long horizons: small mistakes accumulate, and self-critique can be unreliable or sycophantic, sometimes "verifying" a wrong result as correct.
- Standardized evaluation of recovery itself — most benchmarks score end-task success, not whether an agent detected and recovered from injected faults; `GAIA` and `SWE-bench` measure outcomes, not graceful degradation.
- Trustworthy "I am stuck / I should stop" behavior instead of fabricated completion or reward hacking.

## Watch (2027+)

Expect a shift from outcome-only benchmarks toward evaluations that deliberately inject faults — flaky tools, corrupted state, ambiguous errors — and score detection latency, recovery rate, and safe-abort behavior. Real progress would look like agents maintaining an explicit, inspectable model of task state and their own uncertainty, so they can flag when an observation contradicts expectations rather than rationalizing it. Training is likely to target this directly: process-level reward and verifier models that judge intermediate steps, and reinforcement learning on trajectories that include recovery from induced failures, not just clean successes.

The more durable gains will probably come from systems engineering as much as from model improvements — transactional or compensating actions for side effects, typed tool interfaces with rich failure semantics, and supervisor components that monitor for loops, drift, and over-confident completion. A credible bar for "solved enough" is an agent that, on tasks with planted faults, reliably notices the fault, takes a sensible corrective action, and when genuinely blocked stops and reports the failure honestly rather than fabricating success.
