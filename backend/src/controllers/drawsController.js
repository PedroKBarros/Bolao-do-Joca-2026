const drawsServ = require('../services/drawsService');

async function getGroupStageDrawsManualSolutions(req, res) {
  try {
    const { sweepsName, userId } = req.query;
    res.status(200).json(await drawsServ.getGroupStageDrawsManualSolutions(sweepsName, userId));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function saveGroupStageDrawsManualSolutions(req, res) {
  try {
    const { userIdInSweepestake, manualDrawSolutions } = req.body;
    await drawsServ.saveGroupStageDrawsManualSolutions(userIdInSweepestake, manualDrawSolutions);
    res.status(200).json({ message: "Soluções manuais de empates salvas com sucesso!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function setToNotMoreValidGroupStageDrawsManualSolutions(req, res){
  try {
    const { userIdInSweepestake, groupsLetter } = req.body;
    await drawsServ.setToNotMoreValidGroupStageDrawsManualSolutions(userIdInSweepestake, groupsLetter);
    res.status(200).json({ message: "Soluções manuais de empates consideradas não mais válidas com sucesso!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }  
}

async function saveKnockoutStageDrawManualSolution(req, res) {
  try {
    const { userIdInSweepestake, manualDrawSolution } = req.body;
    await drawsServ.saveKnockoutStageDrawManualSolution(userIdInSweepestake, manualDrawSolution);
    res.status(200).json({ message: "Solução manual de empate salva com sucesso!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function undoSavedKnockoutStageDrawManualSolution(req, res) {
  try {
    const { userIdInSweepestake, matchesNumber } = req.body;
    await drawsServ.undoSavedKnockoutStageDrawManualSolution(userIdInSweepestake, matchesNumber);
    res.status(200).json({ message: "Solução manual de empate desfeita com sucesso!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { getGroupStageDrawsManualSolutions, saveGroupStageDrawsManualSolutions, setToNotMoreValidGroupStageDrawsManualSolutions,
  saveKnockoutStageDrawManualSolution, undoSavedKnockoutStageDrawManualSolution };