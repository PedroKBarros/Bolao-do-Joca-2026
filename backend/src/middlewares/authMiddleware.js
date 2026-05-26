const envFileHandle = require('../config/env');
// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const cookieName = envFileHandle.isProductionEnv ? "__Host-auth_token" : "auth_token";
  const token = req.cookies[cookieName];
  console.log("Cookies recebidos:", req.cookies);


   // Cenário 1: usuário não estava autenticado antes, por isso não há token:
  if (!token) {
    return res.status(401).json({ code: 'NO_TOKEN', message: 'Usuario não autenticado' });
  }

  try {
    // Cenário 2: usuário possui token e ele é válido:
    const payload = jwt.verify(token, envFileHandle.jwtSecret);
    req.userId = payload.id;
    return next();
  } catch (err) {
    // Cenário 3: usuário possui token, mas ele está expirado:
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 'TOKEN_EXPIRED',
        message: 'Sessão expirada',
        errorMsg: err.message
      });
    }

    // Cenário 4: usuário possui token, mas ele é inválido/corrompido:
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'Token inválido',
        errorMsg: err.message
      });
    }

    // Cenário 5: erro inesperado:
    return res.status(401).json({
      code: 'AUTH_ERROR',
      message: 'Erro de autenticação',
      errorMsg: err.message
    });
  }
}

module.exports = {authMiddleware};
