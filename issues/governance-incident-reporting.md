---
id: governance-incident-reporting
title: AI incident reporting and postmortems
category: governance
severity: medium
status: active
summary: >-
  AI incident reporting lacks standardized taxonomy, mandatory disclosure, and
  shared infrastructure, so harms recur across deployers who never learn from
  prior failures or conduct rigorous postmortems
tags:
  - incidents
  - reporting
  - accountability
updated: '2026-06-18'
related:
  - governance-accountability
  - governance-audits-and-standards
  - governance-content-provenance
---

## Problem

Unlike aviation, medicine, or cybersecurity, AI deployment has no mature, standardized practice for recording, disclosing, and learning from incidents. When a model causes concrete harm — a discriminatory loan denial, a chatbot giving dangerous medical advice, a content-moderation system silently misclassifying a population, an agent taking an unauthorized irreversible action — there is rarely a structured record of what happened, what the contributing causes were, or what was changed afterward. Knowledge stays trapped inside the deploying organization, so the same failure modes recur across different teams and vendors who had no way to learn from each other.

This matters because frequency and severity are rising as models are wired into agentic workflows, customer-facing decisions, and critical infrastructure. Without disclosure, regulators and downstream users cannot assess real-world risk, researchers cannot study failure distributions, and organizations cannot build the institutional memory that drives safety improvement in other engineering disciplines. The gap is worst in two places: high-stakes regulated domains (health, finance, hiring, public benefits) where harms are consequential but reporting is fragmented or absent, and the long tail of small deployers building on top of foundation-model APIs who have neither the maturity nor the incentive to run postmortems.

A structural complication is the diffuse-accountability chain. A single incident may involve a base model provider, a fine-tuner, an application developer, an integrator, and an enterprise deployer. When something goes wrong, it is genuinely unclear who should detect it, who should investigate root cause, and who should disclose — and each party has incentives to minimize blame.

## Current mitigations

- **Voluntary incident databases** — the AI Incident Database (AIID) and the OECD AI Incidents Monitor (AIM) collect and index publicly reported incidents. They establish shared vocabulary and surface patterns, but coverage is biased toward media-reported, English-language, high-profile events and misses the bulk of operational failures.
- **Regulatory reporting mandates** — the EU AI Act introduces obligations to report "serious incidents" for high-risk systems, and existing sector regulators (financial, medical-device, data-protection authorities) increasingly treat AI failures under existing breach/adverse-event regimes. These create legal pressure but definitions, thresholds, and timelines are still being operationalized.
- **Vendor transparency artifacts** — model cards, system cards, and usage policies document intended use and known limitations at release time. They are point-in-time disclosures, not ongoing incident channels.
- **Internal practices borrowed from SRE/security** — blameless postmortems, runbooks, on-call rotations, and severity tiers (SEV levels) applied to ML systems; coordinated vulnerability disclosure and bug-bounty programs extended to model behavior (jailbreaks, prompt injection, data leakage).
- **Eval and monitoring tooling** — production observability, drift detection, red-teaming, and logging of agent actions help organizations *detect* incidents, which is a precondition for reporting them.

## Open gaps

- No agreed, machine-readable **taxonomy** for AI incidents — what counts as an incident vs. a near-miss, how to classify root cause, harm type, and severity consistently across organizations.
- **No mandatory, low-friction disclosure path** for most deployers; reporting is voluntary, reputationally risky, and competitively disincentivized, so databases capture a small, skewed sample.
- **Root-cause analysis for ML is immature** — stochastic, non-reproducible behavior, opaque model internals, and shifting data make it hard to establish "what actually went wrong" with the rigor of a hardware or software postmortem.
- **Accountability allocation across the supply chain** is unresolved; no standard for who investigates and discloses when foundation model, fine-tuner, and deployer are different parties.
- **Near-miss and pre-deployment learning** are largely uncaptured, even though they are the richest signal in mature safety cultures.
- **Privacy and legal exposure** discourage sharing the logs and prompts needed for useful analysis; anonymization and safe-harbor mechanisms are underdeveloped.

## Watch (2027+)

The likely trajectory is convergence on shared standards: a common incident taxonomy and machine-readable reporting schema, ideally interoperable across the AIID, OECD AIM, and emerging regulatory channels under the EU AI Act and any analogous regimes elsewhere. Real progress would look like reporting becoming routine and low-stakes — backed by legal safe harbors that let organizations disclose near-misses and root-cause analyses without admitting liability, mirroring how aviation's confidential reporting systems decoupled learning from punishment.

Concretely, watch for whether incident reporting moves from voluntary and media-driven to structured and continuous, whether agentic-system incidents (unauthorized actions, cascading multi-agent failures) get first-class treatment in taxonomies, and whether postmortem practices mature enough to produce reproducible root-cause findings despite model stochasticity. The honest signal of progress is not more dashboards but a measurable reduction in *recurring* cross-organization failures — evidence that the field has built the shared institutional memory that other safety-critical engineering disciplines rely on.
