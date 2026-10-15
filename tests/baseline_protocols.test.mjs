import test from 'node:test';
import assert from 'node:assert/strict';

// Extracted from app/index.html baseline for regression verification
const QUESTIONS = [
  { id:1, text:"How is your attention behaving right now?", options:[
    { text:"It is focused, clear, and steady.",              guna:"sattva", score:1 },
    { text:"It is jumping between worries or tasks.",         guna:"rajas",  score:1 },
    { text:"It is drifting, blank, or stuck in the past.",    guna:"tamas",  score:1 },
  ]},
  { id:2, text:"Scan your body. What sensation is dominant?", options:[
    { text:"Lightness, ease, or a steady rhythm.",            guna:"sattva", score:1 },
    { text:"Tension (jaw/shoulders), heat, or vibration.",    guna:"rajas",  score:1 },
    { text:"Heaviness, numbness, or fatigue.",                guna:"tamas",  score:1 },
  ]},
  { id:3, text:"When you think about your day ahead, you feel:", options:[
    { text:"Capable and open to what comes.",                 guna:"sattva", score:1 },
    { text:"Urgency, pressure, or a need to 'fix' it.",       guna:"rajas",  score:1 },
    { text:"Overwhelmed, indifferent, or resistant.",         guna:"tamas",  score:1 },
  ]},
  { id:4, text:"How are you relating to this present moment?", options:[
    { text:"I am accepting it as it is.",                     guna:"sattva", score:1 },
    { text:"I am fighting it or trying to speed it up.",      guna:"rajas",  score:1 },
    { text:"I am trying to escape or ignore it.",             guna:"tamas",  score:1 },
  ]},
];

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

function rmssd(arr = []) {
  if (arr.length < 2) return 0;
  let s = 0;
  for (let i = 1; i < arr.length; i++) { const d = arr[i] - arr[i-1]; s += d*d; }
  return Math.sqrt(s / (arr.length - 1));
}

function computeDominantGuna(scores) {
  return Object.entries(scores).sort((a,b) => b[1]-a[1])[0][0];
}

function resolveMindKey(profile) {
  if (profile.mindStyle === 'emotional') return 'emotional';
  if (profile.beliefLevel === 'strong' || profile.spiritualStrength === 'strong') return 'spiritual';
  return 'logical';
}

function isDistressState(scores) {
  return scores.tamas >= 3 || (scores.tamas >= 2 && scores.rajas >= 2);
}

// ────────────────── TEST SUITE ──────────────────

test('Triguna Assessment Questions - integrity check', () => {
  assert.equal(QUESTIONS.length, 4, 'Assessment must have exactly 4 questions');
  for (const q of QUESTIONS) {
    assert.equal(q.options.length, 3, 'Each question must offer 3 choices (Sattva, Rajas, Tamas)');
    const gunas = q.options.map(o => o.guna).sort();
    assert.deepEqual(gunas, ['rajas', 'sattva', 'tamas'], 'Options must cover all three gunas');
  }
});

test('9 Recommendation Protocols - complete matrix check', () => {
  const gunas = ['rajas', 'tamas', 'sattva'];
  const styles = ['logical', 'emotional', 'spiritual'];

  let count = 0;
  for (const g of gunas) {
    assert.ok(LIBRARY[g], `Library must contain guna ${g}`);
    for (const s of styles) {
      const protocol = LIBRARY[g][s];
      assert.ok(protocol, `Library must define protocol for ${g} x ${s}`);
      assert.ok(protocol.title.length > 0, 'Protocol must have a title');
      assert.ok(protocol.desc.length > 0, 'Protocol must have a description');
      assert.ok(protocol.step1.length > 0, 'Protocol must have step 1');
      assert.ok(protocol.step2.length > 0, 'Protocol must have step 2');
      assert.ok(protocol.action.length > 0, 'Protocol must have an action CTA');
      count++;
    }
  }
  assert.equal(count, 9, 'Exactly 9 distinct recommendation protocols must exist');
});

test('Dominant Guna calculation - deterministic sorting', () => {
  assert.equal(computeDominantGuna({ sattva: 3, rajas: 1, tamas: 0 }), 'sattva');
  assert.equal(computeDominantGuna({ sattva: 0, rajas: 3, tamas: 1 }), 'rajas');
  assert.equal(computeDominantGuna({ sattva: 1, rajas: 0, tamas: 3 }), 'tamas');
});

test('Mind Key resolution - profile routing', () => {
  assert.equal(resolveMindKey({ mindStyle: 'emotional' }), 'emotional');
  assert.equal(resolveMindKey({ mindStyle: 'logical', beliefLevel: 'strong' }), 'spiritual');
  assert.equal(resolveMindKey({ mindStyle: 'logical', spiritualStrength: 'strong' }), 'spiritual');
  assert.equal(resolveMindKey({ mindStyle: 'logical', beliefLevel: 'neutral' }), 'logical');
  assert.equal(resolveMindKey({}), 'logical');
});

test('RMSSD calculation - standard HRV algorithm', () => {
  assert.equal(rmssd([]), 0);
  assert.equal(rmssd([800]), 0);
  // RR intervals: 800, 850, 820. diffs: 50, -30. squares: 2500, 900. sum: 3400. / 2 = 1700. sqrt: ~41.23
  const val = rmssd([800, 850, 820]);
  assert.ok(Math.abs(val - 41.231) < 0.01, `Expected ~41.23, got ${val}`);
});

test('Distress trigger logic - critical safety boundary', () => {
  assert.equal(isDistressState({ sattva: 1, rajas: 0, tamas: 3 }), true, 'Tamas >= 3 triggers distress');
  assert.equal(isDistressState({ sattva: 0, rajas: 2, tamas: 2 }), true, 'Tamas >= 2 and Rajas >= 2 triggers distress');
  assert.equal(isDistressState({ sattva: 2, rajas: 1, tamas: 1 }), false, 'Moderate balanced state does not trigger distress');
  assert.equal(isDistressState({ sattva: 4, rajas: 0, tamas: 0 }), false, 'Pure Sattva does not trigger distress');
});
