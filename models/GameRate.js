const db = require('../config/database');

async function getAll() {
  return db.query('SELECT * FROM game_rates ORDER BY id ASC');
}

module.exports = {
  getAll,
};
