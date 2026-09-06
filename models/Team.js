const { participantConnection } = require('../config/db');
const teamSchema = require('../schemas/team.schema');

module.exports = participantConnection.models.Team || participantConnection.model('Team', teamSchema, 'teams');
