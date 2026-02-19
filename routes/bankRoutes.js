const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/get-bank', bankController.getBank);
router.post('/update-bank', bankController.updateBank);

module.exports = router;
