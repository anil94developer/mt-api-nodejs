const db = require('../config/database');

async function findByUserId(userId, limit = 50, fromDate = null, toDate = null) {
  let sql = `SELECT w.*, m.market_name 
     FROM winners w 
     LEFT JOIN market m ON w.market_id = m.id 
     WHERE w.user_id = ?`;
  const params = [userId];

  if (fromDate) {
    sql += ` AND w.resultDate >= ?`;
    params.push(fromDate);
  }
  if (toDate) {
    sql += ` AND w.resultDate <= ?`;
    params.push(toDate);
  }

  sql += ` ORDER BY w.created_at DESC LIMIT ?`;
  params.push(limit);

  return db.query(sql, params);
}

module.exports = {
  findByUserId,
};
