# 06 — Privacy, Consent, and Wellness Safety Specification

## 1. Purpose and boundary

This product offers self-directed wellness content. It is not a medical device, therapist, emergency service, diagnostic system, or substitute for professional care. The app must not make medical or clinical claims unless a separate evidence and regulatory process has approved them.

This specification is an engineering and product safety baseline, not legal advice. Review applicable laws and platform policies before collecting personal or health-related information.

## 2. Data minimisation

Do not collect data merely because it is technically available. The first demo should avoid:
- real name or date of birth;
- precise location;
- contact list or emergency contact;
- raw microphone recordings;
- camera frames or facial images;
- persistent raw transcripts;
- real wearable/HRV readings unless an actual, permissioned integration is deliberately implemented;
- advertising identifiers or unrelated analytics.

## 3. Microphone and speech disclosure

Before voice input:
- explain why the microphone is requested;
- explain how to continue without voice;
- state what is known about speech processing for the chosen browser and API;
- do not state that audio is processed locally unless that has been verified;
- do not retain raw audio by default;
- provide a visible stop/cancel control while listening.

Speech recognition support and privacy behaviour vary by browser and platform. Test the exact supported browsers and use accurate, current wording.

## 4. Persistence and consent

Default to guest mode and in-memory state. If local browser storage is enabled, tell the user that preferences/session summaries may remain on that device. If remote storage is introduced:
- identify the provider and data categories;
- document access controls, retention, deletion, backups, and region where known;
- use server-side secrets and least-privilege access;
- enforce row-level access controls or equivalent authorization;
- never ship service-role keys or privileged credentials to the browser;
- test access isolation between users;
- do not claim deletion from backups or third-party services unless verified.

A placeholder key or failed save operation must not produce a success message.

## 5. Optional model providers

- The no-paid-API path is mandatory.
- API keys belong in server-side environment variables, not browser code or public repositories.
- Send only the minimum context required.
- Avoid transmitting raw personal narratives unless needed and clearly disclosed.
- Treat model output as untrusted content; validate format and apply safety/content checks.
- Fall back to curated deterministic scripts when unavailable.
- Never let model output bypass safety rules or invoke unapproved physical actions.
- Do not promise zero retention or privacy properties that have not been confirmed in the provider's current terms/settings.

## 6. Triguna, assessment, and sensor claims

- Triguna labels are optional reflection prompts, not a validated clinical classification.
- A questionnaire result is not an objective measurement of a person's mental state.
- Simulated camera PPG/HRV values must be labelled “simulated demo data” at point of display.
- Do not show fabricated biometric values in a way that could be mistaken for real measurement.
- A genuine wearable integration requires explicit permission, verified data provenance, error handling, and accurate explanation of limitations.
- Do not infer diagnosis, crisis risk, or treatment response from HRV or a short questionnaire.

## 7. Safety and crisis handling

- Use conservative triggers and reviewed copy; language matching is imperfect.
- Avoid displaying a false “safe” status.
- When immediate danger is indicated, prioritise direct support guidance and human help over a normal wellness recommendation.
- Never claim an emergency contact, clinician, or authority has been notified unless a real, verified, consented service completed that action.
- Do not create a hidden monitoring promise.
- Avoid making the user answer more questions before showing urgent support information.
- Provide an exit path and allow the user to return to non-crisis content when appropriate.

## 8. Content safety

- Breathing practices are optional and must not require breath holds or forceful/rapid breathing.
- Always provide a non-breath-focused alternative.
- If a user feels dizzy, panicky, or uncomfortable, instruct them to stop the exercise and return attention to their surroundings.
- Do not encourage users to stop prescribed treatment or avoid professional support.
- Do not present spiritual beliefs as facts all users must accept.

## 9. Security controls

- Validate all user inputs on every trust boundary.
- Use safe text rendering; do not insert untrusted input as raw HTML.
- Avoid logging sensitive text, tokens, or personal data.
- Pin dependencies and review high-risk updates.
- Use least privilege for storage/API credentials.
- Restrict CORS to required origins for any deployed API.
- Rate-limit public endpoints if an API is exposed.
- Keep secrets out of screenshots, video, commit history, and agent prompts.
- Add `.env.example` containing names and safe placeholders only; ensure `.env` is ignored by Git.
- Use HTTPS for deployed interfaces and APIs.
- Review third-party SDKs and external network requests.

## 10. User rights and reset behaviour

The interface must explain:
- what app-managed data is stored;
- where it is stored;
- how to clear it;
- what is not under the app's control, such as browser/vendor speech processing;
- whether remote deletion is supported and what it covers.

The reset confirmation must be specific. If a remote deletion fails, report a partial failure; never claim complete deletion.

## 11. Incident response for a hackathon project

If a secret is exposed:
1. Revoke/rotate it immediately.
2. Remove it from active configuration and history where possible.
3. Check logs and usage.
4. Document impact and corrective action.
5. Do not continue demoing with a known compromised credential.

If the app makes a misleading safety or sensor claim:
1. Disable or correct the affected UI.
2. Add a regression test.
3. Update the demo script and documentation.
4. Re-review screenshots and recorded video.
