const e = require('express');
const predModel = require('../models/predictionsModel');

async function getGroupStageMatchesPredictions(sweepsName, userId) {
    let groupMatchesPreds = undefined;

    groupMatchesPreds = await predModel.getGroupStageMatchesPredictions(sweepsName, userId);

    if(!groupMatchesPreds){
        groupMatchesPreds = {};
    }

    return groupMatchesPreds;
}

async function saveGroupStagePredictData(userIdInSweepestake, predictDataArray) {
    let rankingGroupStagePredictions;

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(predictDataArray.length === 0){
        throw new Error("Nenhum dado para ser salvo foi enviado.");
    }

    rankingGroupStagePredictions = await predModel.saveGroupStagePredictData(userIdInSweepestake, predictDataArray);
}

module.exports = { getGroupStageMatchesPredictions, saveGroupStagePredictData };