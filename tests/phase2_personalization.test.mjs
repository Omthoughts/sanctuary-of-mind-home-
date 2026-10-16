import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// 1. Mock LocalStorage Environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockLocalStorage();

const STORAGE_KEYS = {
  SESSIONS: 'sanctuary_sessions',
  FEEDBACK: 'sanctuary_feedback',
  PREFERENCES: 'sanctuary_preferences',
};

const DEFAULT_PREFERENCES = {
  language: 'en',
  narrationStyle: 'calm',
  speechRate: 1.0,
  sessionDuration: 3,
  mindStyle: 'balanced',
  ambientSound: 'rain',
  reducedMotion: false,
  highContrast: false,
  excludedTechniques: [],
};

const localStore = {
  get(key, fallback = []) {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      return false;
    }
  },
  append(key, item) {
    const list = this.get(key, []);
    list.push(item);
    this.set(key, list);
    return item;
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      return true;
    } catch (e) {
      return false;
    }
  }
};

const LIBRARY = {
  rajas: {
    logical:   { title:"Sympathetic Down-Regulation", desc:"Your amygdala is over-firing. Use a 4-7-8 breath ratio to mechanically trigger the parasympathetic (Vagus Nerve).", step1:"Inhale for 4 seconds to oxygenate.", step2:"Exhale for 8 seconds to signal safety.", action:"Initiate Regulation" },
    emotional: { title:"Holding Space for Yourself",  desc:"Your heart is racing because it cares. Let's wrap that anxiety in a blanket of breath. You are safe to let go.", step1:"Breathe in acceptance.",               step2:"Breathe out the weight.",             action:"Begin Breathing" },
    spiritual: { title:"Surrendering to Divine Will", desc:"This restlessness is a call to trust. Release the burden of being the Doer. Breathe in Grace, breathe out control.", step1:"Inhale the present moment.",          step2:"Exhale into the unknown.",            action:"Offer Prayer" },
  },
  tamas: {
    logical:   { title:"Motor Cortex Activation",  desc:"The Default Mode Network is trapping you in rumination. Immediate motor engagement switches neural networks.", step1:"Stand up immediately.",      step2:"Shake hands vigorously.", action:"Activate Protocol" },
    emotional: { title:"Igniting the Spark",        desc:"You feel heavy, and that is okay. We are going to gently move together to remind your body it is capable of change.", step1:"Rise like the sun.", step2:"Shake off the dust.", action:"Move Gently" },
    spiritual: { title:"Awakening the Spirit",      desc:"The veil of inertia is heavy, but your spirit is light. Use movement to break the shell and let your inner light shine.", step1:"Stand and offer presence.", step2:"Release the stagnation.", action:"Awaken Now" },
  },
  sattva: {
    logical:   { title:"Maintenance of Clarity",  desc:"Your executive functions are optimal. Use this state for high-cognitive load tasks without attachment to the result.", step1:"Observe the clarity.",  step2:"Direct it to purpose.",  action:"Deep Focus" },
    emotional: { title:"Savoring the Calm",        desc:"You are in a beautiful state of flow. Pause to feel gratitude for this peace, knowing it is a gift to be shared.", step1:"Smile internally.",      step2:"Send love outward.",      action:"Express Gratitude" },
    spiritual: { title:"Service to the Divine",   desc:"Clarity is a blessing. Offer this clear mind as an instrument for the greater good. Remain humble in this light.", step1:"Witness the peace.",     step2:"Dedicate it to all.",     action:"Offer Service" },
  },
};

