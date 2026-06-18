---
id: robustness-structured-output
title: Unreliable structured output (JSON/schema adherence)
category: robustness
severity: medium
status: active
summary: >-
  LLMs frequently emit JSON that is malformed or violates the target schema;
  constrained decoding fixes syntax but not semantic correctness, and gaps
  remain for complex/nested schemas and tool-calling
tags:
  - json
  - schema
  - function-calling
updated: '2026-06-18'
related: []
---

## Problem

When an application asks a language model to return structured output, such as a JSON object matching a given schema or arguments for a function/tool call, the model often produces output that is either syntactically invalid or schema-noncompliant. Common failure modes include trailing commas, unterminated strings, unescaped quotes inside string values, JSON wrapped in markdown code fences or prose ("Here is the JSON you requested:"), truncation when the response hits a token limit mid-object, hallucinated or missing required keys, wrong value types (a string where a number or boolean is expected), enum values outside the allowed set, and invented enum members. With nested or recursive schemas, deeply optional fields, and `oneOf`/`anyOf` unions, error rates climb sharply.

This matters because structured output is the glue of agentic and pipeline systems: a single malformed object can break a downstream parser, derail a multi-step agent loop, corrupt a database write, or silently drop data when a lenient parser coerces bad values. The failure is often non-deterministic, so the same prompt succeeds in testing and fails in production, making it hard to catch before release.

Failures are worst at the long tail: large or unfamiliar schemas, schemas with many similar fields the model conflates, free-form fields embedded in structure (long text values that contain quotes and newlines), multilingual or special-character content, and tool-calling with many tools or many parameters where the model selects the wrong tool or mis-fills arguments. Smaller and quantized models, long-context prompts that push the schema far from the generation point, and high-temperature sampling all degrade adherence further.

## Current mitigations

- **Constrained / grammar-based decoding.** Tools and libraries such as Outlines, Guidance, LMQL, llama.cpp GBNF grammars, and XGrammar mask the token distribution at each step so only tokens consistent with a JSON grammar or a JSON Schema can be sampled. This effectively guarantees syntactic validity and structural conformance when you control the decoder.
- **Provider "structured outputs" / JSON modes.** Server-side constrained decoding offered by major API providers (for example OpenAI's Structured Outputs and JSON mode, and tool/function-calling interfaces across vendors) enforces that responses parse as JSON and, in strict modes, conform to a supplied schema.
- **Function/tool calling.** Defining tools with typed parameter schemas and letting the model emit a call rather than free text constrains the shape of arguments and is the standard mechanism in most agent frameworks.
- **Schema-aware validation and retry.** Validating against JSON Schema (e.g. with Pydantic, Zod, or `jsonschema`) and, on failure, re-prompting with the validation error fed back. Libraries like Instructor and BAML wrap this loop with typed models.
- **Forgiving parsers and repair.** Lenient parsers and JSON-repair utilities recover from minor syntax errors (trailing commas, missing braces) after generation.
- **Prompting techniques.** Few-shot examples of correct output, explicit "output only JSON, no prose" instructions, and providing the schema inline. These reduce but do not eliminate errors.

Together these get syntactic validity close to fully solved when you control decoding, and substantially reduce schema violations.

## Open gaps

- **Syntactic validity is not semantic correctness.** Constrained decoding guarantees the output parses and fits the type, but cannot ensure the values are right: a date field can be well-formed yet wrong, an enum can be valid yet inappropriate, required fields can be filled with plausible fabrications.
- **Constrained decoding can distort reasoning.** Forcing the grammar can degrade answer quality versus letting the model reason in free text first, and it interacts awkwardly with chain-of-thought; the trade-off is not well characterized.
- **No decoder control via many APIs.** When using a model behind an API without strict structured-output support, or open weights without an integrated grammar engine, teams fall back to prompt-and-retry, which leaves a residual failure rate.
- **Complex schemas remain hard.** Recursive structures, large unions, conditional schemas (`if`/`then`), and tight value constraints (regex patterns, numeric ranges, interdependent fields) are unevenly supported by grammar engines and frequently violated semantically.
- **Tool-calling at scale.** Correct tool selection and argument filling degrade as the number of available tools and parameters grows; parallel and nested calls compound this.
- **Evaluation is fragmented.** There is no single widely adopted benchmark that jointly measures syntactic validity, schema conformance, and semantic correctness across realistic schema complexity; reported adherence numbers are not comparable across setups.

## Watch (2027+)

Expect constrained decoding to become a default, deeply integrated capability rather than an add-on, with grammar engines that handle the full expressiveness of JSON Schema (recursion, conditionals, cross-field constraints) at negligible latency cost, and with better-understood interaction between constraint enforcement and the model's own reasoning, for example reasoning freely before a constrained final emission. Real progress would also include training and post-training that improve schema adherence intrinsically, so that semantic correctness, not just shape, improves, and tool selection stays reliable as tool catalogues grow into the hundreds.

The clearest signal of progress would be standardized, public benchmarks that separate the three layers of the problem (valid syntax, schema conformance, value-level correctness) across a graded range of schema complexity and tool counts, reported in a comparable way across providers and open models. Until value-level correctness can be measured and improved, defensive engineering, validation, retries, and human or programmatic checks on critical fields, will remain necessary even where syntactic adherence is effectively guaranteed.
