const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.get('/get-game-chart', gameController.getGameChart);
router.get('/get-game-rate', gameController.getGameRate);
router.get('/get-game-type', gameController.getGameType);

module.exports = router;
