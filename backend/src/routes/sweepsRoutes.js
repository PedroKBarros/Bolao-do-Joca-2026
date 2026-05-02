const express = require('express');
const router = express.Router();
const sweepsController = require('../controllers/sweepsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/sweeps', authMiddleware.authMiddleware, sweepsController.getSweepstakes);
router.post('/sweeps', authMiddleware.authMiddleware, sweepsController.createSweepstake);

module.exports = router;
