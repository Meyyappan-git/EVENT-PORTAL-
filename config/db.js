const mongoose = require('mongoose');
const { ADMIN_MONGODB_URI, PARTICIPANT_MONGODB_URI } = require('./env');

const adminConnection = mongoose.createConnection(ADMIN_MONGODB_URI, {
  serverSelectionTimeoutMS: 15000,
});

const participantConnection = mongoose.createConnection(PARTICIPANT_MONGODB_URI, {
  serverSelectionTimeoutMS: 15000,
});

async function connectMongo() {
  await Promise.all([
    adminConnection.asPromise(),
    participantConnection.asPromise(),
  ]);

  return { adminConnection, participantConnection };
}

module.exports = { connectMongo, adminConnection, participantConnection };
