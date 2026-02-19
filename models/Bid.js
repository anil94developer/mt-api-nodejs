const db = require('../config/database');

async function findByUserId(userId, limit = 50, fromDate = null, toDate = null) {
  let sql = `SELECT b.*, m.market_name FROM bid_table b LEFT JOIN market m ON b.market_id = m.id WHERE b.user_id = ?`;
  const params = [userId];

  if (fromDate) {
    sql += ` AND b.bid_date >= ?`;
    params.push(fromDate);
  }
  if (toDate) {
    sql += ` AND b.bid_date <= ?`;
    params.push(toDate);
  }

  sql += ` ORDER BY b.created_at DESC LIMIT ?`;
  params.push(limit);

  return db.query(sql, params);
}

async function create(data) {
  const pool = await db.getPool();
  const bidDate = data.bid_date || data.bidDate || new Date().toISOString().split('T')[0];
  const [result] = await pool.execute(
    `INSERT INTO bid_table (user_id, market_id, gtype_id, bid_date, session, open_digit, close_digit, jodi, open_panna, close_panna, half_sangam_a, half_sangam_b, full_sangam, amount, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      data.user_id,
      data.market_id,
      data.gtype_id,
      bidDate,
      data.session || null,
      data.open_digit || null,
      data.close_digit || null,
      data.jodi || null,
      data.open_panna || null,
      data.close_panna || null,
      data.half_sangam_a || null,
      data.half_sangam_b || null,
      data.full_sangam || null,
      data.amount,
    ]
  );
  return result.insertId;
}

module.exports = {
  findByUserId,
  create,
};
