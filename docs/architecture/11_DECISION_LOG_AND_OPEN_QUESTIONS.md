# 11 — Decision Log and Open Questions

## 1. Confirmed constraints from project context

These are project constraints carried forward into this specification:
- Product name: Sanctuary of Mind.
- Target: Amazon Build, Ship, Shape hackathon, with Alexa+ as the intended direction.
- No physical Alexa/Echo hardware should be required for the core demo.
- Browser-based simulator must be demonstrable without paid API keys.
- Existing app must be audited and preserved where appropriate before rewriting.
- Triguna-inspired content is reflective, not diagnostic.
- Simulated sensor values and device actions must be labelled as simulated.
- Real Alexa+, smart-home, music, wearable, and remote database integration must not be claimed unless genuinely implemented and tested.
- Optional MCP server should be a separate, verifiable phase.

## 2. Decisions made in this specification

| ID | Decision | Rationale |
|---|---|---|
| ADR-001 | Simulator-first | Protects the core demo from hardware/account/API dependencies |
| ADR-002 | Deterministic recommendation baseline | Reproducible, testable, no paid model dependency |
| ADR-003 | Guest mode and minimal data | Lowers friction and reduces privacy risk |
| ADR-004 | Voice with text/manual fallback | Browser capability and permission behaviour vary |
| ADR-005 | Optional reflective Triguna framing | Preserves concept without presenting it as diagnosis |
| ADR-006 | Explicit simulation labels | Prevents misleading claims about devices and sensors |
| ADR-007 | MCP is optional and separate | Avoids destabilising the simulator before it is complete |
| ADR-008 | No secret or paid service without approval | Prevents accidental cost and credential exposure |

## 3. Decisions to verify during repository audit

| ID | Question | Default until verified |
|---|---|---|
| Q-001 | Which framework/build path is actually in use? | Preserve current setup; do not migrate prematurely |
| Q-002 | Which existing assessment/protocol logic works? | Run regression tests before changes |
| Q-003 | Is any remote persistence configured correctly? | Assume not operational until a read/write/security test proves it |
| Q-004 | Which browser voice APIs work in target browsers? | Voice is progressive enhancement; manual path always works |
| Q-005 | Are current biometric screens simulated? | Label as simulated unless actual data provenance is verified |
| Q-006 | Is the deployment directory correct? | Inspect host config and actual build output |
| Q-007 | Is an MCP server already present? | Assume absent until repository audit finds it |
| Q-008 | What exact official hackathon requirements apply at submission time? | Verify the live official rules and record URL/date |
| Q-009 | Which languages will be supported in the first release? | Ship one well-tested language first; do not advertise untested languages |
| Q-010 | What data persistence is necessary for the demo? | In-memory/local guest path by default |

## 4. Decision record template

For each new decision:
- ID:
- Date:
- Status: proposed / accepted / superseded
- Context:
- Options considered:
- Decision:
- Why:
- Consequences:
- Evidence/source:
- Owner:
- Revisit trigger:

## 5. Official verification register

Before submission, create a record for each time-sensitive claim:
- claim being checked;
- official URL;
- page title;
- date/time checked;
- exact rule or requirement;
- consequence for the project;
- screenshot or saved evidence if appropriate.

Do not copy old deadlines or requirements into final submission materials without rechecking the official page.
