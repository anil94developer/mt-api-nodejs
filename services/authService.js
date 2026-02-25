const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const db = require('../config/database');

const SALT_ROUNDS = 10;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * Hash password compatible with Laravel's bcrypt (same algorithm)
 */
async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Compare plain password with Laravel's stored hash ($2y$ format is compatible with bcrypt)
 */
async function comparePassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

/**
 * Generate JWT for user
 */
function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Register: create user + wallet (welcome bonus from set_amount)
 * Optional refer_code: referral code of the user who referred this signup (links one user to another)
 */
async function register({ name, mobile, password, refer_code }) {
  const existing = await User.findByNumber(mobile);
  if (existing) {
    const err = new Error('Mobile number already registered.');
    err.code = 'MOBILE_EXISTS';
    err.statusCode = 422;
    throw err;
  }
  let referredBy = null;
  if (refer_code && String(refer_code).trim()) {
    const referrer = await User.findByReferralCode(String(refer_code).trim());
    if (referrer) referredBy = referrer.id;
  }
  const passwordHash = await hashPassword(password);
  const userId = await User.create({
    name,
    number: mobile,
    passwordHash,
    type: 'user',
    status: 'unapproved',
    referredBy,
  });
  const bonusRows = await db.query('SELECT welcome_bonus FROM set_amount LIMIT 1');
  const bonus = (bonusRows && bonusRows[0] && bonusRows[0].welcome_bonus != null)
    ? Number(bonusRows[0].welcome_bonus)
    : 0;
  await Wallet.create(userId, bonus);
  const user = await User.findById(userId);
  const wallet = await Wallet.findByUserId(userId);
  const token = generateToken(userId);
  return {
    user: User.sanitize(user),
    userId,
    wallet: wallet || { balance: bonus },
    user_status: user.status,
    access_type: user.status === 'approved' ? 'full' : 'limited',
    token,
  };
}

/**
 * Login: support password or 4-digit PIN for unapproved users
 */
async function login(mobile, password) {
  const user = await User.findByNumber(mobile);
  if (!user) {
    const err = new Error('No account found for this mobile number. Please register first.');
    err.code = 'USER_NOT_FOUND';
    err.statusCode = 404;
    throw err;
  }
  const isPin = String(password).length === 4 && /^\d{4}$/.test(String(password));
  let valid = false;
  if (isPin && user.security_pin === String(password)) {
    valid = true;
  } else if (!isPin) {
    valid = await comparePassword(password, user.password);
  }
  if (!valid) {
    const err = new Error('Invalid password or PIN.');
    err.code = 'INVALID_CREDENTIALS';
    err.statusCode = 401;
    throw err;
  }
  const wallet = await Wallet.findByUserId(user.id);
  const userSanitized = User.sanitize(user);
  const token = generateToken(user.id);
  return {
    user: userSanitized,
    wallet: wallet || { balance: 0 },
    user_status: user.status,
    access_type: user.status === 'approved' ? 'full' : 'limited',
    token,
  };
}

/**
 * Verify OTP: last 4 digits of mobile; then set user status to approved
 */
async function verifyOtp(mobile, otp) {
  const user = await User.findByNumber(mobile);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  const expectedOtp = String(user.number).slice(-4);
  if (String(otp) !== expectedOtp) {
    const err = new Error('Invalid OTP.');
    err.statusCode = 400;
    throw err;
  }
  await User.updateStatus(user.id, 'approved');
  const updated = await User.findById(user.id);
  const token = generateToken(user.id);
  return { user: User.sanitize(updated), token };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  register,
  login,
  verifyOtp,
};
