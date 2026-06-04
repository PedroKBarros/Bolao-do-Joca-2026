require('dotenv').config();
const db_connection = require('../config/db');

async function getGroupStageMatchesPredictions(sweepsName, userId){
  const sql = `
  select 
      g.group_match_id, g.score_team_1, g.pts_team_1, g.score_team_2, g.pts_team_2
  from group_matches_predictions g join sweepstake_users s
  where g.sweepstake_users_id = s.id and s.sweepstake_name = ? and s.user_id = ?
  order by g.group_match_id;
    `;

    const [rows] = await db_connection.execute(sql, [sweepsName, userId]);
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

async function saveGroupStagePredictData(userIdInSweepestake, predictDataArray) {
  // Add or update registeres of GROUP_MATCH_PREDICTIONS table:
  const sql = `insert into group_matches_predictions (
      sweepstake_users_id,
      group_match_id,
      score_team_1,
      pts_team_1,
      score_team_2,
      pts_team_2
  )
  values (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?
  ) as new_group_match_preds
  on duplicate key update
      score_team_1 = new_group_match_preds.score_team_1,
      pts_team_1 = new_group_match_preds.pts_team_1,
      score_team_2 = new_group_match_preds.score_team_2,
      pts_team_2 = new_group_match_preds.pts_team_2`;

  for(let i =0;i<predictDataArray.length;i++){
    await db_connection.execute(sql, [userIdInSweepestake, predictDataArray[i].group_match_id, predictDataArray[i].score_team_1, 
      predictDataArray[i].pts_team_1, predictDataArray[i].score_team_2, predictDataArray[i].pts_team_2]);
  }

}

async function getFilledStatusOfAllKnockoutStages(userIdInSweepestake) {
  const sql = `
  select * from users_knockout_stages_status u join sweepstake_users s
  on u.sweepstake_user_id = s.id
  where s.id = ?
    `;

    const [rows] = await db_connection.execute(sql, [userIdInSweepestake]);
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

async function getKnockoutStageMatchesPredictionsFromMatchesNumberInterval(userIdInSweepestake, firstMatchNumber, lastMatchNumber){
  const sql = `
  select *
  from user_knockout_stage_predictions u join knockout_match_teams_rules k
  on u.match_number = k.match_number
  where u.sweepstake_users_id = ? and u.match_number between ? and ?
  order by u.match_number;
    `;

    const [rows] = await db_connection.execute(sql, [userIdInSweepestake, firstMatchNumber, lastMatchNumber]);
    if(rows.length){
      const result = rows;
      console.log(result);
      return result;
    }
    
    return undefined; 
}

async function saveKnockoutStagePredictData(userIdInSweepestake, predictDataArray) {
  // Always update registeres of USER_KNOCKOUT_STAGE_PREDICTIONS table, 
  // because matches is previous storage:
  const sql = `update user_knockout_stage_predictions u
               set score_team_1 = ?,
               score_team_2 = ?
               where u.match_number = ? and u.sweepstake_users_id = ?`;

  for(let i =0;i<predictDataArray.length;i++){
    await db_connection.execute(sql, [predictDataArray[i].score_team_1, predictDataArray[i].score_team_2, 
      predictDataArray[i].match_number, userIdInSweepestake]);
  }

}

async function registerKnockoutStageFilledStatus(userIdInSweepestake, knockoutStageName, isAllFilled){
  // Add registeres of USERS_KNOCKOUT_STAGES_STATUS table:
  /*Obs.: caso o registro já exista, sistema chamará a updateKnockoutStageFilledStatus, pois quando usuário
  * avança para a fase mata-mata, a fase de grupos add registro da primeira fase mata-mata
  * com is_all_filled igual a 0. Quando o usuário terminar de preencher a primeira
  * fase mata-mata, o sistema tentará adicionar o registro novamente na tabela,
  * fazendo com que o is_all_filled seja alterado para 1.*/
  
  const sql = `insert into users_knockout_stages_status (
      sweepstake_user_id,
      knockout_stages_name,
      is_all_filled
  )
  values (
      ?,
      ?,
      ?
  )`;

  await db_connection.execute(sql, [userIdInSweepestake, knockoutStageName, isAllFilled]);
}

async function updateKnockoutStageFilledStatus(userIdInSweepestake, knockoutStageName, isAllFilled){
  // Add or update registeres of USERS_KNOCKOUT_STAGES_STATUS table:
  /*Obs.: caso o registro já exista, atualiza o is_all_filled, pois quando usuário
  * avança para a fase mata-mata, a fase de grupos add registro da primeira fase mata-mata
  * com is_all_filled igual a 0. Quando o usuário terminar de preencher a primeira
  * fase mata-mata, o sistema tentará adicionar o registro novamente na tabela,
  * fazendo com que o is_all_filled seja alterado para 1.*/
  
  const sql = `update users_knockout_stages_status s
               set is_all_filled = ?
               where s.sweepstake_user_id = ? and s.knockout_stages_name = ?`;

  await db_connection.execute(sql, [isAllFilled, userIdInSweepestake, knockoutStageName]);
}

module.exports = { getGroupStageMatchesPredictions, saveGroupStagePredictData, getFilledStatusOfAllKnockoutStages,
  getKnockoutStageMatchesPredictionsFromMatchesNumberInterval, saveKnockoutStagePredictData,
  registerKnockoutStageFilledStatus, updateKnockoutStageFilledStatus };