---
id: cost-latency-streaming
title: Latency and interactive-UX cost
category: cost
severity: low
status: active
summary: >-
  Interactive LLM apps must stream tokens fast enough to feel responsive; high
  time-to-first-token and slow output rates degrade UX, and the fixes (caching,
  smaller models, speculative decoding) trade cost, quality, or complexity
tags:
  - latency
  - streaming
  - serving
updated: '2026-06-18'
related:
  - cost-inference-economics
  - cost-agentic-token-explosion
  - cost-energy-footprint
---

## Problem

Interactive LLM applications such as chat assistants, coding copilots, and voice agents are judged less on total compute cost than on how fast they *feel*. The two metrics that dominate perceived quality are time-to-first-token (TTFT) — the delay before any output appears — and inter-token latency, often expressed as tokens per second per stream. A model that is cheap per token but slow to start, or that emits text below natural reading speed, produces a sluggish experience that users abandon even when the final answer is correct.

The tension is structural. The prefill phase that produces the first token is compute-bound and scales with prompt length, so long contexts (large system prompts, retrieved documents, prior conversation) inflate TTFT. The decode phase that produces subsequent tokens is memory-bandwidth-bound and largely serial, so output speed is capped by how fast weights and KV cache can be streamed from memory. Batching many users together raises hardware utilization and lowers cost per token, but it also lengthens queueing delay and inter-token latency for each individual stream — the classic latency-versus-throughput trade-off. Operators are forced to pick a point on that curve, and the cost-optimal point is rarely the one that feels best.

The problem is worst where latency budgets are tight and human attention is real-time: voice assistants needing sub-second response to feel conversational, agentic loops where each of many sequential model calls adds to wall-clock time, and long-context retrieval-augmented generation where prefill alone can exceed acceptable TTFT. It is least severe in batch or asynchronous workloads, which is why this entry is rated low severity — it is an engineering and economics problem, not a capability gap.

## Current mitigations

- **Token streaming (server-sent events / chunked responses):** emitting tokens as generated hides total generation time behind perceived progress; the baseline technique, but it does nothing for TTFT.
- **Prompt / prefix caching:** reusing the KV cache for shared prefixes (system prompts, few-shot examples, common document chunks) cuts prefill cost and TTFT dramatically for repeated prefixes. Now offered by major API providers and serving stacks; limited to genuinely shared prefixes.
- **Speculative decoding and related draft-and-verify methods (e.g., Medusa-style multi-head, lookahead decoding):** a small draft model proposes tokens that the target model verifies in parallel, raising tokens/second without changing output distribution. Gains depend heavily on draft acceptance rate and workload.
- **Continuous (in-flight) batching:** schedulers such as those in vLLM, TensorRT-LLM, and SGLang admit and retire requests at the token level rather than per-batch, improving throughput-latency balance. `PagedAttention`-style KV-cache management reduces memory fragmentation so more concurrent streams fit.
- **Model-size and quantization choices:** smaller or distilled models and INT8/FP8/INT4 quantization reduce memory traffic and latency, trading some quality; routing easy queries to small models and hard ones to large models (cascade/routing) is common.
- **Disaggregated prefill/decode serving:** running compute-bound prefill and bandwidth-bound decode on separate pools so each is tuned independently, reducing interference between TTFT and inter-token latency.
- **Product-level masking:** optimistic UI, skeleton states, and starting to speak/render before generation completes to make latency less noticeable.

## Open gaps

- No principled, automated way to choose the latency-throughput operating point per request given a per-user SLA and a cost budget; tuning is still largely manual and workload-specific.
- Speculative decoding gains are brittle — acceptance rates vary by domain and decoding settings, and maintaining a well-matched draft model adds operational overhead.
- Long-context prefill remains expensive; caching only helps shared prefixes, and dynamic per-user context (fresh retrieval, tool outputs) still pays full prefill cost.
- Reasoning and agentic patterns that emit long hidden chains or many sequential calls inflate end-to-end latency in ways token-level streaming cannot hide.
- Tail latency under bursty, mixed-length traffic is hard to bound; admission control and fair scheduling across heterogeneous request shapes are immature.
- Standard public benchmarks emphasize accuracy; latency/throughput reporting (TTFT, inter-token latency, tail percentiles under realistic concurrency) is inconsistent and hard to compare across stacks.

## Watch (2027+)

Expect continued convergence on disaggregated, cache-aware serving as the default, with prefix caching, speculative methods, and quantization treated as composable layers rather than one-off optimizations. The likely direction is latency-aware schedulers that accept explicit SLAs and dynamically choose batch size, model tier, and speculation depth per request, plus better handling of the long-reasoning workloads that current streaming cannot mask.

Real progress would look like reproducible, widely adopted latency benchmarks that report TTFT and inter-token latency at fixed quality and realistic concurrency, so cost-latency-quality trade-offs become comparable across systems rather than vendor-specific claims. Hardware with higher memory bandwidth and larger on-package memory would relax the decode bottleneck, but the core scheduling and economics problem — serving many interactive users cheaply without making any one of them wait — will remain an active engineering frontier rather than a solved one.
