const db = require('../config/database');

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

async function create({ name, number, passwordHash, type = 'user', status = 'unapproved' }) {
  const pool = await db.getPool();
  const [result] = await pool.execute(
    'INSERT INTO users (name, number, password, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
    [name, number, passwordHash, type, status]
  );
  return result.insertId;
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
  create,
  updatePassword,
  updateStatus,
  updateProfile,
  sanitize,
};
