const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/update-password', userController.updatePassword);
router.get('/user-info', userController.getUserInfo);
router.get('/wallet', userController.getWallet);
router.get('/wallet-history', userController.getWalletHistory);

module.exports = router;
