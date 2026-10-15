# 07 — Requirements Traceability and Test Plan

## 1. Purpose

Every requirement must map to an implementation, a verification method, and recorded evidence. Do not mark a test as passed unless it was actually run.

## 2. Traceability matrix

| ID | Requirement | Priority | Verification | Evidence |
|---|---|---:|---|---|
| P-001 | App opens without paid API credentials | P0 | Clean-start manual test | Command/output and screenshot |
| P-002 | Guest mode is available | P0 | First-run E2E | Video or test report |
| P-003 | Voice, text, and manual check-in paths exist | P0 | Browser tests/manual | Browser/version and results |
| P-004 | Microphone denial does not block use | P0 | Permission-denied test | Test record |
| P-005 | Recommendation is deterministic for same input/version | P0 | Unit test | Test output |
| P-006 | Explicit dislikes exclude techniques | P0 | Unit tests | Test output |
| P-007 | Recommendation includes reason and alternatives | P0 | Unit/schema test | Assertion results |
| P-008 | Session can start, pause, resume, stop, and complete | P0 | Player state tests | Test report |
| P-009 | TTS unavailable falls back to transcript | P0 | Capability mock/manual | Test report |
| P-010 | Feedback is collected without pressure | P0 | Manual test | Screenshot/notes |
| P-011 | Long-term preference change requires confirmation | P0 | Unit/E2E | Test output |
| P-012 | Reset removes app-managed local data | P0 | Storage test | Before/after evidence |
| P-013 | Remote save is never claimed after failure | P0 | Failure injection | Test output |
| P-014 | Simulated device actions disclose simulation | P0 | UI and action test | Screenshot/video |
| P-015 | Simulated biometrics are labelled | P0 if shown | UI review | Screenshot/video |
| P-016 | No diagnosis or clinical efficacy claim | P0 | Copy audit | Checklist |
| P-017 | Safety flow avoids false emergency-alert claim | P0 | Safety scenario test | Test report |
| P-018 | Keyboard navigation and focus are usable | P0 | Manual accessibility pass | Checklist |
| P-019 | Mobile layout has no critical overflow | P0 | Responsive test | Screenshots |
| P-020 | Core Triguna/protocol behaviour is preserved or documented | P0 | Regression test | Test output |
| M-001 | MCP tools validate input and return defined output | P1 | Contract tests | Test report |
| M-002 | MCP transport matches current official requirement | P1 | Protocol/client test | Version and evidence |
| M-003 | Simulator remains usable if MCP server is unavailable | P1 | Failure injection | Test report |
| D-001 | Fresh setup instructions work | P0 | Clean checkout setup | Transcript |
| D-002 | Demo succeeds twice from fresh start | P0 | Rehearsal | Recording/notes |
| D-003 | Submission claims match tested capability | P0 | Human review | Signed checklist |

## 3. Required automated test layers

### Unit tests
- preference validation;
- recommendation ranking and tie-breaking;
- disliked-technique exclusions;
- duration filtering;
- recommendation reason generation;
- session state transitions;
- feedback-to-preference mapping;
- reset functions;
- safety trigger rules;
- simulation action responses.

### Integration tests
- UI to recommendation engine;
- player to browser speech synthesis adapter;
- optional storage success/failure;
- optional MCP client to server;
- model provider failure to deterministic fallback.

### Manual acceptance tests
- fresh first run;
- returning user;
- microphone denied;
- speech recognition unsupported;
- speech result empty;
- TTS unavailable;
- remote store unavailable;
- user stops mid-session;
- user chooses an uncomfortable practice;
- safety-support flow;
- reset/delete;
- narrow mobile layout;
- keyboard-only use;
- simulated environment action.

## 4. Example test scenarios

### Scenario T-01 — Guest path
Given no stored preferences and no network credentials, when the app loads, the user can choose guest mode and complete a manual check-in.

### Scenario T-02 — Disliked breathing
Given `gentle_breathing` is in the user's disliked interventions, when a recommendation is generated, the result must not select it.

### Scenario T-03 — Permission denied
Given microphone permission is denied, when voice input is attempted, the app explains the limitation and preserves a working text/manual route.

### Scenario T-04 — Provider unavailable
Given optional model provider configuration is missing or unavailable, the app produces a curated deterministic practice and does not crash.

### Scenario T-05 — Storage failure
Given persistence fails, the app does not show a “saved” success state and explains what remains available locally.

### Scenario T-06 — Simulation honesty
Given the user requests a demo lighting action, the result explicitly says it is simulated and no physical device was controlled.

### Scenario T-07 — Session stop
Given a session is playing, when the user selects Stop, audio stops, state updates, and the user may return or provide feedback.

### Scenario T-08 — Reset
Given local preferences and history exist, when reset is confirmed, app-managed data is cleared and the first-run state returns.

## 5. Test evidence format

For every run, record:
- test ID;
- date/time;
- commit hash or source version;
- environment and browser/version;
- exact command or manual steps;
- expected result;
- actual result;
- pass/fail/blocked;
- relevant screenshot/log reference;
- issue ID and next action.

Do not fabricate screenshots, browser runs, logs, or pass results.

## 6. Release gates

### Gate A — Core flow
No P0 blocker in welcome, check-in, recommendation, player, feedback, reset.

### Gate B — Safety and privacy
No known misleading medical, biometric, persistence, or simulated-action claim.

### Gate C — Accessibility and responsive
No known critical keyboard, focus, contrast, or mobile blocker.

### Gate D — Submission
Source is included, demo follows current official rules, all claims are accurate, and the demo has been rehearsed twice from a clean start.
