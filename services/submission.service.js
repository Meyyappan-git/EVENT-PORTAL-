const Submission = require('../models/Submission');
const Team = require('../models/Team');
const Question = require('../models/Question');
const Round = require('../models/Round');
const { getCurrentQuestionForTeam } = require('./unlock.service');
const { getLeaderboard } = require('./leaderboard.service');

async function emitLeaderboardUpdate() {
  if (global.io) {
    const leaderboard = await getLeaderboard();
    global.io.emit('leaderboard:update', leaderboard);
  }
}

async function submitAnswer({ teamId, questionId, answer }) {
  const team = await Team.findById(teamId);
  if (!team) {
    const err = new Error('Team not found');
    err.statusCode = 404;
    throw err;
  }

  const question = await Question.findById(questionId);
  if (!question) {
    const err = new Error('Question not found');
    err.statusCode = 404;
    throw err;
  }

  const round = await Round.findById(question.roundId);
  if (!round) {
    const err = new Error('Round not found');
    err.statusCode = 404;
    throw err;
  }

  const expectedCurrentQuestionId = getCurrentQuestionForTeam({
    teamId,
    round,
    submissions: await Submission.find({ teamId }).lean(),
  });

  if (expectedCurrentQuestionId && expectedCurrentQuestionId !== questionId.toString()) {
    const err = new Error('Question is not the team\'s current unlock target');
    err.statusCode = 400;
    throw err;
  }

  if (!expectedCurrentQuestionId) {
    const err = new Error('No active question remains for this team');
    err.statusCode = 400;
    throw err;
  }

  const existingCorrectSubmission = await Submission.findOne({
    teamId,
    questionId,
    isCorrect: true,
  });

  if (existingCorrectSubmission) {
    const err = new Error('Duplicate correct submission rejected');
    err.statusCode = 409;
    throw err;
  }

  const isCorrect = String(answer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
  const pointsAwarded = isCorrect ? Number(question.points || 0) : 0;

  const submission = await Submission.create({
    teamId,
    questionId,
    answer,
    isCorrect,
    pointsAwarded,
    submittedAt: new Date(),
  });

  if (global.io) {
    global.io.emit('submission-received', submission);
  }

  if (isCorrect) {
    team.score += pointsAwarded;
    team.lastSubmissionAt = submission.submittedAt;
    await team.save();
    await emitLeaderboardUpdate();
  }

  return submission;
}

async function getSubmissions(filters = {}) {
  const query = {};

  if (filters.teamId) query.teamId = filters.teamId;
  if (filters.questionId) query.questionId = filters.questionId;

  const submissions = await Submission.find(query)
    .populate({ path: 'teamId', select: 'name code' })
    .populate({ path: 'questionId', select: 'title' })
    .sort({ submittedAt: -1 });

  return submissions;
}

module.exports = { submitAnswer, getSubmissions };
