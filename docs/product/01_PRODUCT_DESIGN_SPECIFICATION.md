# 01 — Product Design Specification

## 1. Design goal

Create a calm, trustworthy, premium-feeling interface that communicates safety and simplicity. The design should support the voice-first interaction without making voice mandatory. The product must remain usable on a mobile browser and desktop browser.

This is a design system specification, not a claim that final visual assets or user research have been completed. Use the following as implementation defaults and adjust only with documented rationale.

## 2. Experience principles

- Calm rather than clinical; warm rather than childish; modern rather than mystical by default.
- One primary action per screen or state.
- Clear hierarchy and generous spacing.
- No shame, urgency, streak pressure, guilt, or manipulative engagement mechanics.
- No animated visual that implies the app is reading emotions or physiological state.
- Motion is subtle and can be reduced or disabled.
- Always expose text/manual controls alongside voice interactions.
- Use clear labels instead of relying on colour alone.

## 3. Visual direction

### Palette tokens
Use CSS variables so the palette can be tuned in one place.

| Token | Suggested value | Purpose |
|---|---|---|
| `--color-bg` | `#F7F5F0` | warm neutral canvas |
| `--color-surface` | `#FFFFFF` | cards and panels |
| `--color-ink` | `#1F2933` | primary text |
| `--color-muted` | `#596773` | secondary text |
| `--color-primary` | `#315C55` | primary actions |
| `--color-primary-hover` | `#264A44` | hover/active state |
| `--color-accent` | `#D9A86C` | restrained highlight |
| `--color-border` | `#D9DED9` | dividers and boundaries |
| `--color-success` | `#2F6B4F` | successful completion |
| `--color-warning` | `#8A5A18` | caution |
| `--color-danger` | `#A43D3D` | urgent safety state |
| `--color-focus` | `#1D70D6` | keyboard focus ring |

Check colour contrast against WCAG 2.2 AA targets. If any token fails in its actual foreground/background pairing, adjust the token rather than shipping the failure.

### Typography
- Use a readable sans-serif system stack for reliable offline rendering.
- Headings: 600–700 weight; body: 400–500.
- Base body size: 16px; small labels should not be essential to understanding.
- Line height: 1.45–1.7 for body copy.
- Avoid all-caps body text and long italic passages.
- Do not depend on externally hosted fonts for the core demo.

### Layout and spacing
Use a consistent 4px spacing scale (4, 8, 12, 16, 24, 32, 48, 64). Keep content readable with a maximum text width around 65–75 characters. Use a mobile-first layout; on desktop, use a central content column and a secondary panel only when it materially helps.

### Shape, borders and elevation
- Card radius: 16px default; controls: 10–12px.
- Use subtle borders; shadows are optional and restrained.
- Avoid excessive glassmorphism, gradients, glowing effects, and dense dashboards.
- Use icons only when their meaning is clear; pair unfamiliar icons with text labels.

## 4. Core information architecture

Primary navigation:
1. **Home** — welcome, start check-in, quick-start practices, current session.
2. **My preferences** — voice, language, duration, practices, sensory preferences, accessibility.
3. **Session history** — optional local history and feedback, if persistence is enabled.
4. **About & privacy** — data handling, limitations, safety guidance, reset/delete controls.
5. **Demo environment** — simulated environment actions, separated from actual wellness recommendations and clearly labelled.

Avoid adding more top-level navigation before the core flow works.

## 5. Screen specifications

### Screen A — Welcome / home
**Goal:** make the next action obvious.
- Heading: “A little space for yourself.”
- Supporting copy: “Choose a check-in or begin a short practice. You’re in control.”
- Primary action: “Start a check-in.”
- Secondary actions: “Choose a practice” and “My preferences.”
- Show a concise non-clinical disclaimer in the About area, not as a frightening wall of text.
- If returning user preferences exist locally, offer “Continue with my preferences” and “Start fresh.”
- Empty state must not imply a prior session exists.

### Screen B — First-run privacy and preferences
**Goal:** obtain informed choices without coercion.
- Explain microphone use before asking for permission.
- Explain whether speech recognition occurs in the browser or may be processed by a browser/vendor service; never promise local-only processing unless verified for the chosen browser.
- Explain that the user can type instead.
- Offer preferences as optional, skippable questions: language, session length, guidance style, preferred/disliked practices, spiritual/secular framing, ambient sound, accessibility needs.
- Do not collect date of birth, precise location, contact list, or unrelated identifiers.
- Provide an explicit “Continue as guest” path.
- Any optional storage choice must state what is stored and where.

### Screen C — Check-in
**Goal:** capture the user's stated needs, not infer a diagnosis.
- Prompt: “How are you arriving right now?”
- Provide voice button, text entry, and manual quick choices.
- Quick choices may include: “I feel tense,” “I feel low,” “I need focus,” “I want to unwind,” “I want to reflect,” “I’m not sure.”
- Include duration choice: 2, 5, 10, or 15 minutes.
- Include “Skip and choose a practice.”
- Show listening/processing states, permission-denied state, no-speech state, and retry.
- Do not display a numerical mental-health score.

