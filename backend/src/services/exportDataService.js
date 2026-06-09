const e = require('express');
const pdfmake = require('pdfmake');
const matchesServ = require('./matchesService');
const predictServ = require('./predictionsService');
const meServ = require('./meService');
const drawServ = require('./drawsService');
var Roboto = require('pdfmake/fonts/Roboto');
const envFileHandle = require('../config/env');

const SECRET = envFileHandle.jwtSecret;

var basicData = {
    sweepsName: '',
    userIdInSweepstake: -1,
    useridOutsideSweeps: -1,
    groupStageMatches: [],
    groupStagePredicts: [],
    groupStageManualDrawSolutions: [],
    groupStageGroupTablesData: [],
    knockoutStageMatches: [],
    knockoutStagePredictions: [],
    knockoutStageManualDrawSolutions: []

};
var matchesData;
var predictData;
var groupTablesData;
var manualDrawsSolutions;
var teamsDraws = [];
const ASCII_CHAR_A_DECIMAL_CODE = 65;
const NOT_DEFINED_PLACE_VALUE = "-";
const TOTAL_GROUPS = 12;
const TOTAL_MATCHES_PER_TEAM = 3;
const TOTAL_MATCHES_PER_GROUP = 6;
const TOTAL_TEAM_IN_ALL_GROUP_MATCHES = TOTAL_MATCHES_PER_GROUP * 2;
const TOTAL_MATCHES = TOTAL_MATCHES_PER_GROUP * TOTAL_GROUPS;
const TEAM_RESULT_IN_MATCH_PREDICTION = {winner: 3, draw: 1, losing: 0};
const DRAW_SOLUTION_STATUS = {inProgress: "IN PROGRESS", automaticSolutionFailed: "AUTO SOLUTION FAILED",
     automaticSolutionWorked: "AUTO SOLUTION WORKED", manualSolutionApplied: "MANUAL SOLUTION APPLIED",
    ignoreByChangeMatchScore: "IGNORE DRAW BY CHANGE MATCH SCORE"};

async function initializeBasicData(userLoggedInData, sweepsName, userIdInSweepstake){
    basicData.sweepsName = sweepsName;
    basicData.userIdInSweepstake = userIdInSweepstake;
    basicData.useridOutsideSweeps = userLoggedInData.id;
    basicData.groupStageMatches = await matchesServ.getGroupStageMatches();
    basicData.groupStagePredicts = await predictServ.getGroupStageMatchesPredictions(sweepsName, userLoggedInData.id);
    basicData.groupStageManualDrawSolutions = await drawServ.getGroupStageDrawsManualSolutions(sweepsName, userLoggedInData.id);
    if(Object.keys(basicData.groupStageManualDrawSolutions).length===0){
        basicData.groupStageManualDrawSolutions=[];
    }
    matchesData = basicData.groupStageMatches;
    predictData = basicData.groupStagePredicts;
    groupTablesData = basicData.groupStageGroupTablesData;
    manualDrawsSolutions = basicData.groupStageManualDrawSolutions;
    createGroupTablesData();
    inicializeTeamNamesInGroupTablesData();
    updateGroupTablesData();
    basicData.groupStageGroupTablesData = groupTablesData;
    basicData.knockoutStageMatches = await matchesServ.getAllKnockoutStagesMatchesRules();
    basicData.knockoutStagePredictions = await predictServ.getAllKnockoutStageMatchesPredictions(basicData.userIdInSweepstake);
    //console.log("PREDICTIONS:");
    //console.log(basicData.knockoutStagePredictions);
    //basicData.knockoutStageManualDrawSolutions = basicData.knockoutStagePredictions.filter(
    //    p => p.team_1_chosen_by_user === 1 || p.team_2_chosen_by_user === 2);
}

function createGroupTablesData(){

    let currentGroupAsciiLetterDecCode;
    groupTablesData = [];

    for(let i=0;i<12;i++){
        currentGroupAsciiLetterDecCode = ASCII_CHAR_A_DECIMAL_CODE + i;
        groupTablesData.push([
            {"group": String.fromCharCode(currentGroupAsciiLetterDecCode), 
                "place": NOT_DEFINED_PLACE_VALUE, "team": "", "pt": 0, "gs": 0, "gr": 0, "gd": 0, "totalFilledMatches": 0, "isPlaceDefinedByUser": false },
            {"group": String.fromCharCode(currentGroupAsciiLetterDecCode), 
                "place": NOT_DEFINED_PLACE_VALUE, "team": "", "pt": 0, "gs": 0, "gr": 0, "gd": 0, "totalFilledMatches": 0, "isPlaceDefinedByUser": false},
            {"group": String.fromCharCode(currentGroupAsciiLetterDecCode), 
                "place": NOT_DEFINED_PLACE_VALUE, "team": "", "pt": 0, "gs": 0, "gr": 0, "gd": 0, "totalFilledMatches": 0, "isPlaceDefinedByUser": false},
            {"group": String.fromCharCode(currentGroupAsciiLetterDecCode), 
                "place": NOT_DEFINED_PLACE_VALUE, "team": "", "pt": 0, "gs": 0, "gr": 0, "gd": 0, "totalFilledMatches": 0, "isPlaceDefinedByUser": false}
        ]);
    }

}

