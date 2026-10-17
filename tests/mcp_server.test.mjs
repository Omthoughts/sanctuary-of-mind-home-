import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { startMcpHttpServer, grantConsentSession, revokeConsentSession } from '../mcp/server.mjs';

const TEST_PORT = 3456;
const TEST_HOST = '127.0.0.1';
const MCP_URL = `http://${TEST_HOST}:${TEST_PORT}/mcp`;

test('MCP Server Suite - Complete Lifecycle & Tool Verification', async (t) => {
  // 1. Start Server
  const { httpServer } = await startMcpHttpServer({ port: TEST_PORT, host: TEST_HOST });

  try {
    // 2. Health & Status Check
    await t.test('Server health endpoint returns online status and protocol info', async () => {
      const res = await fetch(`http://${TEST_HOST}:${TEST_PORT}/health`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.status, 'online');
      assert.equal(data.protocol_version, '2025-11-25');
      assert.equal(data.transport, 'Streamable HTTP');
    });

    // 3. Official Client Connection & Handshake
    let client;
    await t.test('Official MCP SDK Client connects over Streamable HTTP and negotiates protocol', async () => {
      client = new Client({ name: 'sanctuary-test-client', version: '1.0.0' });
      const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
      await client.connect(transport);
      assert.ok(client, 'Client connected successfully');
    });

    // 4. Tool Discovery
    await t.test('tools/list discovers all 8 tools with validated schemas', async () => {
      const { tools } = await client.listTools();
      const toolNames = tools.map(t => t.name);

      assert.equal(tools.length, 8, 'Must expose exactly 8 tools');
      assert.ok(toolNames.includes('list_guided_practices'));
      assert.ok(toolNames.includes('get_practice_details'));
      assert.ok(toolNames.includes('get_consented_preferences'));
      assert.ok(toolNames.includes('create_session_summary'));
      assert.ok(toolNames.includes('simulate_ambient_action'));
      assert.ok(toolNames.includes('get_home_device_states'));
      assert.ok(toolNames.includes('simulate_wellness_scene'));
      assert.ok(toolNames.includes('restore_previous_scene'));
    });

    // 5. Tool 1: list_guided_practices
    await t.test('list_guided_practices returns 9 canonical practices, filterable by Guna', async () => {
      // All
      const resAll = await client.callTool({ name: 'list_guided_practices', arguments: { guna_filter: 'all' } });
      const parsedAll = JSON.parse(resAll.content[0].text);
      assert.equal(parsedAll.total, 9, 'All practices must equal 9');
      assert.equal(parsedAll.filter_applied, 'all');

      // Filtered to Sattva
      const resSattva = await client.callTool({ name: 'list_guided_practices', arguments: { guna_filter: 'sattva' } });
      const parsedSattva = JSON.parse(resSattva.content[0].text);
      assert.equal(parsedSattva.total, 3, 'Sattva practices must equal 3');
      assert.ok(parsedSattva.practices.every(p => p.guna === 'sattva'));
    });

    // 6. Tool 2: get_practice_details
    await t.test('get_practice_details returns practice instructions and adapts for avoided techniques', async () => {
      // Standard
      const resStandard = await client.callTool({
        name: 'get_practice_details',
        arguments: { guna: 'tamas', worldview: 'logical' }
      });
      const parsedStandard = JSON.parse(resStandard.content[0].text);
      assert.equal(parsedStandard.title, 'Motor Cortex Activation');
      assert.equal(parsedStandard.is_adapted, false);

      // Adapted for vigorous movement exclusion
      const resAdapted = await client.callTool({
        name: 'get_practice_details',
        arguments: { guna: 'tamas', worldview: 'logical', avoided_technique: 'vigorous_movement' }
      });
      const parsedAdapted = JSON.parse(resAdapted.content[0].text);
      assert.equal(parsedAdapted.title, 'Seated Isometric Grounding');
      assert.equal(parsedAdapted.is_adapted, true);
      assert.ok(parsedAdapted.adaptation_notice.includes('vigorous movement'));
      assert.ok(parsedAdapted.safety_notice.includes('Non-diagnostic'));
    });

    // 7. Tool 2: Schema validation failure on invalid input & unknown tools
    await t.test('get_practice_details rejects invalid Guna with schema validation error', async () => {
      const res = await client.callTool({
        name: 'get_practice_details',
        arguments: { guna: 'invalid_guna', worldview: 'logical' }
      });
      assert.equal(res.isError, true, 'Must return isError: true on schema validation failure');
      assert.ok(res.content[0].text.includes('invalid_guna') || res.content[0].text.includes('Invalid option'));

      // Unknown tool check
      const resUnknown = await client.callTool({
        name: 'non_existent_tool',
        arguments: {}
      });
      assert.equal(resUnknown.isError, true);
      assert.ok(resUnknown.content[0].text.includes('not found'));
    });

    // 8. Tool 3: get_consented_preferences (Consent Enforcement)
    await t.test('get_consented_preferences returns safe denial when unauthenticated / unauthorized', async () => {
      const res = await client.callTool({
        name: 'get_consented_preferences',
        arguments: { session_auth_token: 'unauthorized_token_xyz_123' }
      });
      assert.equal(res.isError, true);
      const parsed = JSON.parse(res.content[0].text);
      assert.equal(parsed.authorized, false);
      assert.equal(parsed.status, 'DENIED');
      assert.ok(parsed.error.includes('Consent Required'));
    });

    await t.test('get_consented_preferences exposes preferences only after explicit user consent grant', async () => {
      const testToken = 'valid_trusted_token_abc_999';
      grantConsentSession(testToken, {
        sessionDuration: 5,
        narrationStyle: 'grounded',
        speechRate: 0.8,
        excludedTechniques: ['vigorous_movement']
      });

      const res = await client.callTool({
        name: 'get_consented_preferences',
        arguments: { session_auth_token: testToken }
      });
      const parsed = JSON.parse(res.content[0].text);
      assert.equal(parsed.authorized, true);
      assert.equal(parsed.preferences.sessionDuration, 5);
      assert.equal(parsed.preferences.narrationStyle, 'grounded');
      assert.deepEqual(parsed.preferences.excludedTechniques, ['vigorous_movement']);

      // Revoke consent
      revokeConsentSession(testToken);
      const resRevoked = await client.callTool({
        name: 'get_consented_preferences',
        arguments: { session_auth_token: testToken }
      });
      assert.equal(resRevoked.isError, true);
    });

    // 9. Tool 4: create_session_summary
    await t.test('create_session_summary generates non-diagnostic summary and appends crisis info on distress', async () => {
      // Normal Sattva session
      const resNormal = await client.callTool({
        name: 'create_session_summary',
        arguments: { sattva_score: 3, rajas_score: 1, tamas_score: 0, hrv_ms: 60 }
      });
      const parsedNormal = JSON.parse(resNormal.content[0].text);
      assert.equal(parsedNormal.dominant_guna, 'sattva');
      assert.ok(parsedNormal.disclaimer.includes('Non-diagnostic'));
      assert.equal(parsedNormal.distress_support_resources, undefined);

      // Distress Tamas session (tamas >= 3)
      const resDistress = await client.callTool({
        name: 'create_session_summary',
        arguments: { sattva_score: 0, rajas_score: 1, tamas_score: 3, hrv_ms: 32 }
      });
      const parsedDistress = JSON.parse(resDistress.content[0].text);
      assert.equal(parsedDistress.dominant_guna, 'tamas');
      assert.ok(parsedDistress.distress_support_resources, 'Must attach verified crisis resources');
      assert.equal(parsedDistress.distress_support_resources.india_telemanas.helpline, '14416');
      assert.equal(parsedDistress.distress_support_resources.us_lifeline.helpline, '988');
      assert.ok(parsedDistress.distress_support_resources.safety_clarification.includes('does NOT dispatch ambulances'));
    });

    // 10. Tool 5: simulate_ambient_action
    await t.test('simulate_ambient_action returns explicit simulation label and honesty disclaimer', async () => {
      const res = await client.callTool({
        name: 'simulate_ambient_action',
        arguments: { action_type: 'dim_lights', setting: 'warm_amber_2700k' }
      });
      const parsed = JSON.parse(res.content[0].text);
      assert.equal(parsed.status, 'SIMULATED_SUCCESS');
      assert.equal(parsed.simulation_label, '[SIMULATION - NO PHYSICAL HARDWARE CONNECTED]');
      assert.ok(parsed.honesty_disclosure.includes('No Amazon Echo, Alexa device'));
    });

    // 11. Tool 6: get_home_device_states
    await t.test('get_home_device_states returns simulated device states with honesty disclosure', async () => {
      const res = await client.callTool({
        name: 'get_home_device_states',
        arguments: { room: 'sanctuary_room' }
      });
      const parsed = JSON.parse(res.content[0].text);
      assert.equal(parsed.status, 'SUCCESS');
      assert.equal(parsed.simulation_mode, true);
      assert.ok(parsed.simulation_notice.includes('SIMULATION MODE'));
      assert.ok(parsed.devices.lights);
      assert.ok(parsed.devices.audio);
      assert.ok(parsed.devices.fan);
      assert.ok(parsed.devices.thermostat);
      assert.equal(parsed.devices.lights.color_temp_k, 4000);
      assert.equal(parsed.devices.thermostat.current_temp_f, 72);
    });

    // 12. Tool 7: simulate_wellness_scene
    await t.test('simulate_wellness_scene coordinates ambient environment with timeline and supports overrides', async () => {
      // Calm and Ground scene
      const resCalm = await client.callTool({
        name: 'simulate_wellness_scene',
        arguments: {
          scene_id: 'calm_and_ground',
          overrides: { brightness: 35, sound_volume: 30 }
        }
      });
      const parsedCalm = JSON.parse(resCalm.content[0].text);
      assert.equal(parsedCalm.status, 'SCENE_SIMULATED');
      assert.equal(parsedCalm.scene_id, 'calm_and_ground');
      assert.equal(parsedCalm.scene_title, 'Calm and Ground');
      assert.equal(parsedCalm.target_states.lights.brightness, 35, 'Override brightness applied');
      assert.equal(parsedCalm.target_states.lights.color_temp_k, 2700);
      assert.equal(parsedCalm.target_states.audio.track, 'rain');
      assert.equal(parsedCalm.target_states.audio.volume, 30, 'Override volume applied');
      assert.equal(parsedCalm.target_states.fan.speed, 'breeze');
      assert.equal(parsedCalm.target_states.thermostat.target_temp_f, 70);
      assert.equal(parsedCalm.simulation_label, '[SIMULATION - NO PHYSICAL HARDWARE CONNECTED]');
      assert.ok(parsedCalm.simulation_notice.includes('SIMULATION MODE'));
      assert.ok(Array.isArray(parsedCalm.action_timeline));
      assert.equal(parsedCalm.action_timeline.length, 6);
      assert.equal(parsedCalm.recommended_practice.id, 'rajas_logical');

      // Invalid scene ID rejection
      const resInvalid = await client.callTool({
        name: 'simulate_wellness_scene',
        arguments: { scene_id: 'hyper_party_mode' }
      });
      assert.equal(resInvalid.isError, true, 'Invalid scene must be rejected by Zod schema');
    });

    // 13. Tool 8: restore_previous_scene
    await t.test('restore_previous_scene reverts environment to previous state with audit timeline', async () => {
      const previousBaseline = {
        lights: { power: true, brightness: 60, color_temp_k: 4000 },
        audio: { power: false, track: 'silence', volume: 0 },
        fan: { power: true, speed: 'low' },
        thermostat: { target_temp_f: 72 }
      };

      const resRestore = await client.callTool({
        name: 'restore_previous_scene',
        arguments: { previous_states: previousBaseline }
      });
      const parsedRestore = JSON.parse(resRestore.content[0].text);
      assert.equal(parsedRestore.status, 'RESTORED');
      assert.equal(parsedRestore.restored_states.lights.brightness, 60);
      assert.equal(parsedRestore.simulation_label, '[SIMULATION - NO PHYSICAL HARDWARE CONNECTED]');
      assert.ok(parsedRestore.action_timeline.length >= 3);
    });

    // 11. Security: Origin Header Validation
    await t.test('Server rejects requests with untrusted external Origin headers', async () => {
      const res = await fetch(`http://${TEST_HOST}:${TEST_PORT}/mcp`, {
        method: 'POST',
        headers: {
          'Origin': 'http://malicious-external-site.com',
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} })
      });
      assert.equal(res.status, 403, 'Must reject untrusted origin with 403 Forbidden');
    });

    // Close client
    await client.close();

  } finally {
    // 12. Clean Server Shutdown
    await new Promise((resolve) => httpServer.close(resolve));
  }
});
