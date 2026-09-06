const { apiResponse } = require('../utils/apiResponse');
const questionService = require('../services/question.service');

async function createQuestion(req, res, next) {
  try {
    const question = await questionService.createQuestion({
      roundId: req.body.roundId,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      options: req.body.options || [],
      correctAnswer: req.body.correctAnswer,
      points: req.body.points,
      order: req.body.order,
    });

    res.status(201).json(apiResponse(true, question));
  } catch (error) {
    next(error);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const question = await questionService.updateQuestion(req.params.id, req.body);
    res.status(200).json(apiResponse(true, question));
  } catch (error) {
    next(error);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const result = await questionService.deleteQuestion(req.params.id);
    res.status(200).json(apiResponse(true, result));
  } catch (error) {
    next(error);
  }
}

async function getCurrentQuestion(req, res, next) {
  try {
    const currentQuestion = await questionService.getCurrentQuestionForRound({
      teamId: req.user.teamId,
      roundId: req.query.roundId,
    });

    res.status(200).json(apiResponse(true, currentQuestion));
  } catch (error) {
    next(error);
  }
}

module.exports = { createQuestion, updateQuestion, deleteQuestion, getCurrentQuestion };
