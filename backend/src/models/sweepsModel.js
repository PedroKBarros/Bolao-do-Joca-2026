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

module.exports = { getSweepstakesDataFromUserId, getAllSweepstakes }