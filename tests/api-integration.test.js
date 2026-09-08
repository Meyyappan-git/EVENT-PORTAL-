const test = require('node:test');
const assert = require('node:assert/strict');

const enabled = process.env.RUN_INTEGRATION_TESTS === '1';
const baseUrl = process.env.API_URL || 'http://localhost:5011';
const state = {};

async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'content-type': 'application/json', ...(options.token ? { authorization: `Bearer ${options.token}` } : {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return { status: response.status, body: await response.json() };
}

async function setup() {
  const suffix = Date.now();
  const admin = await api('/api/auth/register', { method: 'POST', body: { name: 'Integration Admin', email: `admin-${suffix}@example.com`, password: 'Password123!', role: 'ADMIN' } });
  const participant = await api('/api/auth/register', { method: 'POST', body: { name: 'Integration Participant', email: `participant-${suffix}@example.com`, password: 'Password123!', role: 'PARTICIPANT' } });
  state.adminToken = admin.body.data.token;
  state.participantToken = participant.body.data.token;
}

const integrationTest = enabled ? test : test.skip;

integrationTest('health endpoint responds', async () => {
  const result = await api('/health');
  assert.equal(result.status, 200);
});

integrationTest('authentication creates integration users', async () => {
  await setup();
  assert.ok(state.adminToken);
  assert.ok(state.participantToken);
});

integrationTest('admin creates an event', async () => {
  const result = await api('/api/events', { method: 'POST', token: state.adminToken, body: { name: 'Integration Event' } });
  assert.equal(result.status, 201);
  state.eventId = result.body.data._id;
});

integrationTest('admin creates a round', async () => {
  const result = await api('/api/rounds', { method: 'POST', token: state.adminToken, body: { eventId: state.eventId, name: 'Integration Round' } });
  assert.equal(result.status, 201);
  state.roundId = result.body.data._id;
});

integrationTest('admin creates a question', async () => {
  const result = await api('/api/questions', { method: 'POST', token: state.adminToken, body: { roundId: state.roundId, title: 'Two plus two', description: 'Arithmetic', type: 'MCQ', options: ['3', '4'], correctAnswer: '4', points: 10, order: 1 } });
  assert.equal(result.status, 201);
  state.questionId = result.body.data._id;
});

integrationTest('participant creates a team', async () => {
  const result = await api('/api/teams/create', { method: 'POST', token: state.participantToken, body: { name: `Integration Team ${Date.now()}` } });
  assert.equal(result.status, 201);
  state.teamId = result.body.data._id;
});

integrationTest('participant can retrieve the leaderboard', async () => {
  const result = await api('/api/leaderboard', { token: state.participantToken });
  assert.equal(result.status, 200);
  assert.ok(Array.isArray(result.body.data));
});

integrationTest('admin can retrieve submissions', async () => {
  const result = await api('/api/submissions', { token: state.adminToken });
  assert.equal(result.status, 200);
  assert.ok(Array.isArray(result.body.data));
});
