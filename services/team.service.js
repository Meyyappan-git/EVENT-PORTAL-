const Team = require('../models/Team');
const User = require('../models/User');

const MAX_TEAM_SIZE = 4;

function generateTeamCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let index = 0; index < 6; index += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

async function createTeam({ name, userId }) {
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (existingUser.teamId) {
    const err = new Error('User already belongs to a team');
    err.statusCode = 400;
    throw err;
  }

  let code = generateTeamCode();
  let collision = await Team.findOne({ code });

  while (collision) {
    code = generateTeamCode();
    collision = await Team.findOne({ code });
  }

  const team = await Team.create({ name, code, members: [userId] });

  existingUser.teamId = team._id;
  await existingUser.save();

  return team;
}

async function joinTeam({ code, userId }) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.teamId) {
    const err = new Error('User already belongs to a team');
    err.statusCode = 400;
    throw err;
  }

  const team = await Team.findOne({ code: String(code).toUpperCase() }).populate('members');
  if (!team) {
    const err = new Error('Team code not found');
    err.statusCode = 404;
    throw err;
  }

  if (team.members.length >= MAX_TEAM_SIZE) {
    const err = new Error('Team is full');
    err.statusCode = 400;
    throw err;
  }

  team.members.push(user._id);
  await team.save();

  user.teamId = team._id;
  await user.save();

  return team;
}

async function getMyTeam(userId) {
  const user = await User.findById(userId).populate({
    path: 'teamId',
    populate: { path: 'members', model: 'User', select: 'name email role' },
  });

  if (!user || !user.teamId) {
    const err = new Error('User is not in a team');
    err.statusCode = 404;
    throw err;
  }

  return user.teamId;
}

module.exports = { createTeam, joinTeam, getMyTeam, MAX_TEAM_SIZE };
