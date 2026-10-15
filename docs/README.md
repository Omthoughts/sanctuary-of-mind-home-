# Sanctuary of Mind — Complete Build Documentation

**Purpose:** A practical, implementation-oriented specification for building a reliable, voice-first wellness experience and an honest Amazon Build, Ship, Shape hackathon demonstration.

**Status:** Working specification, version 1.0, prepared 15 October 2026. It is not evidence that the application, integrations, deployment, or hackathon submission have been tested or accepted.

## Start here

1. Read `00_PRODUCT_VISION_AND_SCOPE.md`.
2. Read `01_PRODUCT_DESIGN_SPECIFICATION.md` and `02_USER_FLOWS_AND_STATE_MODEL.md`.
3. Read `03_IMPLEMENTATION_ROADMAP.md` before editing code.
4. Use `04_DATA_AND_API_CONTRACTS.md` while implementing.
5. Follow `05_CONVERSATION_AND_CONTENT_BIBLE.md` and `06_PRIVACY_CONSENT_AND_SAFETY.md`.
6. Use `07_REQUIREMENTS_TRACEABILITY_AND_TESTS.md` to verify every requirement.
7. Prepare the submission only using `08_HACKATHON_DEMO_AND_SUBMISSION_PLAYBOOK.md`.
8. Use `09_DEPLOYMENT_AND_REPRODUCIBILITY_RUNBOOK.md` for setup and release.
9. Follow `10_AGENT_EXECUTION_PROTOCOL.md` when using Antigravity or another coding agent.
10. Read `11_DECISION_LOG_AND_OPEN_QUESTIONS.md` before making consequential architecture decisions.

The prior Master Documentation Pack is preserved in `original_master_pack/` in the ZIP version of this delivery. Treat its architecture and prompts as useful context, but use this new pack as the implementation-focused supplement. Where a conflict exists, do not silently choose: record it in the decision log and resolve it after inspecting the actual repository.

## Non-negotiable principles

- Audit the existing project before editing it. Preserve working behaviour unless a documented change is approved.
- Build a fully usable browser simulator first; do not require physical Alexa hardware.
- Never claim genuine Alexa+, smart-home, music, wearable, HRV, or cloud integration unless it has been implemented and verified.
- Simulated devices, sensors, and measurements must be visibly labelled as simulated.
- Do not diagnose or treat mental-health conditions. Triguna-inspired classifications are reflective prompts, not clinical labels.
- No secret values in source control, logs, screenshots, prompts, or documentation.
- A no-paid-API demonstration path must remain available.
- Use small, reviewable phases with tests and a working state after each phase.
- Verify the current official hackathon rules and technical requirements directly before submission; this document is not a substitute for that check.

## Current known baseline (to verify in the repository)

Prior project notes describe a single-file React 18 application using a browser-based setup, an onboarding/profile flow, a four-question Triguna assessment, nine protocols, feedback, distress-support UI, and optional biometric-related UI. Prior notes also indicate a placeholder Supabase key and simulated camera PPG behaviour. These are **reported baseline facts, not fresh test results**. The coding agent must verify each item and document what is actually present.
