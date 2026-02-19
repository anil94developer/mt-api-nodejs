const db = require('../config/database');

async function create(userId, amount, paymentMethod = 'manual', transactionId = null, merchantId = null) {
  const pool = await db.getPool();
  const txnId = transactionId || null;
  const [result] = await pool.execute(
    `INSERT INTO deposite_table (user_id, deposit_amount, deposit_by, trnxnId, marchantId, deposite_status, transaction_id, deposite_date, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, 'completed', ?, NOW(), NOW(), NOW())`,
    [userId, amount, paymentMethod, txnId, merchantId || null, txnId]
  );
  return result.insertId;
}

async function findByUserId(userId, limit = 50) {
  return db.query(
    `SELECT * FROM deposite_table WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
}

module.exports = {
  create,
  findByUserId,
};
