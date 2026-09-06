const { apiResponse } = require('../utils/apiResponse');
const teamService = require('../services/team.service');

async function createTeam(req, res, next) {
  try {
    const team = await teamService.createTeam({
      name: req.body.name,
      userId: req.user._id,
    });

    res.status(201).json(apiResponse(true, team));
  } catch (error) {
    next(error);
  }
}

async function joinTeam(req, res, next) {
  try {
    const team = await teamService.joinTeam({
      code: req.body.code,
      userId: req.user._id,
    });

    res.status(200).json(apiResponse(true, team));
  } catch (error) {
    next(error);
  }
}

async function getMyTeam(req, res, next) {
  try {
    const team = await teamService.getMyTeam(req.user._id);
    res.status(200).json(apiResponse(true, team));
  } catch (error) {
    next(error);
  }
}

module.exports = { createTeam, joinTeam, getMyTeam };
