const dotenv = require('dotenv');

dotenv.config();

const requiredEnvVars = ['PORT', 'JWT_SECRET', 'JWT_EXPIRES_IN'];

const missing = requiredEnvVars.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const defaultAdminUri = 'mongodb://127.0.0.1:27017/csea_admin_db';
const defaultParticipantUri = 'mongodb://127.0.0.1:27017/csea_participant_db';

module.exports = {
  PORT: Number(process.env.PORT) || 5011,
  MONGODB_URI: process.env.MONGODB_URI || defaultAdminUri,
  ADMIN_MONGODB_URI: process.env.ADMIN_MONGODB_URI || defaultAdminUri,
  PARTICIPANT_MONGODB_URI: process.env.PARTICIPANT_MONGODB_URI || defaultParticipantUri,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
