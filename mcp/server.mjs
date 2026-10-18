import http from 'node:http';
import crypto from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

// Configurable host and port (default loopback on 3333)
const PORT = parseInt(process.env.MCP_PORT || '3333', 10);
const HOST = process.env.MCP_HOST || '127.0.0.1';

// Allowed origins for DNS rebinding & CORS protection
const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/sanctuaryofmind\.netlify\.app$/
];

function isOriginAllowed(origin) {
  if (!origin) return true; // Direct tools, CLI or same-origin without Origin header
  return ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin));
}

// ─── CANONICAL 9 GUIDED PROTOCOLS (SOURCE OF TRUTH) ─────────────────
const LIBRARY = {
  rajas: {
    logical:   { id: 'rajas_logical', title: "Sympathetic Down-Regulation", desc: "When restlessness or sympathetic arousal feels elevated, use an unhurried 4-7-8 breath ratio to cultivate parasympathetic calming.", step1: "Inhale for 4 seconds to oxygenate.", step2: "Exhale for 8 seconds to signal safety.", action: "Initiate Regulation", techniques: ["breath_retention", "paced_breathing"] },
    emotional: { id: 'rajas_emotional', title: "Holding Space for Yourself",  desc: "Your heart is racing because it cares. Let's wrap that anxiety in a blanket of breath. You are safe to let go.", step1: "Breathe in acceptance.", step2: "Breathe out the weight.", action: "Begin Breathing", techniques: ["gentle_breathing", "self_compassion"] },
    spiritual: { id: 'rajas_spiritual', title: "Surrendering to Divine Will", desc: "This restlessness is a call to trust. Release the burden of being the Doer. Breathe in Grace, breathe out control.", step1: "Inhale the present moment.", step2: "Exhale into the unknown.", action: "Offer Prayer", techniques: ["mantra", "contemplation"] },
  },
  tamas: {
    logical:   { id: 'tamas_logical', title: "Motor Cortex Activation",  desc: "When feeling sluggish or mentally stuck in rumination, immediate motor engagement helps reorient your focus to the present moment.", step1: "Stand up immediately.", step2: "Shake hands vigorously.", action: "Activate Protocol", techniques: ["vigorous_movement", "motor_activation"] },
    emotional: { id: 'tamas_emotional', title: "Igniting the Spark",        desc: "You feel heavy, and that is okay. We are going to gently move together to remind your body it is capable of change.", step1: "Rise like the sun.", step2: "Shake off the dust.", action: "Move Gently", techniques: ["vigorous_movement", "emotional_activation"] },
    spiritual: { id: 'tamas_spiritual', title: "Awakening the Spirit",      desc: "The veil of inertia is heavy, but your spirit is light. Use movement to break the shell and let your inner light shine.", step1: "Stand and offer presence.", step2: "Release the stagnation.", action: "Awaken Now", techniques: ["vigorous_movement", "spiritual_activation"] },
  },
  sattva: {
    logical:   { id: 'sattva_logical', title: "Maintenance of Clarity",  desc: "Your executive functions are optimal. Use this state for high-cognitive load tasks without attachment to the result.", step1: "Observe the clarity.", step2: "Direct it to purpose.", action: "Deep Focus", techniques: ["mindful_focus", "cognitive_clarity"] },
    emotional: { id: 'sattva_emotional', title: "Savoring the Calm",        desc: "You are in a beautiful state of flow. Pause to feel gratitude for this peace, knowing it is a gift to be shared.", step1: "Smile internally.", step2: "Send love outward.", action: "Express Gratitude", techniques: ["gratitude", "heart_resonance"] },
    spiritual: { id: 'sattva_spiritual', title: "Service to the Divine",   desc: "Clarity is a blessing. Offer this clear mind as an instrument for the greater good. Remain humble in this light.", step1: "Witness the peace.", step2: "Dedicate it to all.", action: "Offer Service", techniques: ["reverence", "devotional_service"] },
  },
};

