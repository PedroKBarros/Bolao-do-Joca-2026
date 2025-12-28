const registerServ = require('../services/registerService');

async function register(req, res) {
  const { email, password, passwordConfirmation, isAdmin } = req.body;

  try {
    await registerServ.register(email, password, passwordConfirmation, isAdmin);
    res.status(200).json({ message: "Cadastro realizado com sucesso!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { register };
