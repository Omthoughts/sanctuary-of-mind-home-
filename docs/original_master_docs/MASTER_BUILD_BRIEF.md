# MASTER BUILD BRIEF — Sanctuary of Mind
## Voice-first personalized wellness companion and Alexa+ hackathon simulation

You are the principal engineer and technical lead working inside the user's existing Sanctuary of Mind repository in Google Antigravity. Build a polished, reliable, hardware-free voice-first wellness experience and a separately testable MCP server. The owner is entering the Amazon Build, Ship, Shape hackathon and does not currently have Alexa hardware or smart-home hardware.

This file is the controlling build brief. Read all project documents in this pack before implementation. If documents conflict, follow this priority: explicit owner instruction → hackathon official rules → security/privacy/safety requirements → product requirements → technical architecture → implementation convenience. Record conflicts instead of silently guessing.

## Product vision

Sanctuary of Mind helps a person pause, describe how they feel, choose what kind of support they want, receive a personalized guided intervention, listen to it, and reflect afterward. The primary experience is spoken conversation; visual UI is a supporting control surface for setup, accessibility, permission, session controls, playback status, and the hackathon demonstration.

This is not merely a meditation chatbot. It is a **personalized wellness experience orchestrator**:
1. Understand the user's current stated need.
2. Respect long-term likes/dislikes and accessibility preferences.
3. Select an appropriate intervention from a curated library.
4. Generate a profile-aware script from validated templates/content.
5. Speak the guidance and optionally play authorized ambient audio.
6. Ask for feedback and adjust future recommendations with consent.
7. Offer simulated environment actions in the demo, but never claim real devices were controlled.

## Required working method

### Phase 0 — repository reconnaissance; no code edits yet
- Inspect the repository tree, current branch, package manifests, build/deploy configuration, and all existing frontend/backend files.
- Inspect `index (1).html` or its actual successor and identify current assessment scoring, nine protocols, distress logic, profile/preferences, biometric simulation, persistence, and audio/voice behavior.
- Run existing build/tests if available. Capture baseline results and screenshots.
- Identify secrets/placeholders and do not print secret values into reports or logs.
- Produce `docs/REPO_AUDIT.md`, `docs/BASELINE_TEST_REPORT.md`, and a proposed migration plan.
- Do not delete, overwrite, or replace the current working application before this report.

### Phase 1 — requirements and design
- Map existing features to `architecture/PRODUCT_REQUIREMENTS.md`.
- Create a feature traceability matrix linking requirement → module → test.
- Propose the smallest incremental refactor that supports a voice-first experience.
- Confirm the exact currently installed Antigravity surface/version and use its available features; do not assume a feature is available in the user's build.
- Keep UI design focused: profile/preferences, conversation transcript, microphone permission and status, audio player, feedback, data controls, and clearly labeled simulated environment panel. Voice is the main experience; do not spend the project budget on a large conventional dashboard.

### Phase 2 — shared domain engine
Implement framework-independent TypeScript domain logic for:
- profile/preferences validation;
- check-in/session state;
- intervention selection;
- template-based guided script composition;
- safety routing and stop/exit handling;
- feedback capture and preference updates;
- environment-action proposals behind a mock adapter.

Reuse existing scoring and recommendation logic. Do not invent new clinical mappings or replace the existing nine-protocol library without documenting why and preserving regression tests. Separate long-term preference data from current-session answers. User's explicit current choice overrides inferred or historical preferences.

### Phase 3 — voice-first web simulator
- Preserve the existing application while moving code into maintainable modules incrementally.
- Support text input as a reliable fallback.
- Add browser speech recognition only where supported and only after explicit microphone permission. Provide clear permission status and graceful failure.
- Use browser speech synthesis for spoken assistant responses and meditation narration where supported. Detect unsupported voices, cancellation, and synthesis errors.
- Provide play/pause/resume/stop and an obvious exit. A transcript and session summary may be visible but should not compete with the spoken experience.
- Do not claim a live Alexa runtime or real device connection. Label the interface “Alexa-style simulation” or equivalent.
- Ensure keyboard, screen-reader, contrast, reduced-motion, and mobile responsiveness support.

### Phase 4 — meditation and intervention experience
Build a curated intervention library and safe script composition system. Initial options:
- sensory grounding;
- gentle paced breathing (always optional; never force breath holds);
- progressive muscle relaxation with opt-out body areas;
- guided imagery;
- mindfulness/nonjudgmental observation;
- self-compassion;
- reflective journaling;
- short focus reset;
- sleep-preparation relaxation;
- Triguna-inspired reflection, only as a non-diagnostic reflective lens.

