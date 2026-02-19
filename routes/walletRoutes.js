const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/add-amount', walletController.addAmount);
router.post('/send-withdraw', walletController.sendWithdraw);
router.get('/get-deposit-history', walletController.getDepositHistory);
router.get('/get-wallet-history', walletController.getWalletHistory);

module.exports = router;
