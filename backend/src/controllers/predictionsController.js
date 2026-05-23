const predServ = require('../services/predictionsService');

async function getGroupStageMatchesPredictions(req, res) {
  try {
    const { sweepsName, userId } = req.query;
    console.log(sweepsName);
    console.log(userId);
    res.status(200).json(await predServ.getGroupStageMatchesPredictions(sweepsName, userId));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function saveGroupStagePredictData(req, res) {
  try {
    const { userIdInSweepestake, predictDataToSave } = req.body;
    await predServ.saveGroupStagePredictData(userIdInSweepestake, predictDataToSave);
    res.status(200).json({ message: "Dados de predições salvos com sucesso!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { getGroupStageMatchesPredictions, saveGroupStagePredictData };