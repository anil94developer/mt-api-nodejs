const db = require('../config/database');

// Shuffled base36 alphabet so referral codes look random but are reversible (no DB column needed)
const REFERRAL_ALPHABET = '7xk2m9qwp5n4j8f3r6t1vcbhgszyda0euoli';
const REFERRAL_CODE_LEN = 8;

function generateReferralCode(userId) {
  let n = Math.floor(Number(userId));
  if (!Number.isFinite(n) || n <= 0) return '';

  let s = '';
  const base = REFERRAL_ALPHABET.length;

  while (n > 0) {
    s = REFERRAL_ALPHABET[n % base] + s;
    n = Math.floor(n / base);
  }

  return s.padStart(REFERRAL_CODE_LEN, '0'); // safer padding
}

function parseReferralCode(code) {
  if (!code) return null;

  code = code.replace(/^0+/, ''); // remove padding

  const base = REFERRAL_ALPHABET.length;
  let id = 0;

  for (let i = 0; i < code.length; i++) {
    const idx = REFERRAL_ALPHABET.indexOf(code[i].toLowerCase());
    if (idx === -1) return null;
    id = id * base + idx;
  }

  return id || null;
}

/**
 * User model - mirrors Laravel users table (read-only schema assumption)
 * Columns: id, name, number, email?, password, type, status, security_pin?, trusted_devices?, last_full_login?, remember_token?, created_at, updated_at
 */
async function findByNumber(number) {
  return db.queryOne('SELECT * FROM users WHERE number = ?', [number]);
}

async function findById(id) {
  return db.queryOne('SELECT * FROM users WHERE id = ?', [id]);
}

async function findByReferralCode(referralCode) {
  if (!referralCode || String(referralCode).trim() === '') return null;
  const code = String(referralCode).trim();
  try {
    return await db.queryOne('SELECT * FROM users WHERE referral_code = ?', [code]);
  } catch (e) {
    if (e.code === 'ER_BAD_FIELD_ERROR') {
      const id = code.length === REFERRAL_CODE_LEN ? parseReferralCode(code) : null;
      if (id != null) return findById(id);
    }
    throw e;
  }
  return null;
}

async function create({ name, number, passwordHash, type = 'user', status = 'unapproved', referredBy = null }) {
  const pool = await db.getPool();
  const baseParams = [name, number, passwordHash, type, status];
  const sqlWithoutRef = 'INSERT INTO users (name, number, password, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
  if (referredBy != null) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (name, number, password, type, status, referred_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [...baseParams, referredBy]
      );
      const userId = result.insertId;
      try {
        await db.query('UPDATE users SET referral_code = ? WHERE id = ?', [generateReferralCode(userId), userId]);
      } catch (e) { /* referral_code column may not exist */ }
      return userId;
    } catch (e) {
      if (e.code !== 'ER_BAD_FIELD_ERROR') throw e;
      /* referred_by column does not exist, fall through to insert without it */
    }
  }
  const [result] = await pool.execute(sqlWithoutRef, baseParams);
  const userId = result.insertId;
  try {
    await db.query('UPDATE users SET referral_code = ? WHERE id = ?', [generateReferralCode(userId), userId]);
  } catch (e) { /* referral_code column may not exist */ }
  return userId;
}

async function updatePassword(userId, passwordHash) {
  await db.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [passwordHash, userId]);
}

async function updateStatus(userId, status) {
  await db.query('UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?', [status, userId]);
}

async function updateProfile(userId, fields) {
  const allowed = ['name'];
  const set = [];
  const values = [];
  for (const key of allowed) {
    if (fields[key] !== undefined && fields[key] !== null) {
      set.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (set.length === 0) return;
  values.push(userId);
  await db.query(`UPDATE users SET ${set.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
}

/** Exclude password and sensitive fields from user object */
function sanitize(user) {
  if (!user) return null;
  const { password, security_pin, trusted_devices, remember_token, ...rest } = user;
  return rest;
}

module.exports = {
  findByNumber,
  findById,
  findByReferralCode,
  generateReferralCode,
  create,
  updatePassword,
  updateStatus,
  updateProfile,
  sanitize,
};
