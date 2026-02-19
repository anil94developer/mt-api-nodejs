const db = require('../config/database');

async function get() {
  return db.queryOne('SELECT * FROM set_amount LIMIT 1');
}

module.exports = {
  get,
};
