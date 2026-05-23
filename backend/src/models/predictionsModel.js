require('dotenv').config();
const db_connection = require('../config/db');

async function getGroupStageMatchesPredictions(sweepsName, userId){
  const sql = `
  SELECT 
      g.group_match_id, g.score_team_1, g.pts_team_1, g.score_team_2, g.pts_team_2
  FROM GROUP_MATCHES_PREDICTIONS g JOIN SWEEPSTAKE_USERS s
  WHERE g.sweepstake_users_id = s.id and s.sweepstake_name = ? and s.user_id = ?
  ORDER BY g.group_match_id;
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
  const sql = `INSERT INTO GROUP_MATCHES_PREDICTIONS (
      sweepstake_users_id,
      group_match_id,
      score_team_1,
      pts_team_1,
      score_team_2,
      pts_team_2
  )
  VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?
  ) AS new_group_match_preds
  ON DUPLICATE KEY UPDATE
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