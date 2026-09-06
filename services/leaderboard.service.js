const Team = require('../models/Team');

async function getLeaderboard() {
  const teams = await Team.find({}).sort({ score: -1, lastSubmissionAt: 1, createdAt: 1 }).populate('members', 'name email');

  return teams.map((team, index) => ({
    rank: index + 1,
    teamId: team._id,
    name: team.name,
    code: team.code,
    score: team.score,
    lastSubmissionAt: team.lastSubmissionAt,
    members: team.members,
  }));
}

module.exports = { getLeaderboard };
