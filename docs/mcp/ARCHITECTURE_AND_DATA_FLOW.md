# Sanctuary of Mind — MCP Architecture & Data Flow

## 1. Executive Summary & Integration Objective

Sanctuary of Mind integrates the **Model Context Protocol (MCP)** using the official `@modelcontextprotocol/sdk` (specification version `2025-11-25` Streamable HTTP transport).

The integration delivers an honest, secure, and privacy-respecting bridge between AI agents (such as Amazon Alexa+ or developer desktop agents) and the Sanctuary of Mind wellness platform, without requiring external paid cloud APIs, physical IoT hardware, or unauthorized data transmission.

---

## 2. Architecture Diagram

```mermaid
flowchart TD
    subgraph BrowserClient ["Sanctuary Frontend (React 18 / Browser)"]
        UI["UI Shell & Views\n(Practices, Check-in, Preferences)"]
        LocalStore["Local Storage Demo Adapter\n(100% On-Device Persistence)"]
        BrowserMcp["BrowserMcpClient\n(Streamable HTTP Client)"]
        UI -->|Reads / Writes| LocalStore
        UI -->|Dispatches Tool Calls| BrowserMcp
    end

    subgraph LoopbackBoundary ["Strict Loopback Boundary (127.0.0.1:3333)"]
        CorsGuard["Origin & DNS Rebinding Guard\n(Rejects untrusted external Origins)"]
        ConsentStore["In-Memory Active Consent Store\n(Cryptographic Session Tokens)"]
        
        subgraph McpServerSdk ["Official @modelcontextprotocol/sdk"]
            Transport["StreamableHTTPServerTransport\n(enableJsonResponse: true)"]
            Router["McpServer Tool Router"]
            
            T1["Tool 1: list_guided_practices\n(9 Canonical Protocols, Guna Filter)"]
            T2["Tool 2: get_practice_details\n(Adapted Instructions, Zod Schema)"]
            T3["Tool 3: get_consented_preferences\n(Strict Consent Token Boundary)"]
            T4["Tool 4: create_session_summary\n(Non-Diagnostic Summary + Crisis Escalation)"]
            T5["Tool 5: simulate_ambient_action\n(Explicit [SIMULATION] Labeling)"]
        end

        BrowserMcp -->|POST /mcp\nAccept: application/json, text/event-stream| CorsGuard
        CorsGuard --> Transport
        Transport --> Router
        Router --> T1
        Router --> T2
        Router --> T3
        Router --> T4
        Router --> T5
        
        UI -.->|POST /mcp/consent\n(Explicit User Grant/Revoke)| ConsentStore
        T3 -.->|Validates Token| ConsentStore
    end

    subgraph ExternalAgent ["External Agent / Alexa+ Assistant"]
        AgentClient["Alexa+ Agent / Desktop AI Client"]
        AgentClient -->|Standard JSON-RPC 2.0 /mcp| CorsGuard
    end
```

---

## 3. Communication Protocol & Standards Compliance

- **Transport:** Streamable HTTP (`http://127.0.0.1:3333/mcp`) as specified by MCP `2025-11-25`.
- **Headers:**
  - `Accept: application/json, text/event-stream`
  - `Content-Type: application/json`
  - `Mcp-Protocol-Version: 2025-11-25`
  - `Mcp-Session-Id: <uuid>` (stateful transport session tracking)
- **JSON-RPC Version:** `2.0`
- **Supported Methods:** `initialize`, `notifications/initialized`, `tools/list`, `tools/call`.

---

## 4. MCP Tools Specification

| Tool Name | Input Schema (Zod) | Data Scope & Behavior | Safety & Privacy Guards |
| :--- | :--- | :--- | :--- |
| `list_guided_practices` | `guna_filter`: `"sattva" \| "rajas" \| "tamas" \| "all"` | Returns metadata for 9 canonical evidence-based and contemplative protocols. | Read-only; deterministic; non-diagnostic. |
| `get_practice_details` | `guna`: `"sattva" \| "rajas" \| "tamas"`, `worldview`: `"logical" \| "emotional" \| "spiritual"`, `excluded_techniques`: `string[]?` | Returns step-by-step guidance. Safely adapts protocol if an excluded technique (e.g. vigorous movement, breath retention) is active. | Schema validation enforced; rejects invalid Gunas. |
| `get_consented_preferences` | `session_auth_token`: `string (min: 8)` | Exposes user preferences (session duration, narration style, speech rate, avoided techniques). | **Requires cryptographic session token.** Rejects unauthorized or revoked tokens with status `DENIED`. Raw check-in history, crisis disclosures, and emails are strictly excluded. |
| `create_session_summary` | `dominant_guna`, `session_duration_minutes`, `biometric_mode`, `is_distress` | Generates a structured wellness reflection summary. | Strictly non-diagnostic. If `is_distress: true`, automatically appends Tele-MANAS (14416) and 988 lifeline contact info with verified non-alert disclaimer. |
| `simulate_ambient_action` | `action_type`: `"dim_lighting" \| "ambient_soundscape" \| "gentle_focus_cue"`, `setting`: `string` | Simulates calming environmental changes in software. | **Hardware & Simulation Honesty:** Returns `[SIMULATION - NO PHYSICAL HARDWARE CONNECTED]` disclaimer explicitly stating no physical IoT devices are contacted. |

---

## 5. Security, Privacy & Consent Architecture

1. **Origin Verification & DNS Rebinding Protection:** The MCP server strictly checks `Origin` headers on incoming HTTP requests. Requests originating from unknown external domains are immediately rejected with `403 Forbidden`.
2. **Explicit User Consent Boundary:** User wellness preferences cannot be queried by an agent setting a boolean `has_consent: true`. A cryptographic authorization session token is created only when the user explicitly enables the "Authorize AI Agent" toggle inside the application.
3. **Instant Revocation:** Toggling off the consent checkbox immediately clears the token from both local persistence and the server's active consent session registry. Any subsequent tool calls with the old token are rejected with `403 Denied`.
4. **Resilient Local Fallback:** If the MCP server is not running or stops during use, the browser application seamlessly falls back to its verified local canonical protocols. No application crash, modal lockup, or data loss occurs.
