const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

router.get('/get-kalyan-market', marketController.getKalyanMarket);

module.exports = router;
