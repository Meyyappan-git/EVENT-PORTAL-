const { apiResponse } = require('../utils/apiResponse');

function errorMiddleware(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json(apiResponse(false, null, message));
}

module.exports = errorMiddleware;
