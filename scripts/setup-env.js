const fs = require('fs');
const path = require('path');
const readline = require('readline');

const root = path.resolve(__dirname, '..');
const required = [
  'PORT',
  'ADMIN_MONGODB_URI',
  'PARTICIPANT_MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CLIENT_URL',
  'NODE_ENV',
];

function parse(content) {
  return Object.fromEntries(content.split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => {
    const index = line.indexOf('=');
    return [line.slice(0, index), line.slice(index + 1)];
  }));
}

function ask(interface, question, fallback) {
  return new Promise((resolve) => interface.question(`${question} [${fallback}]: `, (answer) => resolve(answer.trim() || fallback)));
}

async function configure(filePath, examplePath, keys) {
  if (!fs.existsSync(filePath)) {
    if (filePath === examplePath) {
      fs.writeFileSync(filePath, 'VITE_API_URL=http://localhost:5011\n');
    } else {
      fs.copyFileSync(examplePath, filePath);
    }
  }
  const values = parse(fs.readFileSync(filePath, 'utf8'));
  const interface = readline.createInterface({ input: process.stdin, output: process.stdout });
  for (const key of keys) {
    if (!values[key]) values[key] = await ask(interface, `Enter ${key}`, '');
  }
  interface.close();
  const content = keys.map((key) => `${key}=${values[key] || ''}`).join('\n') + '\n';
  fs.writeFileSync(filePath, content);
  const missing = keys.filter((key) => !values[key]);
  if (missing.length) console.warn(`${filePath} missing: ${missing.join(', ')}`);
}

(async () => {
  await configure(path.join(root, '.env'), path.join(root, '.env.example'), required);
  await configure(path.join(root, 'frontend', '.env'), path.join(root, 'frontend', '.env'), ['VITE_API_URL']);
  console.log('Environment files checked.');
})().catch((error) => {
  console.error('Environment setup failed:', error.message);
  process.exitCode = 1;
});
