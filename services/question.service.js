const Question = require('../models/Question');
const Round = require('../models/Round');
const Event = require('../models/Event');
const Submission = require('../models/Submission');

async function createQuestion({ roundId, title, description, type, options = [], correctAnswer, points, order }) {
  const round = await Round.findById(roundId);
  if (!round) {
    const err = new Error('Round not found');
    err.statusCode = 404;
    throw err;
  }

  const question = await Question.create({
    roundId,
    title,
    description,
    type,
    options: type === 'MCQ' ? options : [],
    correctAnswer,
    points,
    order,
  });

  round.questionIds.push(question._id);
  await round.save();

  return question;
}

async function updateQuestion(questionId, payload) {
  const question = await Question.findById(questionId);
  if (!question) {
    const err = new Error('Question not found');
    err.statusCode = 404;
    throw err;
  }

  Object.assign(question, payload);
  if (payload.type === 'RIDDLE') {
    question.options = [];
  }

  await question.save();
  return question;
}

async function deleteQuestion(questionId) {
  const question = await Question.findById(questionId);
  if (!question) {
    const err = new Error('Question not found');
    err.statusCode = 404;
    throw err;
  }

  const round = await Round.findById(question.roundId);
  if (round) {
    round.questionIds = round.questionIds.filter((id) => id.toString() !== questionId.toString());
    await round.save();
  }

  await Question.findByIdAndDelete(questionId);
  return { deleted: true };
}

async function getCurrentQuestionForRound({ teamId, roundId }) {
  let round;

  if (roundId) {
    round = await Round.findById(roundId).lean();
  } else {
    const activeEvent = await Event.findOne({ status: 'ACTIVE' }).lean();
    if (!activeEvent || !activeEvent.currentRoundId) {
      const err = new Error('Round not found');
      err.statusCode = 404;
      throw err;
    }
    round = await Round.findById(activeEvent.currentRoundId).lean();
  }

  if (!round) {
    const err = new Error('Round not found');
    err.statusCode = 404;
    throw err;
  }

  const submissions = await Submission.find({ teamId }).lean();
  const currentQuestionId = require('./unlock.service').getCurrentQuestionForTeam({
    teamId,
    round,
    submissions,
  });

  if (!currentQuestionId) {
    return null;
  }

  return Question.findById(currentQuestionId).lean();
}

module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getCurrentQuestionForRound,
};
