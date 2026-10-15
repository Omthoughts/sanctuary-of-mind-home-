# Sanctuary of Mind — Project Agent Rules & Engineering Constraints

These rules apply to all AI agents operating within the Sanctuary of Mind codebase.

---

## 1. Engineering Discipline & Verification
- **Inspect before editing:** Read the task, existing code, and documentation before proposing or applying changes.
- **Make small, reversible changes:** Favor single, well-bounded modifications over broad rewrites.
- **Preserve working functionality:** Keep the existing 9 guided protocols, Triguna scoring, and UI flows intact. Add regression tests rather than rewriting working code.
- **Use official documentation:** Refer to official documentation for version-sensitive integrations (React 18, MCP, Web APIs). Never guess API signatures.
- **Explain each dependency:** State the exact purpose of any new dependency or package added. Never add a dependency when native standard library features suffice.
- **Run tests and report honestly:** Run relevant tests after every meaningful change. Never claim a test passed or an integration succeeded without verifiable execution output.
- **Never invent data:** Do not invent mock data, research citations, API responses, biometric measurements, or integration claims.

---

## 2. Wellness, Safety & Medical Disclaimers
- **Strictly non-diagnostic:** Sanctuary of Mind is a self-reflection and mental wellness aid. It is NOT a clinical tool, medical device, or psychiatric diagnostic instrument.
- **No medical claims:** Never present Triguna classifications (Sattva, Rajas, Tamas) or Heart Rate Variability (HRV) as clinical diagnoses, psychological disorders, or medical facts.
- **Safety flow & crisis escalation:** When a user exhibits acute distress, provide verified, current public support helplines (e.g., Tele-MANAS 14416 / 1800-891-4416 in India, 988 in the US/Canada).
- **No false emergency claims:** Never imply or claim that an emergency alert, police dispatch, ambulance, or automated call has been initiated. Always clarify that contact buttons provide phone or chat links for the user to connect directly with human professionals.

---

## 3. Privacy, Consent & Persistence
- **Informed consent before transmission:** Require explicit, informed consent before transmitting any personal data (name, email, feedback, wellness responses) off the local device.
- **Google Sheets disabled by default:** External Google Sheets / Apps Script transmissions must remain disabled until an explicit opt-in toggle is implemented and accepted by the user.
- **Supabase optional & guarded:** Remote database persistence (Supabase) must remain optional and inactive until configuration, schema, and Row Level Security (RLS) are verified. Use the local storage demo adapter as the primary persistence mechanism.
- **Privacy reset:** Ensure the user can reset and erase all locally stored session data and preferences at any time.

---

## 4. Hardware & Simulation Honesty
- **Clearly label simulations:** All simulated sensor data (e.g., simulated camera PPG, simulated Apple Watch/Fitbit HRV, simulated Bluetooth) and simulated device actions (e.g., simulated smart bulbs, simulated ambient soundscape) must be visibly identified as simulations in the UI.
- **No phantom device claims:** Never claim that an Amazon Echo, Alexa device, real smart-home bulb, or physical biometric sensor is connected unless verified through real, hardware-tested APIs.
- **Developer vs. End-User separation:** Do not expose or activate developer agent MCP servers inside the end-user browser application. The browser application must remain usable offline and standalone without paid APIs or external developer credentials.

---

## 5. Senior Developer Mindset (Ponytail YAGNI)
- The best code is the code never written. Solve the whole problem with the least new code.
- Always conclude significant updates with 1–2 lines summarizing: what was skipped or unverified, and any potential risk the user must be aware of.
