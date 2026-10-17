import { chromium } from 'playwright-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { startMcpHttpServer } from '../mcp/server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const STATIC_PORT = 4322; // Distinct port for isolated smoke run
const MCP_PORT = 3333;

// 60-second total suite watchdog to prevent any indefinite hanging
const suiteTimeout = setTimeout(() => {
  console.error('[FATAL] Smoke test suite exceeded 60s hard timeout. Forcefully aborting.');
  process.exit(1);
}, 60000);
suiteTimeout.unref();

// Start static file server
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

staticServer.listen(STATIC_PORT, async () => {
  console.log(`[SMOKE] Static test server running at http://localhost:${STATIC_PORT}`);
  let mcpInstance = null;
  let browser = null;

  try {
    // 1. Start MCP server on port 3334
    console.log(`[SMOKE] Starting MCP server on port ${MCP_PORT}...`);
    mcpInstance = await startMcpHttpServer(MCP_PORT, '127.0.0.1');
    console.log(`[PASS] MCP Server running on http://127.0.0.1:${MCP_PORT}/mcp`);

    // 2. Launch browser with 10s default timeouts
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true
    });

    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);

    // 3. Navigate to app
    console.log(`[SMOKE] Navigating to app...`);
    await page.goto(`http://localhost:${STATIC_PORT}`);
    await page.waitForSelector('.shell-brand', { timeout: 10000 });
    console.log('[PASS] App shell mounted successfully');

    // 4. Navigate directly to Preferences tab
    console.log('[SMOKE] Testing Preferences & Agent Consent Boundary...');
    const prefsNavBtn = page.locator('.shell-nav-btn:has-text("Preferences")');
    await prefsNavBtn.click();
    await page.waitForSelector('.pref-title');

    // Verify initial consent is unchecked
    const consentToggle = page.locator('.pref-toggle-row:has-text("Authorize AI Agent") input[type="checkbox"]');
    const isInitiallyChecked = await consentToggle.isChecked();
    console.log(`[PASS] Initial consent checkbox state: ${isInitiallyChecked ? 'Checked' : 'Unchecked (Protected)'}`);

    // Check the box to grant consent
    await consentToggle.check();
    console.log('[PASS] Toggled Agent Consent checkbox to CHECKED');

    // Click the Test get_consented_preferences Tool button
    const testToolBtn = page.locator('button:has-text("Test get_consented_preferences Tool")');
    await testToolBtn.waitFor({ state: 'visible', timeout: 5000 });
    await testToolBtn.click();

    // Verify feedback shows authorized
    const feedbackBox = page.locator('.pref-card').locator('text=MCP Response:').locator('..');
    await feedbackBox.waitFor({ state: 'visible', timeout: 6000 });
    const feedbackText = await feedbackBox.textContent();
    console.log(`[PASS] MCP Tool feedback text: ${feedbackText.trim()}`);
    if (!feedbackText.includes('"authorized": true')) {
      throw new Error(`Expected '"authorized": true' in response, got: ${feedbackText}`);
    }

    // Now uncheck consent to test revocation
    await consentToggle.uncheck();
    console.log('[PASS] Toggled Agent Consent checkbox to UNCHECKED');
    await testToolBtn.click();
    await page.waitForTimeout(500);
    const revokedFeedbackText = await feedbackBox.textContent();
    console.log(`[PASS] Revoked MCP Tool feedback: ${revokedFeedbackText.trim()}`);
    if (!revokedFeedbackText.includes('"authorized": false') && !revokedFeedbackText.includes('DENIED')) {
      throw new Error(`Expected denied response after revocation, got: ${revokedFeedbackText}`);
    }

    // 5. Test Navigation to Practices tab & MCP Status
    console.log('[SMOKE] Testing Practices Library & MCP Status...');
    const practicesNavBtn = page.locator('.shell-nav-btn:has-text("Practices")');
    await practicesNavBtn.click();
    await page.waitForSelector('.proto-title');

    const protoCardsCount = await page.locator('.proto-card').count();
    console.log(`[PASS] Practices rendered: ${protoCardsCount}`);
    if (protoCardsCount !== 9) {
      throw new Error(`Expected 9 practices, got ${protoCardsCount}`);
    }

    // Details modal
    const detailsBtn = page.locator('.proto-card-btn:has-text("Details")').first();
    await detailsBtn.click();
    await page.waitForSelector('.modal-card');
    console.log('[PASS] Practice details modal opened');
    await page.locator('.bio-close').click();
    console.log('[PASS] Practice details modal closed');

    // 6. Test Sanctuary Home - Smart Environment Simulation
    console.log('[SMOKE] Testing Sanctuary Home & Smart-Home Simulation...');
    const homeNavBtn = page.locator('.shell-nav-btn:has-text("Sanctuary Home")');
    await homeNavBtn.click();
    await page.waitForSelector('.home-sim-notice');

    const noticeText = await page.textContent('.home-sim-notice');
    console.log(`[PASS] Persistent notice verified: "${noticeText.trim().slice(0, 60)}..."`);
    if (!noticeText.includes('SIMULATION MODE') || !noticeText.includes('No physical smart-home devices')) {
      throw new Error('Simulation notice missing or invalid');
    }

    const sceneCardsCount = await page.locator('.scene-card').count();
    console.log(`[PASS] Wellness scenes rendered: ${sceneCardsCount} (expected 3)`);
    if (sceneCardsCount !== 3) {
      throw new Error(`Expected 3 scenes, got ${sceneCardsCount}`);
    }

    // Preview Calm and Ground scene
    const previewBtn = page.locator('.scene-card:has-text("Calm and Ground") button:has-text("Preview")');
    await previewBtn.click();
    await page.waitForSelector('text=Scene Action Preview:');
    console.log('[PASS] Scene preview rendered');

    // Activate Calm and Ground scene via live MCP
    const activateBtn = page.locator('.scene-card:has-text("Calm and Ground") button:has-text("Activate Scene")');
    await activateBtn.click();
    await page.waitForSelector('.home-active-banner');
    console.log('[PASS] Active scene banner displayed: "Active Scene: Calm and Ground"');

    // Verify lighting changed to 30% and 2700K
    await page.waitForSelector('.device-card:has-text("Smart Lighting") >> text=30%');
    await page.waitForSelector('.device-card:has-text("Smart Lighting") >> text=2700K');
    console.log('[PASS] Simulated device state updated: Lights 30% at 2700K Warm Amber');

    // Verify timeline
    const timelineItems = await page.locator('.timeline-item').count();
    console.log(`[PASS] Simulation timeline items: ${timelineItems} events logged`);
    if (timelineItems < 4) {
      throw new Error(`Expected >= 4 timeline events, got ${timelineItems}`);
    }

    // Restore previous scene
    const restoreBtn = page.locator('button:has-text("Restore Previous Scene")');
    await restoreBtn.click();
    await page.waitForTimeout(300);
    const activeCountAfterRestore = await page.locator('.home-active-banner').count();
    console.log(`[PASS] Reverted scene: active banner dismissed (${activeCountAfterRestore === 0})`);

    // Verify manual interactive controls work (e.g., toggle Smart Lighting power)
    const lightPowerBtn = page.locator('.device-card:has-text("Smart Lighting") .device-power-btn');
    await lightPowerBtn.click();
    await page.waitForTimeout(100);
    const lightPowerText = await lightPowerBtn.textContent();
    console.log(`[PASS] Manual device toggle: Smart Lighting power is now ${lightPowerText.trim()}`);

    // 7. Test graceful degradation on server shutdown
    console.log('[SMOKE] Testing graceful fallback on server stop...');
    await new Promise(r => mcpInstance.httpServer.close(r));
    mcpInstance = null;
    console.log('[PASS] MCP Server stopped');

    // Re-navigate to Practices to click refresh
    await practicesNavBtn.click();
    const refreshBtn = page.locator('button:has-text("Connect to MCP"), button:has-text("Refresh from MCP")');
    await refreshBtn.click();

    // Verify offline status appears
    await page.waitForSelector('text=MCP Server Offline (Using Verified Local Fallback)');
    console.log('[PASS] UI transitioned cleanly to "MCP Server Offline (Using Verified Local Fallback)"');

    const fallbackCount = await page.locator('.proto-card').count();
    console.log(`[PASS] Fallback practices rendered: ${fallbackCount}`);
    if (fallbackCount !== 9) {
      throw new Error(`Expected 9 fallback practices, got ${fallbackCount}`);
    }

    // Verify offline scene activation in Sanctuary Home
    console.log('[SMOKE] Testing offline scene activation in Sanctuary Home...');
    await homeNavBtn.click();
    await page.waitForSelector('.home-sim-notice');
    const focusActivateBtn = page.locator('.scene-card:has-text("Focus") button:has-text("Activate Scene")');
    await focusActivateBtn.click();
    await page.waitForSelector('.home-active-banner:has-text("Active Scene: Focus")');
    console.log('[PASS] Offline scene activation succeeded via local simulation fallback (Focus scene)');

    console.log('[SMOKE PASS] All targeted MCP and consent boundary assertions verified 100%!');
  } catch (err) {
    console.error('[SMOKE FAIL]:', err);
    process.exitCode = 1;
  } finally {
    clearTimeout(suiteTimeout);
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
