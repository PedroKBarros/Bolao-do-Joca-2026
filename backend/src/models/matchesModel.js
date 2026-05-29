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

module.exports = { getGroupStageMatches };