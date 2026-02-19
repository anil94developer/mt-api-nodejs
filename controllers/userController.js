const userService = require('../services/userService');
const { success, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const profile = await userService.getProfile(userId);
  if (!profile) return error(res, 'User not found.', 404);
  return success(res, profile, 'Profile retrieved successfully.');
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { name } = req.body;
  if (!name || String(name).trim() === '') {
    return error(res, 'Name is required.', 422);
  }
  const updated = await userService.updateProfile(userId, { name: String(name).trim() });
  return success(res, updated, 'Profile updated successfully.');
});

exports.updatePassword = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { current_password, new_password, new_password_confirmation } = req.body;
  if (!current_password || !new_password || !new_password_confirmation) {
    return error(res, 'Current password, new password and confirmation are required.', 422);
  }
  await userService.updatePassword(userId, {
    current_password,
    new_password,
    new_password_confirmation,
  });
  return success(res, null, 'Password updated successfully.');
});

exports.getUserInfo = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const profile = await userService.getProfile(userId);
  if (!profile) return error(res, 'User not found.', 404);
  return success(res, profile, 'User info retrieved successfully.');
});

exports.getWallet = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const wallet = await userService.getWallet(userId);
  if (!wallet) return error(res, 'Wallet not found.', 404);
  return success(res, wallet, 'Wallet retrieved successfully.');
});

exports.getWalletHistory = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const result = await userService.getWalletHistory(userId);
  if (!result) return error(res, 'User not found.', 404);
  return success(res, result, 'Wallet history retrieved successfully.');
});