function inicializeTeamNamesInGroupTablesData(){
    let teamsName;

    for(let i = 0;i<12;i++){
        teamsName = getTeamsNameOfGroup(groupTablesData[i][0].group);
        groupTablesData[i][0].team = teamsName[0];
        groupTablesData[i][1].team = teamsName[1];
        groupTablesData[i][2].team = teamsName[2];
        groupTablesData[i][3].team = teamsName[3];
    }
    
}

function getTeamsNameOfGroup(groupLetter, order=true, ascOrder=true){
    groupLetter = String(groupLetter).toUpperCase();
    let team1;
    let team2;
    let teamsName = [];
    for(let i =0;i<matchesData.length;i++){
        if(String(matchesData[i].group_letter_1).toUpperCase() === groupLetter){
            team1 = matchesData[i].team_name_1;
            team2 = matchesData[i].team_name_2;
            if(!teamsName.some(t => t === team1)){
                teamsName.push(team1);
            }
            if(!teamsName.some(t => t === team2)){
                teamsName.push(team2);
            }
        }
    }
    if(order){
        if(ascOrder) {
            teamsName.sort((a, b) => a.localeCompare(b, 'pt-BR'));
        }else{
            teamsName.sort((a, b) => b.localeCompare(a, 'pt-BR'));            
        }
    }

    return teamsName;
}

function updateGroupTablesData(){
    let currentTeamName;
    let teamStatistics;
    let groupFilledMatches;
    for(let i = 0;i<12;i++){
        groupFilledMatches = 0;
        for(let j = 0;j<4;j++){
            currentTeamName = groupTablesData[i][j].team;
            teamStatistics = returnUpdateTeamStatistics(currentTeamName);
            ////console.log("Estatísticas: da selecao " + currentTeamName);
            ////console.log(teamStatistics);
            groupTablesData[i][j].pt = teamStatistics.pt;
            groupTablesData[i][j].gs = teamStatistics.gs;
            groupTablesData[i][j].gr = teamStatistics.gr;
            groupTablesData[i][j].gd = teamStatistics.gd;
            groupTablesData[i][j].totalFilledMatches = teamStatistics.totalFilledMatches;
            groupFilledMatches+= teamStatistics.totalFilledMatches;
        }
        //Definindo colocações, caso todos os jogos do grupo 
        // tenham sido preenchidos e tratando empates de colocação:
        if(groupFilledMatches === TOTAL_TEAM_IN_ALL_GROUP_MATCHES){
            handleTeamGroupsPlaces(i);
        }
    }
}

function returnUpdateTeamStatistics(teamName){
    let pt=0, gs=0, gr=0, gd=0, totalFilledMatches=0;
    let teamNumber;
    //Percorrendo predict data:
    for(let i=0;i<predictData.length;i++){
        //Verificando se o jogo envolve o time:
        teamNumber = matchOfTeamNumber(predictData[i].group_match_id, teamName);
        if(teamNumber === -1){
            continue;
        }

        if(teamNumber === 1){
            pt+=predictData[i].pts_team_1;
            gs+=predictData[i].score_team_1;
            gr+=predictData[i].score_team_2;
            totalFilledMatches++;
        }else{
            pt+=predictData[i].pts_team_2;
            gs+=predictData[i].score_team_2;
            gr+=predictData[i].score_team_1;   
            totalFilledMatches++;         
        }
    
    }
    gd = gs - gr;
    return {"pt": pt, "gs": gs, "gr": gr, "gd": gd, "totalFilledMatches": totalFilledMatches};
}

function matchOfTeamNumber(matchId, teamName){
    let matchData = matchesData.find(m => m.id === matchId);
    teamName = String(teamName).toUpperCase();
    if(String(matchData.team_name_1).toUpperCase() === teamName){
        return 1;
    }
    if(String(matchData.team_name_2).toUpperCase() === teamName){
        return 2;
    }
    return -1;
}

