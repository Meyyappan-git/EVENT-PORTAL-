const { adminConnection } = require('../config/db');
const roundSchema = require('../schemas/round.schema');

module.exports = adminConnection.models.Round || adminConnection.model('Round', roundSchema, 'rounds');
