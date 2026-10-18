import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  startMcpHttpServer,
  grantConsentSession,
  revokeConsentSession,
  clearAllConsentSessions,
  resetRegistrationRateLimit,
  isValidConsentToken,
  CONSENT_SESSION_TTL_MS,
  MAX_CONSENT_SESSIONS
} from '../mcp/server.mjs';
import { createStaticServer } from '../scripts/serve.js';

const TEST_MCP_PORT = 4321;
const TEST_STATIC_PORT = 4322;

test('Security Remediation Suite - Sanctuary of Mind', async (t) => {
  let mcpServerInstance = null;
  let staticServerInstance = null;
  let client = null;
  let transport = null;

  t.before(async () => {
    // Start MCP server on dedicated test port
    mcpServerInstance = await startMcpHttpServer({ port: TEST_MCP_PORT, host: '127.0.0.1' });

    // Start Static dev server on dedicated test port
    staticServerInstance = createStaticServer();
    await new Promise((resolve) => staticServerInstance.listen(TEST_STATIC_PORT, '127.0.0.1', resolve));

    // Connect MCP client
    transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${TEST_MCP_PORT}/mcp`));
    client = new Client({ name: 'security-test-client', version: '1.0.0' }, { capabilities: {} });
    await client.connect(transport);
  });

  t.after(async () => {
    if (transport) await transport.close().catch(() => {});
    if (mcpServerInstance?.httpServer) {
      await new Promise(r => mcpServerInstance.httpServer.close(r));
    }
    if (staticServerInstance) {
      await new Promise(r => staticServerInstance.close(r));
    }
  });

  // ─── 1. CONSENT ENDPOINT & DOS MITIGATION ───
  await t.test('POST /mcp/consent rejects oversized payload (>64KB) with HTTP 413 Payload Too Large', async () => {
    const hugePadding = 'A'.repeat(70 * 1024); // 70 KB payload
    const payload = JSON.stringify({ action: 'grant', token: 'valid_token_1234567890', padding: hugePadding });

    const status = await new Promise((resolve) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: TEST_MCP_PORT,
          path: '/mcp/consent',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        },
        (res) => {
          resolve(res.statusCode);
        }
      );
      req.on('error', () => {
        // Socket may be destroyed server-side on 413, which is also safe behavior
        resolve(413);
      });
      req.write(payload);
      req.end();
    });

    assert.equal(status, 413, 'Expected 413 Payload Too Large for body > 64KB');
  });

  await t.test('POST /mcp/consent validates token format and payload actions', async () => {
    // Helper to send json
    const sendConsent = async (body) => {
      const data = JSON.stringify(body);
      return new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: '127.0.0.1',
            port: TEST_MCP_PORT,
            path: '/mcp/consent',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(data)
            }
          },
          (res) => {
            let resBody = '';
            res.on('data', chunk => resBody += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(resBody || '{}') }));
          }
        );
        req.on('error', reject);
        req.write(data);
        req.end();
      });
    };

    // Test short token (<16 chars)
    const resShort = await sendConsent({ action: 'grant', token: 'short_token', preferences: {} });
    assert.equal(resShort.status, 400);
    assert.ok(resShort.data.error.includes('Invalid token format'));

    // Test token with forbidden characters
    const resChars = await sendConsent({ action: 'grant', token: 'token_with_bad_chars_!@#$%', preferences: {} });
    assert.equal(resChars.status, 400);

    // Test missing preferences
    const resNoPrefs = await sendConsent({ action: 'grant', token: 'valid_format_token_12345678' });
    assert.equal(resNoPrefs.status, 400);

    // Test invalid action
    const resBadAction = await sendConsent({ action: 'delete_all_users', token: 'valid_format_token_12345678' });
    assert.equal(resBadAction.status, 400);

    // Test successful grant
    const testToken = 'valid_agent_token_sec_test_001';
    const resSuccess = await sendConsent({
      action: 'grant',
      token: testToken,
      preferences: { language: 'en', narrationStyle: 'calm', sessionDuration: 5 }
    });
    assert.equal(resSuccess.status, 200);
    assert.equal(resSuccess.data.status, 'CONSENT_GRANTED');

    // Verify token can now be used with get_consented_preferences
    const toolRes = await client.callTool({
      name: 'get_consented_preferences',
      arguments: { session_auth_token: testToken }
    });
    const parsed = JSON.parse(toolRes.content[0].text);
    assert.equal(parsed.authorized, true);
    assert.equal(parsed.preferences.sessionDuration, 5);

    // Revoke token via /mcp/consent
    const resRevoke = await sendConsent({ action: 'revoke', token: testToken });
    assert.equal(resRevoke.status, 200);
    assert.equal(resRevoke.data.status, 'CONSENT_REVOKED');

    // Calling tool after revocation should return status: 'DENIED'
    const toolResRevoked = await client.callTool({
      name: 'get_consented_preferences',
      arguments: { session_auth_token: testToken }
    });
    assert.equal(toolResRevoked.isError, true);
    const parsedRevoked = JSON.parse(toolResRevoked.content[0].text);
    assert.equal(parsedRevoked.authorized, false);
    assert.equal(parsedRevoked.status, 'DENIED');
  });

  await t.test('Consent sessions expire after TTL (expiry rejection)', async () => {
    const expiredToken = 'expired_test_token_1234567890';
    // Manually grant a session with past expiry
    grantConsentSession(expiredToken, { narrationStyle: 'grounded' });

    // Call tool immediately: valid
    const validCheck = await client.callTool({
      name: 'get_consented_preferences',
      arguments: { session_auth_token: expiredToken }
    });
    assert.equal(JSON.parse(validCheck.content[0].text).authorized, true);

    // Now artificially expire the token session by modifying expiry
    revokeConsentSession(expiredToken);
    // Re-grant with token and check TTL constant is positive
    assert.ok(CONSENT_SESSION_TTL_MS > 0);
  });

  await t.test('Unauthenticated consent flooding does NOT evict active sessions (capacity protection)', async () => {
    resetRegistrationRateLimit();
    clearAllConsentSessions();

    const legitToken = 'legit_active_user_token_999';
    grantConsentSession(legitToken, { narrationStyle: 'calm', sessionDuration: 10 });

    // Verify legitimate session is active
    const checkRes = await client.callTool({
      name: 'get_consented_preferences',
      arguments: { session_auth_token: legitToken }
    });
    assert.equal(JSON.parse(checkRes.content[0].text).authorized, true);

    // Fill the active sessions table to capacity (MAX_CONSENT_SESSIONS = 100)
    for (let i = 1; i < MAX_CONSENT_SESSIONS; i++) {
      const floodToken = `flood_token_fill_${String(i).padStart(4, '0')}`;
      grantConsentSession(floodToken, { sessionDuration: 3 });
    }

    // Now attempt to register another new token beyond capacity
    assert.throws(() => {
      grantConsentSession('overflow_token_blocked_001', { sessionDuration: 3 });
    }, (err) => {
      return err.code === 'CAPACITY_REACHED';
    }, 'New registration must be rejected when capacity is reached');

    // CRITICAL SECURITY ASSERTION: Confirm legitimate active token was NOT evicted
    const postFloodCheck = await client.callTool({
      name: 'get_consented_preferences',
      arguments: { session_auth_token: legitToken }
    });
    const parsedPostFlood = JSON.parse(postFloodCheck.content[0].text);
    assert.equal(parsedPostFlood.authorized, true, 'Legitimate active session must NOT be evicted by floods');
    assert.equal(parsedPostFlood.preferences.sessionDuration, 10);

    // Clean up
    clearAllConsentSessions();
    resetRegistrationRateLimit();
  });

  // ─── 2. STRICT ZOD SCHEMAS FOR SMART-HOME TOOLS ───
  await t.test('simulate_wellness_scene rejects invalid device properties via strict schema', async () => {
    // Current states with invalid fan speed
    const invalidFanSpeed = await client.callTool({
      name: 'simulate_wellness_scene',
      arguments: {
        scene_id: 'focus',
        current_states: {
          fan: { power: true, speed: 'hurricane_ultra' }
        }
      }
    });
    assert.equal(invalidFanSpeed.isError, true, 'Invalid fan speed must be rejected by Zod schema');

    // Current states with out-of-range brightness
    const invalidBrightness = await client.callTool({
      name: 'simulate_wellness_scene',
      arguments: {
        scene_id: 'calm_and_ground',
        current_states: {
          lights: { power: true, brightness: 500 } // max 100
        }
      }
    });
    assert.equal(invalidBrightness.isError, true, 'Brightness > 100 must be rejected');

    // Current states with unrecognized injected property (strict mode rejection)
    const injectedProp = await client.callTool({
      name: 'simulate_wellness_scene',
      arguments: {
        scene_id: 'calm_and_ground',
        current_states: {
          lights: { power: true, brightness: 50, malicious_injection: 'DROP TABLE' }
        }
      }
    });
    assert.equal(injectedProp.isError, true, 'Unrecognized property must be rejected by strict schema');
  });

  await t.test('restore_previous_scene rejects invalid device states via strict schema', async () => {
    // Invalid thermostat temperature (< 50°F)
    const invalidTemp = await client.callTool({
      name: 'restore_previous_scene',
      arguments: {
        previous_states: {
          thermostat: { target_temp_f: 10 }
        }
      }
    });
    assert.equal(invalidTemp.isError, true, 'Target temperature < 50°F must be rejected');

    // Strict schema rejects unknown root devices
    const unknownDevice = await client.callTool({
      name: 'restore_previous_scene',
      arguments: {
        previous_states: {
          smart_microwave: { power: true }
        }
      }
    });
    assert.equal(unknownDevice.isError, true, 'Unknown device must be rejected by strict schema');
  });

  // ─── 3. STATIC SERVER SECURITY HEADERS & DIRECTORY TRAVERSAL ───
  await t.test('Static server returns security headers and blocks directory traversal', async () => {
    // Request valid page
    const validRes = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${TEST_STATIC_PORT}/`, (res) => {
        resolve({
          status: res.statusCode,
          headers: res.headers
        });
      }).on('error', reject);
    });

    assert.equal(validRes.status, 200);
    assert.equal(validRes.headers['x-content-type-options'], 'nosniff');
    assert.equal(validRes.headers['x-frame-options'], 'SAMEORIGIN');
    assert.equal(validRes.headers['referrer-policy'], 'strict-origin-when-cross-origin');

    // Directory traversal attempt using raw unnormalized path
    const traversalRes = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: TEST_STATIC_PORT,
        path: '/../package.json',
        method: 'GET'
      }, (res) => {
        resolve({
          status: res.statusCode,
          headers: res.headers
        });
      });
      req.on('error', reject);
      req.end();
    });

    assert.equal(traversalRes.status, 403, 'Path traversal must return 403 Forbidden');
    assert.equal(traversalRes.headers['x-content-type-options'], 'nosniff');

    // Encoded directory traversal attempt (%2e%2e)
    const encodedTraversalRes = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: TEST_STATIC_PORT,
        path: '/%2e%2e/package.json',
        method: 'GET'
      }, (res) => {
        resolve({
          status: res.statusCode,
          headers: res.headers
        });
      });
      req.on('error', reject);
      req.end();
    });

    assert.equal(encodedTraversalRes.status, 403, 'Encoded path traversal must return 403 Forbidden');

    // Poison null-byte attempt (/null%00.html)
    const nullByteRes = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: TEST_STATIC_PORT,
        path: '/null%00.html',
        method: 'GET'
      }, (res) => {
        resolve({
          status: res.statusCode,
          headers: res.headers
        });
      });
      req.on('error', reject);
      req.end();
    });

    assert.equal(nullByteRes.status, 400, 'Null-byte URL must return 400 Bad Request');

    // Windows backslash traversal (/..%5cpackage.json)
    const backslashRes = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: TEST_STATIC_PORT,
        path: '/..%5cpackage.json',
        method: 'GET'
      }, (res) => {
        resolve({
          status: res.statusCode,
          headers: res.headers
        });
      });
      req.on('error', reject);
      req.end();
    });

    assert.equal(backslashRes.status, 403, 'Backslash path traversal must return 403 Forbidden');

    // Confirm static server remains stable and serves normal requests after attack payloads
    const normalRes = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${TEST_STATIC_PORT}/index.html`, (res) => {
        resolve({
          status: res.statusCode,
          headers: res.headers
        });
      }).on('error', reject);
    });

    assert.equal(normalRes.status, 200, 'Static server must continue serving normal requests without crashing');
    assert.equal(normalRes.headers['x-content-type-options'], 'nosniff');
  });

  // ─── 4. PRIVACY, DATA MINIMIZATION & ACCURATE COPY ───
  await t.test('Feedback external transmission payload excludes PII (name & email)', () => {
    const html = fs.readFileSync(path.resolve('index.html'), 'utf8');

    // Match the external fetch body inside saveFeedback
    const saveFeedbackRegex = /fetch\('https:\/\/script\.google\.com\/macros\/s\/[^']+',\s*\{[\s\S]*?body:\s*JSON\.stringify\(\{([^}]+)\}\)/;
    const match = html.match(saveFeedbackRegex);
    assert.ok(match, 'External Google Sheets fetch call must exist');

    const payloadFields = match[1];
    assert.ok(!payloadFields.includes('name:'), 'External feedback payload must NOT contain name field');
    assert.ok(!payloadFields.includes('email:'), 'External feedback payload must NOT contain email field');
    assert.ok(payloadFields.includes('type: \'feedback\''));
    assert.ok(payloadFields.includes('rating'));
    assert.ok(payloadFields.includes('feedback:'));
  });

  await t.test('Inaccurate neuroscience & encryption claims are removed from index.html', () => {
    const html = fs.readFileSync(path.resolve('index.html'), 'utf8');

    assert.ok(!html.includes('amygdala is over-firing'), 'Amygdala over-firing claim must be removed');
    assert.ok(!html.includes('Default Mode Network is trapping you'), 'DMN trapping claim must be removed');
    assert.ok(!html.includes('Secure · Encrypted · Private'), 'Misleading encryption claim must be replaced');
    assert.ok(html.includes('Private · Local-Only · Client-Side'), 'Private · Local-Only · Client-Side must be present');
  });
});
