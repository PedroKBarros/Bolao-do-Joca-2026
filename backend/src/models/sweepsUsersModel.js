const db_connection = require('../config/db');

async function insertSweepsUser(sweepsName, userId){
  const sql = 'INSERT INTO SWEEPSTAKE_USERS (sweepstake_name, user_id) VALUES (?, ?)';

  await db_connection.execute(sql, [sweepsName, userId]);
}

async function isUserInSweepstake(sweepsName, userId) {
  const sql = 'SELECT s.user_id FROM SWEEPSTAKE_USERS s WHERE s.sweepstake_name = ? and s.user_id = ?';
  const [rows] = await db_connection.execute(sql, [sweepsName, userId]);
  
  return rows.length;
}

module.exports = { insertSweepsUser, isUserInSweepstake }