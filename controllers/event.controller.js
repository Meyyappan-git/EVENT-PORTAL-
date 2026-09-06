const { apiResponse } = require('../utils/apiResponse');
const eventService = require('../services/event.service');

async function getEvents(req, res, next) {
  try {
    const events = await eventService.getEvents();
    res.status(200).json(apiResponse(true, events));
  } catch (error) {
    next(error);
  }
}

async function createEvent(req, res, next) {
  try {
    const event = await eventService.createEvent({ name: req.body.name });
    res.status(201).json(apiResponse(true, event));
  } catch (error) {
    next(error);
  }
}

async function setCurrentRound(req, res, next) {
  try {
    const event = await eventService.setCurrentRound({ eventId: req.params.id, roundId: req.body.roundId });
    res.status(200).json(apiResponse(true, event));
  } catch (error) {
    next(error);
  }
}

async function getEvent(req, res, next) {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json(apiResponse(true, event));
  } catch (error) {
    next(error);
  }
}

module.exports = { getEvents, createEvent, setCurrentRound, getEvent };
