const test = require('node:test');
const assert = require('node:assert/strict');

const env = require('../config/env');

test('exposes separate admin and participant database URIs', () => {
  assert.ok(env.ADMIN_MONGODB_URI);
  assert.ok(env.PARTICIPANT_MONGODB_URI);
  assert.notEqual(env.ADMIN_MONGODB_URI, env.PARTICIPANT_MONGODB_URI);
});
