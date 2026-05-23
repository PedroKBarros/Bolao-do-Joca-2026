const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/matches/groupStage', authMiddleware.authMiddleware, matchesController.getGroupStageMatches);

module.exports = router;