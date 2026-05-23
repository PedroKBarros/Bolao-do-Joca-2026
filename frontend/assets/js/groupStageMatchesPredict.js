import { goToPage, showLoadingModal, goToHomePage, makeRequest, handleRequest, HANDLE_REQUESTS_STATUS,
    loadModalInHtmlPage, showModal, hideModal, loadHtmlComponentInHtmlPage, 
    getHtmlOfComponent, addEventsToUpdateDropdownSelectedItem, setDefaultDropdownSelectedItem, 
    formatUrlToExternUrl} from "./common.js";
import { PAGE_CONFIGS } from "./config.js";

const msgTitle = "Predições";
var failedInSomeInitRequest;
var matchesData;
var predictData;
var predictDataPendingToSave = [];
var groupTablesData = [];
var teamsDraws = [];
var userData;
var sweepsName;
var secundaryStatusHtmlElement = document.getElementById("secundaryStatus");

const TOTAL_MATCHES_PER_TEAM = 3;
const TOTAL_MATCHES_PER_GROUP = 6;
const TOTAL_TEAM_IN_ALL_GROUP_MATCHES = TOTAL_MATCHES_PER_GROUP * 2;
//Obs.: o TOTAL_TEAM_IN_ALL_GROUP_MATCHES indica a qtd de seleções 
// envolvidas em todos os 6 jogos, se você considerar repetições.

const ASCII_CHAR_A_DECIMAL_CODE = 65;

const TEAM_RESULT_IN_MATCH_PREDICTION = {winner: 3, draw: 1, losing: 0};

const DRAW_SOLUTION_STATUS = {inProgress: "IN PROGRESS", automaticSolutionFailed: "AUTO SOLUTION FAILED",
     automaticSolutionWorked: "AUTO SOLUTION WORKED", manualSolutionApplied: "MANUAL SOLUTION APPLIED"};

const GROUP_MATCHES_DRAW_ALERT_TXT = "Desempate Necessário";

export async function init(){
    getUserDataFromLocalStorage();
    getSweepsNameFromLocalStorage();
    await loadModalInHtmlPage();
    await getMatchesOfGroupsStage();
    if(failedInSomeInitRequest){
        return;
    }
    await getSavedPredictData();
    if(failedInSomeInitRequest){
        return;
    }
    addSweepsNameInPageHeader();
    defineEventsInHeaderButtons();
    await defineGroupMatchesHtmlUi();
    await defineMatchesHtmlUi();
    showSavedPredictDataInInputFields();
    /* 
    * Limpando o array, pois como os campos já possuem evento, 
    * a função showSavedPredictDataInInputFields dispara eles, fazendo 
    * com que dados já salvos sejam colocados como pendente de salvamento:
    */
    clearPredictDataPendingToSave(); 
    createGroupTablesData();
    inicializeTeamNamesInGroupTablesData();
    updateGroupTablesData();
    updateHtmlTables();

    if(predictData.length === 0){
        showInstructionMsg();
    }

}

function getUserDataFromLocalStorage(){
    try{
        userData = {
            "id": localStorage.getItem("userId"),
            "isAdmin": localStorage.getItem("userIsAdmin"),
            "name": localStorage.getItem("userName"),
            "whatsappNumber": localStorage.getItem("userWhatsappNumber")
        }
    }catch(error){
        showModal(msgTitle, generateHtmlErrorMsgWhileGetDataFromLocalStorage(error.message), true, "OK", goToHomePage, false);
    }

}

function generateHtmlErrorMsgWhileGetDataFromLocalStorage(errorMsg){
    return `<p>Ocorreu um erro ao tentar obter dados armazenados no navegador. 
    Você será direcionado a página inicial.<br>Caso o problema persista, faça 
    contato no Whatsapp do Joca. Nesse caso, informe também os seguintes detalhes 
    técnicos, por favor:<br><br></p>` + errorMsg;
}

function getSweepsNameFromLocalStorage(){
    try{
        sweepsName = localStorage.getItem("fillingSweepstake");
    }catch(error){
        showModal(msgTitle, generateHtmlErrorMsgWhileGetDataFromLocalStorage(error.message), true, "OK", goToHomePage, false);
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
        console.log("MatchesData:");
        console.log([...matchesData]);
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
        console.log("PredictData:");
        console.log([...predictData]);
    }else{
        failedInSomeInitRequest = true;
    }
}

function showInstructionMsg(){
    showModal(msgTitle + " - Instruções", getInstructionsMsgHtmlContent(), true, "OK", null, false);
}

