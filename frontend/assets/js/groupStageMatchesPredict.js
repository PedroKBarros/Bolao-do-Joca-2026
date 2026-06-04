import { goToPage, showLoadingModal, goToHomePage, makeRequest, handleRequest, HANDLE_REQUESTS_STATUS,
    loadModalInHtmlPage, showModal, hideModal, loadHtmlComponentInHtmlPage, 
    getHtmlOfComponent, addEventsToUpdateDropdownSelectedItem, setDefaultDropdownSelectedItem, 
    formatUrlToExternUrl} from "./common.js";
import {defineMainElementMarginTop, defineResizeEvent, getUserDataFromSessionStorage, 
    getSweepsNameFromSessionStorage, addSweepsNameInPageHeader, defineEventsInHeaderButtons,
    showInstructionMsg, defineLoadPageEvents, updateSaveStatus, normalizeScoreTeamInput, 
    checkPartialFilledMatches, checkInvalidFilledMatches, showReviewMatchesMsg} from "./commonPredict.js";
import { PAGE_CONFIGS } from "./config.js";

const msgTitle = "Predições";
var failedInSomeInitRequest;
var matchesData;
var predictData;
var predictDataPendingToSave = [];
var totalFilledMatches = 0;
var groupTablesData = [];
var teamsDraws = [];
var manualDrawsSolutions = [];
var pedingGroupsToTurnNotMoreValidAllManualDrawSolutions = []; //When predict data change and will be saved
var userData;
var sweepsName;
var secundaryStatusHtmlElement = document.getElementById("secundaryStatus");
var thirdPlacesTablesData = [];
var thirdPlacesDefinedKnockoutMatches = [];
var firstStageKnockoutDefinedMatches = [];
var knockoutStagesFilledStatus;

const TOTAL_GROUPS = 12;
const TOTAL_MATCHES_PER_TEAM = 3;
const TOTAL_MATCHES_PER_GROUP = 6;
const TOTAL_TEAM_IN_ALL_GROUP_MATCHES = TOTAL_MATCHES_PER_GROUP * 2;
const TOTAL_MATCHES = TOTAL_MATCHES_PER_GROUP * TOTAL_GROUPS;
//Obs.: o TOTAL_TEAM_IN_ALL_GROUP_MATCHES indica a qtd de seleções 
// envolvidas em todos os 6 jogos, se você considerar repetições.

const NOT_DEFINED_PLACE_VALUE = "-";

const ASCII_CHAR_A_DECIMAL_CODE = 65;

const TEAM_RESULT_IN_MATCH_PREDICTION = {winner: 3, draw: 1, losing: 0};

const DRAW_SOLUTION_STATUS = {inProgress: "IN PROGRESS", automaticSolutionFailed: "AUTO SOLUTION FAILED",
     automaticSolutionWorked: "AUTO SOLUTION WORKED", manualSolutionApplied: "MANUAL SOLUTION APPLIED",
    ignoreByChangeMatchScore: "IGNORE DRAW BY CHANGE MATCH SCORE"};

const GROUP_MATCHES_DRAW_ALERT_TXT = "Desempate Necessário";

export async function init(){
    await loadModalInHtmlPage();
    await checkIfUserCanAccessThisPage();
    if(failedInSomeInitRequest){
        return;
    }
    defineMainElementMarginTop(); //Necessário para que o header não sobreponha parte dos elementos da main
    defineResizeEvent();
    userData = getUserDataFromSessionStorage();
    sweepsName = getSweepsNameFromSessionStorage();
    await getMatchesOfGroupsStage();
    if(failedInSomeInitRequest){
        return;
    }
    await getSavedPredictData();
    if(failedInSomeInitRequest){
        return;
    }
    await getManualDrawSolutions(); //from solutions in database
    if(failedInSomeInitRequest){
        return;
    }
    addSweepsNameInPageHeader(sweepsName);
    defineEventsInHeaderButtons(saveData, () => {showInstructionMsg(msgTitle);}, prepareKnockoutStage);
    await defineGroupMatchesHtmlUi();
    await defineMatchesHtmlUi();
    showSavedPredictDataInInputFields();
    showManualDrawSolutionsSaved();
    /* 
    * Limpando o array, pois como os campos já possuem evento, 
    * a função showSavedPredictDataInInputFields dispara eles, fazendo 
    * com que dados já salvos sejam colocados como pendente de salvamento:
    */
    clearPredictDataPendingToSave(); 
    createGroupTablesData();
    inicializeTeamNamesInGroupTablesData();
    updateGroupTablesData();
    updateDrawsUIOfGroups();
    updateHtmlTables();
    //Atualizando status de total de jogos preenchidos:
    updateTotalFilledMatchesStatus(predictData.length);
    defineLoadPageEvents(secundaryStatusHtmlElement);

    if(predictData.length === 0){
        showInstructionMsg(msgTitle);
    }

}

async function getManualDrawSolutions(){
    let handleReturn = await handleRequest(() => makeRequest("/draws/solutions/groupStage?sweepsName=" + 
        sweepsName + '&userId=' + userData.id, "GET"), null, false, ()=>{throw new Error();}, true, msgTitle);
    /* Obs.: caso ocorra alguma falha, será disparado o erro (passado como parâmetro). 
    * Isso fará com que a handleRequest vá para o bloco catch, exibindo mensagem com
     o erro e direcionando o usuário a home page*/

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        manualDrawsSolutions = handleReturn.response.body;
        if(Object.keys(manualDrawsSolutions).length === 0){
            manualDrawsSolutions = [];
        }
        hideModal();
        //console.log("manualDrawSolutions:");
        //console.log([...manualDrawsSolutions]);
    }else{
        failedInSomeInitRequest = true;
    }
}

async function defineGroupMatchesHtmlUi(){
    //Get group matches div area:
    let groupMatchesArea = document.getElementById("groupMatchesArea");
    const groupMatchHtml = await getHtmlOfComponent("groupMatches");

    //Add all 12 groups:
    for(let i=0;i<12;i++){
        groupMatchesArea.insertAdjacentHTML("beforeEnd", groupMatchHtml);
        document.getElementsByName("groupMatchesTitle")[i].textContent = "GRUPO " + String.fromCharCode(ASCII_CHAR_A_DECIMAL_CODE + i);
    }
 
}

async function defineMatchesHtmlUi() {
    const matchHtml = await getHtmlOfComponent("match");
    let currentMatchGroupLetter = null;
    let currentMatchGroupLetterNumber = null;
    let currentGroupMatch = null;
    let currentInputTime1;
    let currentInputTime2;

    for(let i =0;i<matchesData.length;i++){
        if(currentGroupMatch === null){
            currentMatchGroupLetter = matchesData[i].group_letter_1;
            currentMatchGroupLetterNumber = currentMatchGroupLetter.charCodeAt(0);
            currentGroupMatch = document.getElementsByName("groupMatches")[currentMatchGroupLetterNumber - ASCII_CHAR_A_DECIMAL_CODE];
        }else{
            if(currentMatchGroupLetter !== matchesData[i].group_letter_1){
                currentMatchGroupLetter = matchesData[i].group_letter_1;
                currentMatchGroupLetterNumber = currentMatchGroupLetter.charCodeAt(0);
                currentGroupMatch = document.getElementsByName("groupMatches")[currentMatchGroupLetterNumber - 65];                
            }
        }

        currentGroupMatch.children[1].insertAdjacentHTML("beforeend", matchHtml);
        currentGroupMatch.children[1].lastElementChild.id = matchesData[i].id;
        currentGroupMatch.children[1].lastElementChild.getElementsByTagName("p")[0].textContent = matchesData[i].match_info;
        currentGroupMatch.children[1].lastElementChild.getElementsByTagName("p")[1].textContent = matchesData[i].team_name_1;
        currentGroupMatch.children[1].lastElementChild.getElementsByTagName("p")[2].textContent = matchesData[i].team_name_2;
        //Definindo id e eventos de alteração de valor nos campos de input:
        currentInputTime1 = document.getElementsByName("inputTeam1")[i];
        currentInputTime2 = document.getElementsByName("inputTeam2")[i];
        currentInputTime1.id = "inputTeam1_" + matchesData[i].id;
        currentInputTime1.addEventListener("input", handleChangeInInputFieldValue);
        currentInputTime2.id = "inputTeam2_" + matchesData[i].id;
        currentInputTime2.addEventListener("input", handleChangeInInputFieldValue);
    }
}


