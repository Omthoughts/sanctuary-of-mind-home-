# Antigravity Tooling & MCP Installation Guide

**Project:** Sanctuary of Mind  
**Target Environment:** Windows x64, Node.js v22.16.0, Antigravity IDE 1.104.0  

---

## 1. Quickstart (Automated Baseline)

The Sanctuary of Mind development environment is pre-configured with zero paid dependencies and zero external credential requirements:

```powershell
# 1. Verify runtime prerequisites
node -v   # v22.16.0 or higher
npm -v    # 10.9.2 or higher
git --version

# 2. Run unit and protocol regression tests
npm test

# 3. Start local development server
npm run serve
# Server runs at http://localhost:3000
```

---

## 2. Antigravity Project Rules Setup

Antigravity automatically discovers and loads rules from:
- `AGENTS.md` (Repository root — active across all directories)
- `.agents/rules/*.md` (Hierarchical domain rules)

### Installed Rule Sets:
1. **`.agents/rules/ponytail.md`**: Adapted from the verified official Ponytail repository. Enforces YAGNI, minimal code additions, small reversible changes, and explicit reporting of risks and unverified items.
2. **`AGENTS.md`**: Enforces strict mental wellness safety:
   - Non-diagnostic boundary: Triguna and HRV must never be framed as medical diagnoses.
   - Privacy-first: Google Sheets submissions disabled by default; explicit user consent required.
   - Guarded Supabase: Local storage demo adapter is primary; cloud persistence disabled until schema and RLS are verified.
   - Simulation transparency: Simulated sensor data and simulated smart home actions must be visibly labelled.

No manual IDE actions are required to activate rules; Antigravity injects them automatically based on directory scope.

---

## 3. Model Context Protocol (MCP) Configuration

MCP servers extend Antigravity with external tool capabilities (browser automation and documentation lookup).

### Configuration Location
In Google Antigravity on Windows, global MCP servers are defined in:
`%USERPROFILE%\.gemini\config\mcp_config.json` (e.g., `C:\Users\hp\.gemini\config\mcp_config.json`).

A template configuration is maintained in the repository at [mcp_config.example.json](file:///c:/Users/hp/Downloads/santury%20updates/mcp_config.example.json).

### Active MCP Servers

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx.cmd",
      "args": [
        "-y",
        "@playwright/mcp@latest",
        "--headless",
        "--isolated"
      ]
    },
    "context7": {
      "command": "npx.cmd",
      "args": [
        "-y",
        "@upstash/context7-mcp"
      ]
    }
  }
}
```

### Server Details:
1. **`playwright` (`@playwright/mcp`)**
   - **Transport:** Stdio
   - **Flags:** `--headless` (background execution without stealing window focus), `--isolated` (in-memory session state).
   - **Capabilities:** Accessibility snapshots, automated page interactions, form filling, audio/video state verification.
   - **Cost:** Free, open source. Zero network calls for local testing.

2. **`context7` (`@upstash/context7-mcp`)**
   - **Transport:** Stdio
   - **Capabilities:** Real-time, version-specific documentation retrieval for React 18, Web Audio, and browser APIs.
   - **Cost:** Free tier. Requires outbound HTTPS.

---

## 4. UI Steps for Antigravity IDE

If configuring MCP servers or extensions via the Antigravity GUI:
1. Click the **Additional Options (...)** menu in the top-right toolbar or status pane.
2. Select **MCP Servers**.
3. Confirm that `playwright` and `context7` appear with a green connection status.
4. If modifying rules, reload the window via `Ctrl+Shift+P` -> `Developer: Reload Window`.

---

## 5. Security & Credential Isolation

- **Never put API keys in source code or `.env` files.**
- If adding optional credentials in the future (e.g., Supabase or custom LLM endpoints), copy `.env.example` to `.env` and verify that `.env` remains in `.gitignore`.
- Neither Playwright MCP nor Context7 require API keys or administrative privileges.