function handleTeamGroupsPlaces(groupTableDataIndex){
    //Criteria:
    //1º) Total of points
    //2º) Direct confrontation 
    //3º) Gols difference
    //4º) Gols scored
    //5º) User choice

    let groupTableData = groupTablesData[groupTableDataIndex];
    let firstPlaceToDefine;
    //console.log("Grupo com todas partidas preenchidas: " + groupTableData[0].group);
    //Atribuindo possíveis soluções manuais de empates:
    groupTablesData[groupTableDataIndex] = assignManualDrawsSolutionsInGroupPlaces(groupTableData);
    //Obtendo qual a primeira colocação que precisa de definição, já que o usuário pode ter desempatado colocações:
    firstPlaceToDefine = getFirstPlaceToDefine(groupTableData);
    //console.log("FirstPlaceToDefine do Grupo " + groupTableData[0].group + ": " + firstPlaceToDefine);
    if(firstPlaceToDefine === -1){
        //Nesse caso, usuário desempatou todas as 4 colocações, não sendo necessário defini-las.
        groupTablesData[groupTableDataIndex] = sortTeamGroupByColumn(groupTableData, [{attribute:"place", order:"asc"}]);
        return;
    }
    //Definindo colocações inicialmente apenas pela pontuação:
    groupTablesData[groupTableDataIndex] = defineTeamGroupsPlaces(groupTableData, "pt", firstPlaceToDefine);
    //Tratando possíveis empates:
    checkPossibleDraws(groupTableDataIndex);
}

function assignManualDrawsSolutionsInGroupPlaces(groupTableData){

    let groupLetter = groupTableData[0].group;
    let currentManualDrawSolution;
    for(let i=0;i<groupTableData.length;i++){
        //Check if there is a manual draw solution for this team:
        currentManualDrawSolution = getManualDrawSolution(groupLetter, groupTableData[i].team);
        if(currentManualDrawSolution !== null){
            //console.log("ATRIBUIDA SOLUCAO MANUAL PARA COLOCACAO: " + currentManualDrawSolution.place + " DO GRUPO " + groupTableData[0].group);
            groupTableData[i].place = currentManualDrawSolution.place;
            groupTableData[i].isPlaceDefinedByUser = true;
        }
    }

    return groupTableData;
}

function getManualDrawSolution(groupLetter, teamName){
    for(let i=0;i<manualDrawsSolutions.length;i++){
        if(manualDrawsSolutions[i].group_letter === groupLetter && 
            manualDrawsSolutions[i].team_name === teamName){
            return manualDrawsSolutions[i];
        }
    }
    return null;
}

function getFirstPlaceToDefine(groupTableData){
    let placeDefined;
    for(let place=1;place<5;place++){
        placeDefined=false;
        for(let i=0;i<groupTableData.length;i++){
            if(groupTableData[i].isPlaceDefinedByUser){
                if(groupTableData[i].place === place){
                    placeDefined = true;
                }
            }
        }
        if(!placeDefined){
            return place;
        }
    }

    return -1;
}

function sortTeamGroupByColumn(groupTableData, criteria) {

    /*
    Sort group table data based on multiple object attribute names, with precedente order.
    Example of criteria (it's a array):
    [
        { attribute: "pt", order: "desc" },
        { attribute: "gd", order: "desc" },
        { attribute: "team", order: "asc" }
    ]
    */

    return [...groupTableData].sort((a, b) => {

        for (const criterion of criteria) {

            const { attribute, order = "asc" } = criterion;

            const valueA = a[attribute];
            const valueB = b[attribute];

            let comparison = 0;
            // Comparação para strings
            if (typeof valueA === "string" && typeof valueB === "string") {

                comparison = valueA.localeCompare(
                    valueB,
                    "pt-BR",
                    { sensitivity: "base" }
                );

            } else {

                // Comparação para números
                comparison = valueA - valueB;
            }

            // Inverte para descendente
            if (order === "desc") {
                comparison *= -1;
            }

            // Se encontrou diferença, retorna
            if (comparison !== 0) {
                return comparison;
            }
        }

        // Todos critérios empataram
        return 0;
    });
}

function defineTeamGroupsPlaces(groupTableDataOrDrawTable, attributeReference="pt", firstPlace=1, isGroupTableData=true){

    groupTableDataOrDrawTable = sortTeamGroupByColumn(groupTableDataOrDrawTable, [{attribute:attributeReference, order:"desc"}]);

    let lastTeamPlace;
    let attributeRefValueOfLastTeam;
    let totalOfLastTeamPlaceDefinedByUser = 0;
    for(let i =0;i<groupTableDataOrDrawTable.length;i++){
        //Check if team there isn't place, because it can has manual draw solution:
        if(isGroupTableData){
            if(groupTableDataOrDrawTable[i].isPlaceDefinedByUser){
                totalOfLastTeamPlaceDefinedByUser++;
                continue;
            }
        }

        if(i===0){
            groupTableDataOrDrawTable[i].place = i + firstPlace;
        }else{
            if(attributeRefValueOfLastTeam === groupTableDataOrDrawTable[i][attributeReference]){
                groupTableDataOrDrawTable[i].place = lastTeamPlace;                
            }else{
                groupTableDataOrDrawTable[i].place = i + firstPlace - totalOfLastTeamPlaceDefinedByUser;
            }
        }
        lastTeamPlace = groupTableDataOrDrawTable[i].place;
        attributeRefValueOfLastTeam = groupTableDataOrDrawTable[i][attributeReference];
    }
    //console.log("Colocacoes iniciais:");
    //console.log([...groupTableDataOrDrawTable]);

    return groupTableDataOrDrawTable;
}

