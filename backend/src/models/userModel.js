const db_connection = require('../config/db');


async function findByWhatsappNumber(whatsappNumber) {
  const sql = `SELECT * FROM Users WHERE Users.whatsapp_number = ?`;

  const [rows, fields] = await db_connection.execute(sql, [whatsappNumber]);
  if(rows.length)
  {
    return {id: rows[0].id, name: rows[0].name, whatsappNumber: rows[0].whatsapp_number, 
      passwordHash: rows[0].password_hash, isAdmin: rows[0].is_admin, createdAt: rows[0].created_at}
  }
  return undefined
}

async function insertUser(name, whatsappNumber, passwordHash, isAdmin=0){
  const sql = 'INSERT INTO Users (name, whatsapp_number, password_hash, is_admin) VALUES (?, ?, ?, ?)';

  db_connection.execute(sql, [name, whatsappNumber, passwordHash, isAdmin]);
}

module.exports = { findByWhatsappNumber, insertUser };

