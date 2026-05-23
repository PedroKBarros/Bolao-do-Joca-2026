const e = require('express');
const matchesModel = require('../models/matchesModel');

async function getGroupStageMatches() {
    let groupMatches = undefined;

    groupMatches = await matchesModel.getGroupStageMatches();

    if(!groupMatches){
        groupMatches = {};
    }

    return groupMatches;
}

module.exports = { getGroupStageMatches };