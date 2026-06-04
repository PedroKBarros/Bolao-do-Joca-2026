require('dotenv').config();
const db_connection = require('../config/db');

async function getGroupStageMatches(){
  const sql = `
  select 
      g.id, g.group_letter_1, g.team_name_1, g.team_name_2, g.match_info
  from group_matches g
  order by g.group_letter_1 asc;
    `;

    const [rows] = await db_connection.execute(sql);
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

async function getKnockoutStageMatchesRules(knockoutStageName){
  const sql = `
  select *
  from knockout_match_teams_rules k
  where k.knockout_stage_name = ?
  order by k.match_number;
    `;

    const [rows] = await db_connection.execute(sql, [knockoutStageName]);
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

async function getAllKnockoutStagesMatchesRules(){
  const sql = `
  select *
  from knockout_match_teams_rules k
  order by k.match_number;
    `;

    const [rows] = await db_connection.execute(sql);
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;  
}

async function storageUserKnockoutStageMatches(knockoutStageName, userIdInSweepestake, knockoutMatches){
  const sql = `
  insert into user_knockout_stage_predictions(sweepstake_users_id, team_1_name, team_2_name, match_number)
  VALUES
    (?, ?, ?, ?)
    `;
  
  for(let i =0;i<knockoutMatches.length;i++){
    await db_connection.execute(sql, [userIdInSweepestake, knockoutMatches[i].team_1_name, 
      knockoutMatches[i].team_2_name, knockoutMatches[i].match_number]);
  }
  
}

module.exports = { getGroupStageMatches, getKnockoutStageMatchesRules, 
  getAllKnockoutStagesMatchesRules, storageUserKnockoutStageMatches };