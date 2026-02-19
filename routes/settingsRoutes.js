const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/amount-setting', settingsController.getAmountSetting);
router.get('/app-setting', settingsController.getAppSetting);

module.exports = router;
