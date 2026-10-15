# 09 — Deployment and Reproducibility Runbook

## 1. Principle

A developer unfamiliar with the project should be able to clone or extract the source, follow the README, run the app, run tests, and produce the demo without guessing. The precise commands must be derived from the actual repository after audit; do not blindly add a new toolchain.

## 2. Repository audit checklist

Record:
- operating system used for development;
- runtime and package manager versions;
- entry point and build scripts;
- dependency lockfile;
- required environment variable names;
- current test/lint/build commands;
- local development URL;
- deployment target and build output directory;
- any external services called at runtime;
- any assets requiring licensing or network access.

## 3. Environment configuration

Use `.env.example` with names and safe placeholders only. Example:
```dotenv
# Optional only; the core demo must run without these.
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
WELLNESS_MODEL_PROVIDER=none
MODEL_API_KEY=
```

These are examples, not a statement that the current project uses these exact variable names. The audit must identify actual names and remove stale placeholders. Do not put privileged service-role keys in browser-exposed variables. For frontend bundlers, variables prefixed for client exposure are public by design.

Ensure `.env`, tokens, local databases, logs, and personal test data are ignored by version control. Rotate any exposed credential.

## 4. Local setup procedure

The final repository README must contain the actual verified commands. The expected workflow is:
1. Install the documented runtime version.
2. Install dependencies using the lockfile-preserving package-manager command.
3. Copy `.env.example` only if needed.
4. Start the development server.
5. Open the documented local URL.
6. Run unit tests.
7. Run build/typecheck/lint where configured.
8. Run the manual acceptance checklist.
9. Verify no paid credentials or external accounts are required for the demo.

Do not invent commands before inspecting `package.json`, scripts, or the actual build setup.

## 5. Deployment checklist

Before deployment:
- confirm the build output directory matches the host configuration;
- confirm client-side routes and refresh behaviour;
- verify HTTPS and secure headers where supported;
- confirm no secrets are in client bundles;
- test on mobile and desktop;
- verify external service failures degrade gracefully;
- confirm no unintended analytics or data collection;
- check logs for sensitive values;
- ensure the live URL is the one shown in the demo and submission.

After deployment:
- run a smoke test on the public URL;
- verify guest path and no-API fallback;
- test permission-denied path;
- verify simulated actions are labelled;
- check console/network errors;
- record deployment version and date;
- keep a rollback path to the last known good version.

## 6. Optional MCP server runbook

If a server is included:
- document runtime/version and dependency lock;
- document start, test, and build commands;
- document transport and endpoint path;
- validate tool schemas and error responses;
- configure CORS and authentication appropriate to deployment;
- avoid exposing an unauthenticated public endpoint with sensitive or side-effecting capabilities;
- do not expose real device controls in the initial simulation;
- document health checks and safe shutdown;
- test a clean start without optional provider credentials.

## 7. Troubleshooting table

| Symptom | First checks | Safe fallback |
|---|---|---|
| Blank page | Browser console, entry point, dependency loading | Restore last known good build |
| Styles missing | CSS import/path, build config | Use bundled/local styles |
| Voice not available | Browser capability, secure context, permission | Text/manual path |
| Narration silent | Browser speech synthesis support, output device | Transcript |
| Save message incorrect | Persistence return value and error path | Disable remote save claim |
| Build works locally only | Runtime versions, environment variables, output directory | Reproduce in clean environment |
| MCP cannot connect | Endpoint, transport, server logs, protocol compatibility | Use standalone simulator |
| External API quota/billing | Provider settings and logs | Deterministic no-API mode |

## 8. Release record template

- Release/version:
- Commit:
- Build command/result:
- Test command/result:
- Browser/device tested:
- Deployment URL:
- Environment services enabled:
- Features simulated:
- Known limitations:
- Rollback version:
- Human reviewer:
- Date/time:
