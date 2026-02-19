const express = require('express');
const router = express.Router();
const withdrawController = require('../controllers/withdrawController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/get-withdraw-list', withdrawController.getWithdrawList);

module.exports = router;
