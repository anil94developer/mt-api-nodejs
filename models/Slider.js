const db = require('../config/database');

async function getAll() {
  return db.query(
    `SELECT * FROM slider_images WHERE status = 'active' OR status = 1 ORDER BY display_order ASC, id ASC`
  );
}

module.exports = {
  getAll,
};
