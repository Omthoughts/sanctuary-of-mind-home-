# 08 — Amazon Build, Ship, Shape Hackathon Demo and Submission Playbook

## 1. Strategy

The strongest realistic path under a short deadline is a complete, browser-based voice-first simulator with a polished, testable user journey. An optional standards-based MCP server can strengthen the technical story only if it is genuinely implemented and verified. Physical Alexa/Echo hardware must not be treated as a prerequisite.

This document does not establish current eligibility, deadlines, judging criteria, or acceptance. Verify the live official hackathon page, rules, FAQ, required track, source requirements, video format, and deadline before submission.

## 2. Demo narrative

Suggested 3–5 minute story:
1. **Problem (20–30 sec):** wellness tools can feel generic and difficult to start.
2. **Product (20–30 sec):** Sanctuary of Mind offers a user-controlled, personalized, voice-first pause.
3. **Onboarding (30 sec):** choose guest mode, language/guidance style, and an optional preference.
4. **Check-in (30–45 sec):** speak or use the text/manual fallback; show the actual input state.
5. **Recommendation (30 sec):** explain why a practice was selected using the user's choices.
6. **Guided session (45–60 sec):** start a short practice, show transcript and controls, pause/resume or stop.
7. **Feedback loop (20–30 sec):** give feedback and demonstrate a specific change in the next recommendation.
8. **Simulation transparency (10–20 sec):** show simulated environment controls only if implemented, and state clearly no physical device was controlled.
9. **Technical close (20–30 sec):** explain architecture, tests, and exactly what is implemented versus simulated.

Adapt duration to the current official submission requirements. Do not spend most of the video on slides.

## 3. Demo profile

Create a fictional demo profile with no real personal data:
- Language: English.
- Guidance style: gentle and practical.
- Duration: 2 or 5 minutes.
- Preferred practice: grounding or focus reset.
- Disliked practice: breathing focus (to demonstrate exclusion).
- Spiritual mode: secular.
- Persistence: local demo setting, if implemented.

Demonstrate that the disliked technique is excluded and that feedback changes a future recommendation. Avoid entering real sensitive experiences during recording.

## 4. Required evidence

Prepare:
- clean repository URL or source archive;
- exact run/setup instructions;
- build and test results;
- architecture diagram or concise explanation;
- screenshots of core flow;
- demo video with clear audio and readable UI;
- list of actual integrations;
- list of simulated features;
- known limitations;
- current official eligibility/deadline verification notes.

## 5. Claim matrix

| Capability | Claim only if verified | Safe wording when simulated/unverified |
|---|---|---|
| Browser voice input | Tested in named browser | “Voice input is supported in the tested browser; text fallback is available.” |
| Spoken meditation | Actual TTS plays | “Uses browser speech synthesis where supported; transcript remains available.” |
| User preference storage | Save/read/reset tested | “Preferences are stored locally in this demo” only if true |
| Supabase | Credentials, policies, reads/writes, isolation tested | “Remote persistence is not enabled in this build.” |
| HRV/PPG | Genuine supported sensor path and provenance verified | “Any shown sensor values are simulated demo data.” |
| Smart-home controls | Actual authorised integration tested with supported device | “Demo simulation only; no physical device was controlled.” |
| Alexa+/MCP | Exact connection path tested and allowed | “This is a browser simulator” or “MCP server is implemented but not connected to Alexa+ runtime.” |
| AI-generated content | Provider and fallback verified | “Prepared templates are used in the no-API demo.” |
| Clinical efficacy | Independent appropriate evidence exists | Do not claim clinical validation or treatment efficacy. |

## 6. Submission checklist

Before final submission, verify the current official requirements and mark each item:
- [ ] Track selected matches the actual implementation.
- [ ] Current deadline and timezone verified from official page.
- [ ] Eligibility verified.
- [ ] Required source repository/archive included.
- [ ] README contains clean setup instructions.
- [ ] Build and tests run from a clean environment.
- [ ] Demo video format, length, visibility, and link verified.
- [ ] No secret keys or personal data in source or video.
- [ ] All simulated features are disclosed.
- [ ] No unsupported claims about Alexa, devices, AI, sensors, or clinical outcomes.
- [ ] Submission fields reviewed by a human.
- [ ] Final demo rehearsed twice from a fresh start.
- [ ] Submitted entry confirmation saved.

## 7. Demo failure fallback

- If voice input fails, use the text/manual check-in without restarting the recording.
- If TTS fails, use the transcript and explain narration is browser-dependent.
- If the optional model provider fails, show the deterministic template path.
- If MCP is unavailable, show the standalone simulator; do not pretend the MCP call succeeded.
- If a device simulation is shown, keep the simulation label visible.
- Do not record a fabricated successful integration or edit out a failure in a way that misrepresents the product.

## 8. Judging-ready technical explanation

Be ready to answer:
- What is personalized, and what inputs drive it?
- How is the recommendation reason generated?
- What is rule-based versus model-generated?
- What happens without microphone permission or network access?
- What data is stored, and how can a user delete it?
- What is simulated?
- If MCP exists, which tools are exposed and how are inputs validated?
- What tests were actually run?
- What is the most important limitation and next step?
