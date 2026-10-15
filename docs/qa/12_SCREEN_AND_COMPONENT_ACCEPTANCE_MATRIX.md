# 12 — Screen and Component Acceptance Matrix

Use this checklist during implementation and design review.

| Screen/component | Required states | Acceptance test |
|---|---|---|
| Home | first-run, returning, loading, recoverable error | Primary action obvious; no false history |
| Privacy disclosure | first run, declined, acknowledged | Voice and data choices explained accurately |
| Preferences | default, partial, invalid, saved, reset | Optional fields can be skipped; changes are reversible |
| Voice input | idle, listening, result, no speech, denied, unsupported | Text/manual fallback always works |
| Check-in | empty, valid, too long, submitting, error | No empty submission; user text not lost unexpectedly |
| Recommendation | loading, result, no suitable item, alternatives | Explanation grounded in actual inputs |
| Session player | loading, playing, paused, stopped, complete, TTS unavailable | Controls work; transcript available |
| Feedback | unanswered, submitted, failure | No coercion; save claim truthful |
| History | empty, populated, disabled | Only shows history if it is actually stored |
| Reset dialog | open, cancel, confirm, partial failure | Clear scope and truthful result |
| Safety support | triggered, normal, exit | No diagnosis or false alert claim |
| Simulation panel | idle, action simulated, error | Persistent disclosure; no physical-control implication |
| Navigation | mobile, desktop, keyboard focus | No dead links; current location clear |
| Toast/notice | success, warning, error | Accessible announcement; not colour-only |
| Loading state | pending, timeout, failure | No indefinite spinner |
| Empty state | no data, feature unavailable | Helpful next action, no misleading promise |

## Component-level rules

Every interactive component must have:
- accessible name and semantic role;
- keyboard operation;
- visible focus;
- disabled state when action cannot be performed;
- loading state for asynchronous work;
- error feedback;
- responsive layout;
- reduced-motion handling where relevant;
- test coverage for meaningful state changes.

A screenshot alone is not proof that an interaction works. Pair visual review with interaction tests.
