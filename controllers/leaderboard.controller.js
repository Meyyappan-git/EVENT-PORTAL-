const { apiResponse } = require('../utils/apiResponse');
const leaderboardService = require('../services/leaderboard.service');

async function getLeaderboard(req, res, next) {
  try {
    const leaderboard = await leaderboardService.getLeaderboard();
    res.status(200).json(apiResponse(true, leaderboard));
  } catch (error) {
    next(error);
  }
}

module.exports = { getLeaderboard };
