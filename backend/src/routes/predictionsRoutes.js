const express = require('express');
const router = express.Router();
const predController = require('../controllers/predictionsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/predictions/groupStage', authMiddleware.authMiddleware, predController.getGroupStageMatchesPredictions);
router.post('/predictions/groupStage/save', authMiddleware.authMiddleware, predController.saveGroupStagePredictData);

module.exports = router;