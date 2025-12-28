const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');
const registerMiddleware = require('../middlewares/registerMiddleware');

router.post('/register', registerMiddleware.registerMiddleware, registerController.register);

module.exports = router;
