const db_connection = require('../config/db');


async function getSweepstakesDataFromUserId(userId){
  const sql = `
  select 
      s.name,
      s.keyword_hash,
      s.quota,
      s.group_link,
      s.start_date_participation,
      s.final_date_participation,
      s.is_closed,
      s.status,
      s.author_user_id,
      u.name as author_name,
      count(su.id) as total_users
  from sweepstake s
  join users u
      on u.id = s.author_user_id
  join sweepstake_users su 
      on su.sweepstake_name = s.name
  where exists (
      select 1
      from sweepstake_users su2
      where su2.sweepstake_name = s.name
        and su2.user_id = ?
  )
  group by 
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
  select 
      s.name,
      s.keyword_hash,
      s.quota,
      s.group_link,
      s.start_date_participation,
      s.final_date_participation,
      s.is_closed,
      s.status,
      s.author_user_id,
      u.name as author_name,
      count(su.id) as total_users
  from sweepstake s
  join users u
      on u.id = s.author_user_id
  left join sweepstake_users su 
      on su.sweepstake_name = s.name
  group by 
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
  select 
      s.name
  from sweepstake s
  group by s.name
  order by s.name asc;
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
  select 
      s.name,
      s.keyword_hash,
      s.quota,
      s.group_link,
      s.start_date_participation,
      s.final_date_participation,
      s.is_closed,
      s.status,
      s.author_user_id,
      u.name as author_name,
      count(su.id) as total_users
  from sweepstake s
  join users u
      on u.id = s.author_user_id
  join sweepstake_users su 
      on su.sweepstake_name = s.name
  where s.name = ?
  group by 
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
  const sql = `insert into sweepstake (name, keyword_hash, quota, group_link, start_date_participation, 
  final_date_participation, is_closed, status, author_user_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await db_connection.execute(sql, [name, keywordHash, quota, whatsappGroupLink, 
    startDateParticipation, endDateParticipation, isClosed, status, authorUserId]);
}

async function findSweepstake(sweepsName) {
  //Observação: a collation da coluna "name" é "utf8mb4_0900_ai_ci". 
  // Isso significa que ela ignora acentos e não diferencia por 
  // letras maiúsculas e minúsculas na comparação e ordenação.
  const sql = `select * from sweepstake where sweepstake.name = ?`;

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