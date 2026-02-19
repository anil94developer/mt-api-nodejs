const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/get-bid-history', bidController.getBidHistory);
router.get('/get-winning-history', bidController.getWinningHistory);
router.get('/get-bet-place', bidController.getBetPlace);
router.post('/bet-place', bidController.betPlace);
router.post('/kalyan-bet-place', bidController.kalyanBetPlace);

module.exports = router;
