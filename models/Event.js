const { adminConnection } = require('../config/db');
const eventSchema = require('../schemas/event.schema');

module.exports = adminConnection.models.Event || adminConnection.model('Event', eventSchema, 'events');