function checkPossibleDraws(groupTableDataIndex){
    let groupTableData = groupTablesData[groupTableDataIndex];
    let placesCount;
    let teams;
    for(let place =1;place<5;place++){
        placesCount=0;
        teams = [];
        for(let i=0;i<groupTableData.length;i++){
            if(groupTableData[i].place === place){
                placesCount++;
                teams.push(groupTableData[i].team);
            }
        }
        if(placesCount > 1){
            //console.log("Empate detectado");
            handleDraws(groupTableDataIndex, place, teams);
        }
    }
}

function handleDraws(groupTableDataIndex, place, teams){

    let groupTableData = groupTablesData[groupTableDataIndex];
    let groupLetter = groupTableData[0].group;

    //Registering draw:
    /*
    Os objetos inseridos dentro do array teamsDraws não registram os times, pois parte
    deles pode não estar mais empatados, mesmo quando o desempate automático falha,
    já que eles podem ser parcialmente desempatados.
    */
    teamsDraws.push({
        "group": groupTableData[0].group,
        "place": place,
        "status": DRAW_SOLUTION_STATUS.inProgress,
        "detailsOfAppliedManualSolution": []
    });

    //Create table only with those teams:
    let drawTable = [];
    let teamGroupDataIndex;
    let totalDrawTeamsAfterDirectMatchesCriteriaApplied;
    let totalDrawTeamsAfterGoalsDiffCriteriaApplied;
    let totalDrawTeamsAfterGoalsScoredCriteriaApplied;

    //console.log("Draw Table - Antes do loop:");
    //console.log([...drawTable]);

    for(let i =0;i<teams.length;i++){
        teamGroupDataIndex = groupTableData.findIndex(g => g.team === teams[i]);
        //console.log("aaa: " +place);
        drawTable.push({"group": groupLetter, "place": place, "team": teams[i], 
            "pt": getTotalTeamPtsBetweenSpecificTeams(teams[i], teams),
            "gd": groupTableData[teamGroupDataIndex].gd,
            "gs": groupTableData[teamGroupDataIndex].gs});
    }

    //console.log("Draw Table Depois do Lopp:");
    //console.log([...drawTable]);
    //Define places by total of points between draw teams and check if draw persist:
    drawTable = defineTeamGroupsPlaces(drawTable, "pt", place, false);
    //console.log([...drawTable]);
    totalDrawTeamsAfterDirectMatchesCriteriaApplied = totalOfDrawInGroupTableDataByPlace(drawTable, place);
    if(totalDrawTeamsAfterDirectMatchesCriteriaApplied === 0){
        //console.log("Empate resolvido por pts");
        teamsDraws[teamsDraws.length - 1].status = DRAW_SOLUTION_STATUS.automaticSolutionWorked;
        applyAutomaticDrawSolution(groupTableDataIndex, drawTable);
        return;
    }   

    //Define places by gols difference between draw teams and check if draw persist:
    drawTable = defineTeamGroupsPlaces(drawTable, "gd", place, false);
    totalDrawTeamsAfterGoalsDiffCriteriaApplied = totalOfDrawInGroupTableDataByPlace(drawTable, place);          
    if(totalDrawTeamsAfterGoalsDiffCriteriaApplied === 0){
        //console.log("Empate resolvido por saldo gols");
        teamsDraws[teamsDraws.length - 1].status = DRAW_SOLUTION_STATUS.automaticSolutionWorked;
        applyAutomaticDrawSolution(groupTableDataIndex, drawTable);
        return;
    }
   
    //Define places by gols scored between draw teams and check if draw persist:
    drawTable = defineTeamGroupsPlaces(drawTable, "gs", place, false);
    totalDrawTeamsAfterGoalsScoredCriteriaApplied = totalOfDrawInGroupTableDataByPlace(drawTable, place);
    if(totalDrawTeamsAfterGoalsScoredCriteriaApplied === 0){
        //console.log("Empate resolvido por gols pró");
        teamsDraws[teamsDraws.length - 1].status = DRAW_SOLUTION_STATUS.automaticSolutionWorked;
        applyAutomaticDrawSolution(groupTableDataIndex, drawTable);
        return;
    }
    
    /*
    //console.log("Empate não resolvido");
    //Indicating that a manual tiebreaker is necessary:
    teamsDraws[teamsDraws.length - 1].status = DRAW_SOLUTION_STATUS.automaticSolutionFailed;
    //console.log([...teamsDraws]);

    //Check if some automatic solution try reduce total of draw teams:
    if(totalDrawTeamsAfterDirectMatchesCriteriaApplied < teams.length){
        drawTable = defineTeamGroupsPlaces(drawTable, "pt", place, false);
        applyAutomaticDrawSolution(groupTableDataIndex, drawTable);
        //console.log("Empate reduzido por direct matches");
    }else{
        if(totalDrawTeamsAfterGoalsDiffCriteriaApplied < teams.length){

            drawTable = defineTeamGroupsPlaces(drawTable, "gd", place, false);
            applyAutomaticDrawSolution(groupTableDataIndex, drawTable);
            //console.log("Empate reduzido por gd");            
        }else{
            drawTable = defineTeamGroupsPlaces(drawTable, "gs", place, false);
            applyAutomaticDrawSolution(groupTableDataIndex, drawTable);
            //console.log("Empate reduzido por gs");              
        }
    }*/

}

