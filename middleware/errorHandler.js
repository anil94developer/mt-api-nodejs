const { error } = require('../utils/response');

/**
 * Centralized error handling middleware
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An error occurred. Please try again later.';
  return error(res, message, statusCode, process.env.NODE_ENV === 'development' ? { stack: err.stack } : null);
}

module.exports = errorHandler;
