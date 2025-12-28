// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Usuario não autenticado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_CHAVE_TOKEN);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

module.exports = {authMiddleware};
