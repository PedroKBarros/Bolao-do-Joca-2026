const matchesServ = require('../services/matchesService');

async function getGroupStageMatches(req, res) {
  try {
    res.status(200).json(await matchesServ.getGroupStageMatches());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { getGroupStageMatches };