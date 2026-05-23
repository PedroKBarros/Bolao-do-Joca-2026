const e = require('express');
const common = require('./common.js');
const sweepsModel = require('../models/sweepsModel');
const sweepsLogModel = require('../models/sweepsLogsModel');
const sweepsUserModel = require('../models/sweepsUsersModel.js');
const envFileHandle = require('../config/env');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { MIN_PASSWORD_CHARS, MAX_PASSWORD_CHARS } = require('./registerService.js');

const SECRET = envFileHandle.jwtSecret; // Chave armazenada no .env que serve para assinar e verificar o token gerado pelo JWT
const MAX_SWEEPS_NAME_CHARS = 50;
const MIN_SWEEPS_KEYWORD_CHARS = 5;
const MAX_SWEEPS_KEYWORD_CHARS = 30;
const MIN_SWEEPS_QUOTA = 0.00;
const MAX_SWEEPS_QUOTA = 99999999.99; //Baseado no tipo do atributo no banco que foi declarado como DECIMAL(10, 2)
const SWEEPS_STATUS = {
    status1: "não iniciado", 
    status2: "aberto para participação", 
    status3: "em andamento", 
    status4: "encerrado"
};
const DEFAULT_IS_CLOSED_VALUE = 0;
const SWEEPS_LOG_EVENTS = {
    createSweepsEvent: {name: "Criação", details: "Bolão criado."},
    entryParticipantEvent: {name: "Entrada", details: "Novo participante entrou no bolão."},
    startFillingSweepsEvent: {name: "Início Preenchimento", details: "Participante começou a preencher o bolão."},
    endFillingSweepsEvent: {name: "Fim Preenchimento", details: "Participante concluiu preenchimento do bolão e enviou respostas."},    
    removeParticipantEvent: {name: "Remoção", details: "Participante xxx foi removido do bolão."},
    autoRemoveParticipantEvent: {name: "Saída", details: "Participante saiu do bolão."},
    editSweepsEvent: {name: "Edição", details: "Dados xxx do bolão foram editados de yyy para zzz"},
    closeSweepEvent: {name: "Encerramento", details: "Bolão foi encerrado."}
};

async function getSweepstakes(userLoggedInToken) {
    const payload = jwt.verify(userLoggedInToken, SECRET);
    const userId = payload.userId;
    const isAdmin = payload.isAdmin;
    let sweepstakes = undefined;

    if(isAdmin){
        sweepstakes = await sweepsModel.getAllSweepstakes();
    }else{
        sweepstakes = await sweepsModel.getSweepstakesDataFromUserId(userId);
    }

    if(!sweepstakes){
        sweepstakes = {};
    }

    return sweepstakes;
}

async function getAllSweepstakesNames() {
    let sweepstakesNames = undefined;
    sweepstakesNames = await sweepsModel.getAllSweepstakesNames();

    if(!sweepstakesNames){
        sweepstakesNames = {};
    }

    return sweepstakesNames;
}

async function createSweepstake(userLoggedInToken, sweepsName, sweepsKeyword, sweepsQuota, sweepsStartDateParticipation, 
    sweepsEndDateParticipation, sweepsWhatsappGroupLink) {
    const payload = jwt.verify(userLoggedInToken, SECRET);
    const userId = payload.userId;
    const isAdmin = payload.isAdmin;
    let startParticDate = undefined;
    let endParticDate = undefined;

    if(!isAdmin){
        throw new Error('O usuário não é administrador. Apenas usuários administradores podem criar bolões.');
    }

    if(sweepsName.length === 0){
        throw new Error('O nome do bolão não foi informado.');
    }

    if(sweepsName.length > MAX_SWEEPS_NAME_CHARS){
        throw new Error('O nome do bolão tem mais do que ' + MAX_SWEEPS_NAME_CHARS + ' caracteres.');
    }

    if(await sweepsModel.findSweepstake(sweepsName)){
        throw new Error('Já existe bolão com esse nome cadastrado no sistema.')
    }

    if(sweepsKeyword.length === 0){
        throw new Error('A palavra chave não foi informada.');
    }

    if(sweepsKeyword.length < MIN_SWEEPS_KEYWORD_CHARS || sweepsKeyword.length > MAX_SWEEPS_KEYWORD_CHARS){
        throw new Error('A palavra chave tem menos de ' + MIN_SWEEPS_KEYWORD_CHARS + 
            ' ou mais de ' + MAX_SWEEPS_KEYWORD_CHARS + ' caracteres.');
    }

    if(String(sweepsKeyword).toUpperCase() === String(sweepsName).toUpperCase()){
        throw new Error('A palavra chave não pode ser igual ao nome do bolão.');
    }

    if(sweepsQuota.length === 0){
        throw new Error('A cota não foi informada. Caso o bolão não possua cota, preencha-a com 0,00.');
    }

    if(!common.isValidPositiveNumberOrZero(String(sweepsQuota).replace(",", "."))){
        throw new Error('O valor da cota não é um número válido. A cota deve ser um número maior ou igual a ' + MIN_SWEEPS_QUOTA + '.')
    }

    if(parseFloat(String(sweepsQuota).replace(",", ".")) < MIN_SWEEPS_QUOTA || parseFloat(String(sweepsQuota).replace(",", ".")) > MAX_SWEEPS_QUOTA){
        throw new Error('O valor da cota deve ser maior ou igual a ' + MIN_SWEEPS_QUOTA + ' e menor ou igual a ' + MAX_SWEEPS_QUOTA + '.');
    }

    if(sweepsStartDateParticipation.length === 0){
        throw new Error('A data de início do período de participação não foi informada.');
    }

    if(sweepsEndDateParticipation.length === 0){
        throw new Error('A data de término do período de participação não foi informada.');
    }


    if(!common.isValidDate(sweepsStartDateParticipation)){
        throw new Error('A data de início do período de participação é inválida. Ela deve estar no formato \'aaaa-mm-dd\'.');
    }

    if(!common.isValidDate(sweepsEndDateParticipation)){
        throw new Error('A data de término do período de participação é inválida. Ela deve estar no formato \'aaaa-mm-dd\'.');
    }

    startParticDate = common.parseDate(sweepsStartDateParticipation);
    startParticDate = common.returnDateWithZeroTime(startParticDate);
    endParticDate = common.parseDate(sweepsEndDateParticipation);
    endParticDate = common.returnDateWithZeroTime(endParticDate);
    
    if(startParticDate < common.returnDateWithZeroTime(new Date())){
        console.log("startDate: " + startParticDate);
        throw new Error('A data inicial do período de participação informada é menor do que a data de hoje.');
    }

    if(startParticDate > endParticDate){
        throw new Error('A data inicial do período de participação informada é maior do que a data de término.');
    }

    if(sweepsWhatsappGroupLink.length === 0){
        throw new Error("O link do grupo do Whatsapp não foi informado.");
    }

    if(!common.isValidWhatsAppGroupUrl(sweepsWhatsappGroupLink)){
        throw new Error("O link do grupo do Whatsapp informado é inválido. Links de grupos do Whatsapp devem começar com 'chat.whatsapp.com' (não é necessário colocar 'https://' no início do link). Exemplos: 'chat.whatsapp.com/Ab12' ou 'https://chat.whatsapp.com/Ab12'.");
    }

    const sweepsKeywordHash = await bcrypt.hash(sweepsKeyword, 10);
    //Add sweepstake:
    await sweepsModel.insertSweepstake(sweepsName, sweepsKeywordHash, sweepsQuota, sweepsWhatsappGroupLink, 
    sweepsStartDateParticipation, sweepsEndDateParticipation, DEFAULT_IS_CLOSED_VALUE, getInitialSweepsStatus(), userId);
    //Add Author user:
    await sweepsUserModel.insertSweepsUser(sweepsName, userId);
    //Add first log:
    await sweepsLogModel.insertSweepsLog(sweepsName, userId, SWEEPS_LOG_EVENTS.createSweepsEvent.name, 
        SWEEPS_LOG_EVENTS.createSweepsEvent.details, common.formatDateToDataBase(new Date().toISOString()));
}

