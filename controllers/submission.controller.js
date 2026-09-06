const { apiResponse } = require('../utils/apiResponse');
const submissionService = require('../services/submission.service');

async function createSubmission(req, res, next) {
  try {
    const submission = await submissionService.submitAnswer({
      teamId: req.user.teamId,
      questionId: req.body.questionId,
      answer: req.body.answer,
    });

    res.status(201).json(apiResponse(true, submission));
  } catch (error) {
    next(error);
  }
}

async function getSubmissions(req, res, next) {
  try {
    const submissions = await submissionService.getSubmissions({
      teamId: req.query.teamId,
      questionId: req.query.questionId,
    });

    res.status(200).json(apiResponse(true, submissions));
  } catch (error) {
    next(error);
  }
}

module.exports = { createSubmission, getSubmissions };
