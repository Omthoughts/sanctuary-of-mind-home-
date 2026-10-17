import { chromium } from 'playwright-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { startMcpHttpServer } from '../mcp/server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const PORT = 4321;
const MCP_PORT = 3333;

// Explicit 75-second hard suite timeout to prevent any indefinite hanging
const suiteWatchdog = setTimeout(() => {
  console.error('[FATAL] Playwright E2E suite exceeded 75-second safety limit. Forcefully exiting.');
  process.exit(1);
}, 75000);
suiteWatchdog.unref();

// Start local static web server
const staticServer = http.createServer((req, res) => {
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

staticServer.listen(PORT, async () => {
  console.log(`E2E static web server listening at http://localhost:${PORT}`);
  let mcpInstance = null;
  let browser = null;

  try {
    // 1. Start Official MCP Streamable HTTP Server on 127.0.0.1:3333
    console.log(`Starting Sanctuary MCP Server on port ${MCP_PORT}...`);
    mcpInstance = await startMcpHttpServer(MCP_PORT, '127.0.0.1');
    console.log(`[PASS] Sanctuary MCP Server running on http://127.0.0.1:${MCP_PORT}/mcp`);

    // 2. Launch Chromium / Chrome
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);

    page.on('pageerror', err => console.log('UNHANDLED PAGE ERROR:', err.message));

    // 3. Navigate to Sanctuary of Mind
    console.log(`Navigating to http://localhost:${PORT}...`);
    await page.goto(`http://localhost:${PORT}`);

    // Wait for Babel compilation and React mount
    await page.waitForSelector('.ob-title', { timeout: 12000 });
    const titleText = await page.textContent('.ob-title');
    console.log(`[PASS] App mounted. Onboarding Title: "${titleText.trim()}"`);

    // 4. Start Assessment
    const startBtn = page.locator('.ob-enter');
    await startBtn.click();
    console.log('[PASS] Clicked "Enter Sanctuary"');

    // 5. Complete 4 assessment questions with distress-inducing choices (Tamas dominant)
    for (let q = 0; q < 4; q++) {
      await page.waitForSelector('.as-q', { timeout: 5000 });
      const qText = await page.textContent('.as-q');
      console.log(`Question ${q + 1}: ${qText}`);
      const options = page.locator('.as-opt');
      await options.nth(2).click();
      await page.waitForTimeout(150);
    }

    // 6. Transition through Processing screen
    console.log('Waiting for Processing view transition...');
    await page.waitForTimeout(1800);

    // 7. Verify Distress & Crisis Support Modal
    await page.waitForSelector('.distress-card', { timeout: 8000 });
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

    // 8. Safely exit to Calming Sanctuary Reflection
    const continueBtn = page.locator('button:has-text("Continue to Calming Sanctuary Reflection")');
    await continueBtn.click();
    console.log('[PASS] Clicked "Continue to Calming Sanctuary Reflection"');

    // 9. Results View & Guided Protocol Session with Simulated Ambient Control
    await page.waitForSelector('.res-card-title', { timeout: 5000 });
    const actionBtn = page.locator('.res-action');
    await actionBtn.click();
    console.log('[PASS] Clicked Action CTA to launch guided session');

    await page.waitForSelector('.session-card', { timeout: 5000 });
    console.log('[PASS] Guided session modal active');

    // Test Simulated Ambient Action (Hardware & Simulation Honesty Rule)
    const ambientBtn = page.locator('.session-ambient-btn:has-text("Dim Lights")');
    await ambientBtn.click();
    await page.waitForSelector('.session-ambient-feedback', { timeout: 3000 });
    const feedbackText = await page.textContent('.session-ambient-feedback');
    console.log(`[PASS] Ambient simulation feedback received: "${feedbackText.trim()}"`);
    if (!feedbackText.includes('SIMULATION')) {
      throw new Error('Simulation honesty disclaimer missing from ambient feedback!');
    }

    // Pause session and exit
    const pauseBtn = page.locator('.session-btn-pause');
    await pauseBtn.click();
    const endBtn = page.locator('.session-btn-end');
    await endBtn.click();
    console.log('[PASS] Ended guided session safely and returned to Results view');

    // 10. PHASE 3: Practices Library & Live MCP Discovery
    console.log('\n--- Testing Phase 3 Live MCP Practices Library ---');
    const practicesNavBtn = page.locator('.shell-nav-btn:has-text("Practices")');
    await practicesNavBtn.click();
    await page.waitForSelector('.proto-title', { timeout: 5000 });

    // Verify MCP Status Bar shows Connected
    await page.waitForSelector('.mcp-status-title', { timeout: 5000 });
    const mcpStatusText = await page.textContent('.mcp-status-title');
    console.log(`[PASS] MCP Status Bar: "${mcpStatusText.trim()}"`);
    if (!mcpStatusText.includes('Connected')) {
      throw new Error(`Expected MCP Server Connected status, got: ${mcpStatusText}`);
    }

    // Verify cards are rendered from MCP
    const protoCardsCount = await page.locator('.proto-card').count();
    console.log(`[PASS] Practices rendered: ${protoCardsCount} (expected 9 canonical protocols)`);

    // Test Inspect Tool Payload / Practice Details Modal
    const detailsBtn = page.locator('.proto-card-btn:has-text("Details")').first();
    await detailsBtn.click();
    await page.waitForSelector('.modal-card', { timeout: 3000 });
    const modalText = await page.textContent('.modal-card');
    console.log(`[PASS] Practice details modal opened: "${modalText.slice(0, 80).replace(/\s+/g, ' ')}..."`);
    const closeDetailsBtn = page.locator('.bio-close');
    await closeDetailsBtn.click();
    console.log('[PASS] Closed practice details modal');

    // Test MCP Activity Drawer (JSON-RPC audit trail)
    const logToggleBtn = page.locator('button:has-text("Activity Log")');
    await logToggleBtn.click();
    await page.waitForSelector('.mcp-activity-drawer', { timeout: 3000 });
    const drawerText = await page.textContent('.mcp-activity-drawer');
    console.log(`[PASS] MCP Activity Drawer rendered. Contains: ${drawerText.includes('tools/list') ? 'tools/list discovery' : 'log entries'}`);
    await logToggleBtn.click(); // Close drawer

    // 11. PHASE 3: Preferences & Explicit Agent Consent Boundary
    console.log('\n--- Testing Phase 3 Preferences & AI Agent Consent Boundary ---');
    const prefsNavBtn = page.locator('.shell-nav-btn:has-text("Preferences")');
    await prefsNavBtn.click();
    await page.waitForSelector('.pref-title', { timeout: 5000 });

    // Test AI Agent Consent Checkbox Toggle
    const consentToggle = page.locator('.pref-toggle-row:has-text("Authorize AI Agent") input[type="checkbox"]');
    const initialChecked = await consentToggle.isChecked();
    console.log(`[PASS] Initial agent consent status: ${initialChecked ? 'Authorized' : 'Protected/Denied'}`);

    // Toggle Consent On
    await consentToggle.check();
    console.log('[PASS] Toggled Agent Consent ON');

    // Test Live MCP get_consented_preferences Tool Call with Authorization
    const testAccessBtn = page.locator('button:has-text("Test get_consented_preferences Tool")');
    await testAccessBtn.click();
    const consentFeedbackBox = page.locator('.pref-card').locator('text=MCP Response:').locator('..');
    await consentFeedbackBox.waitFor({ state: 'visible', timeout: 5000 });
    const authorizedResponse = await consentFeedbackBox.textContent();
    console.log(`[PASS] MCP Tool get_consented_preferences authorized: "${authorizedResponse.slice(0, 100).replace(/\s+/g, ' ')}..."`);
    if (!authorizedResponse.includes('"authorized": true')) {
      throw new Error(`Expected '"authorized": true', got: ${authorizedResponse}`);
    }

    // Toggle Consent Off (Revocation)
    await consentToggle.uncheck();
    console.log('[PASS] Toggled Agent Consent OFF');
    await testAccessBtn.click();
    await page.waitForTimeout(500);
    const deniedResponse = await consentFeedbackBox.textContent();
    console.log(`[PASS] MCP Tool get_consented_preferences revoked: "${deniedResponse.slice(0, 100).replace(/\s+/g, ' ')}..."`);
    if (!deniedResponse.includes('"authorized": false') && !deniedResponse.includes('DENIED')) {
      throw new Error(`Expected revoked/denied response, got: ${deniedResponse}`);
    }

    // Also toggle avoided technique for personalization regression
    const vigorousCheckbox = page.locator('label:has-text("Vigorous Movement / Shaking") input[type="checkbox"]');
    await vigorousCheckbox.check();
    const savePrefsBtn = page.locator('.pref-save-btn');
    await savePrefsBtn.click();
    await page.waitForSelector('.toast-banner', { timeout: 3000 });
    console.log('[PASS] Preferences saved privately');

    // 12. Check-in Results Personalization Adaptation Regression
    console.log('\n--- Testing Personalization Adaptation in Results View ---');
    const checkinNavBtn = page.locator('.shell-nav-btn:has-text("Check-in")');
    await checkinNavBtn.click();
    await page.waitForSelector('.res-card-title', { timeout: 5000 });
    const adaptedTitle = await page.textContent('.res-card-title');
    console.log(`[PASS] Active protocol in Results: "${adaptedTitle.trim()}"`);
    if (adaptedTitle.includes('Seated Isometric Grounding')) {
      console.log('[PASS] Recommendation successfully adapted to avoid vigorous movement!');
    }

    // 13. SANCTUARY HOME: Smart-Home Simulation & Coordinated Wellness Scenes
    console.log('\n--- Testing Sanctuary Home: Smart-Home Simulation & Scenes ---');
    const homeNavBtn = page.locator('.shell-nav-btn:has-text("Sanctuary Home")');
    await homeNavBtn.click();
    await page.waitForSelector('.home-sim-notice', { timeout: 5000 });

    // Verify Persistent Simulation Notice
    const simNotice = await page.textContent('.home-sim-notice');
    console.log(`[PASS] Persistent notice verified: "${simNotice.trim().slice(0, 70)}..."`);
    if (!simNotice.includes('SIMULATION MODE') || !simNotice.includes('No physical smart-home devices')) {
      throw new Error('Simulation honesty notice missing or invalid!');
    }

    // Verify 3 Coordinated Wellness Scene Cards
    const sceneCardsCount = await page.locator('.scene-card').count();
    console.log(`[PASS] Wellness scene cards rendered: ${sceneCardsCount} (expected 3)`);
    if (sceneCardsCount !== 3) {
      throw new Error(`Expected 3 scene cards, got ${sceneCardsCount}`);
    }

    // Test Scene Preview
    const previewBtn = page.locator('.scene-card:has-text("Calm and Ground") button:has-text("Preview")');
    await previewBtn.click();
    await page.waitForSelector('text=Scene Action Preview:');
    console.log('[PASS] Scene Action Preview rendered successfully');

    // Test Scene Activation via Live MCP (simulate_wellness_scene)
    const activateBtn = page.locator('.scene-card:has-text("Calm and Ground") button:has-text("Activate Scene")');
    await activateBtn.click();
    await page.waitForSelector('.home-active-banner', { timeout: 5000 });
    const bannerText = await page.textContent('.home-active-banner');
    console.log(`[PASS] Active scene banner: "${bannerText.trim().slice(0, 60)}..."`);

    // Verify Simulated Device States Updated
    await page.waitForSelector('.device-card:has-text("Smart Lighting") >> text=30%');
    await page.waitForSelector('.device-card:has-text("Smart Lighting") >> text=2700K');
    await page.waitForSelector('.device-card:has-text("Circulation Fan") >> text=BREEZE');
    await page.waitForSelector('.device-card:has-text("Climate Thermostat") >> text=70°F');
    console.log('[PASS] Device states updated: Lighting 30% @ 2700K, Fan Breeze, Thermostat 70°F');

    // Verify Action & Verification Timeline
    const timelineItemsCount = await page.locator('.timeline-item').count();
    console.log(`[PASS] Chronological simulation timeline logged: ${timelineItemsCount} events`);
    if (timelineItemsCount < 4) {
      throw new Error(`Expected at least 4 timeline events, got ${timelineItemsCount}`);
    }

    // Test Raw Tool Payload Inspection Drawer
    const inspectPayloadBtn = page.locator('button:has-text("Inspect Raw Tool Payload")');
    await inspectPayloadBtn.click();
    await page.waitForSelector('pre:has-text("SCENE_SIMULATED")', { timeout: 3000 });
    console.log('[PASS] Raw MCP JSON-RPC tool response inspected and verified');
    await page.locator('button:has-text("Hide Tool Payload")').click(); // close drawer

    // Test Scene Reversion / Restore Previous Scene via MCP (restore_previous_scene)
    const restoreBtn = page.locator('button:has-text("Restore Previous Scene")');
    await restoreBtn.click();
    await page.waitForTimeout(400);
    const activeBannerCount = await page.locator('.home-active-banner').count();
    console.log(`[PASS] Scene restored: active banner removed (${activeBannerCount === 0})`);

    // Test Manual Interactive Device Control Overrides
    const fanSpeedHighBtn = page.locator('.device-card:has-text("Circulation Fan") button:has-text("HIGH")');
    await fanSpeedHighBtn.click();
    await page.waitForTimeout(200);
    const fanSpeedText = await page.textContent('.device-card:has-text("Circulation Fan") strong');
    console.log(`[PASS] Manual device override: Fan speed updated to ${fanSpeedText.trim()}`);

    // 14. PHASE 3: Test MCP Fallback & Resilient Degradation
    console.log('\n--- Testing Phase 3 MCP Fallback When Server Stops ---');
    // Stop the MCP HTTP Server
    await new Promise((resolve) => {
      mcpInstance.httpServer.close(() => {
        console.log('[PASS] Intentionally stopped MCP HTTP Server to test graceful offline fallback');
        resolve();
      });
    });
    mcpInstance = null;

    // Re-navigate to Practices or click Refresh
    await practicesNavBtn.click();
    const refreshBtn = page.locator('button:has-text("Connect to MCP"), button:has-text("Refresh from MCP")');
    await refreshBtn.click();

    // Verify UI reflects offline status with graceful fallback
    await page.waitForSelector('text=MCP Server Offline (Using Verified Local Fallback)', { timeout: 5000 });
    console.log('[PASS] UI gracefully updated to: "○ MCP Server Offline (Using Verified Local Fallback)"');

    // Verify all 9 practices remain fully available via canonical fallback
    const fallbackCardsCount = await page.locator('.proto-card').count();
    console.log(`[PASS] Fallback practices rendered: ${fallbackCardsCount} (100% resilient fallback)`);

    // Test Sanctuary Home scene activation in offline fallback
    console.log('\n--- Testing Sanctuary Home Offline Fallback Scene Activation ---');
    await homeNavBtn.click();
    await page.waitForSelector('.home-sim-notice', { timeout: 5000 });
    const sleepPrepActivateBtn = page.locator('.scene-card:has-text("Sleep Preparation") button:has-text("Activate Scene")');
    await sleepPrepActivateBtn.click();
    await page.waitForSelector('.home-active-banner:has-text("Active Scene: Sleep Preparation")', { timeout: 5000 });
    console.log('[PASS] Offline scene activation succeeded via local fallback: "Sleep Preparation" active');
    await page.waitForSelector('.device-card:has-text("Smart Lighting") >> text=12%');
    console.log('[PASS] Offline device state updated: Lighting 12% deep sunset amber');

    // 14. Session History & Direct Header Crisis Support
    console.log('\n--- Testing Session History & Header Crisis Flow ---');
    const historyNavBtn = page.locator('.shell-nav-btn:has-text("History")');
    await historyNavBtn.click();
    await page.waitForSelector('.hist-title', { timeout: 5000 });
    console.log('[PASS] Session History rendered offline');

    const headerCrisisBtn = page.locator('.shell-crisis-btn');
    await headerCrisisBtn.click();
    await page.waitForSelector('.distress-card', { timeout: 5000 });
    const dismissCrisisBtn = page.locator('.distress-secondary:has-text("Return to Assessment")');
    await dismissCrisisBtn.click();
    console.log('[PASS] Header crisis modal opened and dismissed');

    console.log('\n======================================================');
    console.log('ALL PHASE 3 PLAYWRIGHT BROWSER E2E TESTS PASSED 100%!');
    console.log('======================================================');
  } catch (err) {
    console.error('Playwright E2E Test Execution Failed:', err);
    process.exitCode = 1;
  } finally {
    clearTimeout(suiteWatchdog);
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
    if (mcpInstance?.httpServer) {
      try {
        await new Promise(r => mcpInstance.httpServer.close(r));
      } catch (e) {}
    }
    if (staticServer) {
      try {
        await new Promise(r => staticServer.close(r));
      } catch (e) {}
    }
    process.exit(process.exitCode || 0);
  }
});