function getInstructionsMsgHtmlContent(){
    return `
    <p>
    Para correto preenchimento do bolão ` + sweepsName + `
    </p>
    `;
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

function addSweepsNameInPageHeader(){
    let filledMatchesStatus = document.getElementById("filledMatchesStatus");
    filledMatchesStatus.textContent = String(sweepsName).toUpperCase() + " - " + filledMatchesStatus.textContent;
}

function handleChangeInInputFieldValue(event){
    const inputTriggedEventId = event.currentTarget.id;
    const groupMatchId = Number(String(inputTriggedEventId).split("_")[1]);
    const isTeam1Input = String(inputTriggedEventId).includes("Team1");
    const inputTeam1 = isTeam1Input ? document.getElementById(inputTriggedEventId) : 
    document.getElementById(String(inputTriggedEventId).replace("Team2", "Team1"));
    const inputTeam2 = isTeam1Input ? document.getElementById(String(inputTriggedEventId).replace("Team1", "Team2")) : 
    document.getElementById(inputTriggedEventId);

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

    console.log([...predictData]);
    console.log([...predictDataPendingToSave]);
}

function normalizeScoreTeamInput(htmlInputElement){
    //Remove all caracteres that is not a 0-9:
    htmlInputElement.value = htmlInputElement.value.replace(/\D/g, '');
}

function defineEventsInHeaderButtons(){
    document.getElementById("save-data").addEventListener("click", saveData);
    document.getElementById("show-instructions").addEventListener("click", showInstructionMsg);
}

async function saveData() {

    //Check if there is some match partiality filled:
    const checkPartialFilledMatchesResult = checkPartialFilledMatches();
    //Check if there is some invalid match filled:
    const checkInvalidFilledMatchesResult = checkInvalidFilledMatches();

    if(checkPartialFilledMatchesResult.total > 0 || checkInvalidFilledMatchesResult.total > 0){
        showReviewMatchesMsg(checkPartialFilledMatchesResult, checkInvalidFilledMatchesResult);
        return;        
    }

    if(predictDataPendingToSave.length === 0){
        //Atualizando status para informar que todos os dados estão salvos:
        updateSaveStatus(true);
        return;
    }

    //Realizando o save:
    let handleReturn = await handleRequest(() => makeRequest("/predictions/groupStage/save", 
        "POST", JSON.stringify({"userIdInSweepestake": localStorage.getItem("userIdInSweepestake"), "predictDataToSave": predictDataPendingToSave}), true), null, false, 
    ()=>{throw new Error();}, true, msgTitle);

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        hideModal();
        //Atualizando data e hora de realização do save:
        updateSaveStatus();
        //Limpando array de dados que estavam pendentes de serem salvos:
        clearPredictDataPendingToSave();
        //Atualizando as tabelas:
        clearTeamDraw();
        updateGroupTablesData();
        updateHtmlTables();
    }
}

function clearPredictDataPendingToSave(){
    predictDataPendingToSave.length = 0;
}

function clearTeamDraw(){
    teamsDraws.length = 0;
}

function updateSaveStatus(onlyInformThatDontHavePendingDataToSave=false){
    if(!onlyInformThatDontHavePendingDataToSave){
        secundaryStatusHtmlElement.textContent = "Dados salvos em " + new Date().toLocaleString();
    }else{

        secundaryStatusHtmlElement.textContent = "Todos os dados estão salvos. :)";

    }
}

function showStatusOf(){
    secundaryStatusHtmlElement.textContent = "Dados salvos em " + new Date().toLocaleString();
}

function checkPartialFilledMatches(){
    let matches = document.getElementsByName("match");
    let isInputTeam1Empty;
    let isInputTeam2Empty;
    let countPartialFilledMatches = 0;
    let partialFilledmatches = "";
    for(let i =0;i < matches.length;i++){
        isInputTeam1Empty = matches[i].children[1].children[1].value === '';
        isInputTeam2Empty = matches[i].children[2].children[1].value === '';        
        if((isInputTeam1Empty && !isInputTeam2Empty) || (!isInputTeam1Empty && isInputTeam2Empty)){
            countPartialFilledMatches++;
            partialFilledmatches += "<br>-" + matches[i].children[1].children[0].textContent + " x " + matches[i].children[2].children[0].textContent;
            if(isInputTeam1Empty) matches[i].children[1].children[1].classList.add("app-alert-field");
            if(isInputTeam2Empty) matches[i].children[2].children[1].classList.add("app-alert-field");
        }
    }
    return {"total": countPartialFilledMatches, "matches": partialFilledmatches};
}

