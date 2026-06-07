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

const KNOCKOUT_STAGES_DATA = [
    {"order": 1, "name": "32-Avos de Final", "firstMatchNumber": 73, "lastMatchNumber": 88, "totalMatches": 16}, 
    {"order": 2, "name":"Oitavas de Final", "firstMatchNumber": 89, "lastMatchNumber": 96, "totalMatches": 8}, 
    {"order": 3, "name":"Quartas de Final", "firstMatchNumber": 97, "lastMatchNumber": 100, "totalMatches": 4}, 
    {"order": 4, "name":"Semifinal", "firstMatchNumber": 101, "lastMatchNumber": 102, "totalMatches": 2}, 
    {"order": 5, "name":"Disputa do 3º Lugar", "firstMatchNumber": 103, "lastMatchNumber": 103, "totalMatches": 1}, 
    {"order": 6, "name":"Final", "firstMatchNumber": 104, "lastMatchNumber": 104, "totalMatches": 1}     
];
const TOTAL_KNOCKOUT_STAGES = 6;

var currentKnockoutStage;
var failedInSomeInitRequest;
var filledStatusOfAllKnockoutStages;
var allMatchesData = [];
var predictData = [];
var matchesData = [];
var allKnockoutStagesmatchesRules = [];
var manualDrawsSolutions = [];
var pendingManualDrawsSolutions = [];
var predictDataPendingToSave = [];
var pedingMatchesToUndoSavedManualDrawSolutions = []; //When predict data change and will be saved
var totalFilledMatches = 0;
var userData;
var sweepsName;
var secundaryStatusHtmlElement = document.getElementById("secundaryStatus");
var failedToFinishSweepstake = false;

const MANUAL_DRAW_SOLUTIONS_STATUS = {
    pending:"PENDING",
    ignoreByChangeMatchScore:"IGNORE BY CHANGE MATCH SCORE",
    applied:"MANUAL SOLUTION APPIED"
};

const TOTAL_MATCHES = 32;

export async function init(){
    await loadModalInHtmlPage();
    await getAllFilledKnockoutStagesStatus();
    await checkIfUserCanAccessThisPage();
    if(failedInSomeInitRequest){
        return;
    }
    defineMainElementMarginTop(); //Necessário para que o header não sobreponha parte dos elementos da main
    defineResizeEvent();
    userData = getUserDataFromSessionStorage();
    sweepsName = getSweepsNameFromSessionStorage();
    if(failedInSomeInitRequest){
        return;
    }
    initializeCurrentKnockoutStage();
    
    await getAllMatchesData();
    if(failedInSomeInitRequest){
        return;
    }

    await getAllKnockoutStagesMatchesRules();
    if(failedInSomeInitRequest){
        return;
    }

    //Dividindo os dados do allMatchesData em matchesData, predictData e manualDrawSolutions:
    defineSpecificArraysData();

    addSweepsNameInPageHeader(sweepsName);
    defineEventsInHeaderButtons(saveData, () => {showInstructionMsg(msgTitle, false);}, handleNextButtonClick, "next-button");
    await defineCurrentKnockoutStageMatchesHtmlUi();
    showSavedPredictDataInInputFields();
    showManualDrawSolutionsSaved();

    /* 
    * Limpando o array, pois como os campos já possuem evento, 
    * a função showSavedPredictDataInInputFields dispara eles, fazendo 
    * com que dados já salvos sejam colocados como pendente de salvamento:
    */
    clearPredictDataPendingToSave();

    defineLoadPageEvents(secundaryStatusHtmlElement);
    updatePendingManualDraws();
    updateDrawsUIOfGroups();

    //Atualizando status de total de jogos preenchidos:
    updateTotalFilledMatchesStatus(predictData.length);

    if(predictData.length === 0){
        showInstructionMsg(msgTitle, false);
    }

}

function isCurrentKnockoutStageFirstKnockoutStage(){
    return currentKnockoutStage.order === KNOCKOUT_STAGES_DATA[0].order;
}

function isCurrentKnockoutStageLastKnockoutStage(){
    return currentKnockoutStage.order === KNOCKOUT_STAGES_DATA[TOTAL_KNOCKOUT_STAGES - 1].order;
}

function initializeCurrentKnockoutStage(){
    let currentKnockoutStageIndex = 0;
    for(let i=0;i<filledStatusOfAllKnockoutStages.length;i++){
        if(filledStatusOfAllKnockoutStages[i].is_all_filled){
            currentKnockoutStageIndex++;
        }
    }
    currentKnockoutStage = KNOCKOUT_STAGES_DATA[currentKnockoutStageIndex];
    console.log(currentKnockoutStage);    
}

