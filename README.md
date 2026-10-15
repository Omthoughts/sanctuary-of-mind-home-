# Sanctuary of Mind — Amazon Build, Ship, Shape Workspace

This is a **working project workspace**, not a claim that the hackathon submission is finished.

## Folder map

- `app/` — existing uploaded web app and its Netlify configuration. The original HTML was copied to `app/index.html`; its code has not been rewritten in this packaging step.
- `docs/product/` — product vision, UI/UX design specification, user flows, and conversation/content guidance.
- `docs/architecture/` — data/API contracts and decision log.
- `docs/implementation/` — phased implementation roadmap, AI agent protocol, and handoff checklist.
- `docs/safety/` — privacy, consent, and wellness safety requirements.
- `docs/qa/` — test traceability and screen/component acceptance matrix.
- `docs/hackathon/` — demo and submission playbook.
- `docs/deployment/` — reproducible setup and deployment runbook.
- `docs/original_master_docs/` — preserved original master documentation.
- `prompts/` — Antigravity master prompt.
- `hackathon-research/` — supplied Amazon hackathon research files.
- `baseline/original-files/` — preserved copies of uploaded app/config files before implementation.

## Start here

1. Open this folder as the project workspace in Antigravity.
2. Open `prompts/ANTIGRAVITY_MASTER_PROMPT.md`.
3. Tell the agent to read `docs/README.md` and all relevant docs.
4. **First task: audit the app** and report verified facts, build commands, existing behaviour, bugs, and risks. Do not rewrite it immediately.
5. Ask it to implement the phases in `docs/implementation/03_IMPLEMENTATION_ROADMAP.md` one by one.
6. Run and record tests; never mark a test as passed unless it was actually run.
7. Re-check the current official hackathon rules, deadline, and submission requirements before final submission.

## Important boundaries

- The browser simulator must have a usable no-paid-API path.
- Voice must have text/manual fallback.
- Clearly label simulated sensor data and simulated smart-home actions.
- Do not claim real Alexa+, smart-home, music, wearable, or cloud integration unless it is genuinely implemented and tested.
- Do not commit API keys or secrets.
- This packaging does not mean the app has been rebuilt, tested, or submitted.

## Baseline caveat

The existing app is preserved for the coding agent to inspect. `app/netlify.toml` is also preserved as uploaded; verify its publish directory against the actual app/build output before deployment.