const ADAPTED_PROTOCOLS = {
  rajas: {
    logical: {
      breath_retention: {
        title: "Gentle Paced Respiration",
        desc: "Adapted protocol avoiding breath retention: smooth 4-second inhalation and 6-second unhurried exhalation to calm the autonomic nervous system without holding breath.",
        step1: "Inhale smoothly through your nose for 4 seconds without straining.",
        step2: "Exhale softly and steadily for 6 seconds without pausing.",
        action: "Begin Paced Respiration",
        adaptationReason: "Adapted because breath retention is in your avoided techniques."
      }
    },
    spiritual: {
      mantra: {
        title: "Silent Trust & Contemplation",
        desc: "Adapted protocol avoiding vocal chanting: silent inner witnessing and unhurried breath to cultivate surrender without audible recitation.",
        step1: "Silently observe the natural rhythm of breath.",
        step2: "Inwardly release control on each slow exhale.",
        action: "Begin Silent Contemplation",
        adaptationReason: "Adapted because mantra/vocal prayer is in your avoided techniques."
      }
    }
  },
  tamas: {
    logical: {
      vigorous_movement: {
        title: "Seated Isometric Grounding",
        desc: "Adapted protocol avoiding vigorous movement: gentle seated foot pressure and wrist extensions to awaken the motor cortex and sensory pathways smoothly.",
        step1: "Press both soles firmly into the ground for 5 seconds.",
        step2: "Gently stretch your palms open and rotate wrists slowly.",
        action: "Begin Gentle Grounding",
        adaptationReason: "Adapted because vigorous movement is in your avoided techniques."
      }
    },
    emotional: {
      vigorous_movement: {
        title: "Warm Self-Embrace & Soft Breath",
        desc: "Adapted protocol avoiding vigorous movement: cross arms to hold your shoulders gently with slow rhythmic rocking.",
        step1: "Place hands over opposite shoulders in a gentle hug.",
        step2: "Rock softly with each calm breath.",
        action: "Embrace Gently",
        adaptationReason: "Adapted because vigorous movement is in your avoided techniques."
      }
    },
    spiritual: {
      vigorous_movement: {
        title: "Mindful Heart Awakening",
        desc: "Adapted protocol avoiding vigorous movement: gentle hand placement on heart with steady vertical posture to renew vitality without jarring motions.",
        step1: "Place one hand gently over your chest.",
        step2: "Feel the warm expansion of each breath.",
        action: "Awaken Gently",
        adaptationReason: "Adapted because vigorous movement is in your avoided techniques."
      }
    }
  }
};

function resolveProtocol(dominant, mindKey, excludedTechniques = []) {
  const base = LIBRARY[dominant][mindKey];
  if (ADAPTED_PROTOCOLS[dominant]?.[mindKey]) {
    for (const tech of excludedTechniques) {
      if (ADAPTED_PROTOCOLS[dominant][mindKey][tech]) {
        return {
          ...base,
          ...ADAPTED_PROTOCOLS[dominant][mindKey][tech],
          isAdapted: true
        };
      }
    }
  }
  return { ...base, isAdapted: false };
}

// ────────────────── TESTS ──────────────────