async function getAllFilledKnockoutStagesStatus() {

    let handleReturn = await handleRequest(() => makeRequest("/predictions/allKnockoutStages/filledStatus?userIdInSweepestake=" + 
        sessionStorage.getItem("userIdInSweepestake"), "GET"), null, false, ()=>{throw new Error();}, true, msgTitle);
    /* Obs.: caso ocorra alguma falha, será disparado o erro (passado como parâmetro). 
    * Isso fará com que a handleRequest vá para o bloco catch, exibindo mensagem com
     o erro e direcionando o usuário a home page*/

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        filledStatusOfAllKnockoutStages = handleReturn.response.body;
        hideModal();
    }else{
        failedInSomeInitRequest = true;
    }
}

async function getAllMatchesData() {
    let handleReturn = await handleRequest(() => makeRequest(`/predictions/knockoutStage?knockoutStageName=${currentKnockoutStage.name}&userIdInSweepestake=${sessionStorage.getItem("userIdInSweepestake")}`, "GET"), null, false, 
        ()=>{throw new Error();}, true, msgTitle);
    /* Obs.: caso ocorra alguma falha, será disparado o erro (passado como parâmetro). 
    * Isso fará com que a handleRequest vá para o bloco catch, exibindo mensagem com
     o erro e direcionando o usuário a home page*/

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        allMatchesData = handleReturn.response.body;
        hideModal();
    }else{
        failedInSomeInitRequest = true;
    }
}

function defineSpecificArraysData(){
    for(let i=0;i<allMatchesData.length;i++){
        matchesData.push({
            "match_number": allMatchesData[i].match_number,
            "match_info": allMatchesData[i].match_info,
            "rule_team_1": allMatchesData[i].rule_team_1,
            "rule_team_2": allMatchesData[i].rule_team_2,
            "team_1_name": allMatchesData[i].team_1_name,
            "team_2_name": allMatchesData[i].team_2_name            
        });

        if(allMatchesData[i].score_team_1 !== null && allMatchesData[i].score_team_2 !== null){
            predictData.push({
                "match_number": allMatchesData[i].match_number,
                "score_team_1": allMatchesData[i].score_team_1,
                "score_team_2": allMatchesData[i].score_team_2                
            })
        }

        if(allMatchesData[i].team_1_chosen_by_user === 1){
            manualDrawsSolutions.push({
                "match_number": allMatchesData[i].match_number,
                "chosed_team": allMatchesData[i].team_1_name,
                "team_number": 1
                })
        }

        if(allMatchesData[i].team_2_chosen_by_user === 1){
            manualDrawsSolutions.push({
                "match_number": allMatchesData[i].match_number,
                "chosed_team": allMatchesData[i].team_2_name,
                "team_number": 2
            })
        }        
    }

        console.log(matchesData);
        console.log(predictData);
        console.log(manualDrawsSolutions);
}

async function defineCurrentKnockoutStageMatchesHtmlUi(){
    //Get knockout matches div area:
    let knockoutMatchesArea = document.getElementById("knockoutMatchesArea");
    let matchHtml = await getHtmlOfComponent("match");
    let matchInfo;
    let matchTeam1, matchTeam2;
    let team1Input, team2Input;
    matchHtml = `
    <div name="matchArea" class="mx-auto app-knockout-match col-auto">
            <p name="matchAreaTitle" class="app-big-txt app-yellow-txt"></p>` + matchHtml;
    matchHtml += `
        <div class="col-auto text-left">
            <button class="app-btn app-small-btn app-alert-btn-color app-small-height-separation d-none" name="drawBtn">DESEMPATAR</button>
            <p class="app-small-txt-box app-small-txt app-green-txt app-small-height-separation d-none" name="drawDetail"></p>
        </div>
    </div>
    `;

    for(let i=0;i<matchesData.length;i++){
        knockoutMatchesArea.insertAdjacentHTML("beforeEnd", matchHtml);
        document.getElementsByName("matchAreaTitle")[i].textContent = "Partida " + matchesData[i].match_number;
        document.getElementsByName("match")[i].id = matchesData[i].match_number;
        matchInfo = document.getElementsByName("matchDayAndPlaceInfo")[i];
        matchInfo.style.minWidth = "90px";
        matchInfo.children[0].textContent = matchesData[i].match_info;
        matchTeam1 = document.getElementsByName("matchInfoTeam1")[i];
        matchTeam1.style.minWidth = "90px";
        matchTeam1.children[0].textContent = matchesData[i].team_1_name;
        matchTeam2 = document.getElementsByName("matchInfoTeam2")[i];
        matchTeam2.style.minWidth = "90px";
        matchTeam2.children[0].textContent = matchesData[i].team_2_name;      
        
        //Add input events and id:
        team1Input = document.getElementsByName("inputTeam1")[i];
        team1Input.addEventListener("input", handleChangeInInputFieldValue);
        team1Input.id = "inputTeam1Match_" + matchesData[i].match_number;
        team2Input=document.getElementsByName("inputTeam2")[i];
        team2Input.addEventListener("input", handleChangeInInputFieldValue);
        team2Input.id = "inputTeam2Match_" + matchesData[i].match_number;
    }
    
    //Add knockout stage name:
    document.getElementById("knockoutStageName").textContent = currentKnockoutStage.name.toUpperCase();
}