async function getMatchesOfGroupsStage() {

    let handleReturn = await handleRequest(() => makeRequest("/matches/groupStage", "GET"), null, false, 
    ()=>{throw new Error();}, true, msgTitle);
    /* Obs.: caso ocorra alguma falha, será disparado o erro (passado como parâmetro). 
    * Isso fará com que a handleRequest vá para o bloco catch, exibindo mensagem com
     o erro e direcionando o usuário a home page*/

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        matchesData = handleReturn.response.body;
        hideModal();
        //console.log("MatchesData:");
        //console.log([...matchesData]);
    }else{
        failedInSomeInitRequest = true;
    }
}

async function getSavedPredictData(){
    const endPoint = '/predictions/groupStage?sweepsName=' + sweepsName + '&userId=' + userData.id;
    let handleReturn = await handleRequest(() => makeRequest(endPoint, "GET"), null, false, 
    ()=>{throw new Error();}, true, msgTitle);
    /* Obs.: caso ocorra alguma falha, será disparado o erro (passado como parâmetro). 
    * Isso fará com que a handleRequest vá para o bloco catch, exibindo mensagem com
     o erro e direcionando o usuário a home page*/

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        predictData = handleReturn.response.body;
        //Caso predictData não possua itens, transformando ele em um array vazio,
        // para que possa ser tratado como array:
        if(Object.keys(predictData).length === 0){
            predictData = [];
        }
        hideModal();
        //console.log("PredictData:");
        //console.log([...predictData]);
    }else{
        failedInSomeInitRequest = true;
    }
}

function showSavedPredictDataInInputFields(){
    let currentMatchid;
    let currentMatchHtmlElement;
    for(let i =0;i<predictData.length;i++){
        currentMatchid = predictData[i].group_match_id;
        //Obtendo o elemento "match" de mesmo id:
        currentMatchHtmlElement = document.getElementById(currentMatchid);
        //Preenchendo os inputs:
        currentMatchHtmlElement.children[1].children[1].value = predictData[i].score_team_1;
        currentMatchHtmlElement.children[2].children[1].value = predictData[i].score_team_2;
    }
}

function showManualDrawSolutionsSaved(){
    let currentGroupLetterCode;
    let currentGroupLetter;
    let currentGroupSavedDraws;
    let currentDrawResolutionDetails;

    for(let i=0;i<TOTAL_GROUPS;i++){
        currentGroupLetterCode = ASCII_CHAR_A_DECIMAL_CODE + i;
        currentGroupLetter = String.fromCharCode(currentGroupLetterCode);
        currentGroupSavedDraws = getAllCurrentValidManualDrawSolutionByGroup(currentGroupLetter);
        if(currentGroupSavedDraws.length === 0){
            continue;
        }

        currentDrawResolutionDetails = document.getElementsByName("drawResolutionDetails")[i];
        currentDrawResolutionDetails.textContent = "Seleções Desempatadas pelo Participante:";
        for(let j = 0;j<currentGroupSavedDraws.length;j++){
            currentDrawResolutionDetails.innerHTML += `
            <br>-${currentGroupSavedDraws[j].team_name}
            `;
        }
    }
}

function handleChangeInInputFieldValue(event){
    const inputTriggedEventId = event.currentTarget.id;
    const groupMatchId = Number(String(inputTriggedEventId).split("_")[1]);
    const groupLetter = getGroupLetterByGroupMatchId(groupMatchId);
    const isTeam1Input = String(inputTriggedEventId).includes("Team1");
    const inputTeam1 = isTeam1Input ? document.getElementById(inputTriggedEventId) : 
    document.getElementById(String(inputTriggedEventId).replace("Team2", "Team1"));
    const inputTeam2 = isTeam1Input ? document.getElementById(String(inputTriggedEventId).replace("Team1", "Team2")) : 
    document.getElementById(inputTriggedEventId);

    //Check if score really change:
    //console.log("RETORNO DA TEAM SCORE REALLY CHANGE: " + teamScoreReallyChange(groupMatchId, inputTeam1.value, inputTeam2.value));
    if(!teamScoreReallyChange(groupMatchId, inputTeam1.value, inputTeam2.value)){
        return;
    }

    //Check if respective group has draw with automatic solution failed, 
    // because, in this case, it's necessary change draw register status and call 
    // function to update group places UI, removing manual draw html elements:
    let groupDrawsCount = 0;
    for(let i=0;i<teamsDraws.length;i++){
        if(teamsDraws[i].group === groupLetter && 
            teamsDraws[i].status === DRAW_SOLUTION_STATUS.automaticSolutionFailed){
            groupDrawsCount++;
            teamsDraws[i].status = DRAW_SOLUTION_STATUS.ignoreByChangeMatchScore;
        }
    }
    if(groupDrawsCount > 0){
        //console.log("Partida alterada de grupo com desempate manual");
        updateDrawsUIOfGroups();
    }

    //Removing all caracteres that is not a 0-9:
    if(isTeam1Input){
        normalizeScoreTeamInput(inputTeam1);
    }else{
        normalizeScoreTeamInput(inputTeam2);
    }

    //Check if all inputs are filled:
    if(inputTeam1.value === '' || inputTeam2.value === ''){
        return;
    }

    let ptsTeam1 = Number(inputTeam1.value) > Number(inputTeam2.value) ? 3 : 
    Number(inputTeam1.value) === Number(inputTeam2.value) ? 1: 0;
    let ptsTeam2 = Number(inputTeam2.value) > Number(inputTeam1.value) ? 3 : 
    Number(inputTeam1.value) === Number(inputTeam2.value) ? 1: 0;

    let predictDataFinded = predictData.find(predictData => predictData.group_match_id === groupMatchId);
    //Check if groupMatchId exist in predictData:
    if(predictDataFinded){
        //Case: exist
        //Update values to save:
        predictDataFinded.score_team_1 = Number(inputTeam1.value);
        predictDataFinded.pts_team_1 = ptsTeam1;
        predictDataFinded.score_team_2 = Number(inputTeam2.value);
        predictDataFinded.pts_team_2 = ptsTeam2;   

        //Check if it's in pending to save:
        let predictDataPendingToSaveFinded = predictDataPendingToSave.find(predictData => 
            predictData.group_match_id === groupMatchId);
        if(!predictDataPendingToSaveFinded){
            //Add predictData to save:
            predictDataPendingToSave.push(predictDataFinded);       
        }
    }else{
        //Case: not exist
        //Add predictData:
        predictData.push({"group_match_id": groupMatchId, "score_team_1": Number(inputTeam1.value), 
            "pts_team_1": ptsTeam1, "score_team_2": Number(inputTeam2.value), "pts_team_2": ptsTeam2});
        
        //Add predictData to save:
        predictDataPendingToSave.push(predictData.at(predictData.length - 1));
    }

    //console.log([...predictData]);
    //console.log([...predictDataPendingToSave]);
}

function teamScoreReallyChange(groupMatchId, scoreTeam1, scoreTeam2){
   let savedMatchPredictData = predictData.find(predictData => 
            predictData.group_match_id === groupMatchId);
                 
    if(savedMatchPredictData){
        return String(savedMatchPredictData.score_team_1) !== scoreTeam1 || 
        String(savedMatchPredictData.score_team_2) !== scoreTeam2;
    }else{
        return true; //Because function handleChangeInInputFieldValue needs to register newScore to pending save
    }
}

function getGroupLetterByGroupMatchId(groupMatchId){
    return matchesData.find(m => m.id === groupMatchId).group_letter_1;
}

