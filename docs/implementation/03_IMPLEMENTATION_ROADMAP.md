# 03 — Executable Implementation Roadmap

## 0. Operating rule

Do not start by rewriting the application. First inspect the actual repository and run a baseline. Record verified facts separately from assumptions. The roadmap is a sequence of gates, not permission to skip verification.

## Phase 0 — Repository audit and baseline

Tasks:
1. List repository files and identify entry points, build system, dependencies, environment variables, and deployment configuration.
2. Inspect the existing HTML/React app, styles, Triguna scoring, protocol mapping, feedback, safety UI, and persistence code.
3. Search for placeholder credentials, hard-coded secrets, unimplemented buttons, unsafe HTML, and external network dependencies.
4. Run the existing app and available tests without changing code.
5. Capture screenshots of key current screens and write a verified baseline report.
6. Confirm which current behaviours are working, broken, simulated, or unverified.
7. Create a Git branch/commit before changes if repository tooling is available.

Exit gate:
- Baseline report exists.
- Existing functionality and known regressions are documented.
- No destructive rewrite has started.
- Existing launch instructions are reproducible or the failure is documented.

## Phase 1 — Stabilise the existing application

Tasks:
1. Remove or disable placeholder remote persistence that may imply data is saved when it is not.
2. Ensure the app starts without secret keys or paid API credentials.
3. Repair fatal runtime/build errors and broken core navigation.
4. Add a small regression test set for the existing assessment and protocol mapping.
5. Make all visible buttons either work or be clearly disabled with explanation.

Exit gate:
- App launches from documented instructions.
- Baseline core flow works.
- No secret is committed.
- Regression tests pass or failures are recorded with reasons.

## Phase 2 — Design system and responsive shell

Tasks:
1. Implement CSS tokens and reusable components from the Product Design Specification.
2. Build navigation and screen layout without removing existing core logic.
3. Add mobile/desktop responsive layouts and accessibility states.
4. Implement privacy/about and simulation banners.
5. Capture screenshots at representative narrow and wide widths.

Exit gate:
- Every required screen has a coherent layout.
- Keyboard navigation works through the core flow.
- No placeholder or dead controls remain in the screens completed so far.

## Phase 3 — User flow and preference model

Tasks:
1. Implement the explicit state model.
2. Add guest mode and optional preference onboarding.
3. Validate and persist preferences locally only after clear user choice.
4. Add reset/delete functionality for app-managed local data.
5. Ensure denied permissions do not block manual input.

Exit gate:
- First-time and returning-user flows pass manual acceptance tests.
- Refresh/reset behaviour matches the documented persistence rules.

## Phase 4 — Voice and check-in

Tasks:
1. Add a capability adapter for browser speech recognition.
2. Add explicit permission and listening states.
3. Add text/manual input fallback.
4. Normalise input into a typed check-in object.
5. Add tests for empty, long, unsupported, and malformed input.
6. Never assume all browsers implement speech recognition identically.

Exit gate:
- Voice path works in at least one explicitly named supported browser.
- Manual path works in all supported browsers.
- Permission denial and unsupported API cases are tested.

## Phase 5 — Deterministic recommendation engine

Tasks:
1. Define the intervention catalogue and metadata.
2. Define transparent rules using stated need, duration, preferences, exclusions, and accessibility settings.
3. Exclude techniques explicitly disliked or unsuitable for the current session.
4. Return one recommendation plus a plain-language explanation and alternatives.
5. Preserve existing Triguna logic only after verifying it; make reflective framing optional.
6. Add unit tests for every rule and priority conflict.

Exit gate:
- Same inputs yield predictable outputs.
- Recommendation never claims diagnosis or certainty.
- Every recommendation includes a reason and an alternative.

## Phase 6 — Session player and feedback loop

Tasks:
1. Implement guided script playback using supported browser speech synthesis, with readable transcript.
2. Add play/pause/resume/stop/restart and completion states.
3. Add optional ambient audio only when licensed/available assets exist.
4. Add post-session feedback.
5. Apply immediate session exclusions by default; only persist long-term preferences after explicit confirmation.
6. Verify that feedback does not make unsupported clinical claims.

Exit gate:
- A complete session can be played and stopped.
- Feedback changes the next choice in a testable, understandable way.
- TTS unavailable does not break the experience.

## Phase 7 — Safety, privacy, and accessibility hardening

Tasks:
1. Implement conservative safety triggers and approved response copy.
2. Review every data field and persistence path.
3. Test keyboard access, contrast, reduced motion, screen-reader announcements, and mobile layout.
4. Ensure simulated biometrics/environment actions are labelled.
5. Add tests for consent decline and reset/delete.

Exit gate:
- Safety and privacy scenarios pass.
- No unsupported emergency-contact, clinician-alert, diagnostic, or sensor claims.
- Accessibility blockers are fixed or explicitly documented.

## Phase 8 — Optional MCP server

Only start after Phases 1–7 have a stable demo path.

Tasks:
1. Verify the exact current official hackathon rules and MCP spec/version.
2. Create a separate Node.js/TypeScript server with pinned dependencies and documented commands.
3. Expose only necessary tools with Zod or equivalent input validation.
4. Use Streamable HTTP if required by current rules.
5. Implement a no-secrets local test path.
6. Add schema, validation, error, timeout, and unavailable-service tests.
7. Test with an official-compatible MCP client and document the evidence.
8. Do not claim Alexa+ device runtime access or partner-only toolkit access.

Candidate tools (final names/contracts must match implementation):
- `start_wellness_checkin`
- `get_wellness_recommendation`
- `save_user_preferences`
- `start_audio_session`
- `record_session_feedback`
- `get_demo_environment_state`
- `simulate_environment_action`

Exit gate:
- Server starts from a clean checkout.
- Tools return documented structured outputs.
- Inputs are validated and errors are safe.
- Simulator still works if the server is down.

## Phase 9 — End-to-end verification and demo

Tasks:
1. Run unit, integration, and manual end-to-end tests.
2. Run the app without paid API credentials and without physical devices.
3. Test all core failure cases.
4. Create a clean demo profile and script.
5. Record a short demo showing a full user journey and all simulation disclosures.
6. Verify repository/source inclusion and the current official submission requirements.
7. Freeze features before final recording; fix only release-blocking issues.

Exit gate:
- Demo succeeds twice from a fresh start.
- No misleading integration claims.
- Build/test results and known limitations are recorded.
- Submission is reviewed by a human before uploading.

## Definition of done for each task

A task is complete only when:
- the code is implemented;
- the relevant test is added or the reason for no test is documented;
- tests were actually run and results recorded;
- error/empty/loading states are handled;
- accessibility and privacy implications were considered;
- documentation is updated;
- no unrelated files were changed unnecessarily.

## Priority rule under deadline pressure

Prefer a smaller, complete, tested, transparent end-to-end simulator over a broad collection of unfinished integrations. Do not start an optional feature if it risks breaking the P0 path.