function showSavedPredictDataInInputFields(){
    let currentMatchid;
    let currentMatchHtmlElement;
    for(let i =0;i<predictData.length;i++){
        currentMatchid = predictData[i].match_number;
        //Obtendo o elemento "match" de mesmo id:
        currentMatchHtmlElement = document.getElementById(currentMatchid);
        //Preenchendo os inputs:
        currentMatchHtmlElement.children[1].children[1].value = predictData[i].score_team_1;
        currentMatchHtmlElement.children[2].children[1].value = predictData[i].score_team_2;
    }
}

function handleChangeInInputFieldValue(event){
    const inputTriggedEventId = event.currentTarget.id;
    const matchNumber = Number(String(inputTriggedEventId).split("_")[1]);
    const isTeam1Input = String(inputTriggedEventId).includes("Team1");
    const inputTeam1 = isTeam1Input ? document.getElementById(inputTriggedEventId) : 
    document.getElementById(String(inputTriggedEventId).replace("Team2", "Team1"));
    const inputTeam2 = isTeam1Input ? document.getElementById(String(inputTriggedEventId).replace("Team1", "Team2")) : 
    document.getElementById(inputTriggedEventId);

    //Check if score really change:
    if(!teamScoreReallyChange(matchNumber, inputTeam1.value, inputTeam2.value)){
        return;
    }

    //Check if respective match has pending draw, 
    // because, in this case, it's necessary change draw register status and call 
    // function to update group places UI, removing manual draw html elements:
    let matchPendingDrawsCount = 0;
    for(let i=0;i<pendingManualDrawsSolutions.length;i++){
        if(pendingManualDrawsSolutions[i].match_number === matchNumber && 
            pendingManualDrawsSolutions[i].status === MANUAL_DRAW_SOLUTIONS_STATUS.pending){
            matchPendingDrawsCount++;
            pendingManualDrawsSolutions[i].status = MANUAL_DRAW_SOLUTIONS_STATUS.ignoreByChangeMatchScore;
        }
    }
    if(matchPendingDrawsCount > 0){
        console.log("Partida com solução de empate pendente foi alterada");
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

    let predictDataFinded = predictData.find(predictData => predictData.match_number === matchNumber);
    //Check if matchnumber exist in predictData:
    if(predictDataFinded){
        //Case: exist
        //Update values to save:
        predictDataFinded.score_team_1 = Number(inputTeam1.value);
        predictDataFinded.score_team_2 = Number(inputTeam2.value); 

        //Check if it's in pending to save:
        let predictDataPendingToSaveFinded = predictDataPendingToSave.find(predictData => 
            predictData.match_number === matchNumber);
        if(!predictDataPendingToSaveFinded){
            //Add predictData to save:
            predictDataPendingToSave.push(predictDataFinded);       
        }
    }else{
        //Case: not exist
        //Add predictData:
        predictData.push({
                "match_number": matchNumber,
                "score_team_1": Number(inputTeam1.value),
                "score_team_2": Number(inputTeam2.value)                
            });
        
        //Add predictData to save:
        predictDataPendingToSave.push(predictData.at(predictData.length - 1));
    }

    console.log([...predictData]);
    console.log([...predictDataPendingToSave]);
}

function updateDrawsUIOfGroups(){
    let htmlGroupElementSolveDrawBtn;
    let currentMatchNumber;
    let currentMatchDraw;

    for(let i=0;i<matchesData.length;i++){
        currentMatchNumber = matchesData[i].match_number;
        currentMatchDraw = pendingManualDrawsSolutions.filter(d => d.match_number === currentMatchNumber && 
            d.status === MANUAL_DRAW_SOLUTIONS_STATUS.pending);
        
        htmlGroupElementSolveDrawBtn = document.getElementsByName("drawBtn")[i];        
        if(currentMatchDraw.length === 0){
            //Hidde draw button:
            htmlGroupElementSolveDrawBtn.classList.add("d-none");           
        }else{
            //Show button to solve draw:
            //Define btn id with match number:
            htmlGroupElementSolveDrawBtn.id = "btnSolveDraw-" + currentMatchNumber;
            //Define btn click event:
            htmlGroupElementSolveDrawBtn.addEventListener("click", handleManualDrawSolution);
            htmlGroupElementSolveDrawBtn.classList.remove("d-none"); //Turn button visible
            htmlGroupElementSolveDrawBtn.textContent = "DEFINIR VENCEDOR";

            showManualDrawPendingAlertMsg();
        }
    }
}

function showManualDrawPendingAlertMsg(){
    showModal(msgTitle + " - Empates", `
        <p><strong>Uma ou mais partidas apresentam empates e é necessário sua decisão para escolher quem avança para a próxima fase.</strong>
        <br><br>Para escolher as seleções que irão avançar, clique no botão 'DEFINIR VENCEDOR' 
        que está sendo exibido na parte inferior de cada uma delas.</p>`, true, "OK", null, false);    
}

async function handleManualDrawSolution(event){
    //Get button id:
    const btnManualDrawSolutionId = event.currentTarget.id;
    const matchNumber = Number(String(btnManualDrawSolutionId).split("-")[1]);
    const modalTitle = "Partida " + matchNumber + " - Definição do Vencedor";

    showModal(modalTitle, generateHtmlContentModalOfManualDrawSolution(matchNumber), 
    true, "CONFIRMAR", () => {saveManualDrawSolution(matchNumber)
        }, true, "CANCELAR", null, true);
}

function generateHtmlContentModalOfManualDrawSolution(matchNumber){
    let matchData = matchesData.find(m => m.match_number === matchNumber);
    let modalHtmlContent = `

    <!-- A div container abaixo serve apenas para que as labels fiquem alinhadas 
        a esquerda, não sendo necessário em todas as páginas.
        Obs.: ela só cumprirá esse objetivo se os elementos de maior 
        largura da página forem os campos. -->
    <div class="container app-restrict-container mx-auto">
        <div class="row d-flex justify-content-center align-items-center">
            <div class="col-12 text-start">
                <p>Defina qual seleção venceu a partida e, portanto, seguirá na Fase Mata-Mata:</p>
            </div>
        </div>
        <div class="row d-flex justify-content-center align-items-center">
            <div class="col-12 text-start">
                <div class="form-check">
                    <input class="app-checkbox-field form-check-input" type="radio" name="flexRadioDefault" id="${matchNumber}-team1">
                    <label class="form-check-label" for="${matchNumber}-team1">
                        ${matchData.team_1_name}
                    </label>
                </div>
            </div>
            <div class="col-12 text-start">
                <div class="form-check">
                    <input class="app-checkbox-field form-check-input" type="radio" name="flexRadioDefault" id="${matchNumber}-team2">
                    <label class="form-check-label" for="${matchNumber}-team2">
                        ${matchData.team_2_name}
                    </label>
                </div>
            </div>
        </div>
    `;
 

    modalHtmlContent += `
    <div class="row d-flex justify-content-center align-items-center">
        <div class="col-12 text-start">
            <p id="warning-msg" class="app-alert-txt-block app-top-separation d-none" style="width: 300px;"></p>
        </div>
    </div>`;

    modalHtmlContent+="</div>";

    return modalHtmlContent;

}

async function saveManualDrawSolution(matchNumber){

    let manualDrawSolution;
    let checkboxs = document.getElementsByName("flexRadioDefault");
    let checkBoxChecked;
    let teamChoosed;

    //Check if one of checkboxs was checked:
    checkBoxChecked = checkManualDrawSolutionTeamChecked(checkboxs);
    if(checkBoxChecked === null){
        return;
    }

    teamChoosed = checkBoxChecked.id.split("-")[1];
    manualDrawSolution = {"match_number": matchNumber, "team_1_chosen_by_user": teamChoosed === "team1" ? 1 : 0, 
        "team_2_chosen_by_user": teamChoosed === "team2" ? 1 : 0};

    //Salvando Desempate 
    let handleReturn = await handleRequest(() => makeRequest("/draws/solutions/knockoutStage/save", 
        "POST", JSON.stringify(
            {
                "userIdInSweepestake": sessionStorage.getItem("userIdInSweepestake"), 
                "manualDrawSolution": manualDrawSolution
            }), true), null, false, ()=>{throw new Error();}, true, msgTitle);

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
    handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
    handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        hideModal();
        changeTeamDrawStatusToManualSolutionApplied(matchNumber);
        //Recarregando página para que função init() seja executada, atualizando UI e 
        // obtendo soluções de desempate salvas no banco:
        location.reload();
        console.log(teamsDraws);
    }

}

