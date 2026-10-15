# Antigravity Plugin, Rule & MCP Comparison Matrix

**Project:** Sanctuary of Mind (Amazon Build, Ship, Shape Hackathon 2026)  
**Host Environment:** Windows x64, Node.js v22.16.0, Antigravity IDE 1.104.0  

---

## 1. Architectural Distinctions in Antigravity

Before comparing specific candidates, we must clarify the role of each architectural mechanism supported by Antigravity:

| Category | Mechanism in Antigravity | When / How Executed |
| :--- | :--- | :--- |
| **Project Rules** | `AGENTS.md`, `.agents/rules/*.md` | Loaded into the model's context progressively or always-on; governs coding principles, safety, and constraints without running external processes. |
| **Skills** | `skills/<name>/SKILL.md` | On-demand workflow guides and procedural knowledge activated when specific tasks are requested. |
| **Plugins** | `plugins/<name>/plugin.json` | Reusable bundles combining rules, skills, and MCP configurations under a single namespace. |
| **MCP Servers** | `mcp_config.json` | External tools exposed to the agent over standard JSON-RPC (`stdio` or Streamable HTTP) providing active tool execution. |
| **Ordinary Packages** | `package.json` dependencies | Libraries used directly by the test runner (e.g., Playwright, Vitest) or the application runtime. |
| **App Integrations** | Web APIs (Web Audio, SpeechRecognition) | Client-side features built directly into `index.html` for end-user interaction. |

---

## 2. Comprehensive Tool Evaluation & Comparison

