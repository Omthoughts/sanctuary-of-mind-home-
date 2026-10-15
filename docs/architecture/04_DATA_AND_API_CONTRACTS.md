# 04 — Data Dictionary and API Contracts

## 1. Contract principles

- Use TypeScript types and runtime validation at system boundaries.
- Store only what is necessary.
- Treat user-entered text as sensitive.
- Avoid storing raw voice audio or raw transcripts by default.
- Distinguish an empty value from an unknown value.
- Use UTC ISO-8601 timestamps for persisted records; display local time in the UI.
- All contracts below are proposed implementation contracts and must be reconciled with the actual code before adoption.

## 2. Core domain types

```ts
type DurationMinutes = 2 | 5 | 10 | 15;
type GuidanceTone = "gentle" | "practical" | "reflective" | "minimal";
type SpiritualMode = "secular" | "optional_reflection";
type FeedbackRating = "helpful" | "okay" | "not_helpful" | "uncomfortable";
type InputMode = "voice" | "text" | "manual";
type RecommendationConfidence = "rule_based";
type InterventionKind =
  | "grounding"
  | "gentle_breathing"
  | "guided_imagery"
  | "mindfulness"
  | "self_compassion"
  | "journaling"
  | "focus_reset"
  | "sleep_preparation"
  | "reflection";
```

### UserPreferences
```ts
interface UserPreferences {
  schemaVersion: 1;
  language: string;                 // BCP-47 tag, e.g. "en"
  guidanceTone: GuidanceTone;
  defaultDurationMinutes: DurationMinutes;
  preferredInterventions: InterventionKind[];
  dislikedInterventions: InterventionKind[];
  spiritualMode: SpiritualMode;
  narrationEnabled: boolean;
  ambientAudioEnabled: boolean;
  captionsEnabled: boolean;
  reducedMotion: boolean;
  persistenceEnabled: boolean;
  updatedAt: string;                // ISO-8601
}
```

Rules:
- Unknown language tags must fall back safely.
- A technique cannot be both preferred and disliked; validation must resolve the conflict by asking the user or prioritising the explicit dislike.
- `persistenceEnabled` is a user choice and must be respected.
- Do not add personal identifiers unless a documented requirement justifies them.

### CheckIn
```ts
interface CheckIn {
  id: string;                       // random non-semantic identifier
  createdAt: string;
  inputMode: InputMode;
  selectedNeeds: string[];          // controlled values, not diagnosis
  userText?: string;                // transient by default; do not persist by default
  durationMinutes: DurationMinutes;
  excludedInterventions: InterventionKind[];
}
```

Use a controlled set for `selectedNeeds`, such as:
`settle`, `focus`, `unwind`, `reflect`, `sleep_prepare`, `self_compassion`, `unsure`.
Free text may add context but must not be the sole source of a safety decision.

### InterventionDefinition
```ts
interface InterventionDefinition {
  id: string;
  title: string;
  kind: InterventionKind;
  minDurationMinutes: DurationMinutes;
  maxDurationMinutes: DurationMinutes;
  contraindicationNotes: string[];
  requiresBreathingFocus: boolean;
  supportsTranscript: boolean;
  scriptTemplateId: string;
  tags: string[];
}
```

The product must not imply medical contraindication screening has been performed. The metadata is for comfort/suitability routing and should include user-facing “skip this technique” choices.

### Recommendation
```ts
interface Recommendation {
  id: string;
  interventionId: string;
  durationMinutes: DurationMinutes;
  reason: string;
  alternatives: string[];
  appliedPreferenceIds: string[];
  engineVersion: string;
  createdAt: string;
  mode: "deterministic";
}
```

### SessionFeedback
```ts
interface SessionFeedback {
  id: string;
  sessionId: string;
  rating: FeedbackRating;
  reasonTags: string[];
  savePreferenceChange: boolean;
  createdAt: string;
}
```

### SessionSummary
```ts
interface SessionSummary {
  id: string;
  interventionId: string;
  startedAt: string;
  endedAt?: string;
  status: "started" | "paused" | "completed" | "stopped" | "failed";
  durationPlannedMinutes: DurationMinutes;
  durationActualSeconds?: number;
  feedbackId?: string;
}
```

## 3. Recommendation engine contract

Input:
```ts
interface RecommendationRequest {
  checkIn: CheckIn;
  preferences: UserPreferences;
  availableInterventions: InterventionDefinition[];
  sessionOverrides?: {
    excludedInterventions?: InterventionKind[];
    durationMinutes?: DurationMinutes;
    spiritualMode?: SpiritualMode;
  };
}
```

