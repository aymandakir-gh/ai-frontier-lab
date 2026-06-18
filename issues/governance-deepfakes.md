---
id: governance-deepfakes
title: Deepfakes and synthetic media
category: governance
severity: high
status: active
summary: >-
  High-severity governance entry on deepfakes and synthetic media: realistic
  synthetic audio/video/images enable fraud, NCII, and disinformation faster
  than detection and provenance systems can keep up
tags:
  - deepfakes
  - synthetic-media
  - provenance
updated: '2026-06-18'
related:
  - governance-content-provenance
  - governance-accountability
  - governance-audits-and-standards
---

## Problem

Generative models now produce synthetic images, voice, and video that are difficult for humans to distinguish from genuine recordings, and the cost of producing them has collapsed. A few seconds of reference audio is enough for voice cloning, and consumer image and video tools (diffusion-based image generators, and increasingly capable text-to-video systems) can fabricate a plausible scene on demand. The governance problem is not any single fake but the asymmetry: generation is cheap, fast, and continuously improving, while reliable attribution and detection lag behind and degrade as soon as a detector is published.

The concrete harms are already well documented. Non-consensual intimate imagery (NCII), overwhelmingly targeting women and including minors via "nudify" apps, is the largest category by volume. Financial fraud is the fastest-growing: cloned-voice "family emergency" scams and CEO/CFO impersonation on video calls have been used to authorize fraudulent transfers. In the civic domain, synthetic robocalls and fabricated candidate audio/video target elections, with audio deepfakes especially dangerous because they lack the visual artifacts people are trained to notice and spread well over phone and messaging channels.

Harm concentrates where verification is weak and stakes are high: real-time voice over phone networks, encrypted messaging where platform-level provenance is absent, and low-resource languages and regions with little detection tooling or local fact-checking capacity. The broader second-order risk is the "liar's dividend" — once the public knows realistic fakes exist, authentic recordings can be dismissed as fabricated, eroding the evidentiary value of media itself.

## Current mitigations

- **Content provenance and signing** — `C2PA` / Content Credentials attach cryptographically signed metadata describing how an asset was created and edited; adopted by several camera makers, editing tools, and generative platforms. Establishes origin for cooperating producers but does not prove an unlabeled file is fake.
- **Invisible watermarking of AI outputs** — techniques such as Google DeepMind's `SynthID` embed signals in generated images, audio, and text; some model providers watermark outputs by default. Survives mild transformations better than metadata but is not universal across models and can be weakened by heavy editing or re-rendering.
- **Forensic detection classifiers** — supervised detectors for face-swap and fully synthetic media, trained on datasets like `FaceForensics++`, `DFDC`, and the `ASVspoof` series for synthetic speech. Useful in-distribution but generalize poorly to unseen generators and degrade under compression and re-encoding.
- **Platform policy and labeling** — major platforms require disclosure of realistic AI-generated content, apply labels, and remove NCII; hash-matching services (e.g., `StopNCII`, NCMEC hashing for CSAM) block known images from re-upload.
- **Regulation** — the EU AI Act mandates marking and disclosure of synthetic content; the US `TAKE IT DOWN Act` and Denmark-style "likeness" proposals target NCII and impersonation; some jurisdictions restrict deceptive election deepfakes.
- **Process controls** — out-of-band verification (call-back on a known number, code words, multi-person sign-off for payments) remains the most reliable defense against voice/video impersonation fraud.

## Open gaps

- **No reliable detector for unlabeled media in the wild** — detection accuracy collapses on novel generators, after social-media re-compression, and on short or low-quality clips; there is no general-purpose "is this real?" tool.
- **Provenance is opt-in and strippable** — C2PA metadata is easily removed by screenshotting or re-encoding, and absence of credentials carries no meaning, so coverage gaps undermine trust signals.
- **Watermark robustness and adversarial removal** — watermarks can be degraded or stripped, open-weight models can be run without any marking, and there is no interoperable standard verifiers can rely on across providers.
- **Real-time audio/video** — live voice and video-call impersonation leaves little time for forensic analysis and bypasses asset-level provenance entirely.
- **Cross-platform, cross-jurisdiction enforcement** — takedown and legal remedies are slow relative to viral spread; victims, especially of NCII, lack fast recourse, and standards adoption is fragmented globally.
- **Evaluation realism** — public benchmarks lag behind deployed generators, so reported detector accuracy overstates real-world performance.

## Watch (2027+)

Expect the center of gravity to shift from detecting fakes toward proving authenticity. The credible path is hardware- and capture-level provenance — signing at the sensor in cameras and phones plus durable, interoperable provenance that survives ordinary edits — combined with verification surfaced directly in platforms and messaging apps rather than buried in metadata. Real progress would look like provenance becoming a default, checkable property of mainstream capture and distribution, and watermark/provenance standards that interoperate across providers and remain meaningful even when open-weight models opt out.

On the threat side, watch real-time interactive deepfakes (live impersonation in calls and video conferencing) and fully synthetic personas used for sustained social engineering, which strain asset-level defenses and push verification toward identity and behavior rather than media forensics. Meaningful indicators to track: whether independent evaluations show detectors generalizing to unseen generators, whether NCII takedown latency drops to hours, and whether provenance adoption reaches the long tail of consumer and open-source tools rather than only large commercial platforms. Absent that breadth, the liar's dividend grows regardless of how good any single detector becomes.
