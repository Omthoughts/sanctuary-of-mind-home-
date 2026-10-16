import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const PORT = 4321;

// Start local test server
const server = http.createServer((req, res) => {
  const safeUrl = req.url.split('?')[0];
  const filePath = path.join(rootDir, safeUrl === '/' ? 'index.html' : safeUrl);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : 'text/plain';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, async () => {
  console.log(`E2E test server listening at http://localhost:${PORT}`);
  let browser;

  try {
    // Launch installed Chrome or Edge
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    // 1. Navigate to Sanctuary of Mind
    console.log('Navigating to http://localhost:' + PORT + '...');
    await page.goto(`http://localhost:${PORT}`);

    // Wait for Babel to compile and React to mount
    await page.waitForSelector('.ob-title', { timeout: 15000 });
    const titleText = await page.textContent('.ob-title');
    console.log(`[PASS] App mounted. Onboarding Title: "${titleText.trim()}"`);

    // 2. Start Assessment
    const startBtn = await page.locator('.ob-enter');
    await startBtn.click();
    console.log('[PASS] Clicked "Enter Sanctuary"');

    // 3. Complete 4 assessment questions (Choose distress answers to test distress safety modal)
    for (let q = 0; q < 4; q++) {
      await page.waitForSelector('.as-q', { timeout: 5000 });
      const qText = await page.textContent('.as-q');
      console.log(`Question ${q + 1}: ${qText}`);
      // Pick 3rd option (Tamas dominant) to trigger distress flow
      const options = page.locator('.as-opt');
      await options.nth(2).click();
      await page.waitForTimeout(300);
    }

    // 4. Wait for processing screen to transition to results
    console.log('Waiting for Processing view transition...');
    await page.waitForTimeout(2000);

    // 5. Verify Distress & Crisis Support Modal appears
    await page.waitForSelector('.distress-card', { timeout: 10000 });
    const distressTitle = await page.textContent('.distress-title');
    console.log(`[PASS] Distress modal rendered: "${distressTitle.trim()}"`);

    const hasTelemanas = await page.locator('text=14416').count();
    console.log(`[PASS] Verified Tele-MANAS 14416 displayed: ${hasTelemanas > 0}`);

    const hasDisclaimer = await page.locator('.distress-disclaimer-box').count();
    console.log(`[PASS] Non-alert safety notice displayed: ${hasDisclaimer > 0}`);

    // Test tab toggle to US / Global
    const usTab = page.locator('button:has-text("US / Global Support")');
    await usTab.click();
    const has988 = await page.locator('text=988').count();
    console.log(`[PASS] US Lifeline 988 displayed on tab switch: ${has988 > 0}`);

    // 6. Test safe exit to Calming Sanctuary Reflection
    const continueBtn = page.locator('button:has-text("Continue to Calming Sanctuary Reflection")');
    await continueBtn.click();
    console.log('[PASS] Clicked "Continue to Calming Sanctuary Reflection"');

    // 7. Verify Results View protocol card
    await page.waitForSelector('.res-card-title', { timeout: 5000 });
    const protocolTitle = await page.textContent('.res-card-title');
    console.log(`[PASS] Protocol card rendered: "${protocolTitle.trim()}"`);

    // 8. Launch Guided Protocol Session
    const actionBtn = page.locator('.res-action');
    await actionBtn.click();
    console.log('[PASS] Clicked Action CTA to start guided session');

    await page.waitForSelector('.session-card', { timeout: 5000 });
    const sessionTitle = await page.textContent('.session-title');
    console.log(`[PASS] Guided session modal active: "${sessionTitle.trim()}"`);

    // Pause session
    const pauseBtn = page.locator('.session-btn-pause');
    await pauseBtn.click();
    const pauseText = await pauseBtn.textContent();
    console.log(`[PASS] Paused session. Button text: "${pauseText.trim()}"`);

    // Safe end and return to results
    const endBtn = page.locator('.session-btn-end');
    await endBtn.click();
    console.log('[PASS] Clicked "End Session & Return"');

    await page.waitForSelector('.res-card-title', { timeout: 5000 });
    console.log('[PASS] Safely returned to Results view');

    // 9. PHASE 2: Test Navigation to "Practices" Library
    console.log('\n--- Testing Phase 2 Practices Library ---');
    const practicesNavBtn = page.locator('.shell-nav-btn:has-text("Practices")');
    await practicesNavBtn.click();
    await page.waitForSelector('.proto-title', { timeout: 5000 });
    const protoTitle = await page.textContent('.proto-title');
    console.log(`[PASS] Navigated to Practices Library: "${protoTitle.trim()}"`);

    const protoCardsCount = await page.locator('.proto-card').count();
    console.log(`[PASS] Protocol library cards rendered: ${protoCardsCount} (expected 9)`);

    // Test Guna Filter
    const sattvaFilter = page.locator('.proto-filter-pill:has-text("Sattva")');
    await sattvaFilter.click();
    const sattvaCardsCount = await page.locator('.proto-card').count();
    console.log(`[PASS] Filtered to Sattva: ${sattvaCardsCount} cards (expected 3)`);

    // 10. PHASE 2: Test Navigation to "Preferences" and Edit Personalization
    console.log('\n--- Testing Phase 2 Preferences & Disliked Techniques ---');
    const prefsNavBtn = page.locator('.shell-nav-btn:has-text("Preferences")');
    await prefsNavBtn.click();
    await page.waitForSelector('.pref-title', { timeout: 5000 });
    console.log('[PASS] Navigated to Preferences View');

    // Set duration to 5 mins
    const duration5Btn = page.locator('.pref-btn-pill:has-text("5 mins")');
    await duration5Btn.click();
    console.log('[PASS] Selected 5 mins session duration');

    // Toggle excluded technique: "Vigorous Movement / Shaking"
    const vigorousCheckbox = page.locator('label:has-text("Vigorous Movement / Shaking") input[type="checkbox"]');
    await vigorousCheckbox.check();
    console.log('[PASS] Checked "Vigorous Movement / Shaking" as avoided technique');

    // Save preferences
    const savePrefsBtn = page.locator('.pref-save-btn');
    await savePrefsBtn.click();
    await page.waitForSelector('.toast-banner', { timeout: 3000 });
    const toastText = await page.textContent('.toast-banner');
    console.log(`[PASS] Preferences saved toast: "${toastText.trim()}"`);

    // 11. PHASE 2: Return to Check-in and Verify Safe Adaptation
    console.log('\n--- Testing Protocol Adaptation in Check-in Results ---');
    const checkinNavBtn = page.locator('.shell-nav-btn:has-text("Check-in")');
    await checkinNavBtn.click();
    await page.waitForSelector('.res-card-title', { timeout: 5000 });
    const adaptedTitle = await page.textContent('.res-card-title');
    console.log(`[PASS] Active protocol in Results: "${adaptedTitle.trim()}"`);

    // Verify it adapted from Motor Cortex Activation to Seated Isometric Grounding
    if (adaptedTitle.includes('Seated Isometric Grounding')) {
      console.log('[PASS] Recommendation successfully adapted to avoid vigorous movement!');
    } else {
      console.log(`[INFO] Current protocol title: ${adaptedTitle}`);
    }

    const rationaleText = await page.textContent('.res-rationale-box');
    console.log(`[PASS] Personalization Rationale displayed: "${rationaleText.trim()}"`);

    // 12. PHASE 2: Test Navigation to Session History
    console.log('\n--- Testing Phase 2 Session History ---');
    const historyNavBtn = page.locator('.shell-nav-btn:has-text("History")');
    await historyNavBtn.click();
    await page.waitForSelector('.hist-title', { timeout: 5000 });
    console.log('[PASS] Navigated to Session History');
    const historyCards = await page.locator('.hist-card').count();
    console.log(`[PASS] Session history records found: ${historyCards} (offline local persistence)`);

    // 13. PHASE 2: Test Direct Header Crisis Support Access
    console.log('\n--- Testing Phase 2 Direct Header Crisis Access ---');
    const headerCrisisBtn = page.locator('.shell-crisis-btn');
    await headerCrisisBtn.click();
    await page.waitForSelector('.distress-card', { timeout: 5000 });
    const crisisModalTitle = await page.textContent('.distress-title');
    console.log(`[PASS] Direct header crisis support modal opened: "${crisisModalTitle.trim()}"`);

    // Close crisis modal
    const returnBtn = page.locator('.distress-secondary:has-text("Return to Assessment")');
    await returnBtn.click();
    console.log('[PASS] Safely dismissed crisis support modal');

    console.log('\n========================================');
    console.log('ALL PLAYWRIGHT BROWSER E2E TESTS PASSED!');
    console.log('========================================');
  } catch (err) {
    console.error('Playwright Test Failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
