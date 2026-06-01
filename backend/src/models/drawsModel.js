require('dotenv').config();
const db_connection = require('../config/db');

async function getGroupStageDrawsManualSolutions(sweepsName, userId){
  const sql = `
  select 
      m.place, m.group_letter, m.team_name, m.is_not_more_valid
  from manual_solutions_group_stage_draws m join sweepstake_users s
  where m.sweepstake_user_id = s.id and m.is_not_more_valid = 0 and s.sweepstake_name = ? and s.user_id = ?
  order by m.group_letter;
    `;

    const [rows] = await db_connection.execute(sql, [sweepsName, userId]);
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

async function saveGroupStageDrawsManualSolutions(userIdInSweepestake, manualDrawSolutionsArray) {
  // Add registeres in MANUAL_SOLUTIONS_GROUP_STAGE_DRAWS table:
  const sql = `insert into manual_solutions_group_stage_draws (
      place,
      sweepstake_user_id,
      group_letter,
      team_name
  )
  values (
      ?,
      ?,
      ?,
      ?
  )`;

  for(let i =0;i<manualDrawSolutionsArray.length;i++){
    await db_connection.execute(sql, [manualDrawSolutionsArray[i].place, userIdInSweepestake, 
        manualDrawSolutionsArray[i].group_letter, manualDrawSolutionsArray[i].team_name]);
  }

}

async function setToNotMoreValidGroupStageDrawsManualSolutions(userIdInSweepestake, groupsLetter) {
  // set all registers in MANUAL_SOLUTIONS_GROUP_STAGE_DRAWS table of all groups includes in groupsLetter array:
  const sql = `update manual_solutions_group_stage_draws
               set is_not_more_valid = 1
               where group_letter = ? and sweepstake_user_id = ?`;

  for(let i =0;i<groupsLetter.length;i++){
    await db_connection.execute(sql, [groupsLetter[i], userIdInSweepestake]);
  }

}


module.exports = { getGroupStageDrawsManualSolutions, saveGroupStageDrawsManualSolutions, setToNotMoreValidGroupStageDrawsManualSolutions };