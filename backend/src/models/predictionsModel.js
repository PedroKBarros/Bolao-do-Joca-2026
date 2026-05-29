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


module.exports = { getGroupStageMatchesPredictions, saveGroupStagePredictData };