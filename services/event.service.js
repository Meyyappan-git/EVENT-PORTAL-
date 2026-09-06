const Event = require('../models/Event');
const Round = require('../models/Round');

async function getEvents() {
  return Event.find({}).sort({ createdAt: -1 });
}

async function createEvent({ name }) {
  return Event.create({ name, status: 'UPCOMING' });
}

async function setCurrentRound({ eventId, roundId }) {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  const round = await Round.findById(roundId);
  if (!round) {
    const err = new Error('Round not found');
    err.statusCode = 404;
    throw err;
  }

  event.currentRoundId = round._id;
  event.status = 'ACTIVE';
  await event.save();

  return event;
}

async function getEventById(eventId) {
  return Event.findById(eventId).populate('currentRoundId');
}

module.exports = { createEvent, setCurrentRound, getEventById };