function changeTeamDrawStatusToManualSolutionApplied(matchNumber){
    pendingManualDrawsSolutions.find(d => d.match_number === matchNumber).status = MANUAL_DRAW_SOLUTIONS_STATUS.applied;
}

function checkManualDrawSolutionTeamChecked(checkboxs){
    let warningMsg = document.getElementById("warning-msg");
    for(let i=0;i<checkboxs.length;i++){
        if(checkboxs[i].checked){
            return checkboxs[i];
        }
    }
    warningMsg.textContent = "Primeiro clique no nome da seleção que será a vencedora da partida.";
    warningMsg.classList.remove("d-none");
    return null;
}

function teamScoreReallyChange(matchNumber, scoreTeam1, scoreTeam2){
   let savedMatchPredictData = predictData.find(predictData => 
            predictData.match_number === matchNumber);
                 
    if(savedMatchPredictData){
        return String(savedMatchPredictData.score_team_1) !== scoreTeam1 || 
        String(savedMatchPredictData.score_team_2) !== scoreTeam2;
    }else{
        return true; //Because function handleChangeInInputFieldValue needs to register newScore to pending save
    }
}

function clearPredictDataPendingToSave(){
    predictDataPendingToSave.length = 0;
}

function updateTotalFilledMatchesStatus(addValueToTotal){
    totalFilledMatches=addValueToTotal;
    document.getElementById("filledMatchesStatus").textContent = totalFilledMatches + " de " + currentKnockoutStage.totalMatches + " jogos preenchidos";
    handleNextButton();
}   

