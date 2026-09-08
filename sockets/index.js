const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

function attachSocketServer(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    const authToken = String(token).startsWith('Bearer ') ? String(token).slice(7) : String(token);

    try {
      const decoded = jwt.verify(authToken, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const joinEvent = ({ eventId } = {}) => {
      if (eventId) {
        socket.join(`event:${eventId}`);
      }
    };

    socket.on('join-event', joinEvent);
    socket.on('join-room', joinEvent);
  });
}

module.exports = { attachSocketServer };
