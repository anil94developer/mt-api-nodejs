const Wallet = require('../models/Wallet');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Bank = require('../models/Bank');
const AppSetting = require('../models/AppSetting');
const db = require('../config/database');
const { success, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { isMarketOnline } = require('../utils/marketTime');

exports.addAmount = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return error(res, 'Valid amount is required.', 422);
  }

  const amt = parseFloat(amount);
  const wallet = await Wallet.findByUserId(userId);
  if (!wallet) return error(res, 'Wallet not found.', 404);

  await Deposit.create(
    userId,
    amt,
    req.body.deposit_by || req.body.payment_method || 'manual',
    req.body.transaction_id || req.body.trnxnId,
    req.body.marchantId || req.body.merchant_id
  );
  const updated = await Wallet.addBalance(userId, amt);

  // Referral commission: if this user was referred, credit referrer's wallet by referred_commission %
  let referrerCommission = 0;
  try {
    const userRow = await db.queryOne('SELECT referred_by FROM users WHERE id = ?', [userId]);
    const referrerId = userRow && userRow.referred_by != null && userRow.referred_by !== '' && Number(userRow.referred_by) > 0 ? Number(userRow.referred_by) : null;
    if (referrerId) {
      const admin = await AppSetting.get();
      const pct = parseFloat(admin && admin.referred_commission) || 0;
      if (pct > 0) {
        referrerCommission = (amt * pct) / 100;
        await Wallet.addBalance(referrerId, referrerCommission);
      }
    }
  } catch (e) {
    // referred_by or referred_commission column may not exist; ignore
  }

  return success(
    res,
    {
      wallet: updated,
      amount_added: amt,
      ...(referrerCommission > 0 && { referrer_commission_added: referrerCommission }),
    },
    'Amount added to wallet successfully.',
    201
  );
});

exports.getDepositHistory = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const limit = parseInt(req.query.limit, 10) || 50;
  const deposits = await Deposit.findByUserId(userId, limit);
  return success(res, { deposits }, 'Deposit history retrieved successfully.');
});

exports.getWalletHistory = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const db = require('../config/database');
  const userData = await db.queryOne(
    `SELECT u.name, u.number, w.balance FROM users u JOIN wallets w ON u.id = w.user_id WHERE u.id = ?`,
    [userId]
  );
  if (!userData) return error(res, 'User not found.', 404);

  let deposits = [];
  let withdrawals = [];
  let bids = [];

  try {
    deposits = await db.query('SELECT * FROM deposite_table WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
  } catch (e) { /* deposite_table may not exist */ }

  try {
    withdrawals = await db.query('SELECT * FROM withdrawal WHERE user_id = ? ORDER BY withdrawal_date DESC LIMIT 50', [userId]);
  } catch (e) { /* withdrawal table may not exist */ }

  try {
    bids = await db.query('SELECT * FROM bid_table WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
  } catch (e) { /* bid_table may not exist */ }

  const history = [
    ...deposits.map((d) => ({ ...d, type: 'deposit', date: d.created_at })),
    ...withdrawals.map((w) => ({ ...w, type: 'withdrawal', date: w.withdrawal_date })),
    ...bids.map((b) => ({ ...b, type: 'bid', date: b.created_at })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return success(res, {
    userData,
    history,
  }, 'Wallet history retrieved successfully.');
});

exports.sendWithdraw = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { amount, bankId } = req.body;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return error(res, 'Valid amount is required.', 422);
  }
  if (!bankId) {
    return error(res, 'bankId is required.', 422);
  }

  const bank = await Bank.findByIdAndUserId(bankId, userId);
  if (!bank) return error(res, 'Bank not found or does not belong to you.', 404);

  const amt = parseFloat(amount);
  const wallet = await Wallet.findByUserId(userId);
  if (!wallet) return error(res, 'Wallet not found.', 404);

  const balance = parseFloat(wallet.balance);
  if (balance < amt) {
    return error(res, 'Insufficient wallet balance.', 400);
  }

  const limits = await Withdrawal.getSetAmount();
  if (limits) {
    const minWithdrawal = parseFloat(limits.min_withdrawal) || 0;
    const maxWithdrawal = parseFloat(limits.max_withdrawal) || Infinity;
    if (amt < minWithdrawal) {
      return error(res, `Minimum withdrawal amount is ${minWithdrawal}.`, 422);
    }
    if (amt > maxWithdrawal) {
      return error(res, `Maximum withdrawal amount is ${maxWithdrawal}.`, 422);
    }

    const startTime = limits.withdrawal_start_time;
    const endTime = limits.withdrawal_end_time;
    if (startTime && endTime && !isMarketOnline(startTime, endTime)) {
      return error(res, 'Withdrawal is only allowed between the configured time window.', 400);
    }
  }

  const withdrawalId = await Withdrawal.create(
    userId,
    amt,
    'bank',
    bank.account_number || '',
    null,
    bankId
  );

  await Wallet.deductBalance(userId, amt);

  const withdrawal = await require('../config/database').queryOne(
    'SELECT * FROM withdrawal WHERE id = ?',
    [withdrawalId]
  );

  return success(
    res,
    { withdrawal, bank },
    'Withdrawal request submitted successfully.',
    201
  );
});
