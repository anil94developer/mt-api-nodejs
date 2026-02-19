const Bid = require('../models/Bid');
const Winner = require('../models/Winner');
const Wallet = require('../models/Wallet');
const { success, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { isMarketOnline } = require('../utils/marketTime');
const db = require('../config/database');

exports.getWinningHistory = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const limit = parseInt(req.query.limit, 10) || 50;
  const fromDate = req.query.from_date || req.query.fromDate;
  const toDate = req.query.to_date || req.query.toDate;
  const winners = await Winner.findByUserId(userId, limit, fromDate, toDate);
  return success(res, { winners }, 'Winning history retrieved successfully.');
});

exports.getBidHistory = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const limit = parseInt(req.query.limit, 10) || 50;
  const fromDate = req.query.from_date || req.query.fromDate;
  const toDate = req.query.to_date || req.query.toDate;
  const bids = await Bid.findByUserId(userId, limit, fromDate, toDate);
  return success(res, { bids }, 'Bid history retrieved successfully.');
});

exports.getBetPlace = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const limit = parseInt(req.query.limit, 10) || 50;
  const marketId = req.query.market_id;
  const bidDate = req.query.bid_date;

  let bids;
  if (marketId && bidDate) {
    bids = await db.query(
      `SELECT b.*, m.market_name FROM bid_table b LEFT JOIN market m ON b.market_id = m.id 
       WHERE b.user_id = ? AND b.market_id = ? AND b.bid_date = ? ORDER BY b.created_at DESC LIMIT ?`,
      [userId, marketId, bidDate, limit]
    );
  } else {
    bids = await Bid.findByUserId(userId, limit);
  }

  return success(res, { bids }, 'Bet list retrieved successfully.');
});

exports.betPlace = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const {
    market_id,
    gtype_id,
    bid_date,
    session,
    open_digit,
    close_digit,
    jodi,
    open_panna,
    close_panna,
    half_sangam_a,
    half_sangam_b,
    full_sangam,
    amount,
  } = req.body;

  if (!market_id || !gtype_id || !amount) {
    return error(res, 'market_id, gtype_id and amount are required.', 422);
  }

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    return error(res, 'Valid amount is required.', 422);
  }

  const hasBid =
    open_digit != null ||
    close_digit != null ||
    jodi != null ||
    open_panna != null ||
    close_panna != null ||
    half_sangam_a != null ||
    half_sangam_b != null ||
    full_sangam != null;

  if (!hasBid) {
    return error(res, 'At least one bid field is required (open_digit, close_digit, jodi, open_panna, close_panna, half_sangam_a, half_sangam_b, full_sangam).', 422);
  }

  const market = await db.queryOne('SELECT * FROM market WHERE id = ?', [market_id]);
  if (!market) return error(res, 'Market not found.', 404);

  if (!isMarketOnline(market.open_time, market.close_time)) {
    return error(res, 'Market is currently closed. Cannot place bet.', 400);
  }

  const wallet = await Wallet.findByUserId(userId);
  if (!wallet || parseFloat(wallet.balance) < amt) {
    return error(res, 'Insufficient wallet balance.', 400);
  }

  const bidId = await Bid.create({
    user_id: userId,
    market_id,
    gtype_id,
    bid_date: bid_date || new Date().toISOString().split('T')[0],
    session: session || null,
    open_digit: open_digit != null ? String(open_digit) : null,
    close_digit: close_digit != null ? String(close_digit) : null,
    jodi: jodi != null ? String(jodi) : null,
    open_panna: open_panna != null ? String(open_panna) : null,
    close_panna: close_panna != null ? String(close_panna) : null,
    half_sangam_a: half_sangam_a != null ? String(half_sangam_a) : null,
    half_sangam_b: half_sangam_b != null ? String(half_sangam_b) : null,
    full_sangam: full_sangam != null ? String(full_sangam) : null,
    amount: amt,
  });

  await db.query(
    'UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE user_id = ?',
    [amt, userId]
  );

  const bid = await db.queryOne('SELECT * FROM bid_table WHERE id = ?', [bidId]);
  return success(res, { bid }, 'Bet placed successfully.', 201);
});

exports.kalyanBetPlace = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.number != null && body.open_digit == null && body.close_digit == null && body.jodi == null) {
    body.open_digit = String(body.number);
  }
  if (body.game_type != null && body.gtype_id == null) {
    body.gtype_id = body.game_type;
  }
  req.body = body;
  return exports.betPlace(req, res);
});