function handleNextButton(){
    if(canShowNextBtn()){
        showNextButton();
    }else{
        hideNextButton();
    }
}

function canShowNextBtn(){
    //Check if doesn't exist pending draws:
    let isThereTeamsDrawNotResolved = pendingManualDrawsSolutions.some(d => d.status === MANUAL_DRAW_SOLUTIONS_STATUS.pending);
    //Check if doesn't exist predict data pending to save:
    let isTherePredictDataPendingToSave = predictDataPendingToSave.length > 0;

    console.log("isThereTeamsDrawNotResolved: " + isThereTeamsDrawNotResolved);
    console.log("isTherePredictDataPendingToSave:" + isTherePredictDataPendingToSave);
    console.log(pendingManualDrawsSolutions.some(d => d.status === MANUAL_DRAW_SOLUTIONS_STATUS.pending));
    console.log(pendingManualDrawsSolutions);    

    return totalFilledMatches === currentKnockoutStage.totalMatches && 
    !isThereTeamsDrawNotResolved && !isTherePredictDataPendingToSave;
}

function showNextButton(){
    let nextBtn = document.getElementById("next-button");
    let btnInstructions = document.getElementById("show-instructions");

    defineNextButtonText(nextBtn);
    btnInstructions.classList.add("d-none");
    nextBtn.classList.remove("d-none");
}

function hideNextButton(){
    let btnFinish = document.getElementById("next-button");
    let btnInstructions = document.getElementById("show-instructions");

    btnInstructions.classList.remove("d-none");
    btnFinish.classList.add("d-none");
}

function defineNextButtonText(nextButtonHtmlElement){
    if(isCurrentKnockoutStageLastKnockoutStage()){
        nextButtonHtmlElement.textContent = "FINALIZAR";
    }else{
        nextButtonHtmlElement.textContent = "AVANÇAR";
    }
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

    //Verificando se há soluções manuais relacionadas as partidas que terão dados de predições salvos:
    if(isThereMatchesThatWillBeNecessaryUndoSaveddAllManualDrawSolutions()){
        showModal(msgTitle, 
            `<p>As alterações que serão salvas envolvem 1 ou mais partidas com placar de empate cuja seleção vencedora
            você já havia definido. Essas definições serão desfeitas caso você salve as alterações. 
            Deseja salvá-las?</p>`, true, "SALVAR", async () => await makeSaveDataRequest(true), 
            true, "CANCELAR");
    }else{
        await makeSaveDataRequest();
    }
}

