const authService = require('../services/authService');

async function login(req, res) {
  const { email, password } = req.body;

  try {
      // Enviando token como cookie para garantir maior segurança no
      // armazenamento dele no lado do client:
      const token = await authService.login(email, password);
      res.cookie("auth_token", token, {
      httpOnly: true,       // JS não acessa
      secure: false,         // só HTTPS TODO: colocar true em produção (false em dev local)
      sameSite: "strict",   // proteção CSRF
      maxAge: 60 * 60 * 1000 // 1h
    });
    res.status(200).json({ message: "Login efetuado com sucesso!" });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

module.exports = { login };
