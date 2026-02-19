const Market = require('../models/Market');
const { success, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { getMarketStatus } = require('../utils/marketTime');

exports.getKalyanMarket = asyncHandler(async (req, res) => {
  const rows = await Market.getKalyanMarkets();
  const markets = rows.map((m) => {
    const { is_online, open_status, close_status } = getMarketStatus(m.open_time, m.close_time);
    return {
      ...m,
      is_online,
      open_status,
      close_status,
    };
  });
  return success(res, { markets }, 'Kalyan market list retrieved successfully.');
});
