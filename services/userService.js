const User = require('../models/User');
const Wallet = require('../models/Wallet');
const db = require('../config/database');
const authService = require('./authService');

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) return null;
  return User.sanitize(user);
}

async function getWallet(userId) {
  return Wallet.findByUserId(userId);
}

async function updateProfile(userId, { name }) {
  await User.updateProfile(userId, { name });
  return User.findById(userId).then(User.sanitize);
}

async function updatePassword(userId, { current_password, new_password, new_password_confirmation }) {
  if (new_password !== new_password_confirmation) {
    const err = new Error('New password and confirmation do not match.');
    err.statusCode = 422;
    throw err;
  }
  if (new_password.length < 6) {
    const err = new Error('New password must be at least 6 characters.');
    err.statusCode = 422;
    throw err;
  }
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  const valid = await authService.comparePassword(current_password, user.password);
  if (!valid) {
    const err = new Error('Current password is incorrect.');
    err.statusCode = 400;
    throw err;
  }
  const hash = await authService.hashPassword(new_password);
  await User.updatePassword(userId, hash);
}

async function getWalletHistory(userId) {
  const userData = await db.queryOne(
    `SELECT u.name, u.number, w.balance 
     FROM users u 
     JOIN wallets w ON u.id = w.user_id 
     WHERE u.id = ?`,
    [userId]
  );
  if (!userData) return null;
  const history = await db.query(
    'SELECT * FROM withdrawal WHERE user_id = ? ORDER BY withdrawal_date DESC',
    [userId]
  );
  return { userData, walletHistory: history };
}

module.exports = {
  getProfile,
  getWallet,
  updateProfile,
  updatePassword,
  getWalletHistory,
};
