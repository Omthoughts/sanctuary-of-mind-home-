# Security & Privacy Policy — Sanctuary of Mind

## 1. Security Architecture & Privacy Principles

Sanctuary of Mind is designed with a **privacy-first, local-default, non-diagnostic** architecture:

- **Local Persistence Primary:** All self-reflection scores, Triguna calculations, preferences, and session histories are stored locally in the browser's `localStorage` by default.
- **Explicit Consent Boundary:** External transmissions or AI agent access are strictly blocked until the user explicitly grants permission via the Preferences tab. When authorized, a client-side cryptographic session token (`agent_token_*`) is generated and registered with the MCP server.
- **Origin Validation:** The Model Context Protocol (MCP) Streamable HTTP server strictly rejects cross-origin requests from unauthorized origins, preventing DNS rebinding and cross-site scripting vulnerabilities.
- **Zero Real Hardware Claims:** All smart-home device interactions (lighting, ambient acoustics, circulation fan, climate thermostat) and biometric measurements (HRV/PPG) are transparent software simulations. No physical devices or external IoT APIs are connected.

## 2. Wellness & Safety Boundaries

- **Strictly Non-Diagnostic:** Sanctuary of Mind is a self-reflection and mental wellness aid. It is NOT a clinical tool, medical device, or psychiatric diagnostic instrument.
- **No Emergency Alerts:** The Crisis Support interface provides direct telephonic links to certified professional helplines (e.g., Tele-MANAS `14416` in India, `988` in the US/Canada). The system never claims to have dispatched police, medical, or emergency responders.

## 3. Reporting a Vulnerability

If you discover a security vulnerability or privacy concern within this project:

1. Do NOT file a public issue.
2. Email the maintainer at `ommaske90@gmail.com` with:
   - A description of the vulnerability.
   - Steps to reproduce or proof-of-concept.
   - Potential impact.
3. We will respond within 48 hours to acknowledge receipt and coordinate a patch before public disclosure.
