const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const marketRoutes = require('./marketRoutes');
const walletRoutes = require('./walletRoutes');
const bidRoutes = require('./bidRoutes');
const gameRoutes = require('./gameRoutes');
const withdrawRoutes = require('./withdrawRoutes');
const sliderRoutes = require('./sliderRoutes');
const bankRoutes = require('./bankRoutes');
const settingsRoutes = require('./settingsRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/market', marketRoutes);
router.use('/wallet', walletRoutes);
router.use('/bid', bidRoutes);
router.use('/game', gameRoutes);
router.use('/withdraw', withdrawRoutes);
router.use('/slider', sliderRoutes);
router.use('/bank', bankRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
