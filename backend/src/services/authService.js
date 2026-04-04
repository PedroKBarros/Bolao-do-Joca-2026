const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const envFileHandle = require('../config/env');

const SECRET = envFileHandle.jwtSecret; // Chave armazenada no .env que serve para assinar e verificar o token gerado pelo JWT
async function login(whatsappNumber, password) {
  const user = await userModel.findByWhatsappNumber(whatsappNumber);

  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new Error('Credenciais inválidas');
  }

  const token = jwt.sign(
    { userId: user.id, whatsappNumber: user.whatsappNumber, userName: user.name, isAdmin: user.isAdmin },
    SECRET,
    { expiresIn: envFileHandle.cookieTokenLifetime }
  );

  return token;
}

async function logout(res) {
  res.clearCookie("auth_token");
}

module.exports = { login, logout };