function getTotalTeamPtsBetweenSpecificTeams(referenceTeam, teams){
    let referenceTeamNumber;
    let totalPts = 0;
    let currentMatchResult;
    let matchData;
    
    //console.log("getTotalTeamPtsBetweenSpecificTeams: referenceTeam=" + referenceTeam + "   teams=" + teams);
    for(let i=0;i<predictData.length;i++){
        referenceTeamNumber = matchOfTeamNumber(predictData[i].group_match_id, referenceTeam);
        //console.log("referenceTeamNumber: " + referenceTeamNumber + "   group_match_id: " + predictData[i].group_match_id);

        if(referenceTeamNumber !== -1){

            matchData = matchesData.find(m => m.id === predictData[i].group_match_id);
          //console.log("Match Data:");
            //console.log(matchData);
            if((matchData.team_name_1 !== referenceTeam && teams.includes(matchData.team_name_1)) || 
            (matchData.team_name_2 !== referenceTeam && teams.includes(matchData.team_name_2))){
                currentMatchResult = getResultOfTeamInMatchPrediction(i, referenceTeamNumber==1);
                if(currentMatchResult === TEAM_RESULT_IN_MATCH_PREDICTION.winner){
                    totalPts+=3;
                }else{
                    if(currentMatchResult === TEAM_RESULT_IN_MATCH_PREDICTION.draw){
                        totalPts+=1;                        
                    }
                }
            }
        }
    }
    return totalPts;
}

function totalOfDrawInGroupTableDataByPlace(groupTableDataOrDrawTable, place){
    //console.log("Place para analisar: " + place);
    let placesCount=0;
    for(let i=0;i<groupTableDataOrDrawTable.length;i++){
        if(groupTableDataOrDrawTable[i].place === place){
            placesCount++;
        }
    }

    //console.log(placesCount);
    if(placesCount <= 1){ //If <=1, there isn't draw
        return 0;
    }else{
        return placesCount;
    }
}

function applyAutomaticDrawSolution(groupTableDataIndex, drawTable){
    let groupTableData = groupTablesData[groupTableDataIndex];
    let currentTeam;
    //console.log("Applicação da solução:");
    for(let i=0;i<drawTable.length;i++){
        //console.log("Iteracao " + (i+1));
        //console.log("Place in drawtable i: " + drawTable[i].place);
        //console.log("Time in drawtable i: " + drawTable[i].team);
        groupTableData.find(g => g.team === drawTable[i].team).place = drawTable[i].place;
    }

    groupTablesData[groupTableDataIndex] =
        sortTeamGroupByColumn(groupTableData, [
            { attribute: "place", order: "asc" }
        ]);
}

function getResultOfTeamInMatchPrediction(predictDataIndex, isFirstTeam){
    let scoreTeam1 = predictData[predictDataIndex].score_team_1;
    let scoreTeam2 = predictData[predictDataIndex].score_team_2;

    if(scoreTeam1 === scoreTeam2){
        return TEAM_RESULT_IN_MATCH_PREDICTION.draw;
    }

    if(isFirstTeam){
        if(scoreTeam1 > scoreTeam2){
            return TEAM_RESULT_IN_MATCH_PREDICTION.winner;
        }else{
            return TEAM_RESULT_IN_MATCH_PREDICTION.losing;
        }
    }else{
        if(scoreTeam2 > scoreTeam1){
            return TEAM_RESULT_IN_MATCH_PREDICTION.winner;
        }else{
            return TEAM_RESULT_IN_MATCH_PREDICTION.losing;
        }        
    }
}

