const db = require('../config/database');

async function create(userId, amount, payout, number, paymentQr = null, bankId = null) {
  const pool = await db.getPool();
  try {
    const [result] = await pool.execute(
      `INSERT INTO withdrawal (user_id, amount, payout, number, status, withdrawal_date, updated_at, payment_qr, bank_id) 
       VALUES (?, ?, ?, ?, 'pending', NOW(), NOW(), ?, ?)`,
      [userId, amount, payout, number, paymentQr, bankId]
    );
    return result.insertId;
  } catch (e) {
    const [result] = await pool.execute(
      `INSERT INTO withdrawal (user_id, amount, payout, number, status, withdrawal_date, updated_at, payment_qr) 
       VALUES (?, ?, ?, ?, 'pending', NOW(), NOW(), ?)`,
      [userId, amount, payout, number, paymentQr]
    );
    return result.insertId;
  }
}

async function getSetAmount() {
  try {
    return await db.queryOne(
      'SELECT min_withdrawal, max_withdrawal, withdrawal_start_time, withdrawal_end_time FROM set_amount LIMIT 1'
    );
  } catch (e) {
    return null;
  }
}

module.exports = {
  create,
  getSetAmount,
};