// Adapted variations when disliked techniques are excluded
const ADAPTED_PROTOCOLS = {
  tamas_logical: {
    vigorous_movement: {
      title: "Seated Isometric Grounding",
      desc: "Adapted protocol avoiding vigorous movement: gentle seated foot pressure and wrist extensions to awaken the motor cortex and sensory pathways smoothly.",
      step1: "Press both soles firmly into the ground for 5 seconds.",
      step2: "Gently stretch your palms open and rotate wrists slowly.",
      action: "Begin Gentle Grounding",
      adaptationReason: "Adapted because vigorous movement is in your avoided techniques."
    }
  },
  rajas_logical: {
    breath_retention: {
      title: "Gentle Paced Respiration",
      desc: "Adapted protocol avoiding breath retention: smooth 4-second inhalation and 6-second unhurried exhalation to calm the autonomic nervous system without holding breath.",
      step1: "Inhale smoothly through your nose for 4 seconds without straining.",
      step2: "Exhale softly and steadily for 6 seconds without pausing.",
      action: "Begin Paced Respiration",
      adaptationReason: "Adapted because breath retention is in your avoided techniques."
    }
  },
  rajas_spiritual: {
    mantra: {
      title: "Silent Trust & Contemplation",
      desc: "Adapted protocol avoiding vocal chanting: silent inner witnessing and unhurried breath to cultivate surrender without audible recitation.",
      step1: "Silently observe the natural rhythm of breath.",
      step2: "Inwardly release control on each slow exhale.",
      action: "Begin Silent Contemplation",
      adaptationReason: "Adapted because mantra/vocal prayer is in your avoided techniques."
    }
  }
};

// ─── TRUSTED IN-MEMORY CONSENT STORE ────────────────────────────────
// Consent tokens are established only by explicit user action in the Sanctuary UI
const activeConsentSessions = new Map();
export const CONSENT_SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
export const MAX_CONSENT_SESSIONS = 100;
const TOKEN_REGEX = /^[a-zA-Z0-9_\-\.]{16,128}$/;

// Bounded registration rate limiter (sliding window) to mitigate flooding attacks
const REGISTRATION_RATE_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REGISTRATIONS_PER_WINDOW = 30; // Max 30 new registrations per minute
const registrationTimestamps = [];

export function isRegistrationRateLimited() {
  const now = Date.now();
  while (registrationTimestamps.length > 0 && registrationTimestamps[0] <= now - REGISTRATION_RATE_WINDOW_MS) {
    registrationTimestamps.shift();
  }
  return registrationTimestamps.length >= MAX_REGISTRATIONS_PER_WINDOW;
}

export function recordRegistration() {
  registrationTimestamps.push(Date.now());
}

export function resetRegistrationRateLimit() {
  registrationTimestamps.length = 0;
}

export function isValidConsentToken(token) {
  return typeof token === 'string' && TOKEN_REGEX.test(token);
}

export function pruneExpiredConsentSessions() {
  const now = Date.now();
  for (const [token, session] of activeConsentSessions.entries()) {
    if (session.expiresAt && now > session.expiresAt) {
      activeConsentSessions.delete(token);
    }
  }
}

export function grantConsentSession(token, preferences = {}) {
  if (!isValidConsentToken(token)) {
    throw new Error('Invalid token format: must be 16-128 characters matching [a-zA-Z0-9_.-]');
  }

  pruneExpiredConsentSessions();

  // Capacity protection: reject new registrations when table is full instead of evicting active sessions
  if (!activeConsentSessions.has(token) && activeConsentSessions.size >= MAX_CONSENT_SESSIONS) {
    const err = new Error('Consent capacity reached: active session limit reached. Active sessions are protected from eviction.');
    err.code = 'CAPACITY_REACHED';
    throw err;
  }

  const now = Date.now();
  activeConsentSessions.set(token, {
    grantedAt: new Date(now).toISOString(),
    expiresAt: now + CONSENT_SESSION_TTL_MS,
    preferences: {
      language: typeof preferences.language === 'string' ? preferences.language.slice(0, 10) : 'en',
      sessionDuration: typeof preferences.sessionDuration === 'number' ? Math.min(Math.max(preferences.sessionDuration, 1), 60) : 3,
      narrationStyle: typeof preferences.narrationStyle === 'string' ? preferences.narrationStyle.slice(0, 20) : 'calm',
      speechRate: typeof preferences.speechRate === 'number' ? Math.min(Math.max(preferences.speechRate, 0.5), 2.0) : 1.0,
      mindStyle: ['logical', 'emotional', 'spiritual', 'balanced'].includes(preferences.mindStyle) ? preferences.mindStyle : 'balanced',
      ambientSound: typeof preferences.ambientSound === 'string' ? preferences.ambientSound.slice(0, 20) : 'rain',
      excludedTechniques: Array.isArray(preferences.excludedTechniques) ? preferences.excludedTechniques.filter(t => typeof t === 'string').slice(0, 10) : [],
      reducedMotion: !!preferences.reducedMotion,
      highContrast: !!preferences.highContrast,
    }
  });
  return token;
}

