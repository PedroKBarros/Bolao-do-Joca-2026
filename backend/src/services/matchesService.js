const e = require('express');
const matchesModel = require('../models/matchesModel');
const firstKnockoutStageInterval = {"firstMatchNumber": 74, "lastMatchNumber": 88};

async function getGroupStageMatches() {
    let groupMatches = undefined;

    groupMatches = await matchesModel.getGroupStageMatches();

    if(!groupMatches){
        groupMatches = {};
    }

    return groupMatches;
}

async function getKnockoutStageMatchesRules(knockoutStageName){
    let knockoutMatchesRules = undefined;

    knockoutMatchesRules = await matchesModel.getKnockoutStageMatchesRules(knockoutStageName);

    if(!knockoutMatchesRules){
        knockoutMatchesRules = {};
    }

    return knockoutMatchesRules;
}

async function getAllKnockoutStagesMatchesRules(){
    let allKnockoutMatchesRules = undefined;

    allKnockoutMatchesRules = await matchesModel.getAllKnockoutStagesMatchesRules();

    if(!allKnockoutMatchesRules){
        allKnockoutMatchesRules = {};
    }

    return allKnockoutMatchesRules;
}

async function defineKnockoutStageMatches(knockoutStageName, userIdInSweepestake, knockoutMatches){
    if(String(knockoutStageName) === ""){
        throw new Error("Fase mata-mata não informada.");        
    }

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(knockoutMatches.length === 0){
        throw new Error("Nenhuma partida da fase mata-mata " + knockoutStageName + " foi informada.");
    }

    if(await matchesModel.getKnockoutUserMatchesByMatchNumberInterval(userIdInSweepestake, 
        firstKnockoutStageInterval.firstMatchNumber, firstKnockoutStageInterval.lastMatchNumber)){
        throw new Error("Existem partidas da fase mata-mata " + knockoutStageName + " já armazenadas.");
    }

    await matchesModel.storageUserKnockoutStageMatches(knockoutStageName, userIdInSweepestake, knockoutMatches);   
}

module.exports = { getGroupStageMatches, getKnockoutStageMatchesRules, 
    getAllKnockoutStagesMatchesRules, defineKnockoutStageMatches };