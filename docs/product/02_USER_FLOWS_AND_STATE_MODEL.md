# 02 — User Flows and State Model

## 1. Main happy path

`App load → Welcome → Privacy disclosure (first run) → Preferences (optional) → Check-in → Recommendation → Guided session → Feedback → Home`

At every step, allow a safe exit or return. Guest mode is a first-class path.

## 2. Detailed flows

### Flow A — First-time guest
1. Load application and verify required assets.
2. Display welcome screen.
3. Show concise privacy/microphone explanation.
4. User chooses guest mode.
5. User can skip preferences or set any subset.
6. User starts a check-in by voice, text, or manual selection.
7. Validate input and create a check-in object.
8. Recommendation engine applies deterministic rules.
9. Display recommendation and explanation.
10. User starts, changes, or declines practice.
11. Player runs and supports pause/resume/stop.
12. On completion or stop, offer optional feedback.
13. Apply only explicit preference updates; return to Home.

### Flow B — Returning user
1. Load saved preferences only if storage has been enabled.
2. Show “Continue with my preferences” and “Start fresh.”
3. Never assume the prior user's identity on a shared device.
4. Start check-in or select a practice directly.
5. Apply preference settings; allow one-session overrides without permanently changing the profile unless the user confirms.

### Flow C — Microphone denied/unavailable
1. Explain that voice input is unavailable.
2. Do not repeatedly prompt the permission dialog.
3. Offer text entry and manual quick choices.
4. Continue through the same recommendation engine.
5. The rest of the experience must work unchanged.

### Flow D — Speech recognition produces no result
1. Show “I didn’t catch that.”
2. Offer retry, type instead, or choose manually.
3. Preserve the user's other form selections.
4. Do not submit an empty check-in.

### Flow E — Audio or speech synthesis unavailable
1. Show the written script.
2. Offer manual reading and any available browser voice option.
3. Keep play controls disabled only for the unavailable feature.
4. Do not block session completion or feedback.

### Flow F — User dislikes recommendation
1. User selects “Choose another” or “Not for me.”
2. Ask optionally what they want to avoid.
3. Exclude the disliked technique for this session.
4. Save a long-term dislike only with explicit confirmation.
5. Generate another recommendation or show a transparent list of available choices.

### Flow G — Distress or immediate danger
1. Detect explicit user language indicating possible immediate danger using conservative, documented rules.
2. Interrupt ordinary recommendation flow.
3. Show supportive, direct safety guidance and encourage immediate contact with emergency services or a trusted nearby person where appropriate.
4. Do not attempt diagnosis, promise monitoring, or pretend an alert was sent.
5. Provide a visible exit and support information.
6. Log only the minimum event information needed for debugging, without raw sensitive text by default.

### Flow H — Reset/delete
1. User opens About & privacy or preferences.
2. Selects “Reset my data.”
3. Explain exactly what will be removed and what cannot be removed (for example, browser/vendor speech processing is outside the app's control).
4. Ask for confirmation.
5. Clear app-managed local preferences/history and revoke optional local state.
6. If a remote persistence service exists, execute and verify deletion there too; otherwise clearly state that only local app data is cleared.
7. Return to first-run state and show a truthful result.

## 3. Application state machine

Use a small explicit state model. Do not rely on many unrelated booleans that can create impossible combinations.

States:
- `booting`
- `welcome`
- `privacy_disclosure`
- `preferences`
- `ready`
- `checkin_idle`
- `checkin_listening`
- `checkin_processing`
- `checkin_error`
- `recommendation_ready`
- `session_loading`
- `session_playing`
- `session_paused`
- `session_stopped`
- `session_completed`
- `feedback`
- `safety_support`
- `reset_confirm`
- `error_recoverable`

Each transition must have a source state, event, guard (if any), effect, and destination state. Examples:
- `ready + START_CHECKIN → checkin_idle`
- `checkin_idle + START_VOICE → checkin_listening` only when the browser capability is available and permission is granted.
- `checkin_listening + RESULT_RECEIVED → checkin_processing`
- `checkin_listening + PERMISSION_DENIED → checkin_idle` with text/manual fallback.
- `checkin_processing + RECOMMENDATION_READY → recommendation_ready`
- `recommendation_ready + START_SESSION → session_loading`
- `session_loading + SESSION_READY → session_playing`
- `session_playing + PAUSE → session_paused`
- `session_paused + RESUME → session_playing`
- `session_playing + STOP → session_stopped`
- `session_playing + COMPLETE → session_completed`
- any ordinary flow state + `URGENT_SAFETY_TRIGGER → safety_support`, with conservative guard and reviewable rule.
- `reset_confirm + CONFIRM_RESET → welcome` after deletion result is verified.

## 4. Domain objects and event names

Use typed domain events such as:
- `APP_READY`
- `PREFERENCES_SAVED`
- `CHECKIN_SUBMITTED`
- `VOICE_PERMISSION_DENIED`
- `RECOMMENDATION_CREATED`
- `SESSION_STARTED`
- `SESSION_PAUSED`
- `SESSION_RESUMED`
- `SESSION_STOPPED`
- `SESSION_COMPLETED`
- `FEEDBACK_SUBMITTED`
- `PREFERENCE_UPDATE_CONFIRMED`
- `RESET_REQUESTED`
- `RESET_COMPLETED`
- `RESET_FAILED`
- `URGENT_SAFETY_TRIGGER`

Events should not contain unnecessary raw transcript, health data, or identifiers. Never put secrets in event payloads.

## 5. Failure handling matrix

| Failure | Required response | Must not happen |
|---|---|---|
| Offline | Core static app remains usable where feasible; disclose unavailable remote features | Infinite spinner |
| Microphone denied | Text/manual fallback | Blocking modal loop |
| Speech API unsupported | Disable voice input with explanation | Runtime crash |
| TTS unsupported | Show transcript | Empty player |
| Invalid user input | Inline validation | Silent failure |
| Remote store unavailable | Continue locally if configured and disclose non-persistence | Claim saved remotely |
| Model provider unavailable | Deterministic recommendation/template fallback | Blank response |
| MCP server unavailable | Simulator remains usable in local mode | Whole app unusable |
| Reset fails remotely | Report partial result and next action | Claim all data deleted |
| Safety trigger | Show support guidance | Diagnose or claim alert sent |

## 6. State model acceptance criteria

- No state can play two sessions at once.
- Starting a new session stops or explicitly resolves any active session.
- Pause/resume/stop are idempotent or safely guarded.
- User preferences survive refresh only when persistence is enabled.
- A user can complete the flow with no microphone, model API, remote database, wearable, or physical device.
- Error recovery does not erase entered text without warning.