export function revokeConsentSession(token) {
  if (!token || typeof token !== 'string') return false;
  return activeConsentSessions.delete(token);
}

export function clearAllConsentSessions() {
  activeConsentSessions.clear();
}

// ─── MCP SERVER SETUP (OFFICIAL SDK) ────────────────────────────────
export function createSanctuaryMcpServer() {
  const server = new McpServer({
    name: 'sanctuary-of-mind-mcp',
    version: '1.0.0',
    description: 'Sanctuary of Mind wellness protocol server supporting Triguna reflection and simulated ambient interactions.'
  });

  // Tool 1: list_guided_practices
  server.tool(
    'list_guided_practices',
    'List verified guided wellness practices from the 9-protocol matrix, filterable by Triguna energy state.',
    {
      guna_filter: z.enum(['all', 'sattva', 'rajas', 'tamas']).optional().default('all')
        .describe('Filter practices by dominant Triguna state (sattva, rajas, tamas, or all)')
    },
    async ({ guna_filter }) => {
      const results = [];
      const gunas = guna_filter === 'all' ? ['sattva', 'rajas', 'tamas'] : [guna_filter];

      for (const guna of gunas) {
        for (const [worldview, proto] of Object.entries(LIBRARY[guna])) {
          results.push({
            id: proto.id,
            guna,
            worldview,
            title: proto.title,
            description: proto.desc,
            action: proto.action,
            techniques: proto.techniques,
            source: 'Canonical 9-Protocol Matrix'
          });
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total: results.length,
              filter_applied: guna_filter,
              practices: results
            }, null, 2)
          }
        ]
      };
    }
  );

  // Tool 2: get_practice_details
  server.tool(
    'get_practice_details',
    'Get full step-by-step guidance, duration, purpose, safety notes, and adaptation for an existing practice.',
    {
      guna: z.enum(['sattva', 'rajas', 'tamas']).describe('Inner Guna state (sattva, rajas, or tamas)'),
      worldview: z.enum(['logical', 'emotional', 'spiritual']).describe('Practice worldview orientation (logical, emotional, spiritual)'),
      avoided_technique: z.string().optional().describe('Optional technique identifier to avoid (e.g. vigorous_movement, breath_retention, mantra)')
    },
    async ({ guna, worldview, avoided_technique }) => {
      const base = LIBRARY[guna]?.[worldview];
      if (!base) {
        throw new Error(`Practice not found for Guna "${guna}" and worldview "${worldview}".`);
      }

      let practice = { ...base };
      let isAdapted = false;
      let adaptationNotice = null;

      if (avoided_technique && ADAPTED_PROTOCOLS[base.id]?.[avoided_technique]) {
        const adaptation = ADAPTED_PROTOCOLS[base.id][avoided_technique];
        practice = { ...practice, ...adaptation };
        isAdapted = true;
        adaptationNotice = adaptation.adaptationReason;
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              id: practice.id,
              guna,
              worldview,
              title: practice.title,
              description: practice.desc,
              steps: [
                { step: 1, instruction: practice.step1 },
                { step: 2, instruction: practice.step2 }
              ],
              action: practice.action,
              is_adapted: isAdapted,
              adaptation_notice: adaptationNotice,
              safety_notice: 'Non-diagnostic: This practice is for self-reflection and calming regulation, not clinical psychiatric intervention.'
            }, null, 2)
          }
        ]
      };
    }
  );

  // Tool 3: get_consented_preferences
  server.tool(
    'get_consented_preferences',
    'Retrieve user-authorized wellness preferences only when explicit user consent has been established in the application.',
    {
      session_auth_token: z.string().min(16).max(128).regex(/^[a-zA-Z0-9_\-\.]+$/).describe('Cryptographic session token issued when user explicitly toggled agent authorization in Sanctuary settings')
    },
    async ({ session_auth_token }) => {
      const session = activeConsentSessions.get(session_auth_token);

      if (!session) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                authorized: false,
                error: 'Consent Required: The user has not established explicit consent for AI agent access in Sanctuary of Mind settings. No personal data was disclosed.',
                status: 'DENIED'
              }, null, 2)
            }
          ]
        };
      }

      if (session.expiresAt && Date.now() > session.expiresAt) {
        activeConsentSessions.delete(session_auth_token);
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                authorized: false,
                error: 'Consent Expired: The authorization token has expired. User must re-authorize agent access.',
                status: 'EXPIRED'
              }, null, 2)
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              authorized: true,
              granted_at: session.grantedAt,
              preferences: session.preferences,
              data_scope: 'Limited to wellness preferences; raw session history, crisis disclosures, and emails are strictly excluded.'
            }, null, 2)
          }
        ]
      };
    }
  );

  // Tool 4: create_session_summary
  server.tool(
    'create_session_summary',
    'Create a minimal, non-diagnostic reflection summary from actual supplied check-in scores.',
    {
      sattva_score: z.number().min(0).max(4).describe('Sattva clarity score (0-4)'),
      rajas_score: z.number().min(0).max(4).describe('Rajas active/restless score (0-4)'),
      tamas_score: z.number().min(0).max(4).describe('Tamas inertia/heaviness score (0-4)'),
      hrv_ms: z.number().optional().describe('Optional Heart Rate Variability in ms'),
      mindstyle: z.enum(['logical', 'emotional', 'spiritual']).optional().default('logical')
        .describe('User worldview orientation')
    },
    async ({ sattva_score, rajas_score, tamas_score, hrv_ms, mindstyle }) => {
      // Dominant energy resolution
      const scores = { sattva: sattva_score, rajas: rajas_score, tamas: tamas_score };
      const dominant = Object.entries(scores).sort((a,b) => b[1] - a[1])[0][0];

      // Distress detection boundary
      const isDistress = tamas_score >= 3 || (tamas_score >= 2 && rajas_score >= 2);

      const recommended = LIBRARY[dominant][mindstyle];

      const summary = {
        dominant_guna: dominant,
        state_label: dominant === 'rajas' ? 'Active Energy (Rajas)' : dominant === 'tamas' ? 'Resting Energy (Tamas)' : 'Clear Energy (Sattva)',
        scores: { sattva: sattva_score, rajas: rajas_score, tamas: tamas_score },
        hrv_ms: hrv_ms || null,
        recommended_practice: {
          id: recommended.id,
          title: recommended.title,
          action: recommended.action
        },
        disclaimer: 'Non-diagnostic: Triguna scores and HRV metrics are reflective wellness concepts, not psychiatric or clinical diagnoses.'
      };

      if (isDistress) {
        summary.distress_support_resources = {
          notice: 'Responses reflect significant emotional heaviness. Professional, caring human connection is available 24/7.',
          india_telemanas: {
            service: 'Tele-MANAS (Govt. of India)',
            helpline: '14416',
            toll_free: '1800-891-4416',
            portal: 'https://telemanas.mohfw.gov.in'
          },
          us_lifeline: {
            service: '988 Suicide & Crisis Lifeline',
            helpline: '988',
            portal: 'https://988lifeline.org'
          },
          safety_clarification: 'Opening dialer links connects to human counselors; it does NOT dispatch ambulances or emergency responders.'
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(summary, null, 2)
          }
        ]
      };
    }
  );

  // Tool 5: simulate_ambient_action
  server.tool(
    'simulate_ambient_action',
    'Return a clearly labeled simulated environment action without claiming physical hardware control.',
    {
      action_type: z.enum(['dim_lights', 'ambient_soundscape', 'gentle_focus_cue', 'breathing_pacer'])
        .describe('Type of ambient environment action to simulate'),
      setting: z.string().optional()
        .describe('Optional setting parameter (e.g. "warm_amber", "gentle_rain", "temple_bells", "4-7-8")')
    },
    async ({ action_type, setting }) => {
      const simulationFeedback = {
        dim_lights: {
          simulated_device: 'Smart Lighting (Virtual)',
          effect: `Color temperature transitioned to ${setting || 'warm amber (2700K)'} at 30% brightness.`,
        },
        ambient_soundscape: {
          simulated_device: 'Ambient Audio Pacer (Virtual)',
          effect: `Streaming calming acoustic layer: ${setting || 'gentle rain'}.`,
        },
        gentle_focus_cue: {
          simulated_device: 'Haptic / Visual Cue (Virtual)',
          effect: 'Emitted gentle calming chime cue for focus realignment.',
        },
        breathing_pacer: {
          simulated_device: 'Visual Breath Pacer (Virtual)',
          effect: `Visual breath guide synchronized to rhythm: ${setting || '4s inhale / 6s exhale'}.`,
        }
      }[action_type];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'SIMULATED_SUCCESS',
              simulation_label: '[SIMULATION - NO PHYSICAL HARDWARE CONNECTED]',
              action_executed: action_type,
              details: simulationFeedback,
              honesty_disclosure: 'This action was executed inside software simulation only. No Amazon Echo, Alexa device, physical smart bulb, or IoT hardware was contacted or altered.'
            }, null, 2)
          }
        ]
      };
    }
  );

  // Tool 6: get_home_device_states
  server.tool(
    'get_home_device_states',
    'Retrieve current simulated states of connected smart-home wellness devices (lighting, acoustics, climate). Software simulation only.',
    {
      room: z.string().optional().describe('Target sanctuary room identifier (e.g. sanctuary_room, living_room)')
    },
    async ({ room }) => {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'SUCCESS',
              simulation_mode: true,
              simulation_notice: 'SIMULATION MODE — No physical smart-home devices are connected. All device states and environmental changes are simulated locally.',
              room: room || 'sanctuary_room',
              devices: {
                lights: {
                  power: true,
                  brightness: 65,
                  color_temp_k: 4000,
                  color_hex: '#fdfbf7',
                  label: 'Circadian Ambience'
                },
                audio: {
                  power: false,
                  track: 'rain',
                  track_label: 'Gentle Monsoon Rain',
                  volume: 40
                },
                fan: {
                  power: true,
                  speed: 'low',
                  mode: 'quiet'
                },
                thermostat: {
                  current_temp_f: 72,
                  target_temp_f: 71,
                  mode: 'eco_cool',
                  unit: '°F'
                }
              },
              timestamp: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    }
  );

