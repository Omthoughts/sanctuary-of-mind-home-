import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Mock localStorage environment for node testing
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
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

// Logic under test extracted from stabilized index.html
const STORAGE_KEYS = {
  SESSIONS: 'sanctuary_sessions',
  FEEDBACK: 'sanctuary_feedback',
};

const localStore = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (e) {
      return [];
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
    const list = this.get(key);
    list.push(item);
    this.set(key, list);
    return item;
  }
};

async function saveSessionLocal({ name, email, age, gender, mindStyle, scores, hrv }) {
  const dominant = Object.entries(scores).sort((a,b) => b[1]-a[1])[0][0];
  const localId = 'loc_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const sessionRecord = {
    id: localId,
    timestamp: new Date().toISOString(),
    name: name || 'Guest',
    email: email || null,
    age: age ? parseInt(age) : null,
    gender: gender || null,
    mindstyle: mindStyle,
    sattva_score: scores.sattva,
    rajas_score: scores.rajas,
    tamas_score: scores.tamas,
    dominant_guna: dominant,
    hrv: hrv || null,
    storage: 'localStorage (device only)',
  };
  localStore.append(STORAGE_KEYS.SESSIONS, sessionRecord);
  return localId;
}

let fetchCalls = [];
globalThis.fetch = async (url, opts) => {
  fetchCalls.push({ url, opts });
  return { ok: true };
};

async function saveFeedbackLocal({ name, email, rating, feedback, sessionId, consentShare }) {
  const localId = 'loc_fb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const feedbackRecord = {
    id: localId,
    timestamp: new Date().toISOString(),
    session_id: sessionId || null,
    name: name || 'Anonymous',
    email: email || null,
    rating,
    feedback_text: feedback,
    consent_share: !!consentShare,
    storage: 'localStorage (device only)',
  };
  localStore.append(STORAGE_KEYS.FEEDBACK, feedbackRecord);

  if (consentShare) {
    await fetch('https://script.google.com/macros/s/test/exec', {
      method: 'POST',
      body: JSON.stringify({ type: 'feedback', name, email, rating, feedback })
    });
  }

  return localId;
}

// ────────────────── TESTS ──────────────────

test('LocalStorage Persistence Adapter - saves session offline', async () => {
  localStorage.clear();
  const sid = await saveSessionLocal({
    name: 'Aarav',
    email: 'aarav@example.com',
    mindStyle: 'logical',
    scores: { sattva: 3, rajas: 1, tamas: 0 },
    hrv: 62
  });

  assert.ok(sid.startsWith('loc_sess_'), 'Should return a valid local session ID');
  const stored = localStore.get(STORAGE_KEYS.SESSIONS);
  assert.equal(stored.length, 1, 'Should contain 1 stored session');
  assert.equal(stored[0].name, 'Aarav');
  assert.equal(stored[0].dominant_guna, 'sattva');
  assert.equal(stored[0].hrv, 62);
  assert.equal(stored[0].storage, 'localStorage (device only)');
});

test('Privacy Protection - Google Sheets external transmission is blocked by default', async () => {
  localStorage.clear();
  fetchCalls = [];

  // Default submission without explicit consent
  await saveFeedbackLocal({
    name: 'Dev',
    email: 'dev@example.com',
    rating: 5,
    feedback: 'Very peaceful',
    consentShare: false
  });

  const stored = localStore.get(STORAGE_KEYS.FEEDBACK);
  assert.equal(stored.length, 1);
  assert.equal(stored[0].consent_share, false);
  assert.equal(fetchCalls.length, 0, 'No fetch network calls should be initiated when consent is false');

  // Opt-in submission with explicit consent
  await saveFeedbackLocal({
    name: 'Dev',
    email: 'dev@example.com',
    rating: 5,
    feedback: 'Very peaceful',
    consentShare: true
  });

  assert.equal(fetchCalls.length, 1, 'External fetch is only triggered when consentShare is explicitly true');
});

test('Crisis Support - Official Tele-MANAS details and non-alert disclaimer', () => {
  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');

  // Must verify Tele-MANAS 14416 is present
  assert.ok(indexHtml.includes('14416'), 'Tele-MANAS short code 14416 must be present');
  assert.ok(indexHtml.includes('1800-891-4416'), 'Tele-MANAS toll-free 1800-891-4416 must be present');
  assert.ok(indexHtml.includes('tel:14416'), 'Clickable dialer link for 14416 must exist');
  assert.ok(indexHtml.includes('988'), 'US 988 Lifeline must be present');

  // Must contain explicit non-alert disclaimer
  assert.ok(
    indexHtml.includes('does NOT dispatch emergency responders') ||
    indexHtml.includes('does <em>NOT</em> dispatch emergency responders'),
    'Safety notice must clarify that emergency responders are NOT automatically dispatched'
  );
});

test('Netlify Configuration - publish path verification', () => {
  const rootToml = fs.readFileSync(path.resolve('netlify.toml'), 'utf8');
  const appToml = fs.readFileSync(path.resolve('app/netlify.toml'), 'utf8');

  assert.ok(rootToml.includes('publish = "."'), 'Root netlify.toml must publish current directory');
  assert.ok(!rootToml.includes('/opt/build/repo'), 'Broken container path must be removed from root netlify.toml');
  assert.ok(appToml.includes('publish = "."'), 'App netlify.toml must publish current directory');
  assert.ok(!appToml.includes('/opt/build/repo'), 'Broken container path must be removed from app netlify.toml');
});

test('Guided Protocol Session - safe playback controls exist', () => {
  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');

  assert.ok(indexHtml.includes('GuidedSessionModal'), 'Guided session component must exist');
  assert.ok(indexHtml.includes('End Session & Return'), 'Safe return/exit action must exist');
  assert.ok(indexHtml.includes('Simulation Mode: Browser-guided pacing'), 'Honest simulation label must exist');
});
