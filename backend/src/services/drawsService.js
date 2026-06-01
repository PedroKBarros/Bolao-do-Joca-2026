const e = require('express');
const drawsModel = require('../models/drawsModel');

async function getGroupStageDrawsManualSolutions(sweepsName, userId) {
    let groupDrawsManualSolutions = undefined;


    groupDrawsManualSolutions = await drawsModel.getGroupStageDrawsManualSolutions(sweepsName, userId);

    if(!groupDrawsManualSolutions){
        groupDrawsManualSolutions = {};
    }

    return groupDrawsManualSolutions;
}

async function saveGroupStageDrawsManualSolutions(userIdInSweepestake, manualDrawSolutionsArray) {

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(manualDrawSolutionsArray.length === 0){
        throw new Error("Nenhuma solução manual de empate foi enviada para ser salva.");
    }

    await drawsModel.saveGroupStageDrawsManualSolutions(userIdInSweepestake, manualDrawSolutionsArray);
}

async function setToNotMoreValidGroupStageDrawsManualSolutions(userIdInSweepestake, groupsLetter) {

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(groupsLetter.length === 0){
        throw new Error("Nenhuma letra de grupo foi informada. Pelo menos uma letra deve ser informada.");
    }

    await drawsModel.setToNotMoreValidGroupStageDrawsManualSolutions(userIdInSweepestake, groupsLetter);
    
}

module.exports = { getGroupStageDrawsManualSolutions, saveGroupStageDrawsManualSolutions, setToNotMoreValidGroupStageDrawsManualSolutions };