const db_connection = require('../config/db');

async function insertSweepsLog(sweepsName, userId, eventName, details, dateAndHour){
  const sql = 'INSERT INTO SWEEPSTAKE_LOGS (sweepstake_name, date_and_hour, user_id, event_name, details) VALUES (?, ?, ?, ?, ?)';

  await db_connection.execute(sql, [sweepsName, dateAndHour, userId, eventName, details]);
}

module.exports = { insertSweepsLog }