// Strict Zod schema for smart-home simulated device state validation
const deviceStateSchema = z.object({
  lights: z.object({
    power: z.boolean().optional(),
    brightness: z.number().min(0).max(100).optional(),
    color_temp_k: z.number().min(2000).max(6500).optional(),
    color_hex: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional(),
    label: z.string().max(100).optional()
  }).strict().optional(),
  audio: z.object({
    power: z.boolean().optional(),
    track: z.string().max(50).optional(),
    track_label: z.string().max(100).optional(),
    volume: z.number().min(0).max(100).optional()
  }).strict().optional(),
  fan: z.object({
    power: z.boolean().optional(),
    speed: z.enum(['off', 'low', 'medium', 'high', 'breeze']).optional(),
    mode: z.string().max(50).optional()
  }).strict().optional(),
  thermostat: z.object({
    power: z.boolean().optional(),
    current_temp_f: z.number().min(40).max(110).optional(),
    target_temp_f: z.number().min(50).max(95).optional(),
    mode: z.string().max(50).optional(),
    unit: z.enum(['°F', '°C']).optional()
  }).strict().optional()
}).strict();

  // Tool 7: simulate_wellness_scene
  server.tool(
    'simulate_wellness_scene',
    'Simulate coordinating an end-to-end wellness scene across lighting, audio, fan, and thermostat. Software simulation only.',
    {
      scene_id: z.enum(['calm_and_ground', 'focus', 'sleep_prep']).describe('Identifier of wellness scene to simulate'),
      overrides: z.object({
        brightness: z.number().min(0).max(100).optional(),
        color_temp_k: z.number().min(2000).max(6500).optional(),
        sound_track: z.enum(['rain', 'forest', 'ocean', 'white_noise', 'silence']).optional(),
        sound_volume: z.number().min(0).max(100).optional(),
        fan_speed: z.enum(['off', 'low', 'medium', 'high', 'breeze']).optional(),
        target_temp_f: z.number().min(60).max(85).optional()
      }).optional().describe('Optional user overrides for lighting, audio, or climate'),
      current_states: deviceStateSchema.optional().describe('Current device states before activating scene to enable restoration')
    },
    async ({ scene_id, overrides = {}, current_states }) => {
      const SCENE_CONFIGS = {
        calm_and_ground: {
          title: 'Calm and Ground',
          description: 'Warm amber lighting at 30% and gentle acoustic rain to down-regulate sympathetic arousal.',
          lights: { power: true, brightness: 30, color_temp_k: 2700, color_hex: '#ffb347', label: 'Warm Amber Grounding' },
          audio: { power: true, track: 'rain', track_label: 'Gentle Monsoon Rain', volume: 35 },
          fan: { power: true, speed: 'breeze', mode: 'gentle_waft' },
          thermostat: { current_temp_f: 72, target_temp_f: 70, mode: 'cool', unit: '°F' },
          recommended_practice: 'rajas_logical',
          recommended_title: 'Sympathetic Down-Regulation'
        },
        focus: {
          title: 'Focus',
          description: 'Crisp neutral daylight with quiet acoustics for uninterrupted cognitive clarity.',
          lights: { power: true, brightness: 75, color_temp_k: 4500, color_hex: '#eef6fc', label: 'Crisp Daylight Neutral' },
          audio: { power: false, track: 'silence', track_label: 'Quiet Study (Muted)', volume: 0 },
          fan: { power: true, speed: 'low', mode: 'quiet' },
          thermostat: { current_temp_f: 72, target_temp_f: 69, mode: 'cool', unit: '°F' },
          recommended_practice: 'sattva_logical',
          recommended_title: 'Maintenance of Clarity'
        },
        sleep_prep: {
          title: 'Sleep Preparation',
          description: 'Deep dim sunset amber and slow waves to prepare circadian rhythm for sleep.',
          lights: { power: true, brightness: 12, color_temp_k: 2200, color_hex: '#e2725b', label: 'Deep Sunset Amber' },
          audio: { power: true, track: 'ocean', track_label: 'Night Waves Pacing', volume: 25 },
          fan: { power: true, speed: 'low', mode: 'whisper' },
          thermostat: { current_temp_f: 72, target_temp_f: 68, mode: 'night_cool', unit: '°F' },
          recommended_practice: 'tamas_emotional',
          recommended_title: 'Holding Space for Yourself'
        }
      };

      const base = SCENE_CONFIGS[scene_id];
      const targetLights = { ...base.lights };
      if (overrides.brightness !== undefined) targetLights.brightness = overrides.brightness;
      if (overrides.color_temp_k !== undefined) targetLights.color_temp_k = overrides.color_temp_k;

      const targetAudio = { ...base.audio };
      if (overrides.sound_track) {
        targetAudio.track = overrides.sound_track;
        targetAudio.power = overrides.sound_track !== 'silence';
      }
      if (overrides.sound_volume !== undefined) targetAudio.volume = overrides.sound_volume;

      const targetFan = { ...base.fan };
      if (overrides.fan_speed) {
        targetFan.speed = overrides.fan_speed;
        targetFan.power = overrides.fan_speed !== 'off';
      }

      const targetThermostat = { ...base.thermostat };
      if (overrides.target_temp_f !== undefined) targetThermostat.target_temp_f = overrides.target_temp_f;

      const updatedStates = {
        lights: targetLights,
        audio: targetAudio,
        fan: targetFan,
        thermostat: targetThermostat
      };

      const now = new Date();
      const actionTimeline = [
        {
          timestamp: new Date(now.getTime() - 250).toLocaleTimeString(),
          source: 'user_action',
          title: `User selected scene: "${base.title}"`,
          detail: 'Scene activation requested in Sanctuary Home interface.'
        },
        {
          timestamp: new Date(now.getTime() - 200).toLocaleTimeString(),
          source: 'mcp_tool_call',
          title: 'MCP tool: simulate_wellness_scene validated parameters',
          detail: `Validated via Zod schema for scene: ${scene_id}.`
        },
        {
          timestamp: new Date(now.getTime() - 150).toLocaleTimeString(),
          source: 'simulated_hardware',
          title: `Smart Lights: ${targetLights.brightness}% at ${targetLights.color_temp_k}K`,
          detail: `[SIMULATION] Virtual lighting smoothly transitioned to ${targetLights.label}.`
        },
        {
          timestamp: new Date(now.getTime() - 100).toLocaleTimeString(),
          source: 'simulated_hardware',
          title: `Ambient Audio: ${targetAudio.power ? targetAudio.track_label : 'Muted'} (${targetAudio.volume}%)`,
          detail: '[SIMULATION] Acoustic simulation configured to user preference.'
        },
        {
          timestamp: new Date(now.getTime() - 50).toLocaleTimeString(),
          source: 'simulated_hardware',
          title: `Climate: Fan ${targetFan.speed}, Thermostat set to ${targetThermostat.target_temp_f}°F`,
          detail: '[SIMULATION] Virtual ventilation and temperature setpoint adjusted.'
        },
        {
          timestamp: now.toLocaleTimeString(),
          source: 'wellness_ready',
          title: `Scene Active — Recommended practice: "${base.recommended_title}"`,
          detail: 'Guided wellness practice is ready to begin.'
        }
      ];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'SCENE_SIMULATED',
              scene_id,
              scene_title: base.title,
              simulation_label: '[SIMULATION - NO PHYSICAL HARDWARE CONNECTED]',
              simulation_notice: 'SIMULATION MODE — No physical smart-home devices are connected. All device states and environmental changes are simulated locally.',
              target_states: updatedStates,
              previous_states: current_states || null,
              recommended_practice: {
                id: base.recommended_practice,
                title: base.recommended_title
              },
              action_timeline: actionTimeline,
              timestamp: now.toISOString()
            }, null, 2)
          }
        ]
      };
    }
  );

  // Tool 8: restore_previous_scene
  server.tool(
    'restore_previous_scene',
    'Revert simulated smart-home wellness environment to previous state. Software simulation only.',
    {
      previous_states: deviceStateSchema.describe('Previous device states to restore')
    },
    async ({ previous_states }) => {
      const now = new Date();
      const actionTimeline = [
        {
          timestamp: new Date(now.getTime() - 100).toLocaleTimeString(),
          source: 'user_action',
          title: 'User requested scene cancellation / restoration',
          detail: 'Initiated rollback to pre-scene smart-home baseline.'
        },
        {
          timestamp: new Date(now.getTime() - 50).toLocaleTimeString(),
          source: 'mcp_tool_call',
          title: 'MCP tool: restore_previous_scene executed',
          detail: 'Restoration payload validated; applying previous state matrix.'
        },
        {
          timestamp: now.toLocaleTimeString(),
          source: 'simulated_hardware',
          title: 'Simulated environment reverted successfully',
          detail: '[SIMULATION] Smart lights, acoustics, fan, and thermostat restored to previous values.'
        }
      ];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'RESTORED',
              simulation_label: '[SIMULATION - NO PHYSICAL HARDWARE CONNECTED]',
              simulation_notice: 'SIMULATION MODE — No physical smart-home devices are connected. All device states and environmental changes are simulated locally.',
              restored_states: previous_states,
              action_timeline: actionTimeline,
              timestamp: now.toISOString()
            }, null, 2)
          }
        ]
      };
    }
  );

  return server;
}

