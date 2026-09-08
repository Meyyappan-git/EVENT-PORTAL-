const http = require('http');
const { connectMongo, adminDb, participantDb } = require('../config/db');
const { JWT_EXPIRES_IN } = require('../config/env');

const green = '\x1b[32m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

function checkHttp(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 500);
    });
    request.on('error', () => resolve(false));
    request.setTimeout(3000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function report(label, ok) {
  console.log(`${ok ? green + '✅' : red + '❌'} ${label}${reset}`);
  return ok;
}

async function main() {
  const results = [];
  results.push(report('Backend /health', await checkHttp('http://localhost:5011/health')));
  results.push(report('Frontend :5173', await checkHttp('http://localhost:5173')));
  try {
    await connectMongo();
    results.push(report('Admin MongoDB connected', adminDb.readyState === 1));
    results.push(report('Participant MongoDB connected', participantDb.readyState === 1));
  } catch (error) {
    results.push(report(`MongoDB connection (${error.message})`, false));
  }
  results.push(report('JWT_EXPIRES_IN configured', Boolean(JWT_EXPIRES_IN)));

  if (results.includes(false)) {
    console.log('\nFix first: start Docker MongoDB, then start the backend and frontend.');
    process.exitCode = 1;
  } else {
    console.log('\nAll services are healthy.');
  }
}

main().finally(async () => {
  await Promise.allSettled([
    adminDb?.readyState ? adminDb.close() : Promise.resolve(),
    participantDb?.readyState ? participantDb.close() : Promise.resolve(),
  ]);
});