Output:
```ts
type RecommendationResult =
  | { ok: true; recommendation: Recommendation }
  | { ok: false; code: "NO_SUITABLE_INTERVENTION"; message: string };
```

Required rule order:
1. Validate request.
2. Apply current-session exclusions and explicit disliked techniques.
3. Apply accessibility and content preferences.
4. Filter to the selected time budget.
5. Score remaining items using transparent, deterministic rules.
6. Choose one result and at least one alternative when available.
7. Generate a plain-language reason using only known inputs.
8. Return a safe fallback choice if possible; otherwise ask the user to select manually.

Never use hidden biometric inference or Triguna labels as a diagnosis. If a reflective Triguna result is used, state that it is an optional self-reflection frame.

## 4. Proposed local service contracts

The initial browser simulator can call pure functions directly. If an API is later added, use contracts like these:

### `POST /api/check-ins`
Request: validated check-in fields, no raw audio.
Response: `{ "ok": true, "checkIn": CheckIn }`

### `POST /api/recommendations`
Request: `RecommendationRequest`.
Response: `RecommendationResult`.

### `POST /api/sessions`
Request: `{ "recommendationId": string, "startedAt": string }`.
Response: `{ "ok": true, "session": SessionSummary }`.

### `POST /api/feedback`
Request: `SessionFeedback`.
Response: `{ "ok": true, "feedbackId": string, "preferenceChangeApplied": boolean }`.

### `DELETE /api/local-data`
Only if a server exists and the authenticated scope is clear. Response must describe exactly which records were removed. A browser-only app should clear local app data and report that remote/vendor data is outside the app's control.

Do not implement network endpoints solely because they are listed here. They are contracts for a future API boundary, not a requirement to add a backend to the simulator.

## 5. MCP tool contract guidelines

If the optional MCP server is built:
- Tool names and schemas must be declared in code and tested.
- Validate all arguments at runtime.
- Return structured content and a concise human-readable result where supported.
- Do not return raw sensitive text unless strictly necessary.
- Avoid side-effecting tools that control physical devices in the initial demo.
- Name simulation tools explicitly, e.g. `simulate_environment_action`.
- Include a response field such as `simulation: true` and a statement that no physical device was controlled.
- Use idempotency where a repeated request could create duplicate sessions or feedback.
- Define timeouts and safe errors.
- Never place credentials in tool output or logs.

Suggested simulation response:
```json
{
  "ok": true,
  "simulation": true,
  "action": "set_lamp",
  "requestedState": "dim",
  "message": "Demo simulation only. No physical device was controlled."
}
```

## 6. Error model

Use stable machine-readable codes:
- `VALIDATION_ERROR`
- `UNSUPPORTED_CAPABILITY`
- `PERMISSION_DENIED`
- `NO_SPEECH_RESULT`
- `NO_SUITABLE_INTERVENTION`
- `PERSISTENCE_UNAVAILABLE`
- `PROVIDER_UNAVAILABLE`
- `MCP_UNAVAILABLE`
- `RESET_PARTIAL_FAILURE`
- `INTERNAL_ERROR`

Errors should include a safe user-facing message and optional non-sensitive diagnostic details. Never return stack traces, secrets, internal prompts, or raw sensitive transcripts to the client.

## 7. Persistence matrix

| Data | Default | If persistence enabled | Reset behaviour |
|---|---|---|---|
| Preferences | In-memory or local-only temporary state | Local browser storage or explicitly configured store | Remove app-managed copy |
| Raw check-in text | Do not persist | Only if a clear product reason and explicit consent are added | Remove app-managed copy |
| Session summary | No history by default | Store minimum fields needed | Remove local/remote copies within supported scope |
| Feedback | Apply to current session only | Store structured rating and tags if disclosed | Remove stored copy |
| Raw microphone audio | Never store by default | Not in initial scope | Not applicable |
| Simulated sensor values | Do not present as real data | Only store clearly labelled demo fixtures if needed | Clear fixtures |
| Emergency contact | Not collected by default | Out of scope unless separately designed and secured | Must support deletion if added |

## 8. Contract acceptance criteria

- Types and runtime validators agree.
- Invalid durations, unknown interventions, contradictory preferences, and oversized input are rejected safely.
- Recommendation outputs are deterministic for the same version and same inputs.
- No data is described as saved unless persistence was successful.
- Delete/reset outcomes are truthful and tested.
