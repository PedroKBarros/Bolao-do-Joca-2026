require('dotenv').config();
const db_connection = require('../config/db');

async function getGroupStageMatches(){
  const sql = `
  SELECT 
      g.id, g.group_letter_1, g.team_name_1, g.team_name_2, g.match_info
  FROM GROUP_MATCHES g
  ORDER BY g.group_letter_1 ASC;
    `;

    const [rows] = await db_connection.execute(sql);
    if(rows.length){
      const result = rows;
      return result;
    }

    return undefined;
}

module.exports = { getGroupStageMatches };