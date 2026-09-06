const { participantConnection } = require('../config/db');
const userSchema = require('../schemas/user.schema');
const teamSchema = require('../schemas/team.schema');
const submissionSchema = require('../schemas/submission.schema');

const User = participantConnection.models.User || participantConnection.model('User', userSchema, 'users');
const Team = participantConnection.models.Team || participantConnection.model('Team', teamSchema, 'teams');
const Submission = participantConnection.models.Submission || participantConnection.model('Submission', submissionSchema, 'submissions');

module.exports = { User, Team, Submission };
