# 00 — Product Vision, Scope and Success Criteria

## 1. Product statement

Sanctuary of Mind is a voice-first, personalized wellness companion that helps a user pause, check in with themselves, choose a suitable short practice, follow guided support, and give feedback that can improve future recommendations.

It should feel calm, respectful, responsive, and easy to use without requiring a wearable, smart-home device, paid model API, or account sign-in.

## 2. Problem and intended value

People may want a short, approachable way to reflect on their current state without navigating a complex mental-wellness library. The product reduces friction by combining:
- a brief conversational check-in;
- user-controlled preferences and accessibility settings;
- transparent recommendations based on the check-in and selected preferences;
- guided interventions with clear start, pause, resume, stop, and completion controls;
- a feedback loop that can adjust future suggestions;
- optional reflective language inspired by the Triguna framework, without presenting it as a diagnosis.

## 3. Primary users and jobs-to-be-done

### Primary user
A person seeking a short, self-directed pause for grounding, focus, relaxation, reflection, or preparation for sleep.

### Jobs-to-be-done
- “Help me choose a practice that fits how I feel and the time I have.”
- “Guide me without requiring me to read a long page.”
- “Remember my stated preferences if I choose to save them.”
- “Let me skip a technique that feels uncomfortable.”
- “Make it clear what is real, what is simulated, and what data is stored.”

## 4. Product principles

1. **User agency:** users can skip, stop, change, or decline any practice.
2. **Low-friction:** useful experience without login, hardware, or external API credentials.
3. **Transparency:** explain the basis of a recommendation in plain language.
4. **Non-clinical:** no diagnosis, risk scoring claims, or promises of treatment.
5. **Privacy by default:** collect the minimum data needed; optional persistence must be explicit.
6. **Reliable fallback:** text and manual selection remain usable when voice, audio, or network features fail.
7. **Honest simulation:** simulated actions and signals are visually and verbally disclosed.
8. **Inclusive language:** no assumption that users share a religion, culture, language, or meditation preference.

## 5. Scope for the hackathon-ready minimum viable product

### P0 — Must work end-to-end
- First-run introduction and privacy notice.
- Profile and preferences, with an easy guest path.
- Voice-style check-in using supported browser capabilities, with text/manual fallback.
- Deterministic recommendation engine using current check-in, user preferences, available time, and intervention suitability.
- At least the core intervention types: grounding, gentle breathing (optional), guided imagery, mindfulness, self-compassion, journaling, focus reset, and sleep preparation.
- Guided session player with progress, pause/resume, stop, restart, and completion.
- Feedback collection and transparent preference-based adaptation.
- Safety response for user statements indicating immediate danger or severe distress; no attempt to diagnose.
- Explicit labels for simulated smart-home/environment controls and simulated sensor data.
- Automated tests for core decision logic and a repeatable demo scenario.
- Working without paid API keys and without physical hardware.

### P1 — Include if stable
- Optional Triguna-inspired reflection.
- Local session history and preference persistence with a clear reset/delete option.
- Optional MCP server implementing the current official MCP requirements, independently testable.
- Optional model-generated content behind a provider interface, with deterministic fallback and output validation.
- Optional wearable/HRV adapter only if a genuine supported integration is available and tested.

### Out of scope unless separately approved and genuinely supported
- Clinical diagnosis, therapy, crisis-service replacement, medical claims, or treatment efficacy claims.
- Claims that camera PPG or simulated HRV is medically accurate.
- Real control of lights, fans, HVAC, television, music accounts, or other devices without a verified integration and user authorisation.
- Direct Alexa+ partner-only tooling or device runtime access that the team has not been granted.
- Unreviewed arbitrary model-generated clinical or spiritual advice.
- Unnecessary account creation, paid API dependencies, or storing raw microphone recordings by default.

## 6. Product success criteria

The project is successful when a first-time user can, without external credentials:
1. open the app;
2. understand the privacy and simulation disclosures;
3. choose preferences or continue as a guest;
4. complete a check-in using voice or text;
5. receive an explainable recommendation;
6. play, pause, resume, and stop a guided intervention;
7. submit feedback;
8. see the feedback reflected in the next recommendation or preference summary;
9. use the app when microphone permission is denied;
10. reset local data and return to the initial state.

A separate technical success criterion applies if an MCP server is included: it must start from documented instructions, expose only documented tools, validate inputs, return schema-consistent results, and pass tests against the exact current official requirements.

## 7. Claims policy

Allowed: “offers guided wellness practices,” “provides reflective prompts,” “recommendations use your stated preferences and check-in,” and “device controls are simulated in this demo.”

Not allowed without evidence: “detects your true mental state,” “measures stress accurately,” “clinically validated,” “treats anxiety/depression,” “works with Alexa+ devices,” or “controls your smart home.”
