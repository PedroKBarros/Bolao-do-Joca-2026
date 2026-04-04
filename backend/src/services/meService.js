const e = require('express');
const jwt = require('jsonwebtoken');
const envFileHandle = require('../config/env');

const SECRET = envFileHandle.jwtSecret; // Chave armazenada no .env que serve para assinar e verificar o token gerado pelo JWT

function getLoggedInUserData(userLoggedInToken) {
  const payload = jwt.verify(userLoggedInToken, SECRET);
  return {
      id: payload.userId,
      whatsappNumber: payload.whatsappNumber,
      name: payload.userName,
      isAdmin: payload.isAdmin
    }
}

module.exports = { getLoggedInUserData };
