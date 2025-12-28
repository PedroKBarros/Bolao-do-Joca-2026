const bcrypt = require('bcrypt');

const users = [
  {
    id: 1,
    email: 'teste@email.com',
    passwordHash: bcrypt.hashSync('123', 10) // senha criptografada
  }
];

//TODO: substituir por MySQL

async function findByEmail(email) {
  return users.find(user => user.email === email);
}

module.exports = { findByEmail };

