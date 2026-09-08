const readline = require('readline');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { connectMongo, adminDb, participantDb } = require('../config/db');
const { User: AdminUser, Event, Round, Question } = require('../models/admin');
const { Team } = require('../models/participant');

function ask(question) {
  const interface = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => interface.question(question, (answer) => {
    interface.close();
    resolve(answer.trim().toLowerCase());
  }));
}

async function confirmClear() {
  if (process.argv.includes('--yes')) return true;
  if (!process.stdin.isTTY) return false;
  const answer = await ask('This clears existing admin and participant data. Continue? (y/N) ');
  return answer === 'y' || answer === 'yes';
}

async function seed() {
  if (!(await confirmClear())) {
    console.log('Seed cancelled. Use --yes to confirm non-interactively.');
    return;
  }

  await connectMongo();
  await Promise.all([
    AdminUser.deleteMany({}),
    Event.deleteMany({}),
    Round.deleteMany({}),
    Question.deleteMany({}),
    Team.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('Admin@123456', 12);
  await AdminUser.create({
    name: 'CSEA Administrator',
    email: 'admin@csea.com',
    passwordHash,
    role: 'ADMIN',
  });

  const events = await Event.insertMany([
    { name: 'CSEA Quiz Championship' },
    { name: 'CSEA Innovation Challenge' },
  ]);
  let roundCount = 0;
  let questionCount = 0;

  for (const event of events) {
    for (let roundNumber = 1; roundNumber <= 3; roundNumber += 1) {
      const round = await Round.create({
        eventId: event._id,
        name: `Round ${roundNumber}`,
        status: roundNumber === 1 ? 'OPEN' : 'LOCKED',
        questionIds: [],
      });
      const questions = await Question.insertMany(Array.from({ length: 5 }, (_, index) => ({
        roundId: round._id,
        title: `${event.name} ${round.name} Question ${index + 1}`,
        description: 'Answer the challenge question.',
        type: index % 2 === 0 ? 'MCQ' : 'RIDDLE',
        options: index % 2 === 0 ? ['Option A', 'Option B', 'Option C', 'Option D'] : [],
        correctAnswer: index % 2 === 0 ? 'Option A' : 'answer',
        points: 10,
        order: index + 1,
      })));
      round.questionIds = questions.map((question) => question._id);
      await round.save();
      roundCount += 1;
      questionCount += questions.length;
    }
  }

  await Team.insertMany([
    { name: 'Quantum Thinkers', code: 'QUANT1' },
    { name: 'Binary Builders', code: 'BINARY' },
    { name: 'Logic Legends', code: 'LOGIC1' },
  ]);

  console.log(`✅ Seeded ${events.length} events, ${roundCount} rounds, ${questionCount} questions, 3 teams`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([
      adminDb?.readyState ? adminDb.close() : Promise.resolve(),
      participantDb?.readyState ? participantDb.close() : Promise.resolve(),
    ]);
  });
