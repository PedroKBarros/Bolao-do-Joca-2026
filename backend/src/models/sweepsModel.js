const db_connection = require('../config/db');


async function getSweepstakesDataFromUserId(userId){
  const sql = `
  SELECT 
      s.name,
      s.keyword_hash,
      s.quota,
      s.group_link,
      s.start_date_participation,
      s.final_date_participation,
      s.is_closed,
      s.status,
      s.author_user_id,
      u.name AS author_name,
      COUNT(su.id) AS total_users
  FROM SWEEPSTAKE s
  JOIN USERS u
      ON u.id = s.author_user_id
  JOIN SWEEPSTAKE_USERS su 
      ON su.sweepstake_name = s.name
  WHERE EXISTS (
      SELECT 1
      FROM SWEEPSTAKE_USERS su2
      WHERE su2.sweepstake_name = s.name
        AND su2.user_id = ?
  )
  GROUP BY 
      s.name,
      s.keyword_hash,
      s.quota,
      s.group_link,
      s.start_date_participation,
      s.final_date_participation,
      s.is_closed,
      s.status,
      u.name;
    `;

    const [rows] = await db_connection.execute(sql, [userId]);
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

async function getAllSweepstakes(){
  const sql = `
  SELECT 
      s.name,
      s.keyword_hash,
      s.quota,
      s.group_link,
      s.start_date_participation,
      s.final_date_participation,
      s.is_closed,
      s.status,
      s.author_user_id,
      u.name AS author_name,
      COUNT(su.id) AS total_users
  FROM SWEEPSTAKE s
  JOIN USERS u
      ON u.id = s.author_user_id
  LEFT JOIN SWEEPSTAKE_USERS su 
      ON su.sweepstake_name = s.name
  GROUP BY 
      s.name,
      s.keyword_hash,
      s.quota,
      s.group_link,
      s.start_date_participation,
      s.final_date_participation,
      s.is_closed,
      s.status,
      s.author_user_id,
      u.name;
    `;

    const [rows] = await db_connection.execute(sql);
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

async function getAllSweepstakesNames(){
  const sql = `
  SELECT 
      s.name
  FROM SWEEPSTAKE s
  GROUP BY s.name
  ORDER BY s.name ASC;
    `;

    const [rows] = await db_connection.execute(sql);
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

async function getSweepstakesDataFromName(sweepsName){
  const sql = `
  SELECT 
      s.name,
      s.keyword_hash,
      s.quota,
      s.group_link,
      s.start_date_participation,
      s.final_date_participation,
      s.is_closed,
      s.status,
      s.author_user_id,
      u.name AS author_name,
      COUNT(su.id) AS total_users
  FROM SWEEPSTAKE s
  JOIN USERS u
      ON u.id = s.author_user_id
  JOIN SWEEPSTAKE_USERS su 
      ON su.sweepstake_name = s.name
  WHERE s.name = ?
  GROUP BY 
      s.name,
      s.keyword_hash,
      s.quota,
      s.group_link,
      s.start_date_participation,
      s.final_date_participation,
      s.is_closed,
      s.status,
      u.name;
    `;

    const [rows] = await db_connection.execute(sql, [sweepsName]);
    console.log(rows);
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

async function insertSweepstake(name, keywordHash, quota, whatsappGroupLink, startDateParticipation, 
    endDateParticipation,  isClosed, status, authorUserId){
  const sql = 'INSERT INTO SWEEPSTAKE (name, keyword_hash, quota, group_link, start_date_participation, final_date_participation, is_closed, status, author_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  await db_connection.execute(sql, [name, keywordHash, quota, whatsappGroupLink, 
    startDateParticipation, endDateParticipation, isClosed, status, authorUserId]);
}

async function findSweepstake(sweepsName) {
  //Observação: a collation da coluna "name" é "utf8mb4_0900_ai_ci". 
  // Isso significa que ela ignora acentos e não diferencia por 
  // letras maiúsculas e minúsculas na comparação e ordenação.
  const sql = `SELECT * FROM SWEEPSTAKE WHERE SWEEPSTAKE.name = ?`;

  const [rows, fields] = await db_connection.execute(sql, [sweepsName]);
  if(rows.length)
  {
      return {name: rows[0].name, keywordHash: rows[0].keyword_hash, quota: rows[0].quota, 
        whatsappGroupLink: rows[0].group_link, startDateParticipation: rows[0].start_date_participation, 
        finalDateParticipation: rows[0].final_date_participation, isClosed: rows[0].is_closed, status: rows[0].status, 
        authorUserId: rows[0].author_user_id};
  }
  return undefined;
}

module.exports = { getSweepstakesDataFromUserId, getAllSweepstakes, 
  getAllSweepstakesNames, insertSweepstake, findSweepstake, getSweepstakesDataFromName }