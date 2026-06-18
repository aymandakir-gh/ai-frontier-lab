---
id: cost-energy-footprint
title: Energy and environmental footprint
category: cost
severity: medium
status: active
summary: >-
  Training and serving large models consumes substantial electricity, water, and
  embodied hardware, with rising inference demand and poor measurement making
  the footprint hard to bound or report
tags:
  - energy
  - environment
  - efficiency
updated: '2026-06-18'
related:
  - cost-long-context
  - cost-quantization-tradeoffs
  - cost-agentic-token-explosion
---

## Problem

Training and serving large models consumes substantial electricity, water (for datacenter cooling), and embodied carbon from accelerator manufacturing. The footprint shows up in two distinct places. Pretraining a frontier model is a large one-time burst, often run on thousands of GPUs for weeks. But the larger and faster-growing cost is *inference*: a popular model serves billions of requests, and aggregate serving energy now generally dominates the one-time training cost over a model's deployed lifetime. Reasoning models that emit long chains of thought, agentic loops that make many tool calls per task, and retrieval pipelines that run an embedding model over large corpora all multiply tokens generated per user action, and energy scales roughly with tokens processed.

It matters because demand is concentrating in regional datacenter clusters where it strains local grids, drives new gas or coal capacity online, and competes for water in already-stressed areas. It is worst where models are largest and most heavily used, where the local grid is carbon-intensive, and in always-on serving fleets provisioned for peak load that sit underutilized off-peak. A second-order problem is measurement: most deployed systems do not report per-query energy, marginal vs. average grid emissions are conflated, and embodied hardware carbon is usually omitted, so the true footprint is hard to bound, audit, or compare.

## Current mitigations

- **Sparse architectures**: Mixture-of-Experts (MoE) activates only a fraction of parameters per token, cutting compute per forward pass relative to a dense model of equal capacity.
- **Quantization and distillation**: serving in `int8`/`fp8`/`int4`, and distilling large teachers into smaller students, reduce memory traffic and energy per token; much inference energy is memory-bound, so this helps directly.
- **Inference-serving optimizations**: `KV-cache` reuse, paged attention, continuous batching, and speculative decoding raise throughput per joule by keeping accelerators busy and avoiding redundant compute.
- **Hardware and datacenter efficiency**: newer accelerators improve performance-per-watt; operators track PUE and increasingly WUE, use free-air and liquid cooling, and pursue carbon-aware scheduling that shifts flexible batch jobs to times/regions with cleaner power.
- **Right-sizing and routing**: cascades and routers send easy queries to small models and escalate only hard ones; caching repeated responses avoids recomputation entirely.
- **Reporting and procurement**: model cards sometimes disclose training energy/emissions; operators sign renewable PPAs and report against grid-carbon data.

Together these yield large per-token efficiency gains year over year, but they are mostly offset by growth in usage and model size — a rebound (Jevons) effect.

## Open gaps

- **No standardized, audited measurement**: there is no agreed methodology for per-query energy and emissions covering training, inference, embodied hardware, networking, and cooling, so reported figures are not comparable across vendors.
- **Inference dominance is under-instrumented**: lifetime serving energy is rarely disclosed, and the cost of reasoning/agentic token inflation is largely unaccounted.
- **Marginal vs. average emissions**: carbon-aware scheduling needs real-time marginal grid signals that are often unavailable, and added load can induce new fossil capacity that average-mix accounting hides.
- **Water and embodied carbon**: cooling water and the manufacturing footprint of accelerators are routinely excluded from headline numbers.
- **Efficiency vs. demand**: per-token gains do not bound total consumption; there is no mechanism tying efficiency improvements to absolute reductions.
- **Capability–efficiency tradeoff**: it remains unclear how far accuracy can be preserved under aggressive quantization, sparsity, and small-model routing without quality regressions on benchmarks like MMLU or SWE-bench.

## Watch (2027+)

Expect measurement to mature faster than absolute consumption falls. Standardized energy/carbon/water reporting — pushed by procurement requirements and regulation such as EU disclosure rules — should make per-query and lifetime-serving footprints comparable and auditable, including embodied hardware. Architecturally, the likely directions are more aggressive sparsity, low-precision and `int4`/`fp4` serving as a default, adaptive compute that spends tokens proportional to problem difficulty, and tighter hardware–software co-design plped against marginal-carbon-aware scheduling on cleaner grids.

Real progress would be decoupling: holding capability roughly constant (on MMLU, SWE-bench, GAIA) while measurably cutting joules and grams of CO2 per useful task, *and* showing absolute fleet-level consumption flattening despite usage growth — not merely improving efficiency per token while totals climb. Credible, third-party-verified disclosure of both inference energy and water, rather than training-only figures, would be the clearest signal that the footprint is being genuinely managed rather than reframed.
