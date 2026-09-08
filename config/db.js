const mongoose = require('mongoose');

const { ADMIN_MONGODB_URI, PARTICIPANT_MONGODB_URI } = require('./env');

const defaultAdminUri = 'mongodb://localhost:27017/csea_admin';
const defaultParticipantUri = 'mongodb://localhost:27017/csea_participant';
const adminUri = ADMIN_MONGODB_URI || defaultAdminUri;
const participantUri = PARTICIPANT_MONGODB_URI || defaultParticipantUri;
const retryAttempts = 3;
const retryDelayMs = 2000;

let adminDb = null;
let participantDb = null;

function createConnection(uri, name) {
  const connection = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  connection.on('connected', () => {
    console.log(`${name} database connected: ${uri}`);
  });
  connection.on('error', (error) => {
    console.error(`${name} database error: ${error.message}`);
  });
  connection.on('disconnected', () => {
    console.warn(`${name} database disconnected: ${uri}`);
  });

  console.log(`${name} database configured: ${uri}`);
  return connection;
}

function getConnections() {
  if (!adminDb) {
    adminDb = createConnection(adminUri, 'Admin');
  }
  if (!participantDb) {
    participantDb = createConnection(participantUri, 'Participant');
  }

  return { adminDb, participantDb };
}

function wait(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function connectMongo() {
  const { adminDb: admin, participantDb: participant } = getConnections();
  let lastError;

  for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
    try {
      await Promise.all([admin.asPromise(), participant.asPromise()]);
      console.log(`Admin and participant databases connected on attempt ${attempt}`);
      return { adminDb: admin, participantDb: participant };
    } catch (error) {
      lastError = error;
      console.error(`Database connection attempt ${attempt}/${retryAttempts} failed: ${error.message}`);

      if (attempt < retryAttempts) {
        await wait(retryDelayMs);
      }
    }
  }

  throw lastError;
}

module.exports = {
  connectMongo,
  get adminDb() {
    return getConnections().adminDb;
  },
  get participantDb() {
    return getConnections().participantDb;
  },
  get adminConnection() {
    return getConnections().adminDb;
  },
  get participantConnection() {
    return getConnections().participantDb;
  },
};