async function makeSaveDataRequest(isNecessaryReloadPage=false){
    //Realizando o save:
    let handleReturn = await handleRequest(() => makeRequest("/predictions/knockoutStage/save", 
        "POST", JSON.stringify({"userIdInSweepestake": sessionStorage.getItem("userIdInSweepestake"), 
            "predictDataToSave": predictDataPendingToSave}), true), null, false, 
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
    handleNextButton();
    //Limpando array de dados que estavam pendentes de serem salvos:
    clearPredictDataPendingToSave();
    //Atualizando as tabelas:
    clearPendingManualDraws();
    if(isNecessaryReloadPage){
        //Recarregando página para que função init() seja executada:
        location.reload();
    }else{
        updatePendingManualDraws();
        //Definindo se botão para ir pra fase mata-mata deve ser exibido ou ocultado:
        handleNextButton();
        updateDrawsUIOfGroups();
        updateTotalFilledMatchesStatus(predictData.length);
    }
}

function clearPendingManualDraws(){
    pendingManualDrawsSolutions.length = 0;
}

async function handleManualDrawSolutionsAfterSaveNewPredictData(){
    defineAllMatchsThatWillBeNecessaryUndoSaveddAllManualDrawSolutions();
    console.log("ENTROU NA handleManualDrawSolutionsAfterSaveNewPredictData");
    if(pedingMatchesToUndoSavedManualDrawSolutions.length === 0){
        console.log("ENTROU NO IF DA handleManualDrawSolutionsAfterSaveNewPredictData");
        return;
    }
    //Realizando requisição para deletar a solução de desempate manual de cada partida
    //  que teve 1 ou mais predições alteradas e atulizadas no banco:
    let handleReturn = await handleRequest(() => makeRequest("/draws/solutions/knockoutStage/undoSaved", 
        "POST", JSON.stringify({"userIdInSweepestake": sessionStorage.getItem("userIdInSweepestake"), 
            "matchesNumber": pedingMatchesToUndoSavedManualDrawSolutions}), true), null, false, 
    ()=>{throw new Error();}, true, msgTitle);

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
        handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        hideModal();
        clearMatchesPendingToUndoSaveddManualDrawSolution();
    }
}

function clearMatchesPendingToUndoSaveddManualDrawSolution(){
    pedingMatchesToUndoSavedManualDrawSolutions.length = 0;
}

function defineAllMatchsThatWillBeNecessaryUndoSaveddAllManualDrawSolutions(){
    //Verificando se há soluções manuais relacionadas as partidas que terão dados de predições salvos e,
    //  em caso positivo, adicionando o número da partida em array global:
    let currentMatchNumber;
    for(let i=0;i<predictDataPendingToSave.length;i++){
        currentMatchNumber = predictDataPendingToSave[i].match_number;
        if(manualDrawsSolutions.some(m => m.match_number === currentMatchNumber)){
            if(!pedingMatchesToUndoSavedManualDrawSolutions.some(g => g === currentMatchNumber)){
                pedingMatchesToUndoSavedManualDrawSolutions.push(currentMatchNumber);
            }
        }
    }
}

function isThereMatchesThatWillBeNecessaryUndoSaveddAllManualDrawSolutions(){
    let currentMatchNumber;
    for(let i=0;i<predictDataPendingToSave.length;i++){
        currentMatchNumber = predictDataPendingToSave[i].match_number;
        if(manualDrawsSolutions.some(m => m.match_number === currentMatchNumber)){
            return true;
        }
    }
    return false;    
} 


async function handleNextButtonClick(){
    if(isCurrentKnockoutStageLastKnockoutStage()){
        showModal(msgTitle + " - Finalizar Preenchimento do Bolão ", `
            <p>Ao clicar em 'CONFIRMAR' suas predições serão permanentemente armazenadas e 
            <strong>não será possível alterá-las posteriormente</strong>.</p>`, true, "CONFIRMAR", 
            () => {registerFilledKnockoutStageStatus();goToPage(PAGE_CONFIGS.PG_FINISH_SWEEPSTAKE)}, 
            true, "CANCELAR");
        
        
    }else{ 
        showModal(msgTitle + " - Avançar para Próxima Fase Mata-Mata ", `
            <p>Você avançará para a fase '${getNextKnockoutStage().name}' e <strong>não poderá retornar a essa fase e a qualquer 
            fase anterior a essa.</strong> Deseja avançar?</p>`, true, "SIM, AVANÇAR", prepareNextKnockoutStage, true, "NÃO, CANCELAR");
    }
}



async function prepareNextKnockoutStage(){
    //1. Criar end-point para adicionar registro na tabela USERS_KNOCKOUT_STAGES_STATUS e 
    // adicionar registro referente a fase atual, ou seja, a finalizada:
    await registerFilledKnockoutStageStatus();
    //2. Definir as partidas da próxima fase se baseando no predictData e nas regras de formação das 
    // partidas que podem ser obtidas via requisição
    await defineMatchesOfNextKnockoutStage();
    //3. Executar um reload da tela e ver se avançamos para próxima fase e se nextButton será ocultado
    location.reload();
}

