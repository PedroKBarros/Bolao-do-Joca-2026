const e = require('express');
const matchesModel = require('../models/matchesModel');
const predicModel = require('../models/predictionsModel');
const predicService = require('../services/predictionsService');

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

    let knockoutStageConstData = predicService.getConstKnockoutStageDataFromKnockoutStageName(knockoutStageName);
    console.log("knockoutStageConstData:");
    console.log(knockoutStageConstData);
    if(await predicModel.getKnockoutStageMatchesPredictionsFromMatchesNumberInterval(userIdInSweepestake, 
        knockoutStageConstData.firstMatchNumber, knockoutStageConstData.lastMatchNumber)){
        throw new Error("Existem partidas da fase mata-mata " + knockoutStageName + " já armazenadas.");
    }
    console.log("CHEGOU NA LINHA 60");
    await matchesModel.storageUserKnockoutStageMatches(knockoutStageName, userIdInSweepestake, knockoutMatches);   
    console.log("CHEGOU NA LINHA 66");
}

module.exports = { getGroupStageMatches, getKnockoutStageMatchesRules, 
    getAllKnockoutStagesMatchesRules, defineKnockoutStageMatches };