async function exportUserFilledInSweeps(userLoggedInToken, sweepsName, userIdInSweepstake){

    if(sweepsName === undefined || sweepsName === null){
        throw new Error("O nome do bolão não foi informado.");        
    }

    if(String(sweepsName) === ""){
        throw new Error("O nome do bolão informado está vazio.");        
    }

    if(userIdInSweepstake === undefined || userIdInSweepstake === null){
        throw new Error("O id do usuário na tabela de usuários do bolão não foi informado.");        
    }

    if(String(userIdInSweepstake) === ""){
        throw new Error("O id do usuário na tabela de usuários do bolão informado está vazio.");        
    }

    const userLoggedInData = meServ.getLoggedInUserData(userLoggedInToken);
    await initializeBasicData(userLoggedInData, sweepsName, userIdInSweepstake);

    pdfmake.addFonts(Roboto);

    var docDefinition = {
        content: [
            {
                text: 'Bolão do Joca 2026',
                style: 'supertitle'
            },
            {
                text: 'Comprovante de Participação',
                style: 'title'
            },
            {
                text: '\n\nComprovante Gerado em: ' + new Date().toLocaleString("pt-br"),
                style: 'normalText'
            },
            {
                text: 'Nome do Bolão: ' + sweepsName,
                style: 'normalText'
            },
            {
                text: 'Nome do Participante: ' + userLoggedInData.name,
                style: 'normalText'
            }
            
        ],

        styles: {
            supertitle:{
                fontSize: 24,
                bold: true,
                alignment: 'center'                
            },            
            title:{
                fontSize: 20,
                bold: true,
                alignment: 'center'                
            },
            subtitle:{
                fontSize: 16,
                bold: true,
                alignment: 'left'  
            },
            normalText:{
                fontSize: 12,
                bold: false
            },
            strongText:{
                fontSize: 12,
                bold: true
            },
            smallText:{
                fontSize: 8,
                bold: false                
            }

        }

    };
    generateAllGroupsDataInPDFMakeFormat(docDefinition);
    generateAllKnockoutMatchesInPDFMakeFormat(docDefinition);
    generateTopFourFinishers(docDefinition);
    const pdf = pdfmake.createPdf(docDefinition);
    return await pdf.getBuffer();

}

function generateTopFourFinishers(docDefinition){
    let thirdPlaceMatch = basicData.knockoutStagePredictions.find(k => k.match_number === 103);
    let finalMatch = basicData.knockoutStagePredictions.find(k => k.match_number === 104);
    let firstPlaceTeam, secondPlaceTeam, thirdPlaceTeam, fortyPlaceTeam;

    if(finalMatch.score_team_1 > finalMatch.score_team_2){
        firstPlaceTeam = finalMatch.team_1_name;
        secondPlaceTeam = finalMatch.team_2_name;
    }else{
        if(finalMatch.score_team_1 < finalMatch.score_team_2){
            firstPlaceTeam = finalMatch.team_2_name;
            secondPlaceTeam = finalMatch.team_1_name;
        }else{
            if(finalMatch.team_1_chosen_by_user === 1){
                firstPlaceTeam = finalMatch.team_1_name;
                secondPlaceTeam = finalMatch.team_2_name;
            }else{
                firstPlaceTeam = finalMatch.team_2_name;
                secondPlaceTeam = finalMatch.team_1_name;
            }
        }
    }

    if(thirdPlaceMatch.score_team_1 > thirdPlaceMatch.score_team_2){
        thirdPlaceTeam = thirdPlaceMatch.team_1_name;
        fortyPlaceTeam = thirdPlaceMatch.team_2_name;
    }else{
        if(thirdPlaceMatch.score_team_1 < thirdPlaceMatch.score_team_2){
            thirdPlaceTeam = thirdPlaceMatch.team_2_name;
            fortyPlaceTeam = thirdPlaceMatch.team_1_name;
        }else{
            if(thirdPlaceMatch.team_1_chosen_by_user === 1){
                thirdPlaceTeam = thirdPlaceMatch.team_1_name;
                fortyPlaceTeam = thirdPlaceMatch.team_2_name;
            }else{
                thirdPlaceTeam = thirdPlaceMatch.team_2_name;
                fortyPlaceTeam = thirdPlaceMatch.team_1_name;
            }
        }
    }

    docDefinition.content.push(
        {
                text: '\nQUATRO PRIMEIRAS SELEÇÕES:',
                alignment: 'center',
                style: 'subtitle'
        },
        {
                text: `\n1º ${firstPlaceTeam}`,
                alignment: 'center',
                style: 'strongText'
        },
        {
                text: `\n2º ${secondPlaceTeam}`,
                alignment: 'center',
                style: 'strongText'
        },
        {
                text: `\n3º ${thirdPlaceTeam}`,
                alignment: 'center',
                style: 'strongText'
        },
        {
                text: `\n4º ${fortyPlaceTeam}`,
                alignment: 'center',
                style: 'strongText'
        },
        {
                text: `\n\n\nBolão do Joca 2026 foi desenvolvido por Pedro Barros.`,
                alignment: 'center',
                style: 'smallText'
        }
    );

}

