const http = require('http');
const { Server } = require('socket.io');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('./app');
const { PORT, CLIENT_URL } = require('./config/env');
const { attachSocketServer } = require('./sockets');

let mongoMemoryServer;

async function startServer() {
  try {
    if (!process.env.ADMIN_MONGODB_URI || !process.env.PARTICIPANT_MONGODB_URI) {
      const adminMemoryServer = await MongoMemoryServer.create({
        binary: { version: '7.0.24' },
        instance: { dbName: 'csea_admin' },
      });
      const participantMemoryServer = await MongoMemoryServer.create({
        binary: { version: '7.0.24' },
        instance: { dbName: 'csea_participant' },
      });

      process.env.ADMIN_MONGODB_URI = adminMemoryServer.getUri();
      process.env.PARTICIPANT_MONGODB_URI = participantMemoryServer.getUri();
      console.log(`Admin MongoMemoryServer started at ${process.env.ADMIN_MONGODB_URI}`);
      console.log(`Participant MongoMemoryServer started at ${process.env.PARTICIPANT_MONGODB_URI}`);
    }

    const { connectMongo } = require('./config/db');
    await connectMongo();
    console.log('Admin and participant MongoDB connections successful');

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST'],
      },
    });

    attachSocketServer(io);
    app.locals.io = io;
    global.io = io;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = { app };
