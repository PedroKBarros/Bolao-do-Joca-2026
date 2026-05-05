import { goToPage, showLoadingModal, goToHomePage, haveRequest, loadModalInHtmlPage, 
    showModal, hideModal, loadHtmlComponentInHtmlPage, getHtmlOfComponent} from "./common.js";
import { PAGE_CONFIGS } from "./config.js";

const msgTitle = "Bolões";
const adminSweepsListTitle = "Bolões do Sistema";
const userSweepsListTitle = "Seus Bolões";
var tryCreateSweeps = false;
var userData;
var sweepsData;

const newSweepsData = `
{
    "sweepsName": "",
    "sweepsKeyword": "",
    "sweepsQuota": "",
    "sweepsStartDateParticipation": "",
    "sweepsEndDateParticipation": "",
    "sweepsWhatsappGroupLink": ""
}
  `;

var newSweepsDataParsed;

export async function init(){
    await loadModalInHtmlPage();
    definePageUI();
}

async function definePageUI() {
    await haveUserDataRequest();
    await haveSweepstakesDataRequest();
    defineButtonEvents();
    defineWelcomeMsgUI();
    if(userData.isAdmin === 0){
        document.getElementById("create-sweepstacke").hidden = true;
    }else{
        document.getElementById("sigin-sweepstacke").hidden = true;        
    }

    defineSweepsListUI();
}

function defineButtonEvents(){
    document.getElementById('create-sweepstacke')
        .addEventListener('click', () => {
            showModalCreateSweepstake();
    });

    //TODO: definir evento do botão "ENTRAR EM BOLÃO"
}

async function defineSweepsListUI(){
    let sweepsArea = document.getElementById("sweepsArea");
    if(sweepsData.length){
        constructSweepsListUI();
    }else{
        sweepsArea.innerHTML=`
                        <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-center">
                        <img src="/frontend/assets/img/soccer-player.png" class="app-top-separation img-fluid" alt="Logo" style="width: 141px;height: 141px;opacity: 60%;">
                    </div>
                </div>
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-center">
                        <p class="app-meidum-txt app-yellow-txt app-top-separation">Você não está participando de nenhum bolão.</p>
                    </div>
                </div>
        `;
    }
}

async function constructSweepsListUI(){
    const listItemHtml = await getHtmlOfComponent("listItem");
    //Add list component in page:
    await loadHtmlComponentInHtmlPage("list", "sweepsArea");
    
    //Hidden filter:
    document.getElementById("listFilter").classList.add("d-none");

    //Change list title:
    if(userData.isAdmin){
        document.getElementById("listTitle").innerText = adminSweepsListTitle + " (" + sweepsData.length + ")";
    }else{
        document.getElementById("listTitle").innerText = userSweepsListTitle + " (" + sweepsData.length + ")";        
    }
    
    //Add list items in list:
    let listArea = document.getElementById("listItemsArea");
    let startPartDate;
    let finalPartDate;
    for(let i=0;i<sweepsData.length;i++){
        listArea.innerHTML += listItemHtml;
        document.getElementsByName("listItemTitle")[i].innerText = sweepsData[i].name + " (" + sweepsData[i].total_users + ")";
        document.getElementsByName("listItemContentPr1")[i].innerText = "Criado por: " + sweepsData[i].author_name + " | Jocota$: " + sweepsData[i].quota;
        if(sweepsData[i].start_date_participation !== null && sweepsData[i].final_date_participation !== null){
            startPartDate = new Date(sweepsData[i].start_date_participation);
            finalPartDate = new Date(sweepsData[i].final_date_participation);
            document.getElementsByName("listItemContentPr2")[i].innerText = "Período Participação: " + startPartDate.toLocaleDateString() + " à " + finalPartDate.toLocaleDateString();
        }

    }

}

function defineWelcomeMsgUI(){
    let welcomeMsg = document.getElementById("welcome-msg");
    welcomeMsg.textContent = "Bem vindo, " + userData.name + "!";
}

async function haveUserDataRequest(){
    try{
        showLoadingModal();
        const response = await haveRequest("/me", "GET");
        if(response.isSuccessStatus){
            userData = response.body;
            console.log(userData);
            hideModal();
        }else{
            throw new Error("Requisição GET /me retornou status " + response.status + ".");           
        }
    }catch(error){
        /*
            Só entra aqui se for erro de rede, ou seja, se ocorrer:
            -Servidor offline
            -Conexão recusada
            -DNS não encontrado
            -Timeout de rede
            -Problema de CORS que bloqueia a requisição
            -Usuário sem internet
        */
        showModal(msgTitle + " - Erro", "<p><strong>Ocorreu um erro inesperado ao tentar obter os dados do usuário logado.</strong>"+
            "<br>Sugerimos que verifique se você está conectado a internet ou aguarde 10 minutos antes de tentar novamente."+
            "<br>Caso o problema persista, envie uma mensagem no grupo de Whatsapp do bolão informando o problema.<br>"+
            "Nesse caso, informe também os seguintes detalhes técnicos, por favor:<br><br></p>"+error.message, 
            true, "OK", goToHomePage, false); 
    }

}


