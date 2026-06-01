const matchesServ = require('../services/matchesService');

async function getGroupStageMatches(req, res) {
  try {
    res.status(200).json(await matchesServ.getGroupStageMatches());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getKnockoutStageMatchesRules(req, res){
  try {
    const { knockoutStageName } = req.query;
    res.status(200).json(await matchesServ.getKnockoutStageMatchesRules(knockoutStageName));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getAllKnockoutStagesMatchesRules(req, res){
  try {
    res.status(200).json(await matchesServ.getAllKnockoutStagesMatchesRules());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function defineKnockoutStageMatches(req, res){
  try {
    const { knockoutStageName } = req.query;
    const { userIdInSweepestake, knockoutMatches } = req.body;
    await matchesServ.defineKnockoutStageMatches(knockoutStageName, userIdInSweepestake, knockoutMatches)
    res.status(200).json("Todas as partidas da primeira fase mata-mata definidas com sucesso!");
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { getGroupStageMatches, getKnockoutStageMatchesRules, 
  getAllKnockoutStagesMatchesRules, defineKnockoutStageMatches };