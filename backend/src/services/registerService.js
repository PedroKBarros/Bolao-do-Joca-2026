const e = require('express');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const MIN_PASSWORD_CHARS = 5;
const MAX_PASSWORD_CHARS = 30;

async function register(email, password, passwordConfirmation, isAdmin=0) {
  if(!emailValido(email)){
    throw new Error('Email é inválido');
  }

  if(password !== passwordConfirmation){
        throw new Error('Senhas diferentes');    
  }

  
  if(password.length < MIN_PASSWORD_CHARS || password.length > MAX_PASSWORD_CHARS){
    throw new Error('Senha tem menos de ' + MIN_PASSWORD_CHARS + ' caracteres ou mais de ' + MAX_PASSWORD_CHARS + 'caracteres')
  }

  if(await userModel.findByEmail(email)){
    throw new Error('Usuário com mesmo e-mail já cadastrado')
  }


  const password_hash = await bcrypt.hash(password, 10);
  await userModel.insertUser(email, password_hash, isAdmin);

}

function emailValido(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

module.exports = { register };
