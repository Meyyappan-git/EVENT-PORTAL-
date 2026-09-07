const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');

const Event = require('../models/Event');
const Round = require('../models/Round');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const { getCurrentQuestionForTeam } = require('../services/unlock.service');
const questionService = require('../services/question.service');
const { loginUser } = require('../services/auth.service');
const User = require('../models/User');
const {
  hashPassword,
  verifyPassword,
  sanitizeInput,
  validateLoginInput,
  generateAuthToken,
  verifyCredentials,
  findUserByCredential,
} = require('../services/auth.security');

test('returns the first unanswered question in round order', () => {
  const round = {
    _id: 'round-1',
    questionIds: ['q1', 'q2', 'q3'],
  };

  const submissions = [
    { teamId: 'team-1', questionId: 'q1', isCorrect: true },
    { teamId: 'team-1', questionId: 'q2', isCorrect: false },
  ];

  const result = getCurrentQuestionForTeam({ round, submissions, teamId: 'team-1' });
  assert.equal(result, 'q2');
});

test('returns null when all questions have been solved correctly', () => {
  const round = {
    _id: 'round-1',
    questionIds: ['q1', 'q2'],
  };

  const submissions = [
    { teamId: 'team-1', questionId: 'q1', isCorrect: true },
    { teamId: 'team-1', questionId: 'q2', isCorrect: true },
  ];

  const result = getCurrentQuestionForTeam({ round, submissions, teamId: 'team-1' });
  assert.equal(result, null);
});

test('rejects login when selected role does not match the account role', async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => ({
    _id: 'user-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
    passwordHash: await bcrypt.hash('Password123!', 10),
  });

  try {
    await assert.rejects(
      () => loginUser({ email: 'admin@example.com', password: 'Password123!', role: 'PARTICIPANT' }),
      { message: 'Selected role does not match this account' }
    );
  } finally {
    User.findOne = originalFindOne;
  }
});

test('hashes and verifies passwords securely', async () => {
  const password = 'Password123!';
  const hashed = await hashPassword(password);

  assert.notEqual(hashed, password);
  assert.equal(await verifyPassword(password, hashed), true);
  assert.equal(await verifyPassword('WrongPassword123!', hashed), false);
});

test('validates login inputs and sanitizes untrusted values', () => {
  assert.throws(() => validateLoginInput('not-an-email', 'Password123!'), /valid email/i);
  assert.throws(() => validateLoginInput('user@example.com', 'short'), /at least 8 characters/i);

  const sanitized = sanitizeInput(" <script>alert('xss')</script> ");
  assert.equal(sanitized.includes('<'), false);
  assert.equal(sanitized.includes('alert'), true);
  assert.equal(sanitized.trim(), sanitized);
});

test('finds and verifies a user credential without leaking account details', async () => {
  const storedUser = {
    _id: 'user-1',
    email: 'alice@example.com',
    name: 'Alice',
    role: 'PARTICIPANT',
    passwordHash: await hashPassword('Password123!'),
  };

  const userModel = {
    findOne: async (query) => {
      if (query.email === 'alice@example.com') return storedUser;
      return null;
    },
  };

  const foundUser = await findUserByCredential('alice@example.com', userModel);
  assert.ok(foundUser);
  assert.equal(foundUser.email, 'alice@example.com');

  const valid = await verifyCredentials({ email: 'alice@example.com' }, 'Password123!', userModel);
  assert.equal(valid.user.email, 'alice@example.com');

  const invalid = await verifyCredentials({ email: 'alice@example.com' }, 'WrongPassword123!', userModel);
  assert.equal(invalid.error, 'Invalid credentials');
});

test('creates a signed auth token with user payload data', () => {
  const token = generateAuthToken('user-1', { role: 'ADMIN' });

  assert.ok(token);
  assert.match(token, /^[A-Za-z0-9-_.]+$/);
});

test('uses the active event round when no roundId is provided', async () => {
  const currentRound = { _id: 'round-1', questionIds: ['q1', 'q2'] };

  const eventFindOne = Event.findOne;
  const roundFindById = Round.findById;
  const submissionFind = Submission.find;
  const questionFindById = Question.findById;

  Event.findOne = () => ({
    lean: async () => ({ currentRoundId: 'round-1' }),
  });
  Round.findById = () => ({
    lean: async () => currentRound,
  });
  Submission.find = () => ({
    lean: async () => [{ teamId: 'team-1', questionId: 'q1', isCorrect: true }],
  });
  Question.findById = () => ({
    lean: async () => ({ _id: 'q2', title: 'Q2', description: 'Next question', type: 'MCQ', options: ['A', 'B'], correctAnswer: 'B', points: 5, order: 2 }),
  });

  try {
    const result = await questionService.getCurrentQuestionForRound({ teamId: 'team-1' });
    assert.deepEqual(result.title, 'Q2');
  } finally {
    Event.findOne = eventFindOne;
    Round.findById = roundFindById;
    Submission.find = submissionFind;
    Question.findById = questionFindById;
  }
});
