const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');


const SECRET = process.env.JWT_CHAVE_TOKEN; // Chave armazenada no .env que serve para assinar e verificar o token gerado pelo JWT
console.log(SECRET);
async function login(email, password) {
  const user = await userModel.findByEmail(email);
  console.log("teste2");
  if (!user) {
    throw new Error('Credenciais inválidas');
  }
  console.log(user);
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    console.log("teste3");
  if (!passwordMatch) {
    throw new Error('Credenciais inválidas');
  }
  console.log("teste");
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    SECRET,
    { expiresIn: '1h' }
  );

  return token;
}

async function logout(res) {
  res.clearCookie("auth_token");
}

module.exports = { login, logout };
