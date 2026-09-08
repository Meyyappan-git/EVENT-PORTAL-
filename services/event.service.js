const Event = require('../models/Event');
const Round = require('../models/Round');

async function getEvents() {
  return Event.find({}).sort({ createdAt: -1 });
}

async function createEvent({ name }) {
  const event = await Event.create({ name, status: 'UPCOMING' });
  global.io?.emit('portal-updated', { type: 'event', action: 'created', eventId: event._id });
  return event;
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
  global.io?.emit('portal-updated', { type: 'event', action: 'updated', eventId: event._id, roundId });

  return event;
}

async function getEventById(eventId) {
  return Event.findById(eventId).populate('currentRoundId');
}

module.exports = { getEvents, createEvent, setCurrentRound, getEventById };
