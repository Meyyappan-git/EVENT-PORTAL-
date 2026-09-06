const Event = require('../models/Event');
const Round = require('../models/Round');

async function getRounds() {
  return Round.find({}).sort({ createdAt: -1 });
}

async function createRound({ eventId, name, status = 'LOCKED', questionIds = [] }) {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  return Round.create({ eventId, name, status, questionIds });
}

async function updateRound(roundId, payload) {
  const round = await Round.findById(roundId);
  if (!round) {
    const err = new Error('Round not found');
    err.statusCode = 404;
    throw err;
  }

  Object.assign(round, payload);
  await round.save();
  return round;
}

async function deleteRound(roundId) {
  const round = await Round.findById(roundId);
  if (!round) {
    const err = new Error('Round not found');
    err.statusCode = 404;
    throw err;
  }

  await Round.findByIdAndDelete(roundId);
  return { deleted: true };
}

async function openRound(roundId) {
  const round = await Round.findById(roundId);
  if (!round) {
    const err = new Error('Round not found');
    err.statusCode = 404;
    throw err;
  }

  round.status = 'OPEN';
  await round.save();
  return round;
}

async function closeRound(roundId) {
  const round = await Round.findById(roundId);
  if (!round) {
    const err = new Error('Round not found');
    err.statusCode = 404;
    throw err;
  }

  round.status = 'CLOSED';
  await round.save();
  return round;
}

module.exports = { createRound, updateRound, deleteRound, openRound, closeRound };
