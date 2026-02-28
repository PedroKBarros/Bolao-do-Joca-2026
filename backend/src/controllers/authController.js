const authService = require('../services/authService');
const envFileHandle = require('../config/env');

async function login(req, res) {
  const { whatsappNumber, password } = req.body;

  try {
      // Enviando token como cookie para garantir maior segurança no
      // armazenamento dele no lado do client:
      const token = await authService.login(whatsappNumber, password);
      res.cookie("auth_token", token, {
      httpOnly: true,       // JS não acessa
      secure: envFileHandle.isProductionEnv,
      sameSite: "strict",   // proteção CSRF
      maxAge: envFileHandle.cookieLifetime
    });
    res.status(200).json({ message: "Login efetuado com sucesso!" });
  } catch (err) {
    console.log("ERRO DO 401: " + err.message);
    res.status(401).json({ message: err.message });
  }
}

async function logout(req, res) {
  try {
    await authService.logout(res);
    res.status(200).json({ message: "Logout efetuado com sucesso!" });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

module.exports = { login, logout };