async function saveData() {

    //Check if there is some match partiality filled:
    const checkPartialFilledMatchesResult = checkPartialFilledMatches();
    //Check if there is some invalid match filled:
    const checkInvalidFilledMatchesResult = checkInvalidFilledMatches();

    if(checkPartialFilledMatchesResult.total > 0 || checkInvalidFilledMatchesResult.total > 0){
        showReviewMatchesMsg(msgTitle, checkPartialFilledMatchesResult, checkInvalidFilledMatchesResult);
        return;        
    }

    if(predictDataPendingToSave.length === 0){
        //Atualizando status para informar que todos os dados estão salvos:
        updateSaveStatus(secundaryStatusHtmlElement, "", true);
        defineMainElementMarginTop();
        return;
    }

    //Verificando se há soluções manuais relacionadas aos grupos que terão dados de predições salvos:
    if(isThereGroupsThatWillBeNecessaryTurnNotMoreValidAllManualDrawSolutions()){
        showModal(msgTitle, 
            `<p>As alterações que serão salvas envolvem 1 ou mais grupos em que parte das seleções 
            empatadas tiveram que ser desempatas por você. Esses desempates 
            serão desfeitos caso você salve as alterações. Deseja salvá-las?</p>`, true, "SALVAR", async () => await makeSaveDataRequest(true), 
            true, "CANCELAR");
    }else{
        await makeSaveDataRequest();
    }
}

async function makeSaveDataRequest(isNecessaryReloadPage=false){
    //Realizando o save:
    let handleReturn = await handleRequest(() => makeRequest("/predictions/groupStage/save", 
        "POST", JSON.stringify({"userIdInSweepestake": sessionStorage.getItem("userIdInSweepestake"), "predictDataToSave": predictDataPendingToSave}), true), null, false, 
    ()=>{throw new Error();}, true, msgTitle);

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        await runOtherFunctionsAfterSaveData(isNecessaryReloadPage);   
    }
}

async function runOtherFunctionsAfterSaveData(isNecessaryReloadPage=false){
    hideModal();
    //Atualizando data e hora de realização do save:
    updateSaveStatus(secundaryStatusHtmlElement);
    defineMainElementMarginTop();
    //Tratando possíveis soluções manuais relacionadas aos grupos que tiveram dados de predições salvos:
    await handleManualDrawSolutionsAfterSaveNewPredictData();
    //Definindo se botão para ir pra fase mata-mata deve ser exibido ou ocultado:
    handleGotoKnockoutStageButton();
    //Limpando array de dados que estavam pendentes de serem salvos:
    clearPredictDataPendingToSave();
    //Atualizando as tabelas:
    clearTeamDraw();
    if(isNecessaryReloadPage){
        //Recarregando página para que função init() seja executada:
        location.reload();
    }else{
        updateGroupTablesData();
        updateDrawsUIOfGroups();
        updateHtmlTables();
        updateTotalFilledMatchesStatus(predictData.length);
    }

}

function updateTotalFilledMatchesStatus(addValueToTotal){
    totalFilledMatches=addValueToTotal;
    document.getElementById("filledMatchesStatus").textContent = totalFilledMatches + " de 72 jogos preenchidos";
    handleGotoKnockoutStageButton();
}   

function handleGotoKnockoutStageButton(){
    if(canShowBtnGoTOKnockoutStage()){
        showGoToKnockoutStageButton();
    }else{
        hideGoToKnockoutStageButton();
    }
}

function showGoToKnockoutStageButton(){
    let btnGoKnockoutStage = document.getElementById("go-to-knockout-stage");
    let btnInstructions = document.getElementById("show-instructions");

    btnInstructions.classList.add("d-none");
    btnGoKnockoutStage.classList.remove("d-none");
}

function hideGoToKnockoutStageButton(){
    let btnGoKnockoutStage = document.getElementById("go-to-knockout-stage");
    let btnInstructions = document.getElementById("show-instructions");

    btnInstructions.classList.remove("d-none");
    btnGoKnockoutStage.classList.add("d-none");
}

function isThereGroupsThatWillBeNecessaryTurnNotMoreValidAllManualDrawSolutions(){
    let currentGroupLetter;
    for(let i=0;i<predictDataPendingToSave.length;i++){
        currentGroupLetter = getGroupLetterByGroupMatchId(predictDataPendingToSave[i].group_match_id);
        if(manualDrawsSolutions.some(m => m.group_letter === currentGroupLetter)){
            return true;
        }
    }
    return false;    
}

function defineAllGroupsThatWillBeNecessaryTurnNotMoreValidAllManualDrawSolutions(){
    //Verificando se há soluções manuais relacionadas aos grupos que terão dados de predições salvos e,
    //  em caso positivo, adicionando a letra do grupo em array global:
    let currentGroupLetter;
    for(let i=0;i<predictDataPendingToSave.length;i++){
        currentGroupLetter = getGroupLetterByGroupMatchId(predictDataPendingToSave[i].group_match_id);
        if(manualDrawsSolutions.some(m => m.group_letter === currentGroupLetter)){
            if(!pedingGroupsToTurnNotMoreValidAllManualDrawSolutions.some(g => g === currentGroupLetter)){
                pedingGroupsToTurnNotMoreValidAllManualDrawSolutions.push(currentGroupLetter);
            }
        }
    }
}

async function handleManualDrawSolutionsAfterSaveNewPredictData(){
    defineAllGroupsThatWillBeNecessaryTurnNotMoreValidAllManualDrawSolutions();
    //console.log("ENTROU NA handleManualDrawSolutionsAfterSaveNewPredictData");
    if(pedingGroupsToTurnNotMoreValidAllManualDrawSolutions.length === 0){
        //console.log("ENTROU NO IF DA handleManualDrawSolutionsAfterSaveNewPredictData");
        return;
    }
    //Realizando requisição para deletar TODAS as soloções de desempate manual de cada grupo
    //  que teve 1 ou mais predições alteradas e atulizadas no banco:
    let handleReturn = await handleRequest(() => makeRequest("/draws/solutions/groupStage/setToNotMoreValid", 
        "POST", JSON.stringify({"userIdInSweepestake": sessionStorage.getItem("userIdInSweepestake"), 
            "groupsLetter": pedingGroupsToTurnNotMoreValidAllManualDrawSolutions}), true), null, false, 
    ()=>{throw new Error();}, true, msgTitle);

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        hideModal();
        clearGroupsPendingToTurnNotMoreValidAllManualDrawSolutions();
    }

}

function clearGroupsPendingToTurnNotMoreValidAllManualDrawSolutions(){
    pedingGroupsToTurnNotMoreValidAllManualDrawSolutions.length = 0;
}

function clearPredictDataPendingToSave(){
    predictDataPendingToSave.length = 0;
}

function clearTeamDraw(){
    teamsDraws.length = 0;
}

function showStatusOf(){
    secundaryStatusHtmlElement.textContent = "Dados salvos em " + new Date().toLocaleString();
}