test('Preferences Schema & Local Persistence - CRUD operations', () => {
  localStorage.clear();

  // Test Default Retrieval
  const initial = localStore.get(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  assert.equal(initial.sessionDuration, 3);
  assert.equal(initial.narrationStyle, 'calm');
  assert.deepEqual(initial.excludedTechniques, []);

  // Test Update Preferences
  const updated = {
    ...DEFAULT_PREFERENCES,
    sessionDuration: 5,
    narrationStyle: 'grounded',
    speechRate: 0.8,
    reducedMotion: true,
    highContrast: true,
    excludedTechniques: ['vigorous_movement', 'breath_retention']
  };
  const success = localStore.set(STORAGE_KEYS.PREFERENCES, updated);
  assert.equal(success, true);

  const retrieved = localStore.get(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  assert.equal(retrieved.sessionDuration, 5);
  assert.equal(retrieved.narrationStyle, 'grounded');
  assert.equal(retrieved.speechRate, 0.8);
  assert.equal(retrieved.reducedMotion, true);
  assert.equal(retrieved.highContrast, true);
  assert.deepEqual(retrieved.excludedTechniques, ['vigorous_movement', 'breath_retention']);

  // Test Privacy Reset / Clear All
  localStore.clearAll();
  const cleared = localStore.get(STORAGE_KEYS.PREFERENCES, null);
  assert.equal(cleared, null, 'Preferences must be wiped on privacy reset');
});

test('Protocol Personalization & Safe Adaptation - Tamas Logical excludes vigorous movement', () => {
  // Default without exclusion
  const standard = resolveProtocol('tamas', 'logical', []);
  assert.equal(standard.title, 'Motor Cortex Activation');
  assert.equal(standard.isAdapted, false);

  // When user dislikes vigorous movement
  const adapted = resolveProtocol('tamas', 'logical', ['vigorous_movement']);
  assert.equal(adapted.title, 'Seated Isometric Grounding');
  assert.equal(adapted.isAdapted, true);
  assert.ok(adapted.desc.includes('avoiding vigorous movement'));
  assert.ok(adapted.adaptationReason.includes('vigorous movement is in your avoided techniques'));
});

test('Protocol Personalization & Safe Adaptation - Rajas Logical excludes breath retention', () => {
  // Default without exclusion
  const standard = resolveProtocol('rajas', 'logical', []);
  assert.equal(standard.title, 'Sympathetic Down-Regulation');
  assert.equal(standard.isAdapted, false);

  // When user dislikes breath retention
  const adapted = resolveProtocol('rajas', 'logical', ['breath_retention']);
  assert.equal(adapted.title, 'Gentle Paced Respiration');
  assert.equal(adapted.isAdapted, true);
  assert.ok(adapted.desc.includes('avoiding breath retention'));
  assert.ok(adapted.adaptationReason.includes('breath retention is in your avoided techniques'));
});

test('Protocol Personalization & Safe Adaptation - Rajas Spiritual excludes mantra', () => {
  // Default without exclusion
  const standard = resolveProtocol('rajas', 'spiritual', []);
  assert.equal(standard.title, 'Surrendering to Divine Will');
  assert.equal(standard.isAdapted, false);

  // When user dislikes mantra / vocal chanting
  const adapted = resolveProtocol('rajas', 'spiritual', ['mantra']);
  assert.equal(adapted.title, 'Silent Trust & Contemplation');
  assert.equal(adapted.isAdapted, true);
  assert.ok(adapted.desc.includes('avoiding vocal chanting'));
  assert.ok(adapted.adaptationReason.includes('mantra/vocal prayer is in your avoided techniques'));
});

test('Session History Schema & Item Deletion', () => {
  localStorage.clear();

  const session1 = {
    id: 'sess_1',
    timestamp: '2026-10-16T10:00:00.000Z',
    dominant_guna: 'sattva',
    sattva_score: 3, rajas_score: 1, tamas_score: 0,
    hrv: 65, mindstyle: 'logical'
  };
  const session2 = {
    id: 'sess_2',
    timestamp: '2026-10-16T10:30:00.000Z',
    dominant_guna: 'rajas',
    sattva_score: 1, rajas_score: 3, tamas_score: 0,
    hrv: 42, mindstyle: 'emotional'
  };

  localStore.append(STORAGE_KEYS.SESSIONS, session1);
  localStore.append(STORAGE_KEYS.SESSIONS, session2);

  let stored = localStore.get(STORAGE_KEYS.SESSIONS, []);
  assert.equal(stored.length, 2);

  // Delete individual session
  const remaining = stored.filter(s => s.id !== 'sess_1');
  localStore.set(STORAGE_KEYS.SESSIONS, remaining);

  const afterDelete = localStore.get(STORAGE_KEYS.SESSIONS, []);
  assert.equal(afterDelete.length, 1);
  assert.equal(afterDelete[0].id, 'sess_2');
});

test('Application Integrity - index.html and app/index.html synchronization', () => {
  const rootIndex = fs.readFileSync(path.resolve('index.html'), 'utf8');
  const appIndex = fs.readFileSync(path.resolve('app/index.html'), 'utf8');

  const rootHash = crypto.createHash('sha256').update(rootIndex).digest('hex');
  const appHash = crypto.createHash('sha256').update(appIndex).digest('hex');

  assert.equal(rootHash, appHash, 'Root index.html and app/index.html must have identical SHA256 hashes');
});

test('Design System & Responsive Shell - Landmarks, accessibility & disclaimer check', () => {
  const html = fs.readFileSync(path.resolve('index.html'), 'utf8');

  // Verify navigation landmarks
  assert.ok(html.includes('role="banner"'), 'Shell header must include banner landmark');
  assert.ok(html.includes('aria-label="Main Navigation"'), 'Desktop nav must have accessible label');
  assert.ok(html.includes('aria-label="Mobile Navigation"'), 'Mobile nav must have accessible label');

  // Verify focus and contrast accessibility rules
  assert.ok(html.includes(':focus-visible'), 'Design system must include :focus-visible rules');
  assert.ok(html.includes('prefers-reduced-motion'), 'Design system must include prefers-reduced-motion media query');
  assert.ok(html.includes('high-contrast'), 'Design system must include high-contrast class definition');

  // Verify non-diagnostic disclaimer
  assert.ok(
    html.includes('Non-Diagnostic Notice') &&
    html.includes('reflective wellness principles, not psychiatric or medical diagnoses'),
    'Non-diagnostic notice must be displayed prominently in Results view'
  );

  // Verify Voice simulation labeling
  assert.ok(
    html.includes('Simulation Mode: Browser-guided pacing & speech synthesis') ||
    html.includes('Simulation Mode: Browser-guided pacing &amp; speech synthesis'),
    'Simulation mode label for speech synthesis must exist'
  );
});
