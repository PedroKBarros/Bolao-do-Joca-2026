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

    if(userIdInSweepestake === undefined || userIdInSweepestake === null){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão informado está vazio.");        
    }

    if(manualDrawSolutionsArray === undefined || manualDrawSolutionsArray === null){
        throw new Error("Nenhuma solução manual de empate foi enviada para ser salva foi informada.");        
    }

    if(manualDrawSolutionsArray.length === 0){
        throw new Error("Array de soluções manuais de empate está vazio.");
    }

    await drawsModel.saveGroupStageDrawsManualSolutions(userIdInSweepestake, manualDrawSolutionsArray);
}

async function setToNotMoreValidGroupStageDrawsManualSolutions(userIdInSweepestake, groupsLetter) {

    if(userIdInSweepestake === undefined || userIdInSweepestake === null){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão informado está vazio.");        
    }

    if(userIdInSweepestake === undefined || userIdInSweepestake === null){
        throw new Error("As letras dos grupos não foram informadas.");        
    }

    if(groupsLetter.length === 0){
        throw new Error("Nenhuma letra de grupo foi informada. Pelo menos uma letra deve ser informada.");
    }

    await drawsModel.setToNotMoreValidGroupStageDrawsManualSolutions(userIdInSweepestake, groupsLetter);
    
}

async function saveKnockoutStageDrawManualSolution(userIdInSweepestake, manualDrawSolution) {

    if(userIdInSweepestake === undefined || userIdInSweepestake === null){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão informado está vazio.");        
    }

    if(manualDrawSolution === null){
        throw new Error("Solução manual de empate não foi enviada para ser salva.");
    }

    await drawsModel.saveKnockoutStageDrawManualSolution(userIdInSweepestake, manualDrawSolution);
}

async function undoSavedKnockoutStageDrawManualSolution(userIdInSweepestake, matchesNumber) {

    if(userIdInSweepestake === undefined || userIdInSweepestake === null){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão informado está vazio.");        
    }

    if(matchesNumber === null){
        throw new Error("Números de partidas não foram enviados.");
    }

    if(matchesNumber.length === 0){
        throw new Error("Array de números de partidas não possui elementos.");        
    }

    await drawsModel.undoSavedKnockoutStageDrawManualSolution(userIdInSweepestake, matchesNumber);
}



module.exports = { getGroupStageDrawsManualSolutions, saveGroupStageDrawsManualSolutions, 
    setToNotMoreValidGroupStageDrawsManualSolutions, saveKnockoutStageDrawManualSolution,
    undoSavedKnockoutStageDrawManualSolution };