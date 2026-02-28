const envFileHandle = require('../config/env');
// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.cookies.auth_token;
  console.log("Cookies recebidos:", req.cookies);

  if (!token) {
    return res.status(401).json({ message: 'Usuario não autenticado' });
  }

  try {
    const payload = jwt.verify(token, envFileHandle.jwtSecret);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

module.exports = {authMiddleware};
