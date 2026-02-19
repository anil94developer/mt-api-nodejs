const db = require('../config/database');

async function findByUserId(userId) {
  return db.queryOne('SELECT * FROM wallets WHERE user_id = ?', [userId]);
}

async function create(userId, balance = 0) {
  await db.query(
    'INSERT INTO wallets (user_id, balance, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
    [userId, balance]
  );
}

async function addBalance(userId, amount) {
  await db.query(
    'UPDATE wallets SET balance = balance + ?, updated_at = NOW() WHERE user_id = ?',
    [amount, userId]
  );
  return findByUserId(userId);
}

async function deductBalance(userId, amount) {
  await db.query(
    'UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE user_id = ?',
    [amount, userId]
  );
  return findByUserId(userId);
}

module.exports = {
  findByUserId,
  create,
  addBalance,
  deductBalance,
};
