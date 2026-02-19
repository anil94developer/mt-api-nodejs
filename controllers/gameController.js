const GameChart = require('../models/GameChart');
const GameRate = require('../models/GameRate');
const Gtype = require('../models/Gtype');
const { success, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

exports.getGameChart = asyncHandler(async (req, res) => {
  const marketId = req.query.market_id || req.params.market_id;
  if (!marketId) {
    return error(res, 'market_id is required.', 422);
  }
  const limit = parseInt(req.query.limit, 10) || 30;
  const charts = await GameChart.getByMarketId(marketId, limit);
  return success(res, { charts }, 'Game chart retrieved successfully.');
});

exports.getGameRate = asyncHandler(async (req, res) => {
  const marketId = req.query.market_id || req.params.market_id;
  const rates = await GameRate.getAll(marketId || null);
  return success(res, { rates }, 'Game rates retrieved successfully.');
});

exports.getGameType = asyncHandler(async (req, res) => {
  const gameTypes = await Gtype.getAll();
  return success(res, { game_type: gameTypes }, 'Game types retrieved successfully.');
});
