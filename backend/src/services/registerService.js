const e = require('express');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const MIN_PASSWORD_CHARS = 5;
const MAX_PASSWORD_CHARS = 30;

async function register(name, whatsappNumber, password, passwordConfirmation, isAdmin=0) {
  if(name.length == 0){
    throw new Error('Nome não foi informado.');
  }

  if(!isValidWhatsappNumber(whatsappNumber)){
    throw new Error('Número do Whatsapp não é válido.');
  }

  if(password !== passwordConfirmation){
        throw new Error('Senhas diferentes.');    
  }

  
  if(password.length < MIN_PASSWORD_CHARS || password.length > MAX_PASSWORD_CHARS){
    throw new Error('Senha tem menos de ' + MIN_PASSWORD_CHARS + ' caracteres ou mais de ' + MAX_PASSWORD_CHARS + 'caracteres.')
  }

  if(await userModel.findByWhatsappNumber(whatsappNumber)){
    throw new Error('Usuário com mesmo número de Whatsapp já cadastrado.')
  }

  const password_hash = await bcrypt.hash(password, 10);
  await userModel.insertUser(name, whatsappNumber, password_hash, isAdmin);

}

function isValidWhatsappNumber(whatsappNumber) {
  const regex = /^(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9\d{4}-?\d{4}$/;
  return regex.test(whatsappNumber);
}

module.exports = { register, MIN_PASSWORD_CHARS, MAX_PASSWORD_CHARS };
