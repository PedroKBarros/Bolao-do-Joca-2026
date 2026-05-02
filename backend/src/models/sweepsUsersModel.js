const db_connection = require('../config/db');

async function insertSweepsUser(sweepsName, userId){
  const sql = 'INSERT INTO SWEEPSTAKE_USERS (sweepstake_name, user_id) VALUES (?, ?)';

  await db_connection.execute(sql, [sweepsName, userId]);
}

module.exports = { insertSweepsUser }