function checkInvalidFilledMatches(){
    let matches = document.getElementsByName("match");
    let isInputTeam1Invalid;
    let isInputTeam2Invalid;
    let countInvalidFilledMatches = 0;
    let invalidFilledmatches = "";
    for(let i =0;i < matches.length;i++){
        isInputTeam1Invalid = Number(matches[i].children[1].children[1].value) < 0;
        isInputTeam2Invalid = Number(matches[i].children[2].children[1].value) < 0;        
        if(isInputTeam1Invalid || isInputTeam2Invalid){
            countInvalidFilledMatches++;
            invalidFilledmatches += "<br>-" + matches[i].children[1].children[0].textContent + " x " + matches[i].children[2].children[0].textContent;
        }
    }
    return {"total": countInvalidFilledMatches, "matches": invalidFilledmatches};
}

function showReviewMatchesMsg(checkPartialFilledMatchesResult, checkInvalidFilledMatchesResult){

    let htmlContentMsg = "<p><strong>Antes de salvar, identificamos partidas que precisam ser revisadas:</strong></p>";
    console.log(checkPartialFilledMatchesResult.matches);
    if(checkPartialFilledMatchesResult.total > 0){
        if(checkPartialFilledMatchesResult.total === 1){
            htmlContentMsg += "<p><strong>Partida Parcialmente Preenchida:</strong>";
            htmlContentMsg += checkPartialFilledMatchesResult.matches +
            `<br><br>É necessário preencher o placar para ambas as seleções dessa partida antes de 
            salvar.</p><p class="app-red-txt">Destacamos a borda do campo em vermelho!</p>`;
        }else{
            htmlContentMsg += "<p><strong>Partidas Parcialmente Preenchidas (" + checkPartialFilledMatchesResult.total + "):</strong>";
            htmlContentMsg += checkPartialFilledMatchesResult.matches +
            `<br><br>É necessário preencher o placar para ambas as seleções dessas partidas antes de 
            salvar.</p><p class="app-red-txt">Destacamos a borda desses campos em vermelho!</p>`;
        }
    }

    if(checkInvalidFilledMatchesResult.total > 0){

        if(checkInvalidFilledMatchesResult.total === 1){
            htmlContentMsg += "<p><strong>Partida com Placar Inválido:</strong>";
            htmlContentMsg += checkInvalidFilledMatchesResult.matches +
            `<br><br>É necessário corrigir o placar dessa partida antes de 
            salvar.</p><p class="app-red-txt">Destacamos a borda desse campo em vermelho!</p>`;
        }else{
            htmlContentMsg += "<p><strong>Partidas com Placar Inválido (" + checkInvalidFilledMatchesResult.total + "):</strong>";
            htmlContentMsg +=  checkInvalidFilledMatchesResult.matches +
            `<br><br>É necessário corrigir o placar dessas partidas antes de 
            salvar.</p><p class="app-red-txt">Destacamos a borda desses campos em vermelho!</p>`;
        }
    }

    showModal(msgTitle + " - Revisar Partidas", htmlContentMsg, true, "OK", null, false);
}