function createGroupTablesData(){

    let currentGroupAsciiLetterDecCode;

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

function updateHtmlTables(){
    let groupTables = document.getElementsByTagName("table");
    let currentTableBody;

    for(let i = 0;i<12;i++){
        currentTableBody = groupTables[i].getElementsByTagName("tbody")[0];
        for(let w = 0;w < 4;w++){
            currentTableBody.getElementsByTagName("tr")[w].getElementsByTagName("th")[0].textContent = 
            groupTablesData[i][w].place === NOT_DEFINED_PLACE_VALUE ? NOT_DEFINED_PLACE_VALUE : groupTablesData[i][w].place + "º";
            currentTableBody.getElementsByTagName("tr")[w].getElementsByTagName("td")[0].textContent = groupTablesData[i][w].team;
            currentTableBody.getElementsByTagName("tr")[w].getElementsByTagName("td")[1].textContent = groupTablesData[i][w].pt;
            currentTableBody.getElementsByTagName("tr")[w].getElementsByTagName("td")[2].textContent = groupTablesData[i][w].gs;
            currentTableBody.getElementsByTagName("tr")[w].getElementsByTagName("td")[3].textContent = groupTablesData[i][w].gr;
            currentTableBody.getElementsByTagName("tr")[w].getElementsByTagName("td")[4].textContent = groupTablesData[i][w].gd;
        }

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

    //Verificando se ocorreu empate que precisa
    // de tratamento manual e avisando ao usuário:
    if(teamsDraws.some(t => t.status === DRAW_SOLUTION_STATUS.automaticSolutionFailed)){
        showManualDrawPendingAlertMsg();
    }

}

function showManualDrawPendingAlertMsg(){
    showModal(msgTitle + " - Empates", `
        <p><strong>Um ou mais grupos apresentam seleções empatadas e é necessário sua decisão para desempatá-las.</strong>
        <br><br><strong>Como identificar esses grupos?</strong><br>Esses grupos apresentam a frase '` + 
        GROUP_MATCHES_DRAW_ALERT_TXT + `' ao lado do nome. Para desempatar as seleções deles, desça até o final deles e 
        clique no botão de desempate exibido abaixo da tabela.</p>`, true, "OK", null, false);
}

function updateDrawsUIOfGroups(){
    let htmlGroupElementsIndex;
    let htmlGroupElementAlert;
    let htmlGroupElementSolveDrawBtn1;
    let htmlGroupElementSolveDrawBtn2;
    let currentGroupLetter;
    let currentGroupDraws;

    for(let i=0;i<12;i++){
        currentGroupLetter = String.fromCharCode(i + ASCII_CHAR_A_DECIMAL_CODE);
        currentGroupDraws = teamsDraws.filter(t => t.group === currentGroupLetter && 
            t.status === DRAW_SOLUTION_STATUS.automaticSolutionFailed);
        
        htmlGroupElementsIndex = i;
        htmlGroupElementAlert = document.getElementsByName("groupMatchesAlert")[htmlGroupElementsIndex];
        htmlGroupElementSolveDrawBtn1 = document.getElementsByName("drawBtn1")[htmlGroupElementsIndex];
        htmlGroupElementSolveDrawBtn2 = document.getElementsByName("drawBtn2")[htmlGroupElementsIndex];
        
        //console.log("ABC:");
        //console.log(currentGroupDraws);
        if(currentGroupDraws.length === 0){
            //Hidde draw alert and buttons:
            htmlGroupElementAlert.classList.add("d-none");
            htmlGroupElementSolveDrawBtn1.classList.add("d-none");
            htmlGroupElementSolveDrawBtn2.classList.add("d-none");            
        }else{
            //Show draw alert:
            htmlGroupElementAlert.classList.remove("d-none"); //Turn alert visible
            htmlGroupElementAlert.textContent = GROUP_MATCHES_DRAW_ALERT_TXT;

            //Show buttons to solve draw(s):
            //Define btn id with group letter and place:
            htmlGroupElementSolveDrawBtn1.id = "btnSolveDraw-" + currentGroupLetter + "-" + currentGroupDraws[0].place;
            //Define btn click event:
            htmlGroupElementSolveDrawBtn1.addEventListener("click", handleManualDrawSolution);
            htmlGroupElementSolveDrawBtn1.classList.remove("d-none"); //Turn button visible
            htmlGroupElementSolveDrawBtn1.textContent = "DESEMPATAR " + currentGroupDraws[0].place + "º";
            if(currentGroupDraws.length === 2){
                //Define btn id with group letter and place:
                htmlGroupElementSolveDrawBtn2.id = "btnSolveDraw-" + currentGroupLetter + "-" + currentGroupDraws[1].place;
                //Define btn click event:
                htmlGroupElementSolveDrawBtn2.addEventListener("click", handleManualDrawSolution);
                htmlGroupElementSolveDrawBtn2.classList.remove("d-none"); //Turn button visible
                htmlGroupElementSolveDrawBtn2.textContent = "DESEMPATAR " + currentGroupDraws[1].place + "º";            
            }
        }

    }
}

async function handleManualDrawSolution(event){
    //Get button id:
    const btnManualDrawSolutionId = event.currentTarget.id;
    const groupLetter = String(btnManualDrawSolutionId).split("-")[1];
    const drawPlace = Number(String(btnManualDrawSolutionId).split("-")[2]);
    const modalTitle = "Grupo " + groupLetter + " - Desempate do " + drawPlace + "º Lugar";
    let groupTableData = getGroupTableDataByLetter(groupLetter);
    let groupDrawRowsTableData = groupTableData.filter(t => t.place === drawPlace);
    let totalOfTeamsDrawed = totalOfDrawInGroupTableDataByPlace(groupTableData, drawPlace);
    let strPlacesToDefine = "";
    let lastPlaceToDefine = drawPlace + totalOfTeamsDrawed - 1;

    for(let place = drawPlace;place <= lastPlaceToDefine;place++){
        strPlacesToDefine += place + "º";
        if(place < lastPlaceToDefine){
            if(place + 1 < lastPlaceToDefine){
                strPlacesToDefine += ", ";    
            }else{
                strPlacesToDefine += " e ";
            }
        }
    }

    showModal(modalTitle, await generateHtmlContentModalOfManualDrawSolution(drawPlace, 
        lastPlaceToDefine, strPlacesToDefine), true, "CONFIRMAR", () => {
            saveManualDrawSolution(groupLetter, drawPlace, lastPlaceToDefine)
        }, true, "CANCELAR", null, true);

    //Config dropdowns to show selected option and to have only places to define:
    configDropdownsOfManualDrawSolutionModal(groupDrawRowsTableData, drawPlace, lastPlaceToDefine);

    //Config Team Names:
    configTeamNamesOfManualDrawSolutionModal(groupDrawRowsTableData);

}

async function saveManualDrawSolution(groupLetter, firstPlaceToDefine, lastPlaceToDefine){

    let manualDrawSolutions;
    let dropdowns = document.getElementsByName("drawDropdown");
    let teamNames = document.getElementsByName("teamName");

    //Check if all dropdowns was filled and if all place is unique:
    let isValidManualDrawSolution = checkManualDrawSolutionPlaceDefinied(dropdowns);
    
    if(!isValidManualDrawSolution){
        return;
    }

    manualDrawSolutions = [];
    for(let i=0;i<dropdowns.length;i++){
        manualDrawSolutions.push(
            {
            "place": dropdowns[i].innerText.replace("º", ""), 
            "group_letter": groupLetter, 
            "team_name": teamNames[i].innerText.replace(":", "")
            });
    }

    //Salvando Desempate 
    let handleReturn = await handleRequest(() => makeRequest("/draws/solutions/groupStage/save", 
        "POST", JSON.stringify(
            {
                "userIdInSweepestake": sessionStorage.getItem("userIdInSweepestake"), 
                "manualDrawSolutions": manualDrawSolutions
            }), true), null, false, ()=>{throw new Error();}, true, msgTitle);

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
    handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
    handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        hideModal();
        changeTeamDrawStatusToManualSolutionApplied(groupLetter, firstPlaceToDefine);
        //Recarregando página para que função init() seja executada, atualizando UI e 
        // obtendo soluções de desempate salvas no banco:
        location.reload();
        //console.log(teamsDraws);
    }

}

function checkManualDrawSolutionPlaceDefinied(dropdowns){
    let warningMsg = document.getElementById("warning-msg");

    //Check if all places were defined:
    for(let i=0;i<dropdowns.length;i++){
        if(dropdowns[i].innerText === ""){
            warningMsg.textContent = "Uma ou mais lugares não foram definidos.";
            warningMsg.classList.remove("d-none");//Show warningMsg element
            return false;
        }
    }

    //Check if all defined places are unique:
    let currentPlace;
    let currentPlaceCount;
    for(let i=0;i<dropdowns.length;i++){
        currentPlace = dropdowns[i].innerText;
        currentPlaceCount=0;
        for(let j=0;j<dropdowns.length;j++){
            if(currentPlace === dropdowns[j].innerText){
                currentPlaceCount++;
                if(currentPlaceCount > 1){
                    warningMsg.textContent = "Uma ou mais lugares estão repetidos.";
                    warningMsg.classList.remove("d-none");//Show warningMsg element
                    return false;
                }
            }
        }
    }
    return true;
}

function changeTeamDrawStatusToManualSolutionApplied(groupLetter, drawPlace){
    teamsDraws.find(d => d.group === groupLetter && d.place === drawPlace).status = DRAW_SOLUTION_STATUS.manualSolutionApplied;
    
}

async function generateHtmlContentModalOfManualDrawSolution(firstPlaceToDefine, lastPlaceToDefine, strPlacesToDefine){
    const drawTeamSolveHtml = await getHtmlOfComponent("drawTeamSolveInGroupStage");
    let currentDrawTeamSolveHtml;
    let currentDropdownId;
    let currentDropDownListOptId;
    let modalHtmlContent = `

    <!-- A div container abaixo serve apenas para que as labels fiquem alinhadas 
        a esquerda, não sendo necessário em todas as páginas.
        Obs.: ela só cumprirá esse objetivo se os elementos de maior 
        largura da página forem os campos. -->
    <div class="container app-restrict-container mx-auto">
        <div class="row d-flex justify-content-center align-items-center">
            <div class="col-12 text-start">
                <p>Defina quais das seleções abaixo deverão estar nos `+ strPlacesToDefine + ` lugares:</p>
            </div>
        </div>
    `;
    let totalPlacesToDefine = lastPlaceToDefine - firstPlaceToDefine + 1;

    //console.log(strPlacesToDefine);
    for(let i=0;i<totalPlacesToDefine;i++){
        currentDrawTeamSolveHtml = drawTeamSolveHtml;
        currentDropdownId = "dropdown-" + (i+1);
        currentDrawTeamSolveHtml = currentDrawTeamSolveHtml.replace("dropdown1", currentDropdownId);
        currentDropDownListOptId = "dropdown-" + (i+1) + "-list-options";
        currentDrawTeamSolveHtml = currentDrawTeamSolveHtml.replace("dropdown1-list-options", currentDropDownListOptId);
        modalHtmlContent += currentDrawTeamSolveHtml;
    }

    modalHtmlContent += `
    <div class="row d-flex justify-content-center align-items-center">
        <div class="col-12 text-start">
            <p id="warning-msg" class="app-alert-txt-block app-top-separation d-none" style="width: 300px;"></p>
        </div>
    </div>`;

    modalHtmlContent+="</div>";

    return modalHtmlContent;

}

function configDropdownsOfManualDrawSolutionModal(groupDrawRowsTableData, firstPlaceToDefine, lastPlaceToDefine){
    let dropdowns = document.getElementsByName("drawDropdown");
    let strDropdownHtmlOption = 
    `
    <li>
        <p class="listDropdownFilterOption app-small-txt dropdown-item">XXXº</p>
    </li>
    `;
    let dropdownsHtmlOptions = "";

    for(let place=firstPlaceToDefine;place <= lastPlaceToDefine;place++){
        dropdownsHtmlOptions += strDropdownHtmlOption.replace("XXX", place);
    }    

    for(let i =0;i<dropdowns.length;i++){
        dropdowns[i].parentElement.children[1].insertAdjacentHTML("beforeend", dropdownsHtmlOptions);
        addEventsToUpdateDropdownSelectedItem(dropdowns[i].id, dropdowns[i].parentElement.getElementsByTagName("ul")[0].id);
    }
}

function configTeamNamesOfManualDrawSolutionModal(groupDrawRowsTableData){
    let teamNamesHtmlElements = document.getElementsByName("teamName");
    //console.log(groupDrawRowsTableData);
    for(let i=0;i<groupDrawRowsTableData.length;i++){
        teamNamesHtmlElements[i].textContent = groupDrawRowsTableData[i].team + ":";
    }
}

function getGroupTableDataByLetter(groupLetter){
    for(let i =0;i<groupTablesData.length;i++){
        if(groupTablesData[i][0].group === groupLetter){
            return groupTablesData[i];
        }
    }

    return null;
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

function getManualDrawSolution(groupLetter, teamName){
    for(let i=0;i<manualDrawsSolutions.length;i++){
        if(manualDrawsSolutions[i].group_letter === groupLetter && 
            manualDrawsSolutions[i].team_name === teamName){
            return manualDrawsSolutions[i];
        }
    }
    return null;
}

function getAllCurrentValidManualDrawSolutionByGroup(groupLetter){
    let allManualDrawsSolGroup = [];
    for(let i=0;i<manualDrawsSolutions.length;i++){
        if(manualDrawsSolutions[i].group_letter === groupLetter && 
            manualDrawsSolutions[i].is_not_more_valid === 0){
            allManualDrawsSolGroup.push(manualDrawsSolutions[i]);
        }
    }
    return allManualDrawsSolGroup;
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

function canShowBtnGoTOKnockoutStage(){
    //Check if doesn't exist automatic filed solution team draws:
    let isThereTeamsDrawNotResolved = teamsDraws.some(d => d.status === DRAW_SOLUTION_STATUS.automaticSolutionFailed);
    //Check if doesn't exist predict data pending to save:
    let isTherePredictDataPendingToSave = predictDataPendingToSave.length > 0;

    return totalFilledMatches === TOTAL_MATCHES && !isThereTeamsDrawNotResolved && !isTherePredictDataPendingToSave;
}


function prepareKnockoutStage(){
    if(thirdPlacesTablesData.length === 0){
        //Create tables of third places that is possible to go to knockout stage:
        createThirdPlacesTablesData();
    }
    
    let placesResult;
    let thirdTableDataRow;
    let thirdTableDataIndex =0;
    let isUserDefiningThirdPlacesToKnockoutMatches;

    while(thirdPlacesDefinedKnockoutMatches.length < 8 && thirdTableDataIndex < thirdPlacesTablesData.length && 
        !isUserDefiningThirdPlacesToKnockoutMatches){
        placesResult = defineThirdPlaceTablePlaces(thirdPlacesTablesData[thirdTableDataIndex]);
        //console.log("thirdTableDataIndex: " + thirdTableDataIndex);
        if(thirdPlacesTablesData[thirdTableDataIndex].length === 0){
            //In this case, third table data matrix have all teams selected to knockout matches.
            thirdTableDataIndex++;
            continue;
        }
        if(!isThirdPlaceTeamDefinedByKnockoutMatchNumber(thirdPlacesTablesData[thirdTableDataIndex][0].knockoutMatchNumber)){
            if(placesResult.occurredFirstPlaceDraw){
                //In this case, user need to define which team will be format the knockout match:
                isUserDefiningThirdPlacesToKnockoutMatches = true;
                showChooseThirdPlaceToKnockoutMatchModal(thirdTableDataIndex);
            }else{
                thirdTableDataRow = thirdPlacesTablesData[thirdTableDataIndex].find(t => t.place === 1);
                thirdPlacesDefinedKnockoutMatches.push({"group": thirdTableDataRow.group, "team": 
                thirdTableDataRow.team, "knockoutMatchNumber": thirdTableDataRow.knockoutMatchNumber, 
                "knockoutMatchThirdPlaceRule": thirdTableDataRow.knockoutMatchThirdPlaceRule});
                thirdPlacesTablesData = removeOfThirdPlaceTablesDataAllOccurrenceOfLastDefinedKnockoutMatchesTeam();
            }
        }
        thirdTableDataIndex++;
    }
    //console.log("SAIU DO LOOOP");
    //console.log(thirdPlacesDefinedKnockoutMatches);
    if(thirdPlacesDefinedKnockoutMatches.length === 8){
        //Solicitando confirmação de ida para fase mata-mata e avisando 
        // usuário sobre impossibilidade de alterar a fase de grupos ao 
        // ir para a fase mata-mata:
        showModal(msgTitle + " - Confirmação Ida Fase Mata-Mata", 
            `<p>Tudo pronto para que você vá para a fase Mata-mata!<br><strong>Ao prosseguir, 
            não será mais possível alterar a fase de grupos.</strong> Deseja continuar?</p>`,
        true, "SIM, IR PARA FASE MATA-MATA", definedFirstKnockoutStageTeamsMatches, 
        true, "NÃO, FICAR NA FASE DE GRUPOS", restoreKnockoutStagePrepareData);
    }
}

async function definedFirstKnockoutStageTeamsMatches(){
    let firstKnockoutStageName = "32-Avos de Final";
    //Obtendo as regras de formação das partidas, número das partidas e infos:
    let handleReturn = await handleRequest(() => makeRequest(`/matches/knockoutStage/matchesRules?knockoutStageName=${firstKnockoutStageName}`, "GET"), 
    null, false, ()=>{throw new Error();}, true, msgTitle);
    let firstKnockoutStageMatchTeamsRules;

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        firstKnockoutStageMatchTeamsRules = handleReturn.response.body;
        console.log("matchesRules:");
        console.log(firstKnockoutStageMatchTeamsRules);
        hideModal();
        //console.log("firstKnockoutStageMatchTeamsRules:");
        //console.log([...firstKnockoutStageMatchTeamsRules]);
    }

    //Definindo dados das partidas da fase 32-avos:
    let currentTeam1;
    let currentTeam2;
    let currentParsedRule;
    for(let i=0;i<firstKnockoutStageMatchTeamsRules.length;i++){
        currentParsedRule = parseFirstKnockoutStageMatchRule(firstKnockoutStageMatchTeamsRules[i].rule_team_1);
        if(isThirdPlaceRuleToDefineKnockoutTeamMatch(currentParsedRule)){
            currentTeam1 = thirdPlacesDefinedKnockoutMatches.find(t => t.knockoutMatchThirdPlaceRule === currentParsedRule.teamGroups).team;
        }else{
            currentTeam1 = getTeamNameOfGroupByPlace(currentParsedRule.teamGroups, currentParsedRule.teamGroupPlace);
        }

        currentParsedRule = parseFirstKnockoutStageMatchRule(firstKnockoutStageMatchTeamsRules[i].rule_team_2);
        if(isThirdPlaceRuleToDefineKnockoutTeamMatch(currentParsedRule)){
            currentTeam2 = thirdPlacesDefinedKnockoutMatches.find(t => t.knockoutMatchThirdPlaceRule === currentParsedRule.teamGroups).team;
        }else{
            currentTeam2 = getTeamNameOfGroupByPlace(currentParsedRule.teamGroups, currentParsedRule.teamGroupPlace);
        }
        firstStageKnockoutDefinedMatches.push({"team_1_name": currentTeam1, "team_2_name": currentTeam2, 
            "match_number": firstKnockoutStageMatchTeamsRules[i].match_number});
    }

    console.log("firstStageKnockoutDefinedMatches:");
    console.log(firstStageKnockoutDefinedMatches);

    //Armazenando as partidas da fase mata-mata 32-avos de final no banco:
    handleReturn = await handleRequest(() => makeRequest(`/matches/knockoutStage/defineMatches?knockoutStageName=${firstKnockoutStageName}`, 
        "POST", JSON.stringify({"userIdInSweepestake": sessionStorage.getItem("userIdInSweepestake"), 
            "knockoutMatches": firstStageKnockoutDefinedMatches}), true), null, false, ()=>{throw new Error();}, true, msgTitle);

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        hideModal();

        //Armazenando USERS_KNOCKOUT_STAGES_STATUS da primeira fase mata-mata, com is_all_filled false,
        //apenas para que seja possível identificar se o usuário já foi ou não para a fase mata-mata:
        handleReturn = await handleRequest(() => makeRequest(`/predictions/knockoutStage/filledStatus`, 
            "POST", JSON.stringify({
                "userIdInSweepestake": sessionStorage.getItem("userIdInSweepestake"), 
                "knockoutStageName": firstKnockoutStageName, 
                "isAllFilled": 0
            }), true), null, false, ()=>{throw new Error();}, true, msgTitle);
         
        if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
            handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
            handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
            hideModal(); 
            goToPage(PAGE_CONFIGS.PG_KNOCKOUT_STAGES_MATCHES_PREDICT);
        }     
    }

}

