# Sanctuary of Mind

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Tests](https://img.shields.io/badge/tests-43%20passed-brightgreen.svg)](./tests)
[![MCP Protocol](https://img.shields.io/badge/MCP-2025--11--25-indigo.svg)](./mcp)
[![Track](https://img.shields.io/badge/Amazon%20Hackathon-Alexa%2B%20Track-orange.svg)](https://amazonappdev2026.devpost.com)

> **India's first AI mental wellness platform combining Triguna psychology with simulated HRV biometrics, guided wellness interventions, and smart-home ambient environment coordination.**

Developed for the **Amazon Build, Ship, Shape: Amazon Developer Hackathon 2026** (Alexa+ Track).

---

## 1. Overview & Problem Statement

Modern mental wellness tools frequently face three critical shortcomings:
1. **Clinical Stigma:** Diagnostic jargon pathologizes everyday stress and sympathetic nervous system arousal.
2. **Disconnected Environments:** Mindfulness exercises take place in isolation from the user's living space, requiring manual adjustment of lighting, sounds, and room climate.
3. **Black-Box AI & Privacy Concerns:** Remote AI agents often access personal wellness data without explicit user authorization or architectural boundaries.

**Sanctuary of Mind** bridges ancient Indian **Triguna psychology** (*Sattva*, *Rajas*, *Tamas*) with modern autonomic nervous system science. It offers non-diagnostic self-reflection, personalized guided practices, and seamless smart-home environment orchestration via the **Model Context Protocol (MCP)**.

---

## 2. Core Features

- **Triguna Self-Reflection:** A 4-step introspective check-in mapping somatic attention, sensation, and daily orientation to Vedic Gunas without psychiatric labeling.
- **Personalized Interventions:** 9 canonical evidence-based and contemplative protocols tailored to Guna state and worldview (Logical, Emotional, Spiritual).
- **Sanctuary Home (Smart Environment Simulation):** Coordinated wellness scenes (*Calm & Ground*, *Focus*, *Sleep Preparation*) adapting virtual lighting, acoustics, ventilation, and thermostat setpoints.
- **One-Click Scene Rollback:** Instant restoration of previous ambient states with zero state corruption.
- **Model Context Protocol (MCP):** Streamable HTTP transport exposing 8 wellness and environment tools with multi-client session routing.
- **Agent Consent Boundary:** Cryptographic authorization token required before any AI agent can access wellness preferences.
- **100% Offline Fallback:** Full application capability persists locally in `localStorage` even if the MCP server is unreachable.
- **Safety & Crisis Support:** Permanent access to verified, confidential human helplines (Tele-MANAS `14416` in India, `988` in US/Canada) with explicit non-alerting disclaimers.

---

## 3. Technology Stack

- **Frontend:** Responsive React 18 single-page application, custom design system, zero external heavy CSS frameworks.
- **MCP Server:** Node.js ES Modules using official `@modelcontextprotocol/sdk` (v1.32.1) and `zod` (v4) over Streamable HTTP (spec version `2025-11-25`).
- **Web Server:** Lightweight zero-dependency Node.js HTTP static server.
- **Testing:** Node.js native test runner (`node:test`), Playwright browser end-to-end automation (`playwright-core`).
- **Persistence:** Privacy-first browser `localStorage` adapter with optional Supabase client configuration.

---

## 4. Hardware & Simulation Disclosure

> [!NOTE]
> **SIMULATION MODE:** All smart-home device interactions (lighting color temperature/brightness, acoustic soundscapes, airflow ventilation fan, climate thermostat) and biometric measurements (PPG camera pulse, watch HRV) are software simulations executed locally in the browser and MCP server. No physical Amazon Echo, smart bulbs, or IoT sensors are required or claimed to be connected.

---

## 5. Quickstart & Local Execution

The project requires **no paid APIs**, **no physical hardware**, and **no external accounts** to run locally.

### Prerequisites
- Node.js 18+ (tested on Node 20 LTS / 22)
- npm 9+

### Setup & Run
```bash
# 1. Install dependencies
npm install

# 2. Start MCP Streamable HTTP server (Port 3333)
npm run mcp:server

# 3. In a second terminal, start the web server (Port 3000)
npm run serve
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 6. Automated Verification & Test Commands

Every feature, protocol, and MCP tool is covered by deterministic test suites:

```bash
# 1. Unit & Security Regression Tests (43/43 tests covering scoring, protocols, 8 MCP tools, and security remediation)
npm test

# 2. Smoke Tests (Fast end-to-end MCP handshake & device simulation)
npm run test:smoke

# 3. Comprehensive Playwright Browser E2E Suite
npm run test:e2e
```

---

## 7. Model Context Protocol (MCP) Tools

The MCP server listens at `http://127.0.0.1:3333/mcp` and provides 8 production tools:

| Tool | Schema / Arguments | Description |
|---|---|---|
| `list_guided_practices` | `guna_filter?: 'all' \| 'sattva' \| 'rajas' \| 'tamas'` | Returns 9 canonical wellness protocols with step instructions. |
| `get_practice_details` | `guna`, `worldview`, `avoided_techniques?` | Returns practice details dynamically adapted for physical/breath restrictions. |
| `get_consented_preferences` | `session_auth_token: string` | Exposes wellness preferences **only** when active user consent is granted. |
| `create_session_summary` | `dominant_guna`, `session_rating`, `journal_notes?` | Generates a non-diagnostic reflective summary. |
| `simulate_ambient_action` | `action_type: 'lights' \| 'soundscape' \| 'thermostat'`, `setting` | Simulates an ambient adjustment with honesty disclosures. |
| `get_home_device_states` | None | Returns current states of all simulated devices and active scene. |
| `simulate_wellness_scene` | `scene_id: 'calm_and_ground' \| 'focus' \| 'sleep_prep'` | Coordinates ambient lighting, acoustics, fan, and thermostat. |
| `restore_previous_scene` | `previous_states: record` | Reverts devices to their exact pre-activation state snapshot. |

---

## 8. Repository Structure

```text
Sanctuary_of_Mind/
├── AGENTS.md                                   # Global project rules and safety constraints
├── README.md                                   # Workspace instructions & documentation
├── LICENSE                                     # MIT License
├── SECURITY.md                                 # Security and privacy policy
├── CONTRIBUTING.md                             # Development & testing guide
├── package.json                                # Scripts and test configuration
├── package-lock.json                           # Deterministic dependency lockfile
├── mcp_config.example.json                     # Antigravity MCP server definitions
├── .env.example                                # Template for optional environment variables
├── .gitignore                                  # VCS exclusion list (secrets, logs, OS caches)
├── index.html                                  # Primary application entry point
├── netlify.toml                                # Netlify deployment configuration
├── .agents/
│   └── rules/
│       └── ponytail.md                         # Senior dev / YAGNI engineering rules
├── app/
│   ├── index.html                              # Synchronized application copy
│   ├── netlify.toml                            # Preserved configuration
│   └── .env.example                            # App environment template
├── baseline/
│   ├── BASELINE_PRESERVATION_NOTE.md           # Baseline preservation notes
│   └── original-files/                         # Byte-for-byte immutable uploaded originals
├── docs/
│   ├── hackathon/
│   │   ├── SMART_HOME_SIMULATION.md            # Smart-home architecture & scenes
│   │   ├── HACKATHON_DEMO_SCRIPT.md            # Hackathon presentation walkthrough
│   │   └── 08_HACKATHON_DEMO_AND_SUBMISSION_PLAYBOOK.md
│   ├── mcp/
│   │   └── ARCHITECTURE_AND_DATA_FLOW.md       # MCP Streamable HTTP specifications
│   ├── product/                                # Vision, UI design spec, user flows, content bible
│   ├── architecture/                           # Data/API contracts and decision logs
│   ├── implementation/                         # Phased roadmap, AI agent execution protocol
│   ├── safety/                                 # Privacy, consent, and wellness safety
│   ├── qa/                                     # Requirements traceability, screen acceptance
│   └── deployment/                             # Deployment and reproducibility runbook
├── mcp/
│   └── server.mjs                              # Official MCP Streamable HTTP Server
├── scripts/
│   └── serve.js                                # Zero-dependency local static HTTP server
└── tests/
    ├── baseline_protocols.test.mjs             # Unit tests for scoring, RMSSD, and 9 protocols
    ├── mcp_server.test.mjs                     # Full MCP lifecycle & 8 tool test suite
    ├── phase2_personalization.test.mjs         # Preferences, adaptation & history tests
    ├── stabilization.test.mjs                  # Storage, privacy & crisis tests
    ├── security_remediation.test.mjs           # Security regression suite (DoS limits, strict Zod, traversal, PII)
    ├── test_mcp_e2e_smoke.mjs                  # Fast MCP & simulation smoke test
    └── playwright_e2e.mjs                      # Comprehensive browser E2E test suite
```

---

## 9. Future Alexa+ Vision vs. Current Prototype

| Dimension | Implemented Prototype | Future Alexa+ Connected Home Vision |
|---|---|---|
| **Interaction** | Web interface + Web Speech audio guidance | Multimodal voice interaction on Echo Show / Echo Spot |
| **Tool Execution** | Local MCP Streamable HTTP JSON-RPC 2.0 | Alexa+ MCP Tool calling integrated with Alexa Skills Kit |
| **Smart Environment** | Local software simulation (swatches, sliders) | Real Matter/Zigbee IoT control (Philips Hue, smart fans, thermostats) |
| **Biometrics** | Simulated PPG camera pulse & watch HRV | Real ambient sensor integration / Apple Health / Fitbit sync |
| **Safety** | Verified Tele-MANAS 14416 & 988 click-to-call | Hands-free spoken crisis helpline handoff |

---

## 10. License & Safety Disclaimers

- **License:** Released under the [MIT License](./LICENSE).
- **Non-Diagnostic Notice:** Sanctuary of Mind is a self-reflection wellness aid. It does not diagnose, treat, or cure psychiatric or clinical conditions. Triguna classifications and simulated HRV are reflective principles, not medical facts.
