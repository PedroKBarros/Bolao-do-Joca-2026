import {showModal} from './common.js';

export function defineMainElementMarginTop() {
    const header = document.querySelector("header");
    const main = document.querySelector("main");
    let mainMarginTop = header.offsetHeight + 10;

    main.style.marginTop = `${mainMarginTop}px`;
}

export function defineResizeEvent(){
    window.addEventListener("resize", defineMainElementMarginTop);
}

export function getUserDataFromSessionStorage(){
    try{
        let userData = {
            "id": sessionStorage.getItem("userId"),
            "isAdmin": sessionStorage.getItem("userIsAdmin"),
            "name": sessionStorage.getItem("userName"),
            "whatsappNumber": sessionStorage.getItem("userWhatsappNumber")
        }
        return userData;
    }catch(error){
        showModal(msgTitle, generateHtmlErrorMsgWhileGetDataFromSessionStorage(error.message), true, "OK", goToHomePage, false);
        return null;
    }

}

function generateHtmlErrorMsgWhileGetDataFromSessionStorage(errorMsg){
    return `<p>Ocorreu um erro ao tentar obter dados armazenados no navegador. 
    Você será direcionado a página inicial.<br>Caso o problema persista, faça 
    contato no Whatsapp do Joca. Nesse caso, informe também os seguintes detalhes 
    técnicos, por favor:<br><br></p>` + errorMsg;
}

export function getSweepsNameFromSessionStorage(){
    try{
        return sessionStorage.getItem("fillingSweepstake");
    }catch(error){
        showModal(msgTitle, generateHtmlErrorMsgWhileGetDataFromSessionStorage(error.message), true, "OK", goToHomePage, false);
        return null;
    }
}

export function addSweepsNameInPageHeader(sweepsName){
    let selectedSweepsName = document.getElementById("selectedSweepsName");
    selectedSweepsName.textContent = String(sweepsName).toUpperCase() + " - " + selectedSweepsName.textContent;
}

export function defineEventsInHeaderButtons(funcSaveBtn, funcShowInstrucBtn, funcThirdBtn, thirdButtonId="go-to-knockout-stage"){
    document.getElementById("save-data").addEventListener("click", funcSaveBtn);
    document.getElementById("show-instructions").addEventListener("click", funcShowInstrucBtn);
    document.getElementById(thirdButtonId).addEventListener("click", funcThirdBtn);
}

export function showInstructionMsg(title, isInstructionsOfGroupStage=true){
    const subtitle = isInstructionsOfGroupStage ? " da Fase de Grupos" : " das Fases Mata-Mata";
    showModal(title + " - Instruções" + subtitle, getInstructionsMsgHtmlContent(isInstructionsOfGroupStage), true, "OK", null, false);
}

function getInstructionsMsgHtmlContent(isInstructionsOfGroupStage=true){
    if(isInstructionsOfGroupStage){
        return `<p class="app-normal-txt">
        <strong>Instruções da Fase de Grupos:</strong><br><br>
        -Preencha todos os resultados da fase de grupos<br>
        -Mesmo antes de concluir o preenchimento, <strong>clique no botão SALVAR</strong> para garantir 
        que os dados já digitados não sejam perdidos
        <br>
        -O sistema irá calcular automaticamente as colocações em cada grupo;
        <br>
        -Se houver empate nos pontos de duas ou mais seleções, os critérios de desempate serão:<br>
        a)	desempate com saldo de gols;<br> 
        b)	depois gols marcados<br>
        c)	depois confronto direto e<br> 
        <strong>d)	por último, se for necessário, você decide o desempate.</strong><br>
        -Após o último salvamento e não havendo mais empates em pontos entre seleções, 
        será exibido o botão 'IR PARA MATA-MATA' para que você prossiga com o preenchimento das
        demais fases do bolão.
        </p>`;
    }else{
        return  `<p class="app-normal-txt">
        <strong>Instruções das Fases Mata-mata:</strong><br><br>
        -Preencha o resultado das partidas normalmente, como você fez na fase de grupos<br>
        -Nos casos em que você preencha com empate, a decisão sobre a seleção que avançará 
        para a próxima fase (vitória nos pênaltis) será sua. Ou seja, <strong>você preencherá apenas o 
        resultado no tempo normal de jogo mais prorrogação.</strong><br>
        -não se esqueça de <strong>clicar no botão SALVAR</strong> de tempos em tempos!
        <br>
        </p>
        `;
    }


}

export function defineLoadPageEvents(secundaryStatusHtmlElement){
    addEventListener("beforeunload", () => {
        sessionStorage.setItem("saveStatusBeforeLoadPage", getSaveStatus())
        sessionStorage.setItem('yScrollBeforeReLoadPage', window.scrollY);
    })
    addEventListener("load", () => {
        const yScroll = sessionStorage.getItem('yScrollBeforeReLoadPage');
        const saveStatus = sessionStorage.getItem('saveStatusBeforeLoadPage');
        if (yScroll) {
            window.scrollTo(0, Number(yScroll));
        }
        if (saveStatus) {
            updateSaveStatus(secundaryStatusHtmlElement, saveStatus, false);
        }
    });
}

function getSaveStatus(){
    return document.getElementById("secundaryStatus").textContent;
}

export function updateSaveStatus(secundaryStatusHtmlElement, specificStatus="", onlyInformThatDontHavePendingDataToSave=false){
    if(!onlyInformThatDontHavePendingDataToSave){
        if(specificStatus === ""){
            secundaryStatusHtmlElement.textContent = "Dados salvos em " + new Date().toLocaleString();
        }else{
            secundaryStatusHtmlElement.textContent = specificStatus;
        }
    }else{
        secundaryStatusHtmlElement.textContent = "Todos os dados estão salvos. :)";
    }
}

export function normalizeScoreTeamInput(htmlInputElement){
    //Remove all caracteres that is not a 0-9:
    htmlInputElement.value = htmlInputElement.value.replace(/\D/g, '');
}

export function checkPartialFilledMatches(){
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

export function checkInvalidFilledMatches(){
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

export function showReviewMatchesMsg(msgTitle, checkPartialFilledMatchesResult, checkInvalidFilledMatchesResult){

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