function generateAllKnockoutMatchesInPDFMakeFormat(docDefinition){
    // Agrupa as partidas por fase mata-mata
    const knockoutStages = {};

    docDefinition.content.push(
        {
                text: '\n\nFASE MATA-MATA',
                style: 'subtitle'
        });

    basicData.knockoutStageMatches.forEach(match => {

        const matchNumber = match.match_number;
        console.log("Linha 650");
        const knockoutStageOfMatch = predictServ.getConstKnockoutStageDataFromMatchNumber(matchNumber);
        console.log("Linha 652");
        const knockoutStageOrder = knockoutStageOfMatch.order;

        if (!knockoutStages[knockoutStageOrder]) {
            knockoutStages[knockoutStageOrder] = [];
        }

        var predict = basicData.knockoutStagePredictions.find(
            p => p.match_number == match.match_number
        );

        knockoutStages[knockoutStageOrder].push({
            matchNumber: match.match_number,
            info: match.match_info,
            game: `${predict.team_1_name} x ${predict.team_2_name}`,
            predict: predict
                ? `${predict.score_team_1} x ${predict.score_team_2}`
                : '-'
        });

    });

    // Cria as colunas das fases mata-mata
    const knockoutStagesTables = [];

    Object.keys(knockoutStages)
        .sort()
        .forEach(knockoutStageOrder => {

            const body = [
                [
                    { text: 'Info', bold: true, alignment: 'center' },
                    { text: 'Jogo', bold: true, alignment: 'center' },
                    { text: 'Palpite', bold: true, alignment: 'center' }
                ]
            ];

            knockoutStages[knockoutStageOrder].forEach(match => {

                body.push([
                    {
                        text: match.info,
                        verticalAlignment: 'middle',
                        fontSize: 8
                    },
                    {
                        text: match.game,
                        verticalAlignment: 'middle',
                        fontSize: 8
                    },
                    {
                        text: match.predict,
                        alignment: 'center',
                        verticalAlignment: 'middle',
                        fontSize: 8
                    }
                ]);

            });
        

            /*let manualDrawSol = basicData.knockoutStageManualDrawSolutions.filter(
                s => predictServ.match_number === match.matchNumber);
            let manualDrawSolText = "";
            if(manualDrawSol.length === 0){
                manualDrawSolText = "";
            }else{
                const choosenTeam = manualDrawSol[0].team_1_chosen_by_user === 1 ? 
                manualDrawSol[0].team_1_name : manualDrawSol[0].team_2_name;
                manualDrawSolText = `Seleção ${choosenTeam} foi escolhida vencedora pelo participante.`;
            }*/

                console.log(knockoutStageOrder);
            knockoutStagesTables.push({
                width: '*',

                stack: [
                    {
                        text: predictServ.getConstKnockoutStageDataFromOrder(Number(knockoutStageOrder)).name,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },

                    // Tabela de jogos
                    {
                        table: {
                            headerRows: 1,
                            dontBreakRows: true,
                            widths: ['auto', '*', 'auto'],
                            body
                        },

                        layout: {
                            hLineWidth: () => 0.5,
                            vLineWidth: () => 0.5
                        }
                    }
                ]
            });

        });


        knockoutStagesTables.sort(
            (a, b) => a.knockoutStageOrder - b.knockoutStageOrder
        );

    // Adiciona as tabelas em linhas de 3 colunas
    for (let i = 0; i < knockoutStagesTables.length; i += 3) {

        docDefinition.content.push({

            margin: [0, 10, 0, 0],

            columnGap: 10,

            columns: [
                knockoutStagesTables[i],
                knockoutStagesTables[i + 1] || { width: '*', text: '' },
                knockoutStagesTables[i + 2] || { width: '*', text: '' }
            ]

        });

    }
}

