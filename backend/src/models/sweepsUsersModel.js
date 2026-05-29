const db_connection = require('../config/db');

async function insertSweepsUser(sweepsName, userId){
  const sql = 'insert into sweepstake_users (sweepstake_name, user_id) values (?, ?)';

  await db_connection.execute(sql, [sweepsName, userId]);
}

async function isUserInSweepstake(sweepsName, userId) {
  const sql = 'select s.user_id from sweepstake_users s where s.sweepstake_name = ? and s.user_id = ?';
  const [rows] = await db_connection.execute(sql, [sweepsName, userId]);
  
  return rows.length;
}

async function getSweepstakeUsers(sweepsName) {
  const sql = 'select s.id as sweeps_user_id, u.name from users u join sweepstake_users s where s.sweepstake_name = ? and s.user_id = u.id';
  const [rows] = await db_connection.execute(sql, [sweepsName]);
  
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

async function getSweepstakeUserId(sweepsName, userId) {
  const sql = 'select s.id as sweeps_user_id from sweepstake_users s where s.sweepstake_name = ? and s.user_id = ?';
  const [rows] = await db_connection.execute(sql, [sweepsName, userId]);
  
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

module.exports = { insertSweepsUser, isUserInSweepstake, getSweepstakeUsers, getSweepstakeUserId }