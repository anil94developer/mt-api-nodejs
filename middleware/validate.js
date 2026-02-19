const { error } = require('../utils/response');

/**
 * Simple validation helper - validates required fields and returns 422 with message
 */
function validateBody(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter((f) => {
      const v = req.body[f];
      return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
    });
    if (missing.length) {
      return error(res, `Missing or invalid fields: ${missing.join(', ')}`, 422);
    }
    next();
  };
}

module.exports = { validateBody };