async function defineMatchesOfNextKnockoutStage(){
    let nextMatches = [];
    let nextStage = getNextKnockoutStage();
    let totalMatchesOfNextStage = nextStage.totalMatches;
    let nextFirstMatchNumber = nextStage.firstMatchNumber;
    let nextLastMatchNumber = nextStage.lastMatchNumber;
    let nextMatchRules;
    let nextMatchRuleTeam1Parsed, nextMatchRuleTeam2Parsed;
    let nextMatchTeam1, nextMatchTeam2;

    //Check if we are in semifinal stage:
    if(currentKnockoutStage.name === KNOCKOUT_STAGES_DATA[3].name){
        //Storage winners of semifinal matches in local storage, because
        //final stage need this data and this matches is not of third matche dispute:
        storeSemifinalsMatchesResultsInLocalStorage();
    }

    //Check if we are in third matche dispute stage, because, in this case,
    // we use only local storage data to define next matches:
    if(currentKnockoutStage.name === KNOCKOUT_STAGES_DATA[4].name){
        nextMatches.push({"team_1_name": localStorage.getItem("match_101_winner"), 
            "team_2_name": localStorage.getItem("match_102_winner"), "match_number": 104});
    }else{
        for(let nextMatchNumber=nextFirstMatchNumber;nextMatchNumber<=nextLastMatchNumber;nextMatchNumber++){

            nextMatchRules = allKnockoutStagesmatchesRules.find(r => r.match_number === nextMatchNumber);
            nextMatchRuleTeam1Parsed = parseKnockoutMatchRule(nextMatchRules.rule_team_1);
            nextMatchRuleTeam2Parsed = parseKnockoutMatchRule(nextMatchRules.rule_team_2);
            
            if(nextMatchRuleTeam1Parsed.isToConsideredWinner){
                nextMatchTeam1 = getTeamMatchWinner(nextMatchRuleTeam1Parsed.previousMatchNumber);
            }else{
                nextMatchTeam1 = getTeamMatchLoser(nextMatchRuleTeam1Parsed.previousMatchNumber);            
            }
            if(nextMatchRuleTeam2Parsed.isToConsideredWinner){
                nextMatchTeam2 = getTeamMatchWinner(nextMatchRuleTeam2Parsed.previousMatchNumber);
            }else{
                nextMatchTeam2 = getTeamMatchLoser(nextMatchRuleTeam2Parsed.previousMatchNumber);            
            }

            nextMatches.push({"team_1_name": nextMatchTeam1, "team_2_name": nextMatchTeam2, "match_number": nextMatchNumber});
        }
    }

    console.log("nextMatches:");
    console.log(nextMatches);
    console.log("nextStage:");
    console.log(nextStage);
    await storesNextKnockoutMatchTeams(nextStage, nextMatches);

}

async function storesNextKnockoutMatchTeams(nextStage, nextMatches){
    //Realizando requisição
    let handleReturn = await handleRequest(() => makeRequest(`/matches/knockoutStage/defineMatches?knockoutStageName=${nextStage.name}`, 
        "POST", JSON.stringify(
            {
                "userIdInSweepestake": Number(sessionStorage.getItem("userIdInSweepestake")),
                 "knockoutMatches": nextMatches
            }), true), null, false, ()=>{throw new Error();}, true, msgTitle);

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
    handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
    handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        hideModal();
    }
}

function parseKnockoutMatchRule(strRule){
    let isToConsideredWinner = String(strRule.split(" ")[0]).charAt(0).toUpperCase() === "V";
    let previousMatchNumber = Number(strRule.split(" ")[2]);

    return {"isToConsideredWinner": isToConsideredWinner, "previousMatchNumber": previousMatchNumber};
}

function getTeamMatchWinner(matchNumber){
    let matchPredictData = predictData.find(p => p.match_number === matchNumber);
    let matchData = matchesData.find(m => m.match_number === matchNumber);

    if(matchPredictData.score_team_1 === matchPredictData.score_team_2){
        return manualDrawsSolutions.find(d => d.match_number === matchNumber).team_number === 1 ? matchData.team_1_name : matchData.team_2_name;
    }
    if(matchPredictData.score_team_1 > matchPredictData.score_team_2){
        return matchData.team_1_name;
    }

    return matchData.team_2_name;
}

function getTeamMatchLoser(matchNumber){
    let matchPredictData = predictData.find(p => p.match_number === matchNumber);
    let matchData = matchesData.find(m => m.match_number === matchNumber);

    if(matchPredictData.score_team_1 === matchPredictData.score_team_2){
        return manualDrawsSolutions.find(d => d.match_number === matchNumber).team_number === 1 ? matchData.team_2_name : matchData.team_1_name;
    }
    if(matchPredictData.score_team_1 > matchPredictData.score_team_2){
        return matchData.team_2_name;
    }

    return matchData.team_1_name;
}

