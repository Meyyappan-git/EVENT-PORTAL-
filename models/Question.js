const { adminConnection } = require('../config/db');
const questionSchema = require('../schemas/question.schema');

module.exports = adminConnection.models.Question || adminConnection.model('Question', questionSchema, 'questions');
