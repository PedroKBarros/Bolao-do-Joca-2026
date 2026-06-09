const e = require('express');
const predModel = require('../models/predictionsModel');
const KNOCKOUT_STAGES_DATA = [
    {"order": 1, "name": "32-Avos de Final", "firstMatchNumber": 73, "lastMatchNumber": 88}, 
    {"order": 2, "name":"Oitavas de Final", "firstMatchNumber": 89, "lastMatchNumber": 96}, 
    {"order": 3, "name":"Quartas de Final", "firstMatchNumber": 97, "lastMatchNumber": 100}, 
    {"order": 4, "name":"Semifinal", "firstMatchNumber": 101, "lastMatchNumber": 102}, 
    {"order": 5, "name":"Disputa do 3º Lugar", "firstMatchNumber": 103, "lastMatchNumber": 103}, 
    {"order": 6, "name":"Final", "firstMatchNumber": 104, "lastMatchNumber": 104}     
];

function getConstKnockoutStageDataFromMatchNumber(matchNumber){
    return KNOCKOUT_STAGES_DATA.find(k => k.firstMatchNumber <= matchNumber && k.lastMatchNumber >= matchNumber);
}

function getConstKnockoutStageDataFromOrder(order){
    return KNOCKOUT_STAGES_DATA.find(k => k.order === order);
}

function getConstKnockoutStageDataFromKnockoutStageName(knockoutStageName){
    for(let i=0;i<KNOCKOUT_STAGES_DATA.length;i++){
        if(KNOCKOUT_STAGES_DATA[i].name === knockoutStageName){
            return KNOCKOUT_STAGES_DATA[i];
        }
    }

    return null;
}

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

    if(userIdInSweepestake === undefined || userIdInSweepestake === null){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão informado está vazio.");        
    }

    if(predictDataArray === undefined || predictDataArray === null){
        throw new Error("Array de predições a serem salvas não foi informado.");        
    }    

    if(predictDataArray.length === 0){
        throw new Error("Array de predições a serem salvas não possui elementos.");
    }


    rankingGroupStagePredictions = await predModel.saveGroupStagePredictData(userIdInSweepestake, predictDataArray);
}

async function getFilledStatusOfAllKnockoutStages(userIdInSweepestake){
    let filledStatusAllKnockoutStages = undefined;

    filledStatusAllKnockoutStages = await predModel.getFilledStatusOfAllKnockoutStages(userIdInSweepestake);

    if(!filledStatusAllKnockoutStages){
        filledStatusAllKnockoutStages = {};
    }

    return filledStatusAllKnockoutStages;
}

async function getKnockoutStageMatchesPredictionsFromMatchesNumberInterval(knockoutStageName, userIdInSweepestake){
    if(userIdInSweepestake === undefined || userIdInSweepestake === null){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(knockoutStageName === undefined || knockoutStageName === null){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(String(knockoutStageName) === ""){
        throw new Error("Fase mata-mata informada está vazia.");        
    }

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão informado está vazio.");        
    }

    let knockoutStageConstData = getConstKnockoutStageDataFromKnockoutStageName(knockoutStageName);
    
    let KnockoutStageMatchesPredictions = await predModel.getKnockoutStageMatchesPredictionsFromMatchesNumberInterval(userIdInSweepestake, 
        knockoutStageConstData.firstMatchNumber, knockoutStageConstData.lastMatchNumber);

    if(!KnockoutStageMatchesPredictions){
        KnockoutStageMatchesPredictions = {};
    }

    return KnockoutStageMatchesPredictions;
}

async function getAllKnockoutStageMatchesPredictions(userIdInSweepestake){
    if(userIdInSweepestake === undefined || userIdInSweepestake === null){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão informado está vazio.");        
    }
    
    let KnockoutStageMatchesPredictions = await predModel.getKnockoutStageMatchesPredictionsFromMatchesNumberInterval(userIdInSweepestake, 
        KNOCKOUT_STAGES_DATA[0].firstMatchNumber, KNOCKOUT_STAGES_DATA[KNOCKOUT_STAGES_DATA.length-1].lastMatchNumber);

    if(!KnockoutStageMatchesPredictions){
        KnockoutStageMatchesPredictions = {};
    }

    return KnockoutStageMatchesPredictions;
}

async function saveKnockoutStagePredictData(userIdInSweepestake, predictDataArray) {
    if(userIdInSweepestake === undefined || userIdInSweepestake === null){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão informado está vazio.");        
    }

    if(predictDataArray === undefined || predictDataArray === null){
        throw new Error("Array de predições a serem salvas não foi informado.");        
    }    

    if(predictDataArray.length === 0){
        throw new Error("Array de predições a serem salvas não possui elementos.");
    }

    await predModel.saveKnockoutStagePredictData(userIdInSweepestake, predictDataArray);
}

async function registerKnockoutStageFilledStatus(userIdInSweepestake, knockoutStageName, isAllFilled){
    if(userIdInSweepestake === undefined || userIdInSweepestake === null){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(String(userIdInSweepestake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão informado está vazio.");        
    }

    if(knockoutStageName === undefined || knockoutStageName === null){
        throw new Error("O nome da fase mata-mata não foi informado.");        
    }

    if(String(knockoutStageName) === ""){
        throw new Error("O nome da fase mata-mata informado está vazio.");        
    }

    if(isAllFilled === undefined || isAllFilled === null){
        throw new Error("O status referente a se a fase mata-mata foi completamente preenchida ou não, não foi informado.");        
    }

    if(String(isAllFilled) === ""){
        throw new Error("O status referente a se a fase mata-mata foi completamente preenchida ou não, informado, está vazio.");        
    }

    console.log("DADOS PARA REGISTRO:");
    console.log(userIdInSweepestake);
    console.log(knockoutStageName);
    console.log(isAllFilled);

    //Verificando se já existe registro com mesmo userIdInSweepstake e knockoutStageName:
    let knockoutStagesFilledStatus = await predModel.getFilledStatusOfAllKnockoutStages(userIdInSweepestake);
    if(knockoutStagesFilledStatus === undefined){
        console.log("REGISTROU POR UNDEFINED");
        await predModel.registerKnockoutStageFilledStatus(userIdInSweepestake, knockoutStageName, isAllFilled);
    }else{
        console.log(knockoutStagesFilledStatus);
        if(!knockoutStagesFilledStatus.some(s => s.sweepstake_user_id === userIdInSweepestake && 
        s.knockout_stages_name === knockoutStageName)){
            console.log("REGISTROU POR NÃO ENCONTRADO");
            await predModel.registerKnockoutStageFilledStatus(userIdInSweepestake, knockoutStageName, isAllFilled);
        }else{
            console.log("RODOU O UPDATE");
            await predModel.updateKnockoutStageFilledStatus(userIdInSweepestake, knockoutStageName, isAllFilled);
        }
    }

}

module.exports = { getGroupStageMatchesPredictions, saveGroupStagePredictData, getFilledStatusOfAllKnockoutStages, 
    getConstKnockoutStageDataFromKnockoutStageName, getKnockoutStageMatchesPredictionsFromMatchesNumberInterval,
    saveKnockoutStagePredictData, registerKnockoutStageFilledStatus, KNOCKOUT_STAGES_DATA,
    getConstKnockoutStageDataFromMatchNumber, getAllKnockoutStageMatchesPredictions, getConstKnockoutStageDataFromOrder };