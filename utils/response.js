/**
 * Centralized API response format: { status, message, data }
 */
function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    status: true,
    message: message,
    data: data,
  });
}

function error(res, message = 'An error occurred', statusCode = 500, data = null) {
  return res.status(statusCode).json({
    status: false,
    message: message,
    data: data,
  });
}

module.exports = {
  success,
  error,
};