async function haveSweepstakesDataRequest(){
    try{
        showLoadingModal();
        const response = await haveRequest("/sweeps", "GET");
        if(response.isSuccessStatus){
            sweepsData = response.body;
            console.log(sweepsData);
            hideModal();
        }else{
            throw new Error("Requisição GET /sweeps retornou status " + response.status + ".");           
        }
    }catch(error){
        /*
            Só entra aqui se for erro de rede, ou seja, se ocorrer:
            -Servidor offline
            -Conexão recusada
            -DNS não encontrado
            -Timeout de rede
            -Problema de CORS que bloqueia a requisição
            -Usuário sem internet
        */
        showModal(msgTitle + " - Erro", "<p><strong>Ocorreu um erro inesperado ao tentar obter os bolões do usuário logado.</strong>"+
            "<br>Sugerimos que verifique se você está conectado a internet ou aguarde 10 minutos antes de tentar novamente."+
            "<br>Caso o problema persista, envie uma mensagem no grupo de Whatsapp do bolão informando o problema.<br>"+
            "Nesse caso, informe também os seguintes detalhes técnicos, por favor:<br><br></p>"+error.message, 
            true, "OK", goToHomePage, false); 
    }
}

async function haveCreateSweepsRequest(){
    try{
        showLoadingModal();
        const response = await haveRequest("/sweeps", "POST", JSON.stringify(newSweepsDataParsed));
        if(response.isSuccessStatus){
            showModal(msgTitle, "<p>Bolão criado com sucesso!<br>A página será atualizada para que ele passe a ser exibido na lista.</p>", 
                false, "", null, false);
            setTimeout(function() {location.reload();}, 3000);
        }else{
            console.log(response.body.message);
            showModalCreateSweepstake(response.body.message);
        }
    }catch(error){
        /*
            Só entra aqui se for erro de rede, ou seja, se ocorrer:
            -Servidor offline
            -Conexão recusada
            -DNS não encontrado
            -Timeout de rede
            -Problema de CORS que bloqueia a requisição
            -Usuário sem internet
        */
        showModal(msgTitle + " - Erro", "<p><strong>Ocorreu um erro inesperado ao tentar criar o bolão.</strong>"+
            "<br>Sugerimos que verifique se você está conectado a internet ou aguarde 10 minutos antes de tentar novamente."+
            "<br>Caso o problema persista, envie uma mensagem no grupo de Whatsapp do bolão informando o problema.<br>"+
            "Nesse caso, informe também os seguintes detalhes técnicos, por favor:<br><br></p>"+error.message, 
            true, "OK", null, false); 
    }

}


function showModalCreateSweepstake(warningMsg=''){
    tryCreateSweeps = true;
    showModal("Criar Bolão", generateModalCreateSweepsHtml(warningMsg), true, "CRIAR", 
    createSweepstake, true, "CANCELAR", null, true);

    //Verificando se alguma tentativa de realizar a requisição de criação 
    // já havia sido realizada, pois, nesse caso, temos que exibir a modal 
    // com os valores nos campos e descer até o elemento warning-msg:
    if(tryCreateSweeps){
        document.getElementById("sweeps-name").value = newSweepsDataParsed.sweepsName;
        document.getElementById("sweeps-keyword").value = newSweepsDataParsed.sweepsKeyword;
        document.getElementById("sweeps-quota").value = newSweepsDataParsed.sweepsQuota;
        document.getElementById("sweeps-start-partic-date").value = newSweepsDataParsed.sweepsStartDateParticipation;
        document.getElementById("sweeps-end-partic-date").value = newSweepsDataParsed.sweepsEndDateParticipation;
        document.getElementById("sweeps-wpp-group-link").value = newSweepsDataParsed.sweepsWhatsappGroupLink;
        document.getElementById("warning-msg").scrollIntoView();
    }
}

async function createSweepstake(){
    const sweepsName = document.getElementById("sweeps-name");
    const sweepsKeyword = document.getElementById("sweeps-keyword");
    const sweepsQuota = document.getElementById("sweeps-quota");
    const sweepsStartParticDate = document.getElementById("sweeps-start-partic-date");
    const sweepsEndParticDate = document.getElementById("sweeps-end-partic-date");
    const sweepsWhatsppGroupLink = document.getElementById("sweeps-wpp-group-link");
    const warningMsg = document.getElementById("warning-msg");
    let existInvalidDate = false;

    if(sweepsName.value === '' && !existInvalidDate){
        warningMsg.innerText = "O nome do bolão não foi preenchido.";
        existInvalidDate = true;
    }

    if(sweepsKeyword.value === '' && !existInvalidDate){    
        warningMsg.innerText = "A palavra-chave do bolão não foi preenchida.";
        existInvalidDate = true;
    }

    if(sweepsQuota.value === '' && !existInvalidDate){
        warningMsg.innerText = "A Jocota$ não foi preenchida. Caso o bolão não possua cota, informe valor zero.";
        existInvalidDate = true;
    }

    if((sweepsStartParticDate.value === '' || 
        sweepsEndParticDate.value === '')  && !existInvalidDate){
        warningMsg.innerText = "A data inicial e/ou a data final do período de participação não foram preenchidas.";
        existInvalidDate = true;
    }

    if(sweepsWhatsppGroupLink.value === ''  && !existInvalidDate){ 
        warningMsg.innerText = "O link do grupo de Whatsapp do bolão não preenchido.";
        existInvalidDate = true;
    }

    if(String(sweepsName.value).toUpperCase() === String(sweepsKeyword.value).toUpperCase()  && !existInvalidDate){
        warningMsg.innerText = "A palavra-chave não pode ser igual ao nome do bolão.";
        existInvalidDate = true;      
    }

    if(existInvalidDate){
        showWarningMsg(warningMsg);
        existInvalidDate=false;
        return;
    }

    //Ocultando warning-msg e modal:
    warningMsg.classList.add("d-none");
    hideModal();

    console.log(sweepsName);
    storageNewSweepstakeData(sweepsName.value, sweepsKeyword.value, sweepsQuota.value, sweepsStartParticDate.value, 
        sweepsEndParticDate.value, sweepsWhatsppGroupLink.value);
    
    await haveCreateSweepsRequest(warningMsg);
}

