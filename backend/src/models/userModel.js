const db_connection = require('../config/db');


async function findByEmail(email) {
  const sql = `SELECT * FROM Users WHERE Users.email = ?`;

  const [rows, fields] = await db_connection.execute(sql, [email]);
  if(rows.length)
  {
    return {id: rows[0].id, email: rows[0].email, passwordHash: rows[0].password_hash, isAdmin: rows[0].is_admin}
  }
  return undefined
}

module.exports = { findByEmail };

