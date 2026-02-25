const authService = require('../services/authService');
const { success, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  const { name, mobile, password, refer_code } = req.body;
  if (!name || !mobile || !password) {
    return error(res, 'Name, mobile and password are required.', 422);
  }
  const mobileStr = String(mobile).trim();
  if (!/^\d{10}$/.test(mobileStr)) {
    return error(res, 'Mobile must be 10 digits.', 422);
  }
  if (String(password).length < 4) {
    return error(res, 'Password must be at least 4 characters.', 422);
  }
  try {
    const payload = await authService.register({
      name,
      mobile: mobileStr,
      password,
      refer_code: refer_code || req.body.referral_code,
    });
    return success(res, payload, 'User registered successfully. Verify OTP to get approved.', 201);
  } catch (err) {
    if (err.code === 'MOBILE_EXISTS') return error(res, err.message, 422);
    throw err;
  }
});

exports.login = asyncHandler(async (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    return error(res, 'Mobile and password are required.', 422);
  }
  try {
    const payload = await authService.login(String(mobile).trim(), password);
    return success(res, payload, 'Login successful.');
  } catch (err) {
    if (err.code === 'USER_NOT_FOUND') return error(res, err.message, 404);
    if (err.code === 'INVALID_CREDENTIALS') return error(res, err.message, 401);
    throw err;
  }
});

exports.logout = asyncHandler(async (req, res) => {
  // JWT is stateless - client should discard token. Optional: blacklist token if needed.
  return success(res, null, 'Logged out successfully.');
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || otp === undefined || otp === null) {
    return error(res, 'Mobile and OTP are required.', 422);
  }
  const otpStr = String(otp).replace(/\s/g, '');
  if (otpStr.length !== 4) {
    return error(res, 'OTP must be 4 digits.', 422);
  }
  try {
    const payload = await authService.verifyOtp(String(mobile).trim(), otpStr);
    return success(res, payload, 'OTP verified. Account approved.');
  } catch (err) {
    if (err.statusCode === 404) return error(res, err.message, 404);
    if (err.statusCode === 400) return error(res, err.message, 400);
    throw err;
  }
});
