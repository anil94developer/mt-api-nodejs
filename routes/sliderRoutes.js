const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliderController');

router.get('/get-slider', sliderController.getSlider);

module.exports = router;
