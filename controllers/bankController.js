const Bank = require('../models/Bank');
const { success, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

exports.updateBank = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { bank_name, account_number, ifsc_code, account_holder, holder_name, account_type, branch_name } = req.body;

  if (!bank_name || !account_number || !ifsc_code) {
    return error(res, 'bank_name, account_number and ifsc_code are required.', 422);
  }

  const holder = holder_name || account_holder || '';
  if (!holder) {
    return error(res, 'account_holder or holder_name is required.', 422);
  }

  const bank = await Bank.upsert(userId, {
    bank_name: String(bank_name).trim(),
    account_number: String(account_number).trim(),
    ifsc_code: String(ifsc_code).trim().toUpperCase(),
    holder_name: String(holder).trim(),
    account_holder: String(holder).trim(),
    account_type: String(account_type || '').trim(),
    branch_name: String(branch_name || '').trim(),
  });

  return success(res, { bank }, 'Bank details updated successfully.');
});

exports.getBank = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const bank = await Bank.findByUserId(userId);
  return success(res, { bank }, 'Bank details retrieved successfully.');
});