function getInitialSweepsStatus(){
    return SWEEPS_STATUS["status1"];
}

async function joinSweepstake(userLoggedInToken, sweepsName, sweepsKeyword) {
    const payload = jwt.verify(userLoggedInToken, SECRET);
    const userId = payload.userId;
    const isAdmin = payload.isAdmin;

    if(sweepsName.length === 0){
        throw new Error('O nome do bolão não foi informado.');
    }

    if(sweepsKeyword.length === 0){
        throw new Error('A palavra-chave não foi informada.');
    }

    //Verificando se usuário já não está participando do bolão:
    if(await sweepsUserModel.isUserInSweepstake(sweepsName, userId)){
        throw new Error('Você já está participando desse bolão!');        
    }

    //Verificando se a keyword informada é a keyword correta:
    sweepsData = await sweepsModel.getSweepstakesDataFromName(sweepsName);
    const keywordMatch = await bcrypt.compare(sweepsKeyword, sweepsData[0].keyword_hash);
    if(!keywordMatch){
        throw new Error('Palavra-chave ou bolão incorreto.');        
    }

    //Add user:
    await sweepsUserModel.insertSweepsUser(sweepsName, userId);
    //Add log:
    await sweepsLogModel.insertSweepsLog(sweepsName, userId, SWEEPS_LOG_EVENTS.entryParticipantEvent, 
        SWEEPS_LOG_EVENTS.entryParticipantEvent.details, common.formatDateToDataBase(new Date().toISOString()));
}

async function isUserInSweepstake(userLoggedInToken, sweepsName) {
    const payload = jwt.verify(userLoggedInToken, SECRET);
    const userId = payload.userId;

    return await sweepsUserModel.isUserInSweepstake(sweepsName, userId);
}

async function getSweepstakeUsers(sweepsName) {
    let sweepsUsers;

    sweepsUsers = await sweepsUserModel.getSweepstakeUsers(sweepsName);
    if(!sweepsUsers){
        sweepsUsers = {};
    }
    return sweepsUsers;
}

async function getSweepstakeUserId(sweepsName, userId) {
    let sweepstakeUserId;

    sweepstakeUserId = await sweepsUserModel.getSweepstakeUserId(sweepsName, userId);
    if(!sweepstakeUserId){
        sweepstakeUserId = {};
    }
    return {"sweepstake_user_id": sweepstakeUserId[0].sweeps_user_id};
}

module.exports = { getSweepstakes, getAllSweepstakesNames, createSweepstake, getInitialSweepsStatus, 
    joinSweepstake, isUserInSweepstake, getSweepstakeUsers, getSweepstakeUserId, MIN_SWEEPS_KEYWORD_CHARS, 
    MAX_SWEEPS_KEYWORD_CHARS, MIN_SWEEPS_QUOTA, MAX_SWEEPS_QUOTA, MIN_PASSWORD_CHARS, MAX_PASSWORD_CHARS, 
    MAX_SWEEPS_NAME_CHARS };