function getTeamNameOfGroupByPlace(groupLetter, teamPlace){
    //console.log(groupLetter);
    //console.log(teamPlace);
    let groupTableSDataIndex = String(groupLetter).charCodeAt() - ASCII_CHAR_A_DECIMAL_CODE;
    //console.log(groupTableSDataIndex);
    return groupTablesData[groupTableSDataIndex].find(t => t.place === teamPlace).team;
}

function isThirdPlaceRuleToDefineKnockoutTeamMatch(parsedRule){
    return parsedRule.teamGroupPlace === 3;
}

function parseFirstKnockoutStageMatchRule(rule){
    let splitRuleBySpace = String(rule).split(" ");
    let teamGroupPlace = Number(splitRuleBySpace[0].charAt(0));
    let teamGroups = splitRuleBySpace[splitRuleBySpace.length - 1];

    return {"teamGroupPlace": teamGroupPlace, "teamGroups": teamGroups};
}

function removeOfThirdPlaceTablesDataAllOccurrenceOfLastDefinedKnockoutMatchesTeam(){
    let definedLastTeam = thirdPlacesDefinedKnockoutMatches.at(thirdPlacesDefinedKnockoutMatches.length - 1);
    let thirdPlaceTablesDataAddressToDelete = [];

    for(let tableIndex = 0;tableIndex < thirdPlacesTablesData.length;tableIndex++){
        for(let tableRowIndex = 0;tableRowIndex<thirdPlacesTablesData[tableIndex].length;tableRowIndex++){
            if(thirdPlacesTablesData[tableIndex][tableRowIndex].team === definedLastTeam.team){
                //Trocando esse objeto com o último objeto para que seja possível utilizar a remoção via função pop():
                let auxArray = thirdPlacesTablesData[tableIndex];
                auxArray[tableRowIndex] = auxArray[auxArray.length - 1];
                thirdPlaceTablesDataAddressToDelete.push(tableIndex);
            }
        }
    }
    
    for(let i=0;i<thirdPlaceTablesDataAddressToDelete.length;i++){
        thirdPlacesTablesData[thirdPlaceTablesDataAddressToDelete[i]].pop();
        
    }

    //console.log("THIRD PLACES DATA AFETER DELETES:");
    //console.log(thirdPlacesTablesData);

    return thirdPlacesTablesData;

}

