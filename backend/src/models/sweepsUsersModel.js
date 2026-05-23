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

async function getSweepstakeUsers(sweepsName) {
  const sql = 'SELECT s.id AS sweeps_user_id, u.name FROM USERS u JOIN SWEEPSTAKE_USERS s WHERE s.sweepstake_name = ? and s.user_id = u.id';
  const [rows] = await db_connection.execute(sql, [sweepsName]);
  
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

async function getSweepstakeUserId(sweepsName, userId) {
  const sql = 'SELECT s.id AS sweeps_user_id FROM SWEEPSTAKE_USERS s WHERE s.sweepstake_name = ? and s.user_id = ?';
  const [rows] = await db_connection.execute(sql, [sweepsName, userId]);
  
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

module.exports = { insertSweepsUser, isUserInSweepstake, getSweepstakeUsers, getSweepstakeUserId }