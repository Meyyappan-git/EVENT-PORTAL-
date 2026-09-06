const { adminConnection } = require('../config/db');
const userSchema = require('../schemas/user.schema');
const eventSchema = require('../schemas/event.schema');
const roundSchema = require('../schemas/round.schema');
const questionSchema = require('../schemas/question.schema');

const User = adminConnection.models.User || adminConnection.model('User', userSchema, 'users');
const Event = adminConnection.models.Event || adminConnection.model('Event', eventSchema, 'events');
const Round = adminConnection.models.Round || adminConnection.model('Round', roundSchema, 'rounds');
const Question = adminConnection.models.Question || adminConnection.model('Question', questionSchema, 'questions');

module.exports = { User, Event, Round, Question };
