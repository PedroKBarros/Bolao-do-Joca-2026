const e = require('express');
const sweepsModel = require('../models/sweepsModel');
const jwt = require('jsonwebtoken');
const envFileHandle = require('../config/env');

const SECRET = envFileHandle.jwtSecret; // Chave armazenada no .env que serve para assinar e verificar o token gerado pelo JWT

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

module.exports = { getSweepstakes };
