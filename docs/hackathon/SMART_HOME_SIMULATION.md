# Sanctuary of Mind — Smart-Home Simulation Architecture & Verification Guide

## 1. Executive Summary & Objective

The **Sanctuary Home** module provides a realistic software simulation of connected smart-home wellness environments for the **Amazon Build, Ship, Shape: Amazon Developer Hackathon 2026 (Alexa+ Track)**.

Because physical Amazon Echo hardware, Alexa+ voice endpoints, smart bulbs, fans, and thermostats are unavailable during development and evaluation, this system delivers an honest, interactive, and transparent simulation. It demonstrates how personalized wellness interventions coordinate with ambient IoT environments without contacting external networks, claiming physical device operation, or requiring paid subscriptions.

---

## 2. Architecture & Data Flow

```mermaid
flowchart TD
    subgraph BrowserUI ["Sanctuary Frontend (React 18)"]
        Nav["Sanctuary Home Navigation Tab"]
        Notice["Persistent Simulation Notice Banner"]
        Scenes["Wellness Scenes (Calm & Ground, Focus, Sleep Prep)"]
        Devices["Interactive Simulated Devices (Lights, Audio, Fan, Temp)"]
        Timeline["Chronological Action & Verification Timeline"]
        Client["BrowserMcpClient (Streamable HTTP)"]
        
        Nav --> Scenes
        Scenes -->|Activate / Revert| Client
        Devices -->|Manual Overrides| Timeline
    end

    subgraph MCPBoundary ["Local MCP Server (http://127.0.0.1:3333/mcp)"]
        Router["McpServer Router (Official SDK)"]
        T6["Tool: get_home_device_states"]
        T7["Tool: simulate_wellness_scene\n(Zod schema validation)"]
        T8["Tool: restore_previous_scene\n(Rollback to previous state)"]
        
        Router --> T6
        Router --> T7
        Router --> T8
    end

    Client -->|POST /mcp (JSON-RPC 2.0)| Router
    T7 -->|Returns target states + audit timeline| Client
    T8 -->|Returns reverted states + audit timeline| Client
    Client --> Devices
    Client --> Timeline
```

---

## 3. Coordinated Wellness Scenes Matrix

| Scene Name | Target Purpose | Simulated Lighting | Simulated Acoustics | Simulated Ventilation | Climate Setpoint | Recommended Protocol |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Calm and Ground** | Vagal Down-Regulation | Warm Amber (2700K) at 30% brightness | Gentle Monsoon Rain at 35% volume | Gentle Breeze waft | 70°F (21°C) | `rajas_logical` (*Sympathetic Down-Regulation*) |
| **Focus** | Cognitive Clarity | Crisp Daylight Neutral (4500K) at 75% brightness | Quiet Study (Muted / Silence) | Quiet Low | 69°F (20.5°C) | `sattva_logical` (*Maintenance of Clarity*) |
| **Sleep Preparation** | Circadian Wind-Down | Deep Sunset Amber (2200K) at 12% brightness | Night Waves Pacing at 25% volume | Whisper Low | 68°F (20°C) | `tamas_emotional` (*Holding Space for Yourself*) |

---

## 4. Hardware & Simulation Honesty Rules

In compliance with project safety rules:
1. **Persistent Notice:** The simulation interface displays a permanent banner:
   > **SIMULATION MODE — No physical smart-home devices are connected. All device states and environmental changes are simulated locally.**
2. **Simulation Badges:** All ambient and environmental actions returned from the MCP server carry the explicit badge: `[SIMULATION - NO PHYSICAL HARDWARE CONNECTED]`.
3. **No Brand Trademarks:** No proprietary brand logos (e.g. Philips Hue, Nest, Dyson, Ring) are used.
4. **Reversible Actions:** Any activated scene can be immediately reverted to its prior state with the one-click **"Restore Previous Scene"** action (`restore_previous_scene` MCP tool).
5. **Interactive Controls:** All device cards support live manual overrides (power toggles, brightness/Kelvin sliders, acoustic track selectors, fan speed pills, temperature steppers) that update the displayed state and timeline immediately.

---

## 5. Model Context Protocol (MCP) Tools

The simulation exposes three dedicated tools via the official `@modelcontextprotocol/sdk`:

### 1. `get_home_device_states`
* **Input Schema:** `{ room?: string }`
* **Returns:** Current simulated states for `lights`, `audio`, `fan`, and `thermostat`.
* **Honesty Label:** `simulation_mode: true`.

### 2. `simulate_wellness_scene`
* **Input Schema:**
  * `scene_id`: `"calm_and_ground" | "focus" | "sleep_prep"`
  * `overrides?`: `{ brightness?, color_temp_k?, sound_track?, sound_volume?, fan_speed?, target_temp_f? }`
  * `current_states?`: Baseline object used to enable one-click rollback.
* **Returns:** Coordinated target states, recommended guided practice, action timeline, and simulation honesty notice.

### 3. `restore_previous_scene`
* **Input Schema:** `{ previous_states: Record<string, any> }`
* **Returns:** Reverted device states, restoration timeline, and simulation disclosure.

---

## 6. Offline Fallback Architecture

If the local MCP server is shut down or unavailable:
* The UI seamlessly falls back to its built-in local simulation engine (`simulateLocalScene`).
* The source indicator updates to `○ Local Simulation Fallback`.
* Device state changes, scene transitions, and timeline logging continue with 100% fidelity.
* Zero unhandled exceptions or UI crashes occur.

---

## 7. Future Physical-Device Integration Path

For production deployment with genuine Alexa+ or Amazon Echo hardware:
1. **Alexa Smart Home Skill API:** Connect MCP tool outputs to the Alexa Smart Home Skill API (`Alexa.BrightnessController`, `Alexa.ColorTemperatureController`, `Alexa.ThermostatController`).
2. **Matter / Zigbee / Thread Gateway:** Route coordinated scene commands through local Matter gateways for zero-latency, local-first IoT execution.
3. **Hardware Biometrics:** Integrate Apple HealthKit or Wear OS HRV sensors via authenticated OAuth consent.
