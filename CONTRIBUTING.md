# Contributing to Sanctuary of Mind

Thank you for your interest in contributing to **Sanctuary of Mind**! We welcome improvements that enhance privacy, accessibility, and contemplative user experiences.

---

## 1. Guiding Principles & Engineering Rules

Before making any changes, please review [`AGENTS.md`](./AGENTS.md):

1. **Non-Diagnostic Stance:** Never introduce clinical diagnoses, disease classifications, or medical claims.
2. **Preserve Working Protocols:** Maintain the 9 canonical protocols, Triguna scoring, local persistence, and offline fallback.
3. **Simulation Honesty:** Any ambient or smart-home interaction must remain clearly identified as software simulations (`[SIMULATION MODE]`).
4. **Privacy-First:** User data remains local by default. Never introduce unconsented external tracking or data transmission.
5. **Synchronized Entry Points:** When modifying UI or styles, keep `index.html` and `app/index.html` strictly synchronized.

---

## 2. Development Setup

### Prerequisites
- Node.js 18+ (tested on Node 20 LTS / 22)
- npm 9+

### Installation
```bash
npm install
```

### Running Locally
```bash
# Terminal 1: Start MCP Streamable HTTP Server (Port 3333)
npm run mcp:server

# Terminal 2: Start Web Application (Port 3000)
npm run serve
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Running the Test Suite

Always ensure all automated tests pass before submitting changes:

```bash
# 1. Run Unit Tests (33/33 tests covering protocols, scoring, MCP tools)
npm test

# 2. Run MCP Smoke Tests (Streamable HTTP handshake & device simulation)
npm run test:smoke

# 3. Run Full Browser Playwright E2E Suite
npm run test:e2e
```

---

## 4. Submitting Pull Requests

1. Fork the repository and create your feature branch from `master`.
2. Commit your changes using conventional commit messages (e.g., `feat:`, `fix:`, `docs:`, `test:`).
3. Ensure all tests pass (`npm test && npm run test:smoke && npm run test:e2e`).
4. Submit a Pull Request describing your changes, motivation, and test verification output.