A session should include a personalized but non-assumptive opening, purpose, instructions, optional pauses, a gentle close, and feedback. Estimate duration from word count and selected speech rate, and explain that actual duration varies. Do not use an LLM as the sole source of intervention content. Use approved templates and validated content first; use a model only for bounded personalization/rephrasing when configured.

### Phase 5 — MCP server
Create a separate Node.js/TypeScript service in `mcp-server/` using the official MCP TypeScript SDK and Zod validation. Use Streamable HTTP for the remote MCP path. Select the SDK version based on the official current docs and hackathon rules; pin dependencies and document the chosen protocol version. The official TypeScript SDK v1 docs implement MCP spec `2025-11-25`; do not mix v1 and v2 import paths. Verify any newer SDK before adopting it.

Expose narrow, schema-validated tools:
- `get_profile_preferences`
- `update_profile_preferences`
- `start_wellness_checkin`
- `record_checkin_answer`
- `get_intervention_recommendation`
- `generate_guided_meditation`
- `record_session_feedback`
- `get_session_summary`
- `delete_user_wellness_data`
- `propose_environment_action`
- `get_integration_capabilities`

Use fake/demo data in local mode. Keep user identity and authorization explicit. Do not expose arbitrary database queries, arbitrary URLs, shell execution, or unrestricted device commands as tools. MCP server must run independently of the browser frontend and have automated tests.

**Do not claim the hackathon simulation is using Amazon's gated Alexa+ MCP Toolkit.** The public route is a self-hosted MCP server or the official-rule-compliant simulation route. The toolkit/partner-only integration is unavailable to ordinary hackathon participants according to the official FAQ at research time.

### Phase 6 — persistence and AI provider
- Keep the domain engine usable without a database and without a paid model API.
- Provide a local/demo adapter first. Add Supabase only after inspecting the existing setup and verifying environment configuration.
- Never place Supabase service-role keys or model API keys in frontend code.
- Use a provider abstraction for LLM text generation. Default to deterministic curated templates. Enable Gemini or another provider only when an API key, quotas, billing, privacy terms, and deployment secrets are explicitly configured.
- A Google AI Pro subscription or Antigravity quota must not be treated as automatic Gemini API credits for a deployed application. Check current Google documentation and account billing separately.
- Add timeouts, retry limits, schema validation, output limits, and safe fallback behavior.

### Phase 7 — security, safety, and quality
Implement the controls in `architecture/SECURITY_PRIVACY_SAFETY.md`. In particular:
- data minimization and opt-in retention;
- user-scoped access and deletion;
- server-side secret management;
- schema validation and rate limits;
- safe output rendering;
- no unsupported medical claims;
- distress/crisis response that does not diagnose;
- no autonomous environmental actuation;
- explicit confirmation before any real future device action;
- complete test coverage of safety-critical branches.

### Phase 8 — verification and demo
- Follow `qa/TEST_PLAN_AND_RELEASE_GATES.md`.
- Run lint, typecheck, unit tests, integration tests, build, and browser-based smoke tests.
- Use Antigravity's browser/Chrome tooling only if available in the installed version. If not, use Playwright or another project-appropriate test runner and report limitations.
- Record what was actually tested. Hardware testing must be marked “not performed” until real compatible hardware and integration credentials exist.
- Provide a concise demo script and a demo that clearly shows the simulator, generated script, spoken playback, feedback, and a changed next recommendation.
- Produce `docs/IMPLEMENTATION_REPORT.md` with completed features, evidence, known limitations, test results, costs/quotas to verify, and next steps.

## Definition of done

A new user can configure preferences, complete a conversational check-in using text or permitted speech input, receive a suitable intervention, generate a personalized guided meditation, hear it through browser speech synthesis, stop it at any time, provide feedback, and receive a meaningfully adjusted next recommendation. The flow works without Alexa hardware, without a paid model API, and without real smart-home devices. The MCP server can be launched and tested separately. The README gives exact setup/test commands. No fake integrations or test results are represented as real.

## How to operate as an agent
- Work in small, reviewable phases and create a plan before editing.
- Use separate subagents for independent audits or reviews; do not let parallel agents edit the same files simultaneously.
- Keep the main agent responsible for integration and decisions.
- Before destructive commands, migrations, deployments, purchases, or enabling paid services, ask the owner.
- Do not make a claim unless backed by inspected code, executed tests, or a cited official source.
- At each phase, summarize changed files, commands run, results, unresolved risks, and the next proposed phase.
