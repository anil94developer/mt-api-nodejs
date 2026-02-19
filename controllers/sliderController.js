const Slider = require('../models/Slider');
const { success, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

exports.getSlider = asyncHandler(async (req, res) => {
  const sliders = await Slider.getAll();
  return success(res, { sliders }, 'Sliders retrieved successfully.');
});
