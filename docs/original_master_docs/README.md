# Sanctuary of Mind — Voice-First Alexa+ Hackathon Documentation Pack

**Prepared:** 13 October 2026  
**Purpose:** A source-of-truth documentation pack for building Sanctuary of Mind with Google Antigravity and submitting a truthful, hardware-free Alexa+ simulation to the Amazon Build, Ship, Shape hackathon.

## Read in this order

1. `MASTER_BUILD_BRIEF.md` — the primary prompt to give Antigravity.
2. `architecture/PRODUCT_REQUIREMENTS.md` — product goals, users, requirements, and acceptance criteria.
3. `architecture/TECHNICAL_ARCHITECTURE.md` — proposed stack, components, APIs, data model, and boundaries.
4. `architecture/VOICE_UX_AND_INTERVENTIONS.md` — voice-first conversation, meditation generation, and feedback.
5. `architecture/SECURITY_PRIVACY_SAFETY.md` — privacy, security, wellness safety, and threat controls.
6. `prompts/ANTIGRAVITY_RULES.md` — persistent project rules to place in the repository.
7. `prompts/AGENT_SUBPROMPTS.md` — phase prompts and specialist sub-agent prompts.
8. `qa/TEST_PLAN_AND_RELEASE_GATES.md` — tests, verification, demo, and release gates.
9. `research/TOOLS_AND_OFFICIAL_RESOURCES.md` — verified resources and integration limitations.
10. `research/DECISIONS_AND_OPEN_QUESTIONS.md` — explicit decisions, assumptions, and unresolved issues.

## Important project context

The current project has been described as a single-file React 18 application (`index (1).html`) plus `netlify.toml`, with a four-question Triguna assessment, nine recommendation protocols (three gunas × three mind styles), distress detection, optional/simulated biometric flows, profile/feedback UI, and placeholder Supabase/Google Sheets integrations. These details are a starting hypothesis from prior project inspection, not a substitute for re-inspecting the actual repository.

**Before changing code, the agent must inspect the current repository and report what exists.** Do not assume filenames, functions, dependencies, credentials, or test status without checking.

## Ground rules

- The app is a wellness/self-reflection product, not a diagnostic or emergency service.
- Triguna categories are reflective concepts, not clinical diagnoses or proven measurements of brain networks.
- Do not claim simulated HRV, camera PPG, Alexa, smart-home, music, or TV integration is real.
- The first complete milestone must work without Alexa or smart-home hardware.
- Do not put secrets in browser code or commit `.env` files.
- Do not replace the existing app wholesale. Preserve behavior and refactor incrementally.
- No paid API or cloud resource should be activated without the owner confirming cost and quota.
