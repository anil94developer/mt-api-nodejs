const db = require('../config/database');

/**
 * Market model - fetches from markets table (shared with Laravel)
 * Returns Kalyan market list. Falls back to all markets if type/slug/name columns don't exist.
 */
async function getKalyanMarkets() {
  try {
    const rows = await db.query(
      `SELECT * FROM market
       WHERE type = 'kalyan' OR slug = 'kalyan' OR name LIKE '%kalyan%' OR market_name LIKE '%kalyan%'
       ORDER BY open_time ASC`
    );
    return rows;
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      try {
        return db.query('SELECT * FROM market ORDER BY open_time ASC');
      } catch (e) {
        return db.query('SELECT * FROM market ORDER BY id ASC');
      }
    }
    throw err;
  }
}

module.exports = {
  getKalyanMarkets,
};
