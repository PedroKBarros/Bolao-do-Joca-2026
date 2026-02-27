const registerServ = require('../services/registerService');

async function register(req, res) {
  try {
    const { name, whatsappNumber, password, passwordConfirmation, isAdmin } = req.body;
    await registerServ.register(name, whatsappNumber, password, passwordConfirmation, isAdmin);
    res.status(200).json({ message: "Cadastro realizado com sucesso!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { register };
