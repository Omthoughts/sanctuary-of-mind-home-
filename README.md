# Sanctuary of Mind — Amazon Build, Ship, Shape Workspace

Sanctuary of Mind is an AI mental wellness platform combining Triguna psychology with simulated HRV biometrics and personalized guided wellness interventions.

This project is prepared for the **Amazon Build, Ship, Shape: Amazon Developer Hackathon 2026**.

---

## 1. Quickstart & Local Execution

The project requires **no paid APIs**, **no physical hardware**, and **no external accounts** to run locally.

```powershell
# 1. Verify runtime (Node.js v20+ / v22+ recommended)
node -v
npm -v

# 2. Run automated regression and protocol tests
npm test

# 3. Start local development server
npm run serve
# Navigate to http://localhost:3000
```

---

## 2. Workspace Directory Structure

```text
Sanctuary_of_Mind/
├── AGENTS.md                                   # Global project rules and safety constraints
├── README.md                                   # Workspace instructions & runbook
├── package.json                                # Scripts and test configuration
├── mcp_config.example.json                     # Verified Model Context Protocol configuration
├── .env.example                                # Template for optional environment variables
├── .gitignore                                  # VCS exclusion list (secrets, logs, OS caches)
├── index.html                                  # Root application entry point
├── netlify.toml                                # Netlify deployment configuration
├── .agents/
│   └── rules/
│       └── ponytail.md                         # Senior dev / YAGNI engineering rules
├── app/
│   ├── index.html                              # Preserved application working copy
│   ├── netlify.toml                            # Preserved uploaded configuration
│   └── .env.example                            # App environment template
├── baseline/
│   ├── BASELINE_PRESERVATION_NOTE.md           # Baseline preservation notes
│   └── original-files/                         # Byte-for-byte immutable uploaded originals
├── docs/
│   ├── tooling/                                # Tooling, MCP, and verification documentation
│   │   ├── TOOLING_AUDIT.md
│   │   ├── PLUGIN_AND_MCP_COMPARISON.md
│   │   ├── INSTALLATION_GUIDE.md
│   │   └── TOOLING_VERIFICATION_REPORT.md
│   ├── product/                                # Vision, UI design spec, user flows, content bible
│   ├── architecture/                           # Data/API contracts and decision logs
│   ├── implementation/                         # Phased roadmap, AI agent execution protocol
│   ├── safety/                                 # Privacy, consent, and wellness safety
│   ├── qa/                                     # Requirements traceability, screen acceptance
│   ├── hackathon/                              # Submission guide and demo playbook
│   ├── deployment/                             # Deployment and reproducibility runbook
│   └── original_master_docs/                   # Preserved original master specifications
├── prompts/                                    # Antigravity master prompts
├── scripts/
│   └── serve.js                                # Zero-dependency local static HTTP server
└── tests/
    └── baseline_protocols.test.mjs             # Unit tests for scoring, RMSSD, and 9 protocols
```

---

## 3. Developer Tooling & Antigravity MCP Setup

This workspace is integrated with Google Antigravity:
- **Project Rules:** Located in `AGENTS.md` and `.agents/rules/ponytail.md`. Enforces YAGNI, non-diagnostic wellness copy, privacy-first defaults, and verification before code modification.
- **MCP Servers:** Defined in `mcp_config.example.json` and loaded into `%USERPROFILE%\.gemini\config\mcp_config.json`:
  - `playwright`: Headless browser automation via `@playwright/mcp@latest` for deterministic UI and accessibility tests.
  - `context7`: Up-to-date documentation retrieval via `@upstash/context7-mcp`.

For comprehensive details on tools and verification evidence, see:
- [TOOLING_AUDIT.md](file:///c:/Users/hp/Downloads/santury%20updates/docs/tooling/TOOLING_AUDIT.md)
- [PLUGIN_AND_MCP_COMPARISON.md](file:///c:/Users/hp/Downloads/santury%20updates/docs/tooling/PLUGIN_AND_MCP_COMPARISON.md)
- [INSTALLATION_GUIDE.md](file:///c:/Users/hp/Downloads/santury%20updates/docs/tooling/INSTALLATION_GUIDE.md)
- [TOOLING_VERIFICATION_REPORT.md](file:///c:/Users/hp/Downloads/santury%20updates/docs/tooling/TOOLING_VERIFICATION_REPORT.md)

---

## 4. Safety & Operating Boundaries

1. **Non-Diagnostic:** Sanctuary of Mind is a self-reflection aid. It does not diagnose, treat, or cure psychiatric conditions. Triguna classifications and HRV must never be presented as clinical diagnoses.
2. **Crisis Support:** When distress is detected, provide verified human helpline numbers (e.g., Tele-MANAS `14416` in India, `988` in US). Never claim emergency services are being called.
3. **Privacy First:** Google Sheets transmissions are disabled by default. Explicit consent is required before saving or transmitting personal data.
4. **Simulation Honesty:** Biometrics (camera PPG, watch HRV) and smart-home ambient controls (lights, audio) are browser-based simulations and are visibly labelled as such.
