# Tooling & Environment Audit — Sanctuary of Mind

**Date:** 2026-10-15  
**Project:** Sanctuary of Mind (Amazon Build, Ship, Shape: Amazon Developer Hackathon 2026)  
**Host Environment:** Windows (x64)  
**IDE / Surface:** Google Antigravity IDE `v1.104.0` (commit `94f91bc110994badc7c086033db813077a5226af`)  
**AI Pairing Agent:** Antigravity (Google AI Pro / Gemini 3.8 Flash model tier)  

---

## 1. Executive Summary

This audit assesses the current repository state, development tooling, installed runtimes, existing integrations, and candidate MCP/plugin additions before any functional or architecture modifications are introduced.

### Key Findings
1. **Core Runtime:** Node.js `v22.16.0`, npm `10.9.2`, and Python `3.13.2` are installed and healthy.
2. **Browsers Available:** Both Google Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`) and Microsoft Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`) are installed locally.
3. **Version Control:** Git `2.54.0.windows.1` was initialized with a clean root commit (`13efcf6`). Scraps, temporary files, and downloaded tracking artifacts are ignored via `.gitignore`.
4. **Application Architecture:** `app/index.html` (and root `index.html`) is an in-browser React 18 single-page application compiled via `@babel/standalone` using browser ES module imports (`esm.sh/react@18.2.0`). No Node.js build pipeline or `package.json` was present in the original upload.
5. **Secrets & Persistence Inspection:**
   - Supabase client initialization in `app/index.html` contains placeholder key `'YOUR_PUBLISHABLE_KEY_HERE'`, failing silently in try/catch blocks without crashing the app.
   - An unconsented Google Sheets webhook endpoint (`script.google.com/macros/s/...`) was hardcoded into the feedback submit handler.
   - A critical UI button (`Connect with Crisis Support`) lacked an `onClick` handler.
6. **Antigravity Customization Architecture:**
   - Rules are loaded hierarchically from `AGENTS.md` and `.agents/rules/*.md` (capped at 24 KB / file, 20,000 token shared rules budget).
   - MCP servers are configured in `C:\Users\hp\.gemini\config\mcp_config.json` (currently 0 bytes, no servers active).
   - Built-in capabilities include native web search (`search_web`), URL fetch (`read_url_content`), browser interaction, tasks, and subagent orchestration.

---

## 2. Environment Details & Compatibility Matrix

| Component | Detected Version / Path | Status | Impact / Notes |
| :--- | :--- | :--- | :--- |
| **Operating System** | Windows 10/11 x64 | Verified | PowerShell commands require `;` instead of `&&`. Path separators handled cleanly. |
| **Antigravity IDE** | 1.104.0 | Verified | Supports progressive disclosure rules (`AGENTS.md`, `.agents/rules/`), MCP stdio/HTTP transports. |
| **Node.js** | v22.16.0 | Verified | Modern LTS. Supports ES modules, native fetch, npx tools. |
| **npm** | 10.9.2 | Verified | Available for package management and npx script runners. |
| **Git** | 2.54.0.windows.1 | Verified | Initialized repository. Recoverable baseline checkpoint committed. |
| **Python** | 3.13.2 | Verified | Standard library HTTP server (`python -m http.server`) available as zero-dependency preview. |
| **Local Browsers** | Chrome 130+, Edge 130+ | Verified | Available for local testing, DevTools CDP debugging, and Playwright execution. |
| **Global MCP Config** | `C:\Users\hp\.gemini\config\mcp_config.json` | 0 bytes (Empty) | Ready for safe, additive configuration of verified stdio/HTTP servers. |

---

## 3. Application Asset & File Baseline

| File / Folder | Original State | Audit Action Taken | Baseline State |
| :--- | :--- | :--- | :--- |
| `index (1).html` | Root duplicate of app HTML | Checked SHA256 against `app/index.html` and `baseline/original-files/index_original_uploaded.html` (all `1A2AC5CB...`). | Renamed safely to `index.html` at root to allow direct static serving. |
| `baseline/original-files/` | Untouched copies | Preserved original `index_original_uploaded.html` and `netlify_original_uploaded.toml`. | Immutable reference checkpoint. |
| `app/index.html` | Working copy | Validated structure: React 18, Babel standalone, Cormorant Garamond / DM Sans fonts. | Maintained for app packaging. |
| `netlify.toml` | `publish = "/opt/build/repo"` | Preserved original. Flagged configuration issue: publish directory points to absolute build container path instead of `app` or `.`. | Marked for deployment update. |
| Download scraps (`*.download`, `saved_resource*`, `07557c1a*`, `f.txt`) | Tracking pixels and HTML scraps from initial web export | Excluded from version control via `.gitignore`. Kept on disk untouched. | Clean repository state. |
| `.env.example` | Missing at root, template in `app/` | Created root `.env.example` with safe, optional placeholders and clear non-secret documentation. | Safe, reproducible configuration. |

---

## 4. Security & Safety Findings

1. **Remote Endpoint Submissions:**
   - `fetch('https://script.google.com/macros/s/...', { method: 'POST', mode: 'no-cors', body: JSON.stringify(...) })` transmits user name, email, rating, and feedback to an external Google Apps Script.
   - **Risk:** Lacks explicit consent banner or user opt-out.
   - **Action:** Must be disabled by default; require explicit opt-in toggle before transmission.
2. **Database Credentials:**
   - Placeholder key `'YOUR_PUBLISHABLE_KEY_HERE'` in `app/index.html`.
   - **Risk:** Misleading implication of cloud persistence.
   - **Action:** Implement local storage demo adapter as primary persistence mechanism; keep Supabase optional and disabled until verified.
3. **Crisis & Distress Flow:**
   - Distress overlay triggers when `tamas >= 3 || (tamas >= 2 && rajas >= 2)`.
   - The primary button (`Connect with Crisis Support`) has no action attached.
   - **Risk:** High safety hazard for users in acute distress.
   - **Action:** Connect button to verified, non-diagnostic crisis helplines (Tele-MANAS `14416` / `1800-891-4416`, Kiran `1800-599-0019`, Vandrevala Foundation, iCall, and US `988`). Clearly disclose that this provides phone/chat links and does NOT dispatch an automated alert or emergency services.

---

## 5. Tooling Compatibility & Gap Analysis

1. **Documentation Retrieval (Context7 vs. Native Web Search):**
   - Built-in `search_web` and `read_url_content` provide zero-friction, zero-config lookups.
   - Context7 MCP provides structured library documentation retrieval without web clutter.
2. **Browser Testing (Playwright MCP vs. Chrome DevTools MCP):**
   - Playwright MCP uses token-efficient accessibility trees (`refs`) and deterministic action locators, ideal for testing interactive user flows and multi-step states.
   - Chrome DevTools MCP connects via CDP, ideal for inspecting console logs and CSS.
   - **Recommendation:** Playwright MCP is primary for automated acceptance testing; DevTools is optional.
3. **Research Tooling (Tavily MCP):**
   - Requires external API key and billing/quotas.
   - Built-in Google AI tools already provide search without third-party tokens.
   - **Decision:** Do not install Tavily MCP; avoid unneeded API keys.

---

## 6. Next Steps & Approval Gates

- [x] Phase 0 Baseline Git Checkpoint established (`13efcf6`).
- [x] Renamed `index (1).html` to `index.html` after verifying triple-backup parity.
- [ ] Install project rules (`AGENTS.md` and `.agents/rules/ponytail.md`).
- [ ] Provide safe `mcp_config.json` configuration for developer tooling.
- [ ] Prepare test harness and baseline verification report.
