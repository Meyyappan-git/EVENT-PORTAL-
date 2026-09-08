const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { io: client } = require('socket.io-client');
const { JWT_SECRET } = require('../config/env');
const { attachSocketServer } = require('../sockets');

const enabled = process.env.RUN_SOCKET_TESTS === '1';
const socketTest = enabled ? test : test.skip;
let server;
let io;
let url;
const token = jwt.sign({ userId: 'socket-test', role: 'PARTICIPANT' }, JWT_SECRET);

function connect() {
  return new Promise((resolve, reject) => {
    const socket = client(url, { auth: { token } });
    socket.once('connect', () => resolve(socket));
    socket.once('connect_error', reject);
  });
}

test.before(async () => {
  if (!enabled) return;
  server = http.createServer();
  io = new Server(server);
  attachSocketServer(io);
  await new Promise((resolve) => server.listen(0, resolve));
  url = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (io) await new Promise((resolve) => io.close(resolve));
  if (server) await new Promise((resolve) => server.close(resolve));
});

socketTest('socket connects and disconnects with a valid JWT', async () => {
  const socket = await connect();
  assert.equal(socket.connected, true);
  await new Promise((resolve) => { socket.once('disconnect', resolve); socket.disconnect(); });
});

socketTest('client can join an event room', async () => {
  const socket = await connect();
  socket.emit('join-room', { eventId: 'event-1' });
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(io.sockets.adapter.rooms.has('event:event-1'), true);
  socket.disconnect();
});

socketTest('client can use the join-event alias', async () => {
  const socket = await connect();
  socket.emit('join-event', { eventId: 'event-2' });
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(io.sockets.adapter.rooms.has('event:event-2'), true);
  socket.disconnect();
});

socketTest('leaderboard-update broadcasts to connected clients', async () => {
  const socket = await connect();
  const received = new Promise((resolve) => socket.once('leaderboard:update', resolve));
  io.emit('leaderboard:update', [{ rank: 1 }]);
  assert.deepEqual(await received, [{ rank: 1 }]);
  socket.disconnect();
});

socketTest('submission-received broadcasts to connected clients', async () => {
  const socket = await connect();
  const received = new Promise((resolve) => socket.once('submission-received', resolve));
  io.emit('submission-received', { questionId: 'question-1' });
  assert.deepEqual(await received, { questionId: 'question-1' });
  socket.disconnect();
});
