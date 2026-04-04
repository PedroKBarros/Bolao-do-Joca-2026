const express = require('express');
const router = express.Router();
const meController = require('../controllers/meController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/me', authMiddleware.authMiddleware, meController.getLoggedInUserData);

module.exports = router;
