const db = require('../config/database');

async function getByMarketId(marketId, limit = 30) {
  return db.query(
    `SELECT * FROM market_results WHERE market_id = ? ORDER BY result_date DESC LIMIT ?`,
    [marketId, limit]
  );
}

module.exports = {
  getByMarketId,
};