function showWarningMsg(warningMsg){
    warningMsg.classList.remove("d-none");
    warningMsg.scrollIntoView();
}

function storageNewSweepstakeData(sweepsName, sweepsKeyword, sweepsQuota, 
    sweepsStartDateParticipation, sweepsEndDateParticipation, sweepsWhatsappGroupLink){

    newSweepsDataParsed = JSON.parse(newSweepsData);
    newSweepsDataParsed.sweepsName = sweepsName;
    newSweepsDataParsed.sweepsKeyword = sweepsKeyword;
    newSweepsDataParsed.sweepsQuota = sweepsQuota;
    newSweepsDataParsed.sweepsStartDateParticipation = sweepsStartDateParticipation;
    newSweepsDataParsed.sweepsEndDateParticipation = sweepsEndDateParticipation;
    newSweepsDataParsed.sweepsWhatsappGroupLink = sweepsWhatsappGroupLink;

    console.log(newSweepsDataParsed);

}

function generateModalCreateSweepsHtml(warningMsg=''){
    let warningMsgClass='';
    if(warningMsg === ''){
        warningMsgClass = "\"app-alert-txt-block app-top-separation d-none\"";
    }else{
        warningMsgClass = "\"app-alert-txt-block app-top-separation\"";
    }

    let html = `
            <!-- A div container abaixo serve apenas para que as labels fiquem alinhadas 
             a esquerda, não sendo necessário em todas as páginas.
             Obs.: ela só cumprirá esse objetivo se os elementos de maior 
             largura da página forem os campos. -->
            <div class="container app-restrict-container mx-auto">
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-start">
                        <label for="sweeps-name" class="app-big-txt app-yellow-txt">Nome:</label>
                    </div>
                </div>
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-center">
                        <input type="text" class="app-field app-big-field" id="sweeps-name" placeholder="">
                    </div>
                </div>
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-start">
                        <label for="sweeps-keyword" class="app-big-txt app-yellow-txt app-top-separation">Palavra-chave:</label>
                    </div>
                </div>
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-center">
                        <input type="text" class="app-field app-big-field" id="sweeps-keyword" placeholder="">
                    </div>
                </div>
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-start">
                        <label for="sweeps-quota" class="app-big-txt app-yellow-txt app-top-separation">Jocota$:</label>
                    </div>
                </div>
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-center">
                        <input type="number" class="app-field app-big-field" id="sweeps-quota" placeholder="">
                    </div>
                </div>
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-start">
                        <p class="app-big-txt app-yellow-txt app-top-separation">Período para participar do bolão:</p>
                    </div>
                </div>
                <div class="row d-flex align-items-center">
                    <div class="col-auto text-start">
                        <label for="sweeps-start-partic-date" class="app-big-txt app-yellow-txt">Data Inicial:</label>
                    </div>
                </div>
                <div class="row d-flex align-items-center">
                    <div class="col-auto text-start">
                        <input type="date" class="app-field app-big-field" id="sweeps-start-partic-date" placeholder="">
                    </div>
                </div>
                <div class="row d-flex align-items-center">
                    <div class="col-auto text-start">
                        <label for="sweeps-end-partic-date" class="app-big-txt app-yellow-txt app-top-separation">Data Final:</label>
                    </div>
                </div>
                <div class="row d-flex align-items-center">
                    <div class="col-auto text-start">
                        <input type="date" class="app-field app-big-field" id="sweeps-end-partic-date" placeholder="">
                    </div>
                </div>
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-start">
                        <label for="sweeps-wpp-group-link" class="app-big-txt app-yellow-txt app-top-separation">Link do Grupo do Whatsapp:</label>
                    </div>
                </div>
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-center">
                        <input type="text" class="app-field app-big-field" id="sweeps-wpp-group-link" placeholder="">
                    </div>
                </div>
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-start">
                        <p id="warning-msg" class=` + warningMsgClass + `style="width: 300px;">` +
                            warningMsg +
                 `</p>
                    </div>
                </div>                
            </div>`;
    return html;
}