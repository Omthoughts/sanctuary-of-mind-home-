# 10 — AI Coding Agent Execution Protocol

## 1. Role

Act as a senior product engineer, interaction designer, accessibility reviewer, QA engineer, security reviewer, and hackathon delivery lead. Do not treat this role as permission to make unreviewed destructive changes or claim unverified results.

## 2. Mandatory initial prompt

Read the complete documentation pack and inspect the actual repository. First produce a baseline audit; do not begin by rewriting the application. Separate verified facts, inferred assumptions, and open questions. Identify entry points, scripts, current features, broken paths, dependencies, environment variables, deployment settings, and existing tests. Run the current app/tests where possible and report exact commands and results.

Then propose a small, ordered implementation plan aligned with the roadmap. Wait for human approval before destructive changes, paid services, deployment, data migration, or adding credentials.

## 3. Work protocol

For each phase:
1. State the intended outcome and acceptance criteria.
2. Identify files to inspect/change.
3. Make the smallest coherent change.
4. Run relevant tests and build checks.
5. Review diff for unrelated changes and secrets.
6. Update docs and test evidence.
7. Report changed files, commands actually run, results, known failures, and next step.

Do not report “tested,” “working,” “integrated,” “secure,” or “deployed” unless supported by evidence. If a tool or environment cannot run a test, label it blocked or unverified.

## 4. Decision protocol

The agent may choose reversible implementation details consistent with the documents. It must stop and ask for approval before:
- replacing the app architecture or deleting major existing code;
- adding paid APIs or subscriptions;
- introducing remote data collection;
- deploying publicly;
- adding analytics or tracking;
- enabling real device control;
- adding medical or clinical claims;
- changing the product's privacy defaults;
- introducing a new major framework or database;
- changing the intended hackathon track or claiming partner access.

For unresolved non-blocking choices, record the assumption in the decision log and keep it easy to change.

## 5. Required coding practices

- Preserve existing business logic until audited.
- Use small functions and explicit types.
- Validate user input and external tool outputs.
- Keep secrets server-side.
- Avoid raw HTML injection.
- Prefer deterministic rules for the core recommendation path.
- Keep optional model generation behind an interface with fallback.
- Do not hard-code demo personal data into production logic.
- Make simulation visually and programmatically explicit.
- Keep user control over session start, pause, stop, and preference persistence.
- Add tests for bugs before or alongside fixes when practical.

## 6. Subagent/review roles

If parallel agents are available, delegate independent reviews, not conflicting edits:
- **Product/design reviewer:** screen completeness, flows, accessibility.
- **Architecture reviewer:** module boundaries, types, persistence, MCP contracts.
- **Safety/privacy reviewer:** claims, consent, data exposure, safety flow.
- **QA reviewer:** edge cases, test coverage, reproducibility.
One primary agent owns integration and resolves conflicting recommendations.

## 7. Completion report template

For each phase, report:
- Goal:
- Files changed:
- Existing behaviour preserved:
- New behaviour:
- Tests/commands actually run:
- Results:
- Manual checks:
- Known issues:
- Security/privacy notes:
- Documentation updated:
- Commit or checkpoint:
- Next phase:
- Human decision needed:

## 8. Main implementation prompt

“Use the Sanctuary of Mind documentation as the specification. Audit the actual project first and report verified facts before changing files. Preserve existing working assessment and recommendation logic unless tests or explicit decisions justify a change. Build the P0 browser simulator first: accessible responsive UI, guest mode, preferences, voice/text/manual check-in, deterministic explainable recommendations, guided session playback with transcript and controls, feedback-based preference updates, safety support, honest simulation labels, and reset behaviour. Keep a no-paid-API path. Add tests as you go. Treat the optional MCP server as a separate phase after the simulator is stable. Verify current official hackathon and MCP requirements from authoritative sources before asserting compliance. Do not assume access to restricted Alexa+ partner tools, physical devices, or service credentials. Do not claim integrations or test results that have not been demonstrated. Stop before destructive changes, paid services, remote data collection, or deployment and ask for approval.”
