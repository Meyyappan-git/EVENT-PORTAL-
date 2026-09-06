const { apiResponse } = require('../utils/apiResponse');

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(apiResponse(false, null, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(apiResponse(false, null, 'Forbidden: insufficient role permissions'));
    }

    next();
  };
}

module.exports = { requireRole };
