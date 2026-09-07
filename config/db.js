const mongoose = require('mongoose');

let adminConnection = null;
let participantConnection = null;

function getConnections() {
  if (!adminConnection || !participantConnection) {
    // Require env.js here to get the latest environment variables
    const { ADMIN_MONGODB_URI, PARTICIPANT_MONGODB_URI } = require('./env');
    
    adminConnection = mongoose.createConnection(ADMIN_MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    participantConnection = mongoose.createConnection(PARTICIPANT_MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
  }

  return { adminConnection, participantConnection };
}

async function connectMongo() {
  const { adminConnection: admin, participantConnection: participant } = getConnections();
  
  await Promise.all([
    admin.asPromise(),
    participant.asPromise(),
  ]);

  return { adminConnection: admin, participantConnection: participant };
}

module.exports = {
  connectMongo,
  get adminConnection() {
    return getConnections().adminConnection;
  },
  get participantConnection() {
    return getConnections().participantConnection;
  },
};