function showChooseThirdPlaceToKnockoutMatchModal(thirdTableDataIndex){
    showModal(msgTitle + " - Definição de Partida da Fase Mata-Mata", generateHTMLChooseThirdPlaceToKnockoutMatchModal(thirdTableDataIndex), 
    true, "CONFIRMAR", () => {storageDefinedThirdPlaceTeamInKnockoutStageMatch(thirdTableDataIndex);prepareKnockoutStage()}, true, 
    "ALTERAR FASE DE GRUPOS", restoreKnockoutStagePrepareData, true);
} 

function isThirdPlaceTeamDefinedByKnockoutMatchNumber(matchNumber){
    return thirdPlacesDefinedKnockoutMatches.some(t => t.knockoutMatchNumber === matchNumber);
}

function storageDefinedThirdPlaceTeamInKnockoutStageMatch(thirdTableDataIndex){
    let checkboxs = document.getElementsByName("flexRadioDefault");
    let thirdTableData = thirdPlacesTablesData[thirdTableDataIndex];
    let thirdTableDataRow;
    for(let i=0;i<checkboxs.length;i++){
        if(checkboxs[i].checked){
            thirdTableDataRow = thirdTableData[Number(checkboxs[i].id.split("_")[1])];
            thirdPlacesDefinedKnockoutMatches.push({"group": thirdTableDataRow.group, "team": 
                thirdTableDataRow.team, "knockoutMatchNumber": thirdTableDataRow.knockoutMatchNumber, 
                "knockoutMatchThirdPlaceRule": thirdTableDataRow.knockoutMatchThirdPlaceRule});
            //Remove team defined:
            thirdPlacesTablesData = removeOfThirdPlaceTablesDataAllOccurrenceOfLastDefinedKnockoutMatchesTeam();
            console.log("thirdPlacesDefinedKnockoutMatches:");
            console.log(thirdPlacesDefinedKnockoutMatches);
            return;
        }
    }

    //Se chegamos aqui, significa que o usuário não marcou nenhuma checkbox:
    //showNotChoosedThirdPlaceTeamWarningMsg();
}

