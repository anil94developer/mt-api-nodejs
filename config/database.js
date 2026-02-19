/**
 * Database configuration - connects to the same MySQL used by Laravel
 * Uses env: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE
 */
require('dotenv').config();

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'laravel',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

async function query(sql, params = []) {
  const p = await getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows && rows.length ? rows[0] : null;
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Check if database connection is working
 * @returns {{ connected: boolean, message?: string, error?: string }}
 */
async function checkConnection() {
  try {
    const p = await getPool();
    await p.execute('SELECT 1');
    return { connected: true, message: 'Database connected successfully' };
  } catch (err) {
    return {
      connected: false,
      message: 'Database connection failed',
      error: err.message,
    };
  }
}

module.exports = {
  getPool,
  query,
  queryOne,
  closePool,
  checkConnection,
  dbConfig,
};
