const express = require('express');
const router = express.Router();
const predController = require('../controllers/predictionsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/predictions/groupStage', authMiddleware.authMiddleware, predController.getGroupStageMatchesPredictions);
router.post('/predictions/groupStage/save', authMiddleware.authMiddleware, predController.saveGroupStagePredictData);
router.get('/predictions/allKnockoutStages/filledStatus', authMiddleware.authMiddleware, predController.getFilledStatusOfAllKnockoutStages);
router.get('/predictions/knockoutStage/', authMiddleware.authMiddleware, predController.getKnockoutStageMatchesPredictionsFromMatchesNumberInterval);
router.post('/predictions/knockoutStage/save', authMiddleware.authMiddleware, predController.saveKnockoutStagePredictData);
router.post('/predictions/knockoutStage/filledStatus', authMiddleware.authMiddleware, predController.registerKnockoutStageFilledStatus);

module.exports = router;