function showNotChoosedThirdPlaceTeamWarningMsg(){
    let warningMsg = document.getElementById("warning-msg");

    warningMsg.classList.remove("d-none");
    warningMsg.innerText = "Você não escolheu uma das seleções. Clique no nome da seleção desejada para escolhe-la.";
}

function restoreKnockoutStagePrepareData(){
    thirdPlacesTablesData.length = 0;
    thirdPlacesDefinedKnockoutMatches.length = 0;
    //console.log("EXEC RESTORE");
}

function generateHTMLChooseThirdPlaceToKnockoutMatchModal(thirdTableDataIndex){
    let thirdTableData = thirdPlacesTablesData[thirdTableDataIndex];
    let html = `
    <!-- A div container abaixo serve apenas para que as labels fiquem alinhadas 
        a esquerda, não sendo necessário em todas as páginas.
        Obs.: ela só cumprirá esse objetivo se os elementos de maior 
        largura da página forem os campos. -->
    <div class="container app-restrict-container mx-auto">
        <div class="row d-flex justify-content-center align-items-center">
            <div class="col-12 text-start">
                <p>Devido a um empate entre os terceiros lugares dos grupos 
                ${thirdTableData[0].knockoutMatchThirdPlaceRule}, 
                é necessário escolher quais das seleções abaixo comporá essa partida:</p>
            </div>
        </div>`;


    let currentCheckboxId;
    for(let i =0;i<thirdTableData.length;i++){
        if(thirdTableData[i].place === 1){
            currentCheckboxId = "thirdTableIndex_" + i;
            html += `<div class="row d-flex justify-content-center align-items-center">
                <div class="col-12 text-start">
                    <div class="form-check">
                        <input class="app-checkbox-field form-check-input" type="radio" name="flexRadioDefault" id="${currentCheckboxId}">
                        <label class="form-check-label" for="${currentCheckboxId}">
                            ${thirdTableData[i].team}
                        </label>
                    </div>
                </div>
            </div>`;
        }
    }

    html+=`
    <div class="row d-flex justify-content-center align-items-center">
        <div class="col-12 text-start">
            <p id="warning-msg" class="app-alert-txt-block app-top-separation d-none" style="width: 300px;">
            </p>
        </div>
    </div>`;

    html+='</div>';

    return html;
}

function getThirdPlacesDataFromGroupTablesData(groupsLetterArray){
    let currentGroupIndex;
    let thirdPlacesData = [];
    for(let i=0;i<groupsLetterArray.length;i++){
         currentGroupIndex = String(groupsLetterArray[i]).charCodeAt() - ASCII_CHAR_A_DECIMAL_CODE;
         thirdPlacesData.push(groupTablesData[currentGroupIndex][2]);
    }

    return thirdPlacesData;
}

function createThirdPlacesTablesData(){
    let thirdPlacesData;
    let thirdPlacesTable;
    let knockoutMatchNumber;
    let knockoutMatchThirdPlaceRule;
    let knockoutMatchTeamNumber;    

    thirdPlacesData = getThirdPlacesDataFromGroupTablesData(["A", "B", "C", "D", "F"]);
    //console.log(thirdPlacesData);
    knockoutMatchNumber = 74;
    knockoutMatchThirdPlaceRule = "A/B/C/D/F";
    
    thirdPlacesTable = [];
    for(let i=0;i<thirdPlacesData.length;i++){
        thirdPlacesTable.push(
            {"knockoutMatchNumber": knockoutMatchNumber, "knockoutMatchThirdPlaceRule": knockoutMatchThirdPlaceRule, 
                 "place": NOT_DEFINED_PLACE_VALUE, 
                "group": thirdPlacesData[i].group, "team": thirdPlacesData[i].team, "pt": thirdPlacesData[i].pt, 
                "gs": thirdPlacesData[i].gs, "gr": thirdPlacesData[i].gr, "gd": thirdPlacesData[i].gd }
        );
    }
    //console.log(thirdPlacesTable);
    thirdPlacesTablesData.push(thirdPlacesTable);

    thirdPlacesData = getThirdPlacesDataFromGroupTablesData(["C", "D", "F", "G", "H"]);
    knockoutMatchNumber = 77;
    knockoutMatchThirdPlaceRule = "C/D/F/G/H";
    
    thirdPlacesTable = [];
    for(let i=0;i<thirdPlacesData.length;i++){
        thirdPlacesTable.push(
            {"knockoutMatchNumber": knockoutMatchNumber, "knockoutMatchThirdPlaceRule": knockoutMatchThirdPlaceRule, 
                 "place": NOT_DEFINED_PLACE_VALUE, 
                "group": thirdPlacesData[i].group, "team": thirdPlacesData[i].team, "pt": thirdPlacesData[i].pt, 
                "gs": thirdPlacesData[i].gs, "gr": thirdPlacesData[i].gr, "gd": thirdPlacesData[i].gd },

        );
    }
    thirdPlacesTablesData.push(thirdPlacesTable);

    thirdPlacesData = getThirdPlacesDataFromGroupTablesData(["C", "E", "F", "H", "I"]);
    knockoutMatchNumber = 79;
    knockoutMatchThirdPlaceRule = "C/E/F/H/I";
    
    thirdPlacesTable = [];
    for(let i=0;i<thirdPlacesData.length;i++){
        thirdPlacesTable.push(
            {"knockoutMatchNumber": knockoutMatchNumber, "knockoutMatchThirdPlaceRule": knockoutMatchThirdPlaceRule, 
                 "place": NOT_DEFINED_PLACE_VALUE, 
                "group": thirdPlacesData[i].group, "team": thirdPlacesData[i].team, "pt": thirdPlacesData[i].pt, 
                "gs": thirdPlacesData[i].gs, "gr": thirdPlacesData[i].gr, "gd": thirdPlacesData[i].gd },

        );
    }
    thirdPlacesTablesData.push(thirdPlacesTable);

    thirdPlacesData = getThirdPlacesDataFromGroupTablesData(["E", "H", "I", "J", "K"]);
    knockoutMatchNumber = 80;
    knockoutMatchThirdPlaceRule = "E/H/I/J/K";
    
    thirdPlacesTable = [];
    for(let i=0;i<thirdPlacesData.length;i++){
        thirdPlacesTable.push(
            {"knockoutMatchNumber": knockoutMatchNumber, "knockoutMatchThirdPlaceRule": knockoutMatchThirdPlaceRule, 
                 "place": NOT_DEFINED_PLACE_VALUE, 
                "group": thirdPlacesData[i].group, "team": thirdPlacesData[i].team, "pt": thirdPlacesData[i].pt, 
                "gs": thirdPlacesData[i].gs, "gr": thirdPlacesData[i].gr, "gd": thirdPlacesData[i].gd },

        );
    }
    thirdPlacesTablesData.push(thirdPlacesTable);

    thirdPlacesData = getThirdPlacesDataFromGroupTablesData(["B", "E", "F", "I", "J"]);
    knockoutMatchNumber = 81;
    knockoutMatchThirdPlaceRule = "B/E/F/I/J";
    
    thirdPlacesTable = [];
    for(let i=0;i<thirdPlacesData.length;i++){
        thirdPlacesTable.push(
            {"knockoutMatchNumber": knockoutMatchNumber, "knockoutMatchThirdPlaceRule": knockoutMatchThirdPlaceRule, 
                 "place": NOT_DEFINED_PLACE_VALUE, 
                "group": thirdPlacesData[i].group, "team": thirdPlacesData[i].team, "pt": thirdPlacesData[i].pt, 
                "gs": thirdPlacesData[i].gs, "gr": thirdPlacesData[i].gr, "gd": thirdPlacesData[i].gd },

        );
    }
    thirdPlacesTablesData.push(thirdPlacesTable);

    thirdPlacesData = getThirdPlacesDataFromGroupTablesData(["A", "E", "H", "I", "J"]);
    knockoutMatchNumber = 82;
    knockoutMatchThirdPlaceRule = "A/E/H/I/J";
    
    thirdPlacesTable = [];
    for(let i=0;i<thirdPlacesData.length;i++){
        thirdPlacesTable.push(
            {"knockoutMatchNumber": knockoutMatchNumber, "knockoutMatchThirdPlaceRule": knockoutMatchThirdPlaceRule, 
                 "place": NOT_DEFINED_PLACE_VALUE, 
                "group": thirdPlacesData[i].group, "team": thirdPlacesData[i].team, "pt": thirdPlacesData[i].pt, 
                "gs": thirdPlacesData[i].gs, "gr": thirdPlacesData[i].gr, "gd": thirdPlacesData[i].gd },

        );
    }
    thirdPlacesTablesData.push(thirdPlacesTable);

    thirdPlacesData = getThirdPlacesDataFromGroupTablesData(["E", "F", "G", "I", "J"]);
    knockoutMatchNumber = 85;
    knockoutMatchThirdPlaceRule = "E/F/G/I/J";
    
    thirdPlacesTable = [];
    for(let i=0;i<thirdPlacesData.length;i++){
        thirdPlacesTable.push(
            {"knockoutMatchNumber": knockoutMatchNumber, "knockoutMatchThirdPlaceRule": knockoutMatchThirdPlaceRule, 
                 "place": NOT_DEFINED_PLACE_VALUE, 
                "group": thirdPlacesData[i].group, "team": thirdPlacesData[i].team, "pt": thirdPlacesData[i].pt, 
                "gs": thirdPlacesData[i].gs, "gr": thirdPlacesData[i].gr, "gd": thirdPlacesData[i].gd },

        );
    }
    thirdPlacesTablesData.push(thirdPlacesTable);

    thirdPlacesData = getThirdPlacesDataFromGroupTablesData(["D", "E", "I", "J", "L"]);
    knockoutMatchNumber = 87;
    knockoutMatchThirdPlaceRule = "D/E/I/J/L";
    
    thirdPlacesTable = [];
    for(let i=0;i<thirdPlacesData.length;i++){
        thirdPlacesTable.push(
            {"knockoutMatchNumber": knockoutMatchNumber, "knockoutMatchThirdPlaceRule": knockoutMatchThirdPlaceRule, 
                 "place": NOT_DEFINED_PLACE_VALUE, 
                "group": thirdPlacesData[i].group, "team": thirdPlacesData[i].team, "pt": thirdPlacesData[i].pt, 
                "gs": thirdPlacesData[i].gs, "gr": thirdPlacesData[i].gr, "gd": thirdPlacesData[i].gd },

        );
    }
    thirdPlacesTablesData.push(thirdPlacesTable);

    //console.log("Third Places Tables:");
    //console.log(thirdPlacesTablesData);

}

