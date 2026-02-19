const db = require('../config/database');

async function findByUserId(userId) {
  try {
    return await db.queryOne('SELECT * FROM bank WHERE `user-id` = ?', [userId]);
  } catch (e) {
    return db.queryOne('SELECT * FROM bank WHERE user_id = ?', [userId]);
  }
}

async function findByIdAndUserId(bankId, userId) {
  try {
    return await db.queryOne('SELECT * FROM bank WHERE id = ? AND `user-id` = ?', [bankId, userId]);
  } catch (e) {
    return db.queryOne('SELECT * FROM bank WHERE id = ? AND user_id = ?', [bankId, userId]);
  }
}

async function upsert(userId, data) {
  const { bank_name, holder_name, branch_name, account_number, ifsc_code, account_type } = data;
  const holder = holder_name || data.account_holder || '';
  const branch = branch_name || '';
  const acctType = account_type || '';

  const existing = await findByUserId(userId);
  const params = [bank_name, holder, branch, account_number, ifsc_code, acctType, userId];

  try {
    if (existing) {
      await db.query(
        `UPDATE bank SET bank_name = ?, holder_name = ?, branch_name = ?, account_number = ?, ifsc_code = ?, account_type = ? WHERE \`user-id\` = ?`,
        params
      );
    } else {
      await db.query(
        `INSERT INTO bank (\`user-id\`, bank_name, holder_name, branch_name, account_number, ifsc_code, account_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, bank_name, holder, branch, account_number, ifsc_code, acctType]
      );
    }
  } catch (e) {
    if (existing) {
      await db.query(
        `UPDATE bank SET bank_name = ?, holder_name = ?, branch_name = ?, account_number = ?, ifsc_code = ?, account_type = ? WHERE user_id = ?`,
        params
      );
    } else {
      await db.query(
        `INSERT INTO bank (user_id, bank_name, holder_name, branch_name, account_number, ifsc_code, account_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, bank_name, holder, branch, account_number, ifsc_code, acctType]
      );
    }
  }
  return findByUserId(userId);
}

module.exports = {
  findByUserId,
  findByIdAndUserId,
  upsert,
};
