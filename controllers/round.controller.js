const { apiResponse } = require('../utils/apiResponse');
const roundService = require('../services/round.service');

async function getRounds(req, res, next) {
  try {
    const rounds = await roundService.getRounds();
    res.status(200).json(apiResponse(true, rounds));
  } catch (error) {
    next(error);
  }
}

async function createRound(req, res, next) {
  try {
    const round = await roundService.createRound({
      eventId: req.body.eventId,
      name: req.body.name,
      status: req.body.status,
      questionIds: req.body.questionIds || [],
    });

    res.status(201).json(apiResponse(true, round));
  } catch (error) {
    next(error);
  }
}

async function updateRound(req, res, next) {
  try {
    const round = await roundService.updateRound(req.params.id, req.body);
    res.status(200).json(apiResponse(true, round));
  } catch (error) {
    next(error);
  }
}

async function deleteRound(req, res, next) {
  try {
    const result = await roundService.deleteRound(req.params.id);
    res.status(200).json(apiResponse(true, result));
  } catch (error) {
    next(error);
  }
}

async function openRound(req, res, next) {
  try {
    const round = await roundService.openRound(req.params.id);
    res.status(200).json(apiResponse(true, round));
  } catch (error) {
    next(error);
  }
}

async function closeRound(req, res, next) {
  try {
    const round = await roundService.closeRound(req.params.id);
    res.status(200).json(apiResponse(true, round));
  } catch (error) {
    next(error);
  }
}

module.exports = { getRounds, createRound, updateRound, deleteRound, openRound, closeRound };
