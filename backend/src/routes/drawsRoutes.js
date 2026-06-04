const express = require('express');
const router = express.Router();
const drawsController = require('../controllers/drawsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/draws/solutions/groupStage', authMiddleware.authMiddleware, drawsController.getGroupStageDrawsManualSolutions);
router.post('/draws/solutions/groupStage/save', authMiddleware.authMiddleware, drawsController.saveGroupStageDrawsManualSolutions);
router.post('/draws/solutions/groupStage/setToNotMoreValid', authMiddleware.authMiddleware, drawsController.setToNotMoreValidGroupStageDrawsManualSolutions);
router.post('/draws/solutions/knockoutStage/save', authMiddleware.authMiddleware, drawsController.saveKnockoutStageDrawManualSolution);
router.post('/draws/solutions/knockoutStage/undoSaved', authMiddleware.authMiddleware, drawsController.undoSavedKnockoutStageDrawManualSolution);

module.exports = router;