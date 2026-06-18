---
id: data-retrieval-quality
title: Retrieval quality in RAG pipelines
category: data
severity: medium
status: active
summary: >-
  Retrieval-augmented generation pipelines often surface incomplete or off-topic
  context due to chunking, embedding, and ranking limits, capping answer quality
  regardless of generator strength
tags:
  - rag
  - retrieval
  - chunking
updated: '2026-06-18'
related: []
---

## Problem

In retrieval-augmented generation (RAG), the generator can only reason over the passages the retriever hands it. When retrieval returns incomplete, redundant, or off-topic context, the model either hallucinates around the gap or confidently answers from the wrong passage — and this happens even when the underlying corpus contains the correct answer. The failure is upstream of the LLM, so swapping in a stronger generator does not fix it. This makes retrieval quality the practical ceiling on accuracy for most enterprise question-answering, support, and internal-knowledge deployments.

Several distinct things go wrong. Fixed-size chunking splits a single fact across two chunks or merges unrelated content, so no chunk is individually retrievable as a clean answer. Dense embeddings collapse lexical specifics — exact part numbers, names, dates, negations — into vectors that score semantically similar but distinct passages too closely, so the top-k is plausible but wrong. Queries are short and underspecified while documents are long and verbose, creating an asymmetry that hurts matching. And recall degrades on multi-hop questions, where the answer requires combining facts from passages that are not individually similar to the query.

It is worst in domains with dense, structured, or jargon-heavy text — legal, medical, finance, technical documentation — and in large heterogeneous corpora where many near-duplicate passages compete. Tables, figures, and multi-column PDFs are especially fragile because chunking destroys their structure before retrieval ever runs.

## Current mitigations

- **Hybrid retrieval**: combining dense (embedding) search with sparse lexical methods like `BM25`, then fusing rankings (e.g., reciprocal rank fusion). Recovers exact-match terms that dense vectors blur; widely adopted and reliably better than either alone.
- **Reranking**: a cross-encoder (e.g., the rerankers shipped by Cohere and various open models) re-scores an over-fetched candidate set. Improves precision@k substantially at the cost of extra latency; now a near-default second stage.
- **Better chunking**: semantic, recursive, and structure-aware splitting; sentence-window and parent-document retrieval that embed small units but return larger context. Reduces split-fact failures but requires per-corpus tuning.
- **Query transformation**: query rewriting, multi-query expansion, and `HyDE` (hypothetical document embeddings) to close the query-document asymmetry. Helps on vague queries; can add noise.
- **Domain-adapted embeddings**: fine-tuning embedding models on in-domain pairs, and using strong general models from the `MTEB` leaderboard as a starting point.
- **Graph and structured RAG**: linking entities (e.g., GraphRAG-style approaches) to support multi-hop questions that flat vector search misses.
- **Evaluation harnesses**: frameworks like `RAGAS` and `BEIR`-style retrieval benchmarks, plus LLM-as-judge faithfulness and context-relevance scoring, to measure retrieval rather than guess.

Together these move recall and precision from "demo-quality" to "production-tolerable" on many workloads, but each adds tuning surface and most still require corpus-specific calibration to pay off.

## Open gaps

- No principled, corpus-agnostic chunking strategy; chunk size and boundaries remain empirical knobs retuned per dataset.
- Multi-hop and aggregative queries ("how many...", "compare across all...") still fail because no single passage is similar to the query; graph methods help narrowly and are costly to build and maintain.
- Retrieval over tables, figures, and complex layouts is unreliable; parsing loss happens before retrieval and is hard to recover.
- Faithfulness evaluation leans on LLM judges that are themselves noisy and gameable, so "retrieval quality" lacks a cheap, trustworthy ground-truth metric at scale.
- Knowing *when not to retrieve*, or when retrieved context is insufficient and the model should abstain, is largely unsolved — pipelines retrieve and answer regardless.
- Long, evolving corpora drift: embeddings, chunk boundaries, and rerankers tuned at launch silently degrade as content changes, with little tooling to detect it.

## Watch (2027+)

Expect the boundary between retrieval and generation to keep blurring. Long-context models reduce pressure on perfect chunking by tolerating larger, messier context windows, while agentic and iterative retrieval — where a model issues several queries, inspects results, and refines — is likely to replace single-shot top-k as the default for hard questions. Late-interaction and multi-vector representations point toward retrieval that preserves token-level detail instead of collapsing passages into one vector.

Real progress would look like retrieval that handles multi-hop and aggregative queries without hand-built graphs, structure-preserving ingestion for tables and documents, calibrated signals for insufficient-context abstention, and standardized end-to-end benchmarks that measure retrieval quality independently of the generator and survive corpus drift. Until those land, retrieval will remain the most common and least glamorous reason RAG systems underperform their underlying models.
