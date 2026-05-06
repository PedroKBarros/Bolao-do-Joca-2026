const express = require('express');
const router = express.Router();
const sweepsController = require('../controllers/sweepsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/sweeps', authMiddleware.authMiddleware, sweepsController.getSweepstakes);
router.get('/sweeps/names', authMiddleware.authMiddleware, sweepsController.getAllSweepstakesNames);
router.post('/sweeps', authMiddleware.authMiddleware, sweepsController.createSweepstake);
router.post('/sweeps/join', authMiddleware.authMiddleware, sweepsController.joinSweepstake);

module.exports = router;
