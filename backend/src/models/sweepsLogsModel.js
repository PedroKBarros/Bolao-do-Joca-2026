const db_connection = require('../config/db');

async function insertSweepsLog(sweepsName, userId, eventName, details, dateAndHour){
  const sql = 'insert into sweepstake_logs (sweepstake_name, date_and_hour, user_id, event_name, details) values (?, ?, ?, ?, ?)';

  await db_connection.execute(sql, [sweepsName, dateAndHour, userId, eventName, details]);
}

module.exports = { insertSweepsLog }