const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportDataController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/export/sweeps/data/userFilled', authMiddleware.authMiddleware, exportController.exportUserFilledInSweeps);
router.get('/export/sweeps/data/allFilled', authMiddleware.authMiddleware, exportController.exportAllFilledInSweeps);

module.exports = router;