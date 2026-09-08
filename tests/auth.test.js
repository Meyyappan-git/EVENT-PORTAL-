const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');
const bcrypt = require('bcrypt');
const http = require('http');
const authService = require('../services/auth.service');
const app = require('../app');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, async () => {
      const { port } = server.address();
      try {
        const response = await fetch(`http://127.0.0.1:${port}${path}`, {
          method,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });
        const contentType = response.headers.get('content-type') || '';
        resolve({ status: response.status, body: contentType.includes('json') ? await response.json() : null });
      } catch (error) {
        reject(error);
      } finally {
        server.close();
      }
    });
  });
}

test('register returns a user and JWT token', async () => {
  const register = mock.method(authService, 'registerUser', async () => ({ user: { email: 'new@example.com' }, token: 'token' }));
  const result = await request('POST', '/api/auth/register', { name: 'New User', email: 'new@example.com', password: 'Password123!' });
  assert.equal(result.status, 201);
  assert.equal(result.body.data.token, 'token');
  register.mock.restore();
});

test('register rejects invalid input', async () => {
  const register = mock.method(authService, 'registerUser', async () => { throw new Error('Email and password are required'); });
  const result = await request('POST', '/api/auth/register', {});
  assert.equal(result.status, 500);
  assert.equal(result.body.success, false);
  register.mock.restore();
});

test('register rejects duplicate email', async () => {
  const register = mock.method(authService, 'registerUser', async () => { throw new Error('Email already registered'); });
  const result = await request('POST', '/api/auth/register', { name: 'Duplicate', email: 'new@example.com', password: 'Password123!' });
  assert.equal(result.body.error, 'Email already registered');
  register.mock.restore();
});

test('login returns a JWT for valid credentials', async () => {
  const login = mock.method(authService, 'loginUser', async () => ({ user: { email: 'admin@example.com' }, token: 'valid-token' }));
  const result = await request('POST', '/api/auth/login', { email: 'admin@example.com', password: 'Password123!' });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.token, 'valid-token');
  login.mock.restore();
});

test('login rejects invalid credentials', async () => {
  const login = mock.method(authService, 'loginUser', async () => { throw new Error('Invalid credentials'); });
  const result = await request('POST', '/api/auth/login', { email: 'admin@example.com', password: 'wrong' });
  assert.equal(result.body.error, 'Invalid credentials');
  login.mock.restore();
});

test('bcrypt hashes passwords and rejects the wrong password', async () => {
  const hash = await bcrypt.hash('Password123!', 4);
  assert.notEqual(hash, 'Password123!');
  assert.equal(await bcrypt.compare('Password123!', hash), true);
  assert.equal(await bcrypt.compare('WrongPassword123!', hash), false);
});

test('auth routes return the standard response envelope', async () => {
  const login = mock.method(authService, 'loginUser', async () => ({ user: {}, token: 'token' }));
  const result = await request('POST', '/api/auth/login', { email: 'a@example.com', password: 'Password123!' });
  assert.equal(result.body.success, true);
  assert.ok('error' in result.body);
  login.mock.restore();
});

test('unknown auth route returns a 404 response', async () => {
  const result = await request('POST', '/api/auth/unknown', {});
  assert.equal(result.status, 404);
});
