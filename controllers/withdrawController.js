const db = require('../config/database');
const { success, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

exports.getWithdrawList = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const limit = parseInt(req.query.limit, 10) || 50;
  const withdrawals = await db.query(
    'SELECT * FROM withdrawal WHERE user_id = ? ORDER BY withdrawal_date DESC LIMIT ?',
    [userId, limit]
  );
  return success(res, { withdrawals }, 'Withdrawal list retrieved successfully.');
});
