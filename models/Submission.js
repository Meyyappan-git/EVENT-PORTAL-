const { participantConnection } = require('../config/db');
const submissionSchema = require('../schemas/submission.schema');

module.exports = participantConnection.models.Submission || participantConnection.model('Submission', submissionSchema, 'submissions');
