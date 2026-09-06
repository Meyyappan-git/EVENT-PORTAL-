const jwt = require('jsonwebtoken');
const { apiResponse } = require('../utils/apiResponse');
const { JWT_SECRET } = require('../config/env');
const { User: AdminUser } = require('../models/admin');
const { User: ParticipantUser } = require('../models/participant');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(apiResponse(false, null, 'Authentication token missing or invalid'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const UserModel = decoded.role === 'ADMIN' ? AdminUser : ParticipantUser;
    const user = await UserModel.findById(decoded.userId).lean();

    if (!user) {
      return res.status(401).json(apiResponse(false, null, 'User not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    const err = new Error('Invalid or expired token');
    err.statusCode = 401;
    return next(err);
  }
}

module.exports = authMiddleware;