async function registerFilledKnockoutStageStatus() {  
    let handleReturn = await handleRequest(() => makeRequest("/predictions/knockoutStage/filledStatus", 
        "POST", JSON.stringify(
            {
                "userIdInSweepestake": Number(sessionStorage.getItem("userIdInSweepestake")),
                 "knockoutStageName": currentKnockoutStage.name,
                "isAllFilled": 1
            }), true), null, false, ()=>{throw new Error();}, true, msgTitle);

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
    handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
    handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        hideModal();
    }else{
        failedToFinishSweepstake = true;
    }
}

function storeSemifinalsMatchesResultsInLocalStorage(){
    localStorage.setItem("match_101_winner", getTeamMatchWinner(101));
    localStorage.setItem("match_102_winner", getTeamMatchWinner(102));
}

function getNextKnockoutStage(){
    if(currentKnockoutStage.order === 6){
        return null;
    }

    return KNOCKOUT_STAGES_DATA[currentKnockoutStage.order];
}

async function getAllKnockoutStagesMatchesRules(){
    let handleReturn = await handleRequest(() => makeRequest("/matches/allKnockoutStage/matchesRules", 
        "GET"), null, false, ()=>{throw new Error();}, true, msgTitle);

    if(handleReturn.status !== HANDLE_REQUESTS_STATUS.authError && 
    handleReturn.status !== HANDLE_REQUESTS_STATUS.unknownError && 
    handleReturn.status !== HANDLE_REQUESTS_STATUS.failed){
        hideModal();
        allKnockoutStagesmatchesRules = handleReturn.response.body;
    }else{
        failedInSomeInitRequest = true;
    }    
}

function updatePendingManualDraws(){
    for(let i=0;i<predictData.length;i++){
        if(predictDataPendingToSave.some(p => p.match_number === predictData[i].match_number)){
            continue;
        }

        if(predictData[i].score_team_1 === predictData[i].score_team_2 && 
            !manualDrawsSolutions.some(d => d.match_number === predictData[i].match_number)){
            pendingManualDrawsSolutions.push({"match_number": predictData[i].match_number, "status": MANUAL_DRAW_SOLUTIONS_STATUS.pending});
        }
    }
}

async function checkIfUserCanAccessThisPage(){
    const sweepsName = sessionStorage.getItem("fillingSweepstake");

    //Verificando se o usuário pertence ao bolão:
    let isUserInSweeps = await checkIfUserIsInSweeps(sweepsName);
    if(isUserInSweeps === 0){
        goToPage(PAGE_CONFIGS.PG_SWEEPS_NAME);
        showModal(msgTitle, "Você está tentando acessar um bolão sem ser participante dele. Para preenchê-lo, primeiro entre nele.", true, 
            "OK", null, false);
    }else{
        if(filledStatusOfAllKnockoutStages.length > 0){
            if(filledStatusOfAllKnockoutStages.length === 6){
                goToPage(PAGE_CONFIGS.PG_SWEEPS_NAME);
                showModal(msgTitle, "Você já preencheu todas as fases do bolão e, portanto, não pode acessá-las novamente.", true, 
                "OK", null, false);
            }
        }else{
            goToPage(PAGE_CONFIGS.PG_GROUP_STAGE_MATCHES_PREDICT);        
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

function showManualDrawSolutionsSaved(){
    let totalOfMatches = document.getElementsByName("match").length;
    let currentMatchSavedDraw;
    let currentDrawResolutionDetails;

    for(let i=0;i<totalOfMatches;i++){
        currentMatchSavedDraw = manualDrawsSolutions.find(m => m.match_number === matchesData[i].match_number);
        if(currentMatchSavedDraw === undefined){
            continue;
        }
        currentDrawResolutionDetails = document.getElementsByName("drawDetail")[i];
        currentDrawResolutionDetails.innerHTML = `Seleção definida vencedora pelo participante:<br>` + getTeamInManualDraw(currentMatchSavedDraw);
        currentDrawResolutionDetails.classList.remove("d-none");
    }
}

function getTeamInManualDraw(manualDraw){
    let draw = manualDraw;
    let match_number, team_number;
    let matchData;

    match_number = draw.match_number;
    team_number = draw.team_number;
    matchData = matchesData.find(m => m.match_number === match_number);

    return team_number === 1 ? matchData.team_1_name : matchData.team_2_name;
}

