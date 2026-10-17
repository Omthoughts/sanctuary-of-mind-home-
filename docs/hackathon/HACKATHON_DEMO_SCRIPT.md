# Sanctuary of Mind — Amazon Build, Ship, Shape 2026: 3-Minute Demo Script

**Track:** Alexa+ Track  
**Platform:** Sanctuary of Mind (AI Mental Wellness with Triguna, HRV & Official Model Context Protocol SDK)  
**Target Duration:** 3 minutes (180 seconds)

---

## Act 1: The Vision & Non-Diagnostic Check-in (0:00 – 0:50)

**Speaker Screen:** Browser on `http://localhost:4321` with `node mcp/server.mjs` running on `http://127.0.0.1:3333/mcp`.

> **Speaker:**
> *"Welcome to Sanctuary of Mind, built for the Amazon Build, Ship, Shape Hackathon 2026 Alexa+ track.
> 
> Modern wellness platforms either offer rigid static audio tracks or push invasive, uncalibrated biometric claims. Sanctuary of Mind bridges ancient Triguna psychology—reflecting Sattva (clarity), Rajas (activation), and Tamas (rest/inertia)—with Heart Rate Variability self-reflection and the official Model Context Protocol (MCP) Streamable HTTP standard.
> 
> Let's take a quick 4-question check-in."*

**Action:**
1. Click **"Enter Sanctuary"**.
2. Answer 4 questions honestly, choosing high-load or restless answers (e.g. Tamas/Rajas).
3. The platform transitions through Processing and reveals the **Distress & Crisis Safety Boundary**.

> **Speaker:**
> *"Notice our clinical safety boundary. Sanctuary of Mind is strictly non-diagnostic. When acute distress is indicated, we present verified, official helplines—Tele-MANAS 14416 in India and 988 in the US/Canada. We explicitly clarify that no emergency dispatch or automated call has been placed; users are connected directly with human professionals."*

---

## Act 2: Guided Session & Honest Ambient Simulation (0:50 – 1:30)

**Action:**
1. Click **"Continue to Calming Sanctuary Reflection"**.
2. Click **"Activate Protocol"** (or customized action) to launch the Guided Session modal.
3. Click **"Dim Lights (Warm Amber)"**.

> **Speaker:**
> *"Inside our guided session, we provide voice narration with real-time breathing visualizers.
> 
> When interacting with ambient environments, we adhere strictly to the Hackathon's Hardware & Simulation Honesty Rule.
> 
> Notice the feedback badge: `[SIMULATION - NO PHYSICAL HARDWARE CONNECTED]`. We explicitly disclose to the user that this action was executed in software simulation and that no physical Alexa or smart-home bulb was contacted. This guarantees complete transparency."*

**Action:**
4. Click **"End Session & Return"**.

---

## Act 3: Live MCP Integration & Tool Discovery (1:30 – 2:15)

**Action:**
1. Click **"Practices"** in the top navigation shell.

> **Speaker:**
> *"Here in the Practices Library, we see real-time Model Context Protocol integration in action.
> 
> Notice the status indicator: `● MCP Server Connected (Live Streamable HTTP)` connected to `http://127.0.0.1:3333/mcp` using the official `@modelcontextprotocol/sdk` on the `2025-11-25` specification.
> 
> All 9 canonical wellness protocols are dynamically queried from the MCP server tool `list_guided_practices`."*

**Action:**
2. Click **"Details"** on any protocol card to open the payload modal.

> **Speaker:**
> *"Clicking Details calls the MCP tool `get_practice_details`, returning structured steps and safety adaptations."*

**Action:**
3. Click **"Activity Log"** in the status bar to show the JSON-RPC audit drawer.

> **Speaker:**
> *"The built-in activity drawer reveals every JSON-RPC 2.0 transaction—from initialization and tool discovery (`tools/list`) to individual tool invocations with round-trip latency tracking."*

---

## Act 4: Explicit Consent Boundary & Resilient Fallback (2:15 – 3:00)

**Action:**
1. Click **"Preferences"** in the top navigation shell.
2. Scroll to the **"AI Agent & Alexa+ MCP Consent Boundary"** card.

> **Speaker:**
> *"Privacy is fundamental in mental wellness. External AI assistants and Alexa+ agents cannot query user wellness preferences simply by asserting a boolean flag.
> 
> As you can see, agent access is denied by default.
> 
> When the user explicitly toggles 'Authorize AI Agent Preference Access', an ephemeral cryptographic authorization token is established."*

**Action:**
3. Toggle the checkbox **ON** and click **"Test get_consented_preferences Tool"**.
4. The response box displays `{"authorized": true, ...}`.

> **Speaker:**
> *"The MCP tool confirms authorized access, sharing only non-sensitive preferences like narration tone and avoided techniques. Raw check-in history and distress records are permanently excluded from the agent boundary.
> 
> If the user revokes consent..."*

**Action:**
5. Toggle the checkbox **OFF** and click the test button again. The response displays `{"authorized": false, "status": "DENIED"}`.

> **Speaker:**
> *"Access is instantly revoked and verified.
> 
> Finally, what happens if the local MCP server goes offline? Let's stop the server process in the terminal."*

**Action:**
6. Stop server, navigate back to **Practices**, and click **"Refresh from MCP"**.
7. The status gracefully updates to: `○ MCP Server Offline (Using Verified Local Fallback)`. All 9 practices remain interactive.

> **Speaker:**
> *"The application seamlessly shifts to its verified local canonical matrix without crashing or locking the interface.
> 
> Sanctuary of Mind delivers a complete, secure, and privacy-respecting reference architecture for ambient AI mental wellness on Amazon Alexa+ and the Model Context Protocol. Thank you!"*