### Candidate A: Ponytail Project Rules
- **Official Repository:** [https://github.com/DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)
- **Classification:** Project Rules & Agent Steering (`.agents/rules/ponytail.md` / `AGENTS.md`)
- **Purpose & Project Value:** Enforces the "lazy senior developer" paradigm: YAGNI (You Aren't Gonna Need It), preferring existing code, avoiding unrequested dependencies, minimal blast radius, and reporting untested assumptions. Crucial for keeping hackathon scope realistic and preventing regression churn.
- **Environment Compatibility:** 100% compatible. Antigravity natively parses markdown rules in `.agents/rules/` and `AGENTS.md`.
- **Installation Method:** Local repository rule file at `.agents/rules/ponytail.md` and referenced in root `AGENTS.md`. Zero binary dependencies or background processes.
- **Auth / Costs / Permissions:** Free, open-source (MIT). No API keys, no network access, zero runtime overhead.
- **Activity & Signals:** Active (160k+ stars, multi-agent support).
- **Classification Verdict:** **Essential — High Priority**. Install adapted rules immediately.

---

### Candidate B: Context7 MCP
- **Official Repository:** [https://github.com/upstash/context7](https://github.com/upstash/context7) (Package: `@upstash/context7-mcp`, CLI: `ctx7`)
- **Classification:** Model Context Protocol (MCP) Server (Stdio)
- **Purpose & Project Value:** Retrieves up-to-date, version-specific documentation and API snippets for libraries (e.g., React 18 hooks, Playwright API, Web Audio API) directly into agent queries.
- **Environment Compatibility:** Fully compatible via Node.js v22 stdio runner (`npx -y @upstash/context7-mcp`).
- **Installation Method:** Configured in `mcp_config.json`:
  ```json
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
  ```
- **Auth / Costs / Permissions:** Free tier available; no API key required for standard doc resolution. Requires outbound HTTPS access to Context7 documentation index.
- **Activity & Signals:** Actively maintained by Upstash, rapidly adopted across MCP clients.
- **Classification Verdict:** **Optional / Recommended**. Helpful when referencing unfamiliar APIs; never substitutes for running real tests.

---

### Candidate C: Local Git CLI vs. Remote GitHub MCP
- **Official Repository:** [https://github.com/github/github-mcp-server](https://github.com/github/github-mcp-server)
- **Classification:** CLI Tool (Local) vs. MCP Server (Remote / Container)
- **Purpose & Project Value:** Source control, diff inspection, atomic commits, rollback checkpoints, branch management.
- **Environment Compatibility:**
  - Local `git`: Installed (`2.54.0.windows.1`), verified, immediate.
  - Remote GitHub MCP: Requires Docker for local container execution or GitHub Personal Access Token (PAT) for remote endpoint.
- **Installation Method:**
  - Local `git`: Native CLI commands via terminal runner.
  - Remote MCP: Containerized or token-based config in `mcp_config.json`.
- **Auth / Costs / Permissions:**
  - Local `git`: Zero cost, completely local, zero token exposure risk.
  - Remote GitHub MCP: Requires user PAT with repository read/write permissions. Potential risk of accidental push or public visibility modification if misconfigured.
- **Classification Verdict:**
  - **Local Git CLI:** **Essential — Primary**. Already active and checked in.
  - **Remote GitHub MCP:** **Optional / Deferred**. Not required for local hackathon development. Requires explicit user PAT and approval before setup.

---

### Candidate D: Playwright MCP
- **Official Repository:** [https://github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- **Classification:** Model Context Protocol (MCP) Server & Automation Framework
- **Purpose & Project Value:** End-to-end browser automation for testing:
  - Onboarding and guest mode flows.
  - Triguna check-in and 9 protocol recommendation rationale.
  - Audio/speech player state machine (start, pause, resume, stop).
  - Accessibility tree verification, keyboard navigation, focus trap prevention.
  - Responsive viewport rendering (mobile vs desktop).
- **Environment Compatibility:** Fully compatible with Node.js v22 and local Chromium/Edge installations. Verified via npx (`playwright 1.64.1`).
- **Installation Method:**
  ```json
  "playwright": {
    "command": "npx",
    "args": ["-y", "@playwright/mcp@latest"]
  }
  ```
- **Auth / Costs / Permissions:** Free, open source (Apache 2.0 / MIT). Runs 100% locally on localhost. No API keys or external network calls needed.
- **Activity & Signals:** Maintained by Microsoft, official Playwright standard.
- **Classification Verdict:** **Essential — High Priority**. The premier testing tool for browser acceptance tests.

---

### Candidate E: Chrome DevTools MCP
- **Official Repository:** [https://github.com/ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- **Classification:** Model Context Protocol (MCP) Server
- **Purpose & Project Value:** Connects agent directly to Chrome DevTools Protocol (CDP) for live console error capture, network request/failure inspection, and CSS debugging.
- **Environment Compatibility:** Fully compatible with installed Google Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`).
- **Installation Method:** `npx -y chrome-devtools-mcp@latest`.
- **Auth / Costs / Permissions:** Free, open source. Runs locally. Requires Chrome launched with remote debugging port enabled.
- **Activity & Signals:** Official Google Chrome DevTools team project.
- **Redundancy Analysis:** Overlaps with Playwright MCP for general page interaction. Its distinct value is low-level CDP console/network diagnostics.
- **Classification Verdict:** **Optional / Secondary**. Retain as documented option; prefer Playwright MCP to avoid duplicate browser-control daemons.

---

### Candidate F: Tavily MCP
- **Official Repository:** [https://github.com/tavily-ai/tavily-mcp](https://github.com/tavily-ai/tavily-mcp)
- **Classification:** Model Context Protocol (MCP) Server
- **Purpose & Project Value:** AI-optimized search engine for web scraping and information retrieval.
- **Environment Compatibility:** Requires API key and network access.
- **Auth / Costs / Permissions:** Requires Tavily account and API key. Free tier has rate limits; paid plans required for heavy usage.
- **Redundancy Analysis:** Antigravity already features built-in first-party search (`search_web`) and URL scraping (`read_url_content`) tools natively at zero extra cost and zero configuration.
- **Classification Verdict:** **Redundant / Unsuitable**. Rejected to prevent unnecessary API keys, external accounts, and operational costs.

---

### Candidate G: Google Developer Knowledge MCP
- **Official Documentation:** [https://developers.google.com/knowledge](https://developers.google.com/knowledge)
- **Classification:** Managed Remote MCP Server (Streamable HTTP)
- **Purpose & Project Value:** Programmatic search and retrieval of Google Cloud, Firebase, and Android official documentation.
- **Environment Compatibility:** Antigravity supports Streamable HTTP MCP transports.
- **Auth / Costs / Permissions:** Requires Google Cloud project, Developer Knowledge API activation, and `X-Goog-Api-Key`.
- **Relevance Analysis:** Sanctuary of Mind is a standalone client-side web app for the Amazon Hackathon. Google Cloud / Android documentation is not part of this hackathon's core deliverables.
- **Classification Verdict:** **Unsuitable for Current Scope**. Documented but not enabled to avoid unnecessary GCP service setup.

---

## 3. Prioritized Implementation Summary

| Tool | Type | Priority | Setup Complexity | Action |
| :--- | :--- | :--- | :--- | :--- |
| **Ponytail Rules** | Rule / Steering | **P0 (Immediate)** | Minimal (Markdown file) | Install to `.agents/rules/ponytail.md` and link in `AGENTS.md`. |
| **Sanctuary Safety Rules** | Rule / Steering | **P0 (Immediate)** | Minimal (Markdown file) | Integrate non-diagnostic and privacy mandates into `AGENTS.md`. |
| **Playwright Automation** | MCP / Test Runner | **P1 (Core)** | Low (`npx @playwright/mcp`) | Configure in `mcp_config.json` & verify baseline tests. |
| **Context7** | MCP | **P2 (Optional)** | Low (`npx @upstash/context7-mcp`) | Add to `mcp_config.json` for API documentation queries. |
| **Chrome DevTools** | MCP | **P3 (Diagnostic)** | Medium (CDP port) | Document in installation guide for specialized debugging. |
| **Local Git CLI** | Tooling | **Active (Done)** | Zero (Native) | Maintain atomic commits on `master`. |
| **Tavily MCP** | MCP | **Excluded** | Unneeded API Key | Rely on built-in native `search_web`. |
| **Google Dev Knowledge** | MCP | **Excluded** | GCP Key Required | Out of scope for client-side Amazon hackathon app. |