### Screen D — Recommendation
**Goal:** explain the suggestion and preserve choice.
- Show one recommended practice, estimated duration, and a plain-language reason based only on the check-in and preferences.
- Example: “You asked for help settling in, and you prefer gentle guidance. A short grounding practice may be a useful place to start.”
- Primary action: “Start this practice.”
- Secondary actions: “Choose another,” “Shorten it,” “No breathing exercises,” and “Not now.”
- Never imply the recommendation is certain or clinically superior.

### Screen E — Guided session player
**Goal:** deliver a calm, controllable practice.
- Show practice name, elapsed/remaining time, current instruction, and accessible text transcript.
- Controls: play/pause, resume, restart, stop, volume/mute where relevant, captions/transcript.
- Do not auto-start microphone or audio unexpectedly.
- Breathing animation must be optional and must not force a breath-hold pattern.
- On stop, ask “Would you like to finish here or return to the session?” Do not guilt the user.
- Handle speech synthesis unavailable, audio interrupted, browser tab hidden, and user leaving the screen.

### Screen F — Completion and feedback
**Goal:** close the loop gently.
- Ask: “How was that for you?” with choices: helpful, okay, not helpful, uncomfortable.
- Optional reason tags: too long, too fast, breathing uncomfortable, too spiritual, too generic, preferred another style.
- Offer “Use this preference next time” only with clear meaning.
- Show no streaks or comparative scores.
- Acknowledge feedback without claiming the user's state improved.

### Screen G — Preferences
Fields:
- preferred language;
- preferred guidance tone (gentle, practical, reflective, minimal);
- default duration;
- preferred and disliked techniques;
- spiritual reflection on/off;
- voice narration on/off and voice selection where supported;
- ambient audio on/off;
- reduced motion;
- captions/transcript preference;
- data storage choice and clear/reset action.

Each field needs a default, validation, persistence rule, and accessible label. The user can change preferences at any time.

### Screen H — Demo environment
- Heading must say “Demo environment — simulated controls.”
- Show separate cards for lighting, fan, temperature, or media only if included in the demo.
- Every action must be labelled “Simulate,” and its result must state “No physical device was controlled.”
- Do not place this panel in the critical wellness flow.
- Keep a visible simulation banner while this panel is active.

### Screen I — Safety support
- Use calm, direct language.
- If user describes imminent danger, self-harm intent, or a medical emergency, stop the ordinary recommendation flow and show appropriate urgent support guidance for the user's location only when the location is known reliably. Otherwise advise contacting local emergency services or a trusted nearby person.
- Do not use an automated score to decide whether a person is “safe.”
- Do not claim to monitor or alert a clinician or emergency contact unless that capability is real, configured, and consented to.
- Provide a clear way to exit the safety screen and access support information.

## 6. Component inventory

Required reusable components:
- `AppShell`, `TopNavigation`, `PageHeader`
- `PrimaryButton`, `SecondaryButton`, `IconButton`
- `PreferenceCard`, `ChoiceChip`, `DurationSelector`
- `VoiceInputPanel`, `TextCheckIn`
- `RecommendationCard`, `ReasonDisclosure`
- `SessionPlayer`, `TranscriptPanel`, `ProgressIndicator`
- `FeedbackPrompt`, `Toast/InlineNotice`
- `PermissionState`, `EmptyState`, `ErrorState`
- `SimulationBanner`, `SimulatedDeviceCard`
- `PrivacyDisclosure`, `SafetySupportPanel`
- `ConfirmResetDialog`

Avoid duplicating component styles across screens. Components should have disabled, loading, focus, hover, active, error, and reduced-motion behaviour where relevant.

## 7. Responsive and accessibility requirements

- Keyboard-operable end to end.
- Visible focus indicators.
- Correct semantic headings, labels, and button names.
- Announce important dynamic status changes to assistive technology without excessive announcements.
- Minimum WCAG 2.2 AA contrast target.
- Touch targets should be comfortably usable; aim for at least 44×44 CSS pixels.
- Respect reduced-motion settings.
- Do not rely on colour, sound, or animation alone to convey state.
- Ensure zoom and narrow screens do not hide controls.
- Provide captions/transcript for narrated practices.
- Avoid flashing or fast pulsing visuals.

## 8. Interaction and visual acceptance checklist

- A new user can identify the primary action within five seconds.
- Every screen has a clear back/exit path.
- Every asynchronous action has loading, success, and error states.
- Permission denial never blocks the core experience.
- Session controls remain visible and operable on mobile.
- Simulation is unmistakable.
- No broken links, placeholder buttons, overflow, or console errors in the supported test browsers.
- All important text and control states are keyboard and screen-reader accessible.