// ─── HTTP SERVER CREATION & STREAMABLE HTTP TRANSPORT ───────────────
export async function startMcpHttpServer(optsOrPort = {}, maybeHost) {
  let port = PORT;
  let host = HOST;
  if (typeof optsOrPort === 'number') {
    port = optsOrPort;
    if (maybeHost) host = maybeHost;
  } else if (typeof optsOrPort === 'object' && optsOrPort !== null) {
    if (optsOrPort.port) port = optsOrPort.port;
    if (optsOrPort.host) host = optsOrPort.host;
  }
  const sessions = new Map();
  const defaultMcpServer = createSanctuaryMcpServer();
  const defaultTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    enableJsonResponse: true,
    onsessioninitialized: (sid) => {
      sessions.set(sid, { transport: defaultTransport, mcpServer: defaultMcpServer });
    }
  });

  await defaultMcpServer.connect(defaultTransport);

  const httpServer = http.createServer(async (req, res) => {
    const origin = req.headers.origin;

    // Validate origin
    if (origin && !isOriginAllowed(origin)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Forbidden: Origin not allowed' }));
    }

    // Set CORS headers for authorized origins
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version');
      res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id, Mcp-Protocol-Version');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || host}`);

    // Health / Status endpoint for UI connection testing
    if (parsedUrl.pathname === '/health' || parsedUrl.pathname === '/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        status: 'online',
        service: 'Sanctuary of Mind MCP Server',
        protocol_version: '2025-11-25',
        transport: 'Streamable HTTP',
        endpoint: `http://${host}:${port}/mcp`,
        active_consent_sessions: activeConsentSessions.size,
        timestamp: new Date().toISOString()
      }));
    }

    // Trusted application consent registration endpoint
    if (parsedUrl.pathname === '/mcp/consent' && req.method === 'POST') {
      const MAX_BODY_BYTES = 64 * 1024; // 64 KB limit to prevent memory exhaustion DoS
      let bodyStr = '';
      let bodyBytes = 0;
      let tooLarge = false;

      req.on('data', chunk => {
        bodyBytes += chunk.length;
        if (bodyBytes > MAX_BODY_BYTES) {
          tooLarge = true;
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Payload Too Large: request body exceeds 64KB limit' }));
          req.destroy();
          return;
        }
        bodyStr += chunk;
      });

      req.on('end', () => {
        if (tooLarge) return;
        try {
          const body = JSON.parse(bodyStr || '{}');
          if (body.action === 'grant') {
            if (!isValidConsentToken(body.token)) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Invalid token format: must be 16-128 characters matching [a-zA-Z0-9_.-]' }));
            }
            if (!body.preferences || typeof body.preferences !== 'object' || Array.isArray(body.preferences)) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Invalid or missing preferences object' }));
            }

            // Rate limit new registration requests
            if (!activeConsentSessions.has(body.token) && isRegistrationRateLimited()) {
              res.writeHead(429, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Too Many Requests: registration rate limit exceeded. Please try again later.' }));
            }

            try {
              grantConsentSession(body.token, body.preferences);
              recordRegistration();
              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ success: true, token: body.token, status: 'CONSENT_GRANTED' }));
            } catch (err) {
              if (err.code === 'CAPACITY_REACHED') {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: err.message, status: 'CAPACITY_REACHED' }));
              }
              throw err;
            }
          } else if (body.action === 'revoke') {
            if (!isValidConsentToken(body.token)) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Invalid token format: must be 16-128 characters matching [a-zA-Z0-9_.-]' }));
            }
            revokeConsentSession(body.token);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, status: 'CONSENT_REVOKED' }));
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid consent payload: action must be "grant" or "revoke"' }));
          }
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // Streamable HTTP MCP endpoint
    if (parsedUrl.pathname === '/mcp') {
      try {
        const sessionId = req.headers['mcp-session-id'];
        let activeTransport = defaultTransport;

        if (sessionId && sessions.has(sessionId)) {
          activeTransport = sessions.get(sessionId).transport;
        } else if (defaultTransport.sessionId) {
          // If default transport is already bound to an active session, spawn a session transport
          const sessionServer = createSanctuaryMcpServer();
          const sessionTransport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => crypto.randomUUID(),
            enableJsonResponse: true,
            onsessioninitialized: (sid) => {
              sessions.set(sid, { transport: sessionTransport, mcpServer: sessionServer });
            }
          });
          sessionTransport.onclose = () => {
            if (sessionTransport.sessionId) sessions.delete(sessionTransport.sessionId);
          };
          await sessionServer.connect(sessionTransport);
          activeTransport = sessionTransport;
        }

        await activeTransport.handleRequest(req, res);
      } catch (err) {
        console.error('MCP Transport request error:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal MCP Error', details: err.message }));
        }
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found', valid_endpoints: ['/mcp', '/health', '/mcp/consent'] }));
  });

  return new Promise((resolve, reject) => {
    httpServer.listen(port, host, () => {
      console.log(`[Sanctuary MCP] Streamable HTTP server listening on http://${host}:${port}/mcp`);
      resolve({ httpServer, mcpServer: defaultMcpServer, transport: defaultTransport, port, host });
    });
    httpServer.on('error', reject);
  });
}

// Direct CLI startup (e.g. `node mcp/server.mjs`)
if (process.argv[1] && process.argv[1].endsWith('server.mjs')) {
  startMcpHttpServer().catch(err => {
    console.error('Failed to start Sanctuary MCP Server:', err);
    process.exit(1);
  });
}
