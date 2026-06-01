const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/matches/groupStage', authMiddleware.authMiddleware, matchesController.getGroupStageMatches);
router.get('/matches/knockoutStage/matchesRules', authMiddleware.authMiddleware, matchesController.getKnockoutStageMatchesRules);
router.post('/matches/knockoutStage/defineMatches', authMiddleware.authMiddleware, matchesController.defineKnockoutStageMatches);
router.get('/matches/allKnockoutStage/matchesRules', authMiddleware.authMiddleware, matchesController.getAllKnockoutStagesMatchesRules);

module.exports = router;