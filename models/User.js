const { adminConnection } = require('../config/db');
const { participantConnection } = require('../config/db');
const userSchema = require('../schemas/user.schema');

const AdminUser = adminConnection.models.User || adminConnection.model('User', userSchema, 'users');
const ParticipantUser = participantConnection.models.User || participantConnection.model('User', userSchema, 'users');

const UserProxy = {
  async findOne(query = {}, ...args) {
    const role = query.role ? String(query.role).toUpperCase() : null;

    if (role === 'ADMIN') {
      return AdminUser.findOne(query, ...args);
    }

    if (role === 'PARTICIPANT') {
      return ParticipantUser.findOne(query, ...args);
    }

    const participantUser = await ParticipantUser.findOne(query, ...args);
    if (participantUser) return participantUser;

    return AdminUser.findOne(query, ...args);
  },

  async findById(id, ...args) {
    const participantUser = await ParticipantUser.findById(id, ...args);
    if (participantUser) return participantUser;

    return AdminUser.findById(id, ...args);
  },

  async create(doc, ...args) {
    const targetModel = String(doc?.role || 'PARTICIPANT').toUpperCase() === 'ADMIN' ? AdminUser : ParticipantUser;
    return targetModel.create(doc, ...args);
  },

  async countDocuments(query = {}, ...args) {
    const role = query.role ? String(query.role).toUpperCase() : null;

    if (role === 'ADMIN') {
      return AdminUser.countDocuments(query, ...args);
    }

    if (role === 'PARTICIPANT') {
      return ParticipantUser.countDocuments(query, ...args);
    }

    const participantCount = await ParticipantUser.countDocuments(query, ...args);
    const adminCount = await AdminUser.countDocuments(query, ...args);
    return participantCount + adminCount;
  },
};

module.exports = UserProxy;