function createGroupTablesData(){

    let currentGroupAsciiLetterDecCode;

    for(let i=0;i<12;i++){
        currentGroupAsciiLetterDecCode = ASCII_CHAR_A_DECIMAL_CODE + i;
        groupTablesData.push([
            {"group": String.fromCharCode(currentGroupAsciiLetterDecCode), 
                "place": "-", "team": "", "pt": 0, "gs": 0, "gr": 0, "gd": 0, "totalFilledMatches": 0},
            {"group": String.fromCharCode(currentGroupAsciiLetterDecCode), 
                "place": "-", "team": "", "pt": 0, "gs": 0, "gr": 0, "gd": 0, "totalFilledMatches": 0},
            {"group": String.fromCharCode(currentGroupAsciiLetterDecCode), 
                "place": "-", "team": "", "pt": 0, "gs": 0, "gr": 0, "gd": 0, "totalFilledMatches": 0},
            {"group": String.fromCharCode(currentGroupAsciiLetterDecCode), 
                "place": "-", "team": "", "pt": 0, "gs": 0, "gr": 0, "gd": 0, "totalFilledMatches": 0}
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
            groupTablesData[i][w].place === "-" ? "-" : groupTablesData[i][w].place + "º";
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
            //console.log("Estatísticas: da selecao " + currentTeamName);
            //console.log(teamStatistics);
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
    // de tratamento manual, avisando ao usuário e 
    // exibindo indicativo ao lado do nome dos grupos:
    if(teamsDraws.some(t => t.status === DRAW_SOLUTION_STATUS.automaticSolutionFailed)){
        showManualDrawPendingAlertMsg();
        updateUIOfGroupsWithManualDrawPending();
    }
}

function showManualDrawPendingAlertMsg(){
    showModal(msgTitle + " - Empates", `
        <p><strong>Um ou mais grupos apresentam seleções empatadas e é necessário sua decisão para desempatá-las.</strong>
        <br><br><strong>Como identificar esses grupos?</strong><br>Esses grupos apresentam a frase '` + 
        GROUP_MATCHES_DRAW_ALERT_TXT + `' ao lado do nome. Para desempatar as seleções deles, desça até o final deles e 
        clique no botão de desempate exibido abaixo da tabela.</p>`, true, "OK", null, false);
}

function updateUIOfGroupsWithManualDrawPending(){
    let htmlGroupElementAlertIndex;
    let htmlGroupElementAlert;
    console.log(teamsDraws);
    for(let i=0;i<teamsDraws.length;i++){
        if(teamsDraws[i].status === DRAW_SOLUTION_STATUS.automaticSolutionFailed){
            console.log(String(teamsDraws[i].group).charCodeAt(0));
            htmlGroupElementAlertIndex = String(teamsDraws[i].group).charCodeAt(0) - ASCII_CHAR_A_DECIMAL_CODE;
            htmlGroupElementAlert = document.getElementsByName("groupMatchesAlert")[htmlGroupElementAlertIndex];
            htmlGroupElementAlert.classList.remove("d-none"); //Turn alert visible
            htmlGroupElementAlert.textContent = GROUP_MATCHES_DRAW_ALERT_TXT;
        }
    }
}

function handleTeamGroupsPlaces(groupTableDataIndex){
    //Criteria:
    //1º) Total of points
    //2º) Direct confrontation 
    //3º) Gols difference
    //4º) Gols scored
    //5º) User choice

    let groupTableData = groupTablesData[groupTableDataIndex];
    console.log("Grupo com todas partidas preenchidas: " + groupTableData[0].group);
    //Definindo colocações inicialmente apenas pela pontuação:
    groupTablesData[groupTableDataIndex] = defineTeamGroupsPlaces(groupTableData);
    //Tratando possíveis empates:
    checkPossibleDraws(groupTableDataIndex);
}

function defineTeamGroupsPlaces(groupTableDataOrDrawTable, attributeReference="pt", firstPlace=1){

    groupTableDataOrDrawTable = sortTeamGroupByColumn(groupTableDataOrDrawTable, [{attribute:attributeReference, order:"desc"}]);

    let lastTeamPlace;
    let attributeRefValueOfLastTeam;
    for(let i =0;i<groupTableDataOrDrawTable.length;i++){
        if(i===0){
            groupTableDataOrDrawTable[i].place = i + firstPlace;
        }else{
            if(attributeRefValueOfLastTeam === groupTableDataOrDrawTable[i][attributeReference]){
                groupTableDataOrDrawTable[i].place = lastTeamPlace;                
            }else{
                groupTableDataOrDrawTable[i].place = i + firstPlace;
            }
        }
        lastTeamPlace = groupTableDataOrDrawTable[i].place;
        attributeRefValueOfLastTeam = groupTableDataOrDrawTable[i][attributeReference];
    }
    console.log("Colocacoes iniciais:");
    console.log([...groupTableDataOrDrawTable]);

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
            console.log("Empate detectado");
            handleDraws(groupTableDataIndex, place, teams);
        }
    }
}

function handleDraws(groupTableDataIndex, place, teams){

    let groupTableData = groupTablesData[groupTableDataIndex];

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

    console.log("Draw Table - Antes do loop:");
    console.log([...drawTable]);

    for(let i =0;i<teams.length;i++){
        teamGroupDataIndex = groupTableData.findIndex(g => g.team === teams[i]);
        console.log("aaa: " +place);
        drawTable.push({"place": place, "team": teams[i], 
            "pt": getTotalTeamPtsBetweenSpecificTeams(teams[i], teams),
            "gd": groupTableData[teamGroupDataIndex].gd,
            "gs": groupTableData[teamGroupDataIndex].gs});
    }

    console.log("Draw Table Depois do Lopp:");
    console.log([...drawTable]);
    //Define places by total of points between draw teams and check if draw persist:
    drawTable = defineTeamGroupsPlaces(drawTable, "pt", place);
    console.log([...drawTable]);
    totalDrawTeamsAfterDirectMatchesCriteriaApplied = totalOfDrawInGroupTableDataByPlace(drawTable, place);
    if(totalDrawTeamsAfterDirectMatchesCriteriaApplied === 0){
        console.log("Empate resolvido por pts");
        teamsDraws[teamsDraws.length - 1].status = DRAW_SOLUTION_STATUS.automaticSolutionWorked;
        applyAutomaticDrawSolution(groupTableDataIndex, drawTable);
        return;
    }   

    //Define places by gols difference between draw teams and check if draw persist:
    drawTable = defineTeamGroupsPlaces(drawTable, "gd", place);
    totalDrawTeamsAfterGoalsDiffCriteriaApplied = totalOfDrawInGroupTableDataByPlace(drawTable, place);          
    if(totalDrawTeamsAfterGoalsDiffCriteriaApplied === 0){
        console.log("Empate resolvido por saldo gols");
        teamsDraws[teamsDraws.length - 1].status = DRAW_SOLUTION_STATUS.automaticSolutionWorked;
        applyAutomaticDrawSolution(groupTableDataIndex, drawTable);
        return;
    }
   
    //Define places by gols scored between draw teams and check if draw persist:
    drawTable = defineTeamGroupsPlaces(drawTable, "gs", place);
    totalDrawTeamsAfterGoalsScoredCriteriaApplied = totalOfDrawInGroupTableDataByPlace(drawTable, place);
    if(totalDrawTeamsAfterGoalsScoredCriteriaApplied === 0){
        console.log("Empate resolvido por gols pró");
        teamsDraws[teamsDraws.length - 1].status = DRAW_SOLUTION_STATUS.automaticSolutionWorked;
        applyAutomaticDrawSolution(groupTableDataIndex, drawTable);
        return;
    }
    
    console.log("Empate não resolvido");
    //Indicating that a manual tiebreaker is necessary:
    teamsDraws[teamsDraws.length - 1].status = DRAW_SOLUTION_STATUS.automaticSolutionFailed;
    console.log([...teamsDraws]);

    //Check if some automatic solution try reduce total of draw teams:
    if(totalDrawTeamsAfterDirectMatchesCriteriaApplied < teams.length){
        drawTable = defineTeamGroupsPlaces(drawTable, "pt", place);
        applyAutomaticDrawSolution(groupTableDataIndex, drawTable);
        console.log("Empate reduzido por direct matches");
    }else{
        if(totalDrawTeamsAfterGoalsDiffCriteriaApplied < teams.length){

            drawTable = defineTeamGroupsPlaces(drawTable, "gd", place);
            applyAutomaticDrawSolution(groupTableDataIndex, drawTable);
            console.log("Empate reduzido por gd");            
        }else{
            drawTable = defineTeamGroupsPlaces(drawTable, "gs", place);
            applyAutomaticDrawSolution(groupTableDataIndex, drawTable);
            console.log("Empate reduzido por gs");              
        }
    }

}

function applyAutomaticDrawSolution(groupTableDataIndex, drawTable){
    let groupTableData = groupTablesData[groupTableDataIndex];
    let currentTeam;
    console.log("Applicação da solução:");
    for(let i=0;i<drawTable.length;i++){
        console.log("Iteracao " + (i+1));
        console.log("Place in drawtable i: " + drawTable[i].place);
        console.log("Time in drawtable i: " + drawTable[i].team);
        groupTableData.find(g => g.team === drawTable[i].team).place = drawTable[i].place;
    }

    groupTablesData[groupTableDataIndex] =
        sortTeamGroupByColumn(groupTableData, [
            { attribute: "place", order: "asc" }
        ]);
}

function totalOfDrawInGroupTableDataByPlace(groupTableDataOrDrawTable, place){
    console.log("Place para analisar: " + place);
    let placesCount=0;
    for(let i=0;i<groupTableDataOrDrawTable.length;i++){
        if(groupTableDataOrDrawTable[i].place === place){
            placesCount++;
        }
    }

    console.log(placesCount);
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
    
    console.log("getTotalTeamPtsBetweenSpecificTeams: referenceTeam=" + referenceTeam + "   teams=" + teams);
    for(let i=0;i<predictData.length;i++){
        referenceTeamNumber = matchOfTeamNumber(predictData[i].group_match_id, referenceTeam);
        console.log("referenceTeamNumber: " + referenceTeamNumber + "   group_match_id: " + predictData[i].group_match_id);

        if(referenceTeamNumber !== -1){

            matchData = matchesData.find(m => m.id === predictData[i].group_match_id);
          console.log("Match Data:");
            console.log(matchData);
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