function defineThirdPlaceTablePlaces(thirdPlaceTable, attributesReference=["pt", "gd", "gs"]){
    let lastTeamPlace;
    let attributeRefValueOfLastTeam;
    let occuredFirstPlaceDraw = true;
    let attributeRefIndex=0;
    let attributeReference;

    while(occuredFirstPlaceDraw && attributeRefIndex < attributesReference.length){
        attributeReference = attributesReference[attributeRefIndex];
        switch(attributeRefIndex){
            case 0:
                thirdPlaceTable = sortTeamGroupByColumn(thirdPlaceTable, [{attribute:attributeReference, order:"desc"}]);
                break;
            case 1:
                thirdPlaceTable = sortTeamGroupByColumn(thirdPlaceTable, [{attribute:attributesReference[attributeRefIndex-1], order:"desc"}, 
                    {attribute:attributesReference[attributeRefIndex], order:"desc"}]);
            default:
                thirdPlaceTable = sortTeamGroupByColumn(thirdPlaceTable, [{attribute:attributesReference[attributeRefIndex-2], order:"desc"},
                    {attribute:attributesReference[attributeRefIndex-1], order:"desc"}, 
                    {attribute:attributesReference[attributeRefIndex], order:"desc"}]);
        }

        
        occuredFirstPlaceDraw=false;
        for(let i =0;i<thirdPlaceTable.length;i++){
            if(i===0){
                thirdPlaceTable[i].place = i + 1;
                //occuredFirstPlaceDraw = true;
            }else{
                if(attributeRefValueOfLastTeam === thirdPlaceTable[i][attributeReference]){
                    thirdPlaceTable[i].place = lastTeamPlace;
                    if(lastTeamPlace === 1){
                        occuredFirstPlaceDraw = true;
                    }               
                }else{
                    thirdPlaceTable[i].place = i + 1;
                }
            }
            lastTeamPlace = thirdPlaceTable[i].place;
            attributeRefValueOfLastTeam = thirdPlaceTable[i][attributeReference];
        }
        attributeRefIndex++;
    }


    return {"occurredFirstPlaceDraw": occuredFirstPlaceDraw, "thirdPlaceTable": thirdPlaceTable};
}

async function getAllKnockoutStagesFilledStatus(){

    let userIdInSweepestake = sessionStorage.getItem("userIdInSweepestake");
    console.log("userIdInSweepestake:");
    console.log(userIdInSweepestake);
    let handleReturn = await handleRequest(() => makeRequest(`/predictions/allKnockoutStages/filledStatus?userIdInSweepestake=${userIdInSweepestake}`, "GET"), 
    null, false, ()=>{throw new Error();}, true, msgTitle);

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
            knockoutStagesFilledStatus = handleReturn.response.body;
            if(Object.keys(knockoutStagesFilledStatus).length === 0){
                knockoutStagesFilledStatus = [];
            }
            hideModal();
    }else{
        failedInSomeInitRequest = true;
    }
}

async function checkIfUserCanAccessThisPage(){
    const sweepsName = sessionStorage.getItem("fillingSweepstake");

    //Verificando se o usuário pertence ao bolão:
    let isUserInSweeps = await checkIfUserIsInSweeps(sweepsName);
    if(isUserInSweeps === 0){
        goToPage(PAGE_CONFIGS.PG_SWEEPS_NAME);
        showModal(msgTitle, "Você está tentando acessar um bolão sem ser participante dele.", true, 
            "OK", null, false);
    }else{
        await getAllKnockoutStagesFilledStatus();
        if(knockoutStagesFilledStatus.length > 0){
            console.log("ENTROU AQUI");
            if(knockoutStagesFilledStatus.length < 6){
                goToPage(PAGE_CONFIGS.PG_KNOCKOUT_STAGES_MATCHES_PREDICT);
            }else{
                goToPage(PAGE_CONFIGS.PG_SWEEPS_NAME);
                showModal(msgTitle, "Você já preencheu todas as fases do bolão e, portanto, não pode acessá-las novamente.", true, 
                "OK", null, false);
            }
        }
    }
}

async function checkIfUserIsInSweeps(sweepsName){

    let handleReturn = await handleRequest(() => makeRequest("/sweeps/users/verify", "POST", '{"sweepsName": \"' + 
        sweepsName + '\"}', true), null, false, ()=>{throw new Error();}, true, msgTitle);

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        return handleReturn.response.body.message;
    }else{
        failedInSomeInitRequest = true;
    }

    //Na prática esse retorno nunca será executado, pois caso haja
    //  erro na requisição, o usuário será direcionado a página home:
    return null;
}