function generateAllGroupsDataInPDFMakeFormat(docDefinition){
    // Agrupa as partidas por grupo
    const groups = {};

    docDefinition.content.push(
        {
                text: '\nFASE DE GRUPOS',
                style: 'subtitle'
        });

    basicData.groupStageMatches.forEach(match => {

        const groupLetter = match.group_letter_1;

        if (!groups[groupLetter]) {
            groups[groupLetter] = [];
        }

        const predict = basicData.groupStagePredicts.find(
            p => p.group_match_id === match.id
        );

        groups[groupLetter].push({
            info: match.match_info,
            game: `${match.team_name_1} x ${match.team_name_2}`,
            predict: predict
                ? `${predict.score_team_1} x ${predict.score_team_2}`
                : '-'
        });

    });

    // Cria as colunas dos grupos
    const groupTables = [];

    Object.keys(groups)
        .sort()
        .forEach(groupLetter => {

            const body = [
                [
                    { text: 'Info', bold: true, alignment: 'center' },
                    { text: 'Jogo', bold: true, alignment: 'center' },
                    { text: 'Palpite', bold: true, alignment: 'center' }
                ]
            ];

            groups[groupLetter].forEach(match => {

                body.push([
                    {
                        text: match.info,
                        verticalAlignment: 'middle',
                        fontSize: 8
                    },
                    {
                        text: match.game,
                        verticalAlignment: 'middle',
                        fontSize: 8
                    },
                    {
                        text: match.predict,
                        alignment: 'center',
                        verticalAlignment: 'middle',
                        fontSize: 8
                    }
                ]);

            });

        const groupIndex =
            groupLetter.charCodeAt(0) - 'A'.charCodeAt(0);

        const standings = basicData.groupStageGroupTablesData[groupIndex] || [];

        const standingsBody = [
            [
                { text: 'Col', bold: true, alignment: 'center' },
                { text: 'Seleção', bold: true, alignment: 'center' },
                { text: 'Pg', bold: true, alignment: 'center' },
                { text: 'Gp', bold: true, alignment: 'center' },
                { text: 'Gc', bold: true, alignment: 'center' },
                { text: 'Sg', bold: true, alignment: 'center' }
            ]
        ];

        standings
            .sort((a, b) => a.place - b.place)
            .forEach(team => {

                standingsBody.push([
                    {
                        text: String(team.place),
                        alignment: 'center',
                        verticalAlignment: 'middle',
                        fontSize: 8
                    },
                    {
                        text: team.team,
                        verticalAlignment: 'middle',
                        fontSize: 8
                    },
                    {
                        text: team.pt,
                        alignment: 'center',
                        verticalAlignment: 'middle',
                        fontSize: 8
                    },
                    {
                        text: team.gs,
                        alignment: 'center',
                        verticalAlignment: 'middle',
                        fontSize: 8
                    },
                    {
                        text: team.gr,
                        alignment: 'center',
                        verticalAlignment: 'middle',
                        fontSize: 8
                    },
                    {
                        text: team.gd,
                        alignment: 'center',
                        verticalAlignment: 'middle',
                        fontSize: 8
                    }

                ]);

            });

            let manualDrawSol = basicData.groupStageManualDrawSolutions.filter(s => s.group_letter === groupLetter);
            let manualDrawSolText = "";
            if(manualDrawSol.length === 0){
                manualDrawSolText = "Particpante não realizou desempates.";
            }else{
                manualDrawSolText = "Seleções desempatadas pelo participante:\n";
                for(let i=0;i<manualDrawSol.length;i++){
                    manualDrawSolText += manualDrawSol[i].team_name + ", ";
                }
            }
            standingsBody.push([
                {
                    text: manualDrawSol.length > 0 ? manualDrawSolText.substring(0, manualDrawSolText.length - 2) : manualDrawSolText,
                    colSpan: 6,
                    alignment: 'left',
                    style: 'smallText'
                },
                {},
                {},
                {},
                {},
                {}
            ]);


            groupTables.push({
                width: '*',

                stack: [
                    {
                        text: `Grupo ${groupLetter}`,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },

                    // Tabela de classificação
                    {
                        unbreakable: true,
                        table: {
                            headerRows: 1,
                            dontBreakRows: true,
                            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                            heights: 18,
                            body: standingsBody
                        },

                        layout: {
                            hLineWidth: () => 0.5,
                            vLineWidth: () => 0.5
                        }
                    },

                    // Espaçamento
                    {
                        text: '',
                        margin: [0, 5, 0, 0]
                    },

                    // Tabela de jogos
                    {
                        unbreakable: true,
                        table: {
                            headerRows: 1,
                            dontBreakRows: true,
                            widths: ['auto', '*', 'auto'],
                            body
                        },

                        layout: {
                            hLineWidth: () => 0.5,
                            vLineWidth: () => 0.5
                        }
                    }
                ]
            });

        });

    // Adiciona as tabelas em linhas de 3 colunas
    for (let i = 0; i < groupTables.length; i += 3) {

        docDefinition.content.push({

            margin: [0, 10, 0, 0],

            columnGap: 10,

            columns: [
                groupTables[i],
                groupTables[i + 1] || { width: '*', text: '' },
                groupTables[i + 2] || { width: '*', text: '' }
            ]

        });

    }
}



function getPredictDataByMatchId(matchId){
    return basicData.groupStagePredicts.find(p => p.group_match_id === matchId);
}


async function exportAllFilledInSweeps(userLoggedInToken, sweepsName, userIdInSweepstake){

}

module.exports = { exportUserFilledInSweeps, exportAllFilledInSweeps, basicData };