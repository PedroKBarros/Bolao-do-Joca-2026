const authService = require('../services/authService');

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const token = await authService.login(email, password);
    res.status(200).json({ token });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

module.exports = { login };
