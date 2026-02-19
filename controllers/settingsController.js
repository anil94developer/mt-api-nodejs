const SetAmount = require('../models/SetAmount');
const AppSetting = require('../models/AppSetting');
const { success } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

exports.getAmountSetting = asyncHandler(async (req, res) => {
  const settings = await SetAmount.get();
  return success(res, { amount_setting: settings }, 'Amount settings retrieved successfully.');
});

exports.getAppSetting = asyncHandler(async (req, res) => {
  const settings = await AppSetting.get();
  return success(res, { app_setting: settings }, 'App settings retrieved successfully.');
});
