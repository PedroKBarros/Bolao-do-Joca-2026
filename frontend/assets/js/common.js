import { PAGE_CONFIGS, getFrontendBaseUrl, getBackendBaseUrl } from './config.js';
const UNAUTHENTICATED_HTTP_STATUS = 401;
export const HANDLE_REQUESTS_STATUS = {
    pending:"PENDING REQUEST", 
    success:"SUCCESS RESPONSE", 
    failed:"FAILED RESPONSE", 
    authError:"AUTH ERROR", 
    unknownError:"UNKNOWN ERROR"
};

export function goToPage(htmlFileName){
    if(!String(htmlFileName).includes('.html')){
        htmlFileName+='.html';
    }

    if(String(htmlFileName).indexOf('/') === 0){
        window.location.href = getFrontendBaseUrl() + htmlFileName;
    }else{
        window.location.href = getFrontendBaseUrl() + '/' + htmlFileName;
    }     
}

export function goToHomePage(){
    goToPage(PAGE_CONFIGS.PG_HOME_NAME);
}

export function goToLoginPage(){
    goToPage(PAGE_CONFIGS.PG_LOGIN_NAME);
}

export function showModal(title, htmlContent, showPositiveButton=true, positiveButtonText='CONFIRMAR', 
    positiveButtonCallFunc=null,  showNegativeButton=true, negativeButtonText='CANCELAR', 
    negativeButtonCallFunc=null, removeDefaultHideModalWhenClickPosBtn=false){
    console.log("SHOW MODAL DISPARADO");
    document.getElementById('modalTitle').innerHTML = title;
    document.getElementById('modalHtmlContent').innerHTML = htmlContent;
    if(showPositiveButton){
        document.getElementById("modalPositiveBtn").classList.remove("d-none");
        document.getElementById("modalPositiveBtn").innerHTML = positiveButtonText;
    }else{
        document.getElementById("modalPositiveBtn").classList.add("d-none");        
    }

    if(showNegativeButton){
        document.getElementById("modalNegativeBtn").classList.remove("d-none");
        document.getElementById("modalNegativeBtn").innerHTML = negativeButtonText;
    }else{
        document.getElementById("modalNegativeBtn").classList.add("d-none");        
    }

    //Definindo se o botão positivo fechará por padrão a modal ou não:
    if(removeDefaultHideModalWhenClickPosBtn){
        document.getElementById("modalPositiveBtn").removeAttribute("data-bs-dismiss");
    }else{
        document.getElementById("modalPositiveBtn").setAttribute("data-bs-dismiss","modal");
    }


    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("appModal"), {
        backdrop: 'static',  // não fecha ao clicar fora
        keyboard: false      // não fecha ao pressionar ESC
    });
    /*
    * Obs.: utilizar getOrCreateInstance garante que se a modal já estiver em memória, 
    * por ter sido criada anteriormente, ela não será criada novamente.
    */
    modal.show();

    //Adicionando eventos nos botões da modal:
    addEventsInModalButtons(negativeButtonCallFunc, positiveButtonCallFunc);
}

export function hideModal() {
    const element = document.getElementById("appModal");
    const modal = bootstrap.Modal.getOrCreateInstance(element);

    if (!modal) return;

    modal.hide();
}
export async function loadModalInHtmlPage(){
    await loadHtmlComponentInHtmlPage("modal", "modalComponent");
}

export async function loadHtmlComponentInHtmlPage(componentName, htmlPageElementIdToAddComponent, incrementElementInnerHtml=false){
    const html = await getHtmlOfComponent(componentName);
    if(!incrementElementInnerHtml){
        document.getElementById(htmlPageElementIdToAddComponent).innerHTML = html;
    }else{
        document.getElementById(htmlPageElementIdToAddComponent).innerHTML += html;
    }

}

export async function getHtmlOfComponent(componentName){
    componentName = String(componentName).replace(".html", "");
    const response = await fetch("/frontend/assets/components/" + componentName + ".html");
    const html = await response.text();
    return html;
}

export function showLoadingModal(){
    let loadingHtml = 
    `
        <div class="container d-flex justify-content-center align-items-center">
            <img src="../assets/img/logo_sem_fundo.png" class="app-loading-element img-fluid" alt="Logo">
        </div>
    `;
    showModal("", loadingHtml, false, "", null, false, "", null);
}

export function addHtmlInShowedModal(htmlContent){
    let modalBody = document.getElementsByClassName("modal-body")[0];
    modalBody.insertAdjacentHTML("beforeend", htmlContent);
}

export function createCloneOfElement(elementId, replaceElement=true){
    const oldElement = document.getElementById(elementId);

    if (oldElement) {
        const newElement = oldElement.cloneNode(true);
        if(replaceElement){
            oldElement.replaceWith(newElement);
        }
        return newElement;
    }
    return null;
}

function removeEventsOfPositiveModalButton(){
    createCloneOfElement("modalPositiveBtn");

}

function removeEventsOfNegativeModalButton(){
    createCloneOfElement("modalNegativeBtn");
}

function removeEventsOfModalButtons(){
    removeEventsOfPositiveModalButton();
    removeEventsOfNegativeModalButton();
}

function addEventsInModalButtons(negativeButtonFunc, positiveButtonFunc){
    removeEventsOfModalButtons();
    if(negativeButtonFunc){
        addEventInElement("modalNegativeBtn", "click", negativeButtonFunc);
        
    }
    if(positiveButtonFunc){
        addEventInElement("modalPositiveBtn", "click", positiveButtonFunc);

    }
}

function addEventInElement(elementId, eventName='click', callFunction=null){
    document.getElementById(elementId)
    .addEventListener(eventName, () => {
        callFunction();
    });
  
}

export async function makeRequest(endPoint, method = 'GET', reqJson=null, isJsonStr=true) {
  try {
    let requestOptions = {
        method: method,
        credentials: "include", //Garante que o navegador enviará possíveis cookies e auth headers, mesmo sendo cross-origin
        headers: { "Content-Type": "application/json" },
    };
    if(method !== 'GET'){
        if(isJsonStr === false){
            requestOptions.body = JSON.stringify(reqJson);
        }else{
            requestOptions.body = reqJson;
        }

    }
    const response = await fetch(getBackendBaseUrl() + endPoint, requestOptions);
    const responseBody = await response.json(); // ou .json()

    return {
      status: response.status,
      isSuccessStatus: response.ok,
      body: responseBody
    };

  } catch (error) {
    /* Só entra aqui se for erro de rede, ou seja, se ocorrer:
    -Servidor offline
    -Conexão recusada
    -DNS não encontrado
    -Timeout de rede
    -Problema de CORS que bloqueia a requisição
    -Usuário sem internet*/
    throw new Error("End-point: " + method + " " + endPoint + "<br>Erro de Rede: " + error.message + 
        "<br>Navegador Online: " + navigator.onLine + "<br>Resultado Ping: " + await checkNetworkConnection());
  }
}

export async function handleRequest(requestFunc, successRespFunc=null, 
    showResponseBodyMsgInCaseOfFailedRequest = true, notSuccessRespFunc=null, 
    showLoadingModalBeforeMakeRequest=true, titleOfMessages="BJ 2026"){
    
    let response = null;
    let handleReturn = {status:HANDLE_REQUESTS_STATUS.pending, response:response};
    
    try{
        if(showLoadingModalBeforeMakeRequest){
            showLoadingModal();
        }

        response = await requestFunc();
        if(response.isSuccessStatus){
            if(successRespFunc !== null){
                await successRespFunc();
            }
            handleReturn.status = HANDLE_REQUESTS_STATUS.success;
            handleReturn.response = response;
            return handleReturn;
        }else{
            if(showResponseBodyMsgInCaseOfFailedRequest){
                showModal(titleOfMessages, "<p>"+response.body.message+"</p>", 
                    true, "OK", null, false);     
            }
            if(notSuccessRespFunc !== null){
                await notSuccessRespFunc();
            }
            handleReturn.status = HANDLE_REQUESTS_STATUS.failed;
            handleReturn.response = response;
            return handleReturn;
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

        // Verificando se houve uma response:
        if(response !== null){
            //Cenário 1: caso seja erro de usuário não autenticado:
            if (response.status === UNAUTHENTICATED_HTTP_STATUS) {
                await handleUnauthenticatedUser(response);
                handleReturn.status = HANDLE_REQUESTS_STATUS.authError;
                handleReturn.response = null;
                return handleReturn;
            }
        }
        //Cenário 2: caso seja outro tipo de erro:
        showRequestErrorMessage(titleOfMessages, "Ocorreu um erro de rede desconhecido.", 
            error.message, "Sugerimos que verifique se você está conectado a internet.", goToHomePage);
        }
    handleReturn.status = HANDLE_REQUESTS_STATUS.unknownError;
    handleReturn.response = null;
    return handleReturn;
    }

function showRequestErrorMessage(title, errorDescription, technicalErrorMessage, hintSolution='', callbackFunction=goToHomePage){
    let htmlErrorMsgContent = `
        <p><strong>` + errorDescription + `</strong>`;
    
    if(hintSolution !== ''){
        htmlErrorMsgContent += `<br><br>` + hintSolution;
    }

    htmlErrorMsgContent += `
        <br>Caso o problema persista, faça contato no Whatsapp do Joca.`;
    if(technicalErrorMessage!==''){
        htmlErrorMsgContent += `<br>Nesse caso, informe também os seguintes detalhes técnicos, por favor:<br><br>`;
        htmlErrorMsgContent += technicalErrorMessage + `</p>`;
    }

    showModal(title + " - Erro", htmlErrorMsgContent, true, "OK", callbackFunction, false);
}

async function handleUnauthenticatedUser(response){
  const unauthenticatedCode = response.body.code;

  switch (unauthenticatedCode) {

    case 'NO_TOKEN':
        showModal("BJ 2026", "<p>Você não está logado e será direcionado a página de login.</p>", 
            true, "OK", goToLoginPage, false);
        break;

    case 'TOKEN_EXPIRED':
      await reLogin();
      break;

    case 'INVALID_TOKEN':
        await makeLogout();
        showModal("BJ 2026", "<p>Você possuia uma autorização de acesso inválida que foi revogada. Você será direcionado a página inicial.</p>", 
            true, "OK", goToHomePage, false);
        break;

    default:
      //Nesse caso ocorreu um erro de autenticação desconhecido:
      showRequestErrorMessage("BJ 2026", "Ocorreu um erro de autenticação desconhecido.", 
        response.body.errorMsg, "Sugerimos que você feche o navegador e tente acessar o BJ 2026 novamente.", 
        goToHomePage);

  }
}

export async function makeLogout() {
    await makeRequest("/logout", "POST");
}

async function reLogin(){

    let reLoginHtmlModal = `
            <!-- A div container abaixo serve apenas para que as labels fiquem alinhadas 
             a esquerda, não sendo necessário em todas as páginas.
             Obs.: ela só cumprirá esse objetivo se os elementos de maior 
             largura da página forem os campos. -->
            <div class="container app-restrict-container mx-auto">
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-start">
                        <label for="whatsapp-num" class="app-big-txt app-yellow-txt app-top-separation">Número do Whatsapp:</label>
                    </div>
                </div>
                <div class="row d-flex justify-content-start align-items-start">
                    <div class="col-12 text-start">
                        <input type="text" class="app-field app-big-field" id="whatsapp-num" placeholder="">
                    </div>
                </div>
                <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-start">
                        <label for="password" class="app-big-txt app-yellow-txt app-top-separation">Senha:</label>
                    </div>
                </div>
                <div class="row d-flex justify-content-start align-items-start">
                    <div class="col-12 text-start">
                        <input type="password" class="app-field app-big-field" id="password" placeholder="">
                    </div>
                </div>
               <div class="row d-flex justify-content-center align-items-center">
                    <div class="col-12 text-start">
                        <p id="warning-msg" class="app-alert-txt-block app-top-separation" style="width: 300px;">
                 </p>
                    </div>
                </div>  
                       
            </div>`;

    showModal("BJ2026 - Relogin", reLoginHtmlModal, true, "CONFIRMAR", 
        makeRelogin, true, "CANCELAR", cancelRelogin, true);
}

async function makeRelogin(){
    //Obtendo os dados informados:
    let whatsappNumberField = document.getElementById("whatsapp-num");
    let passwordField = document.getElementById("password");
    let warningMsg = document.getElementById("warning-msg");

    console.log(whatsappNumberField);
    let handleReturn = await handleRequest(() => makeRequest("/login", "POST", 
        {whatsappNumber: whatsappNumberField.value, password: passwordField.value}, false), () => {location.reload();}, false, null, false);
    
    if(handleReturn.status === HANDLE_REQUESTS_STATUS.failed){
        warningMsg.textContent = handleReturn.response.body.message;
    }

}

async function cancelRelogin(){
    await makeLogout();
    showModal("BJ 2026", "<p>Você será direcionado para a página inicial.</p>", true, "OK", goToHomePage, false);
}

async function checkNetworkConnection(){
    try {
        const res = await fetch(
        "https://clients3.google.com/generate_204",
        { method: "GET", mode: "no-cors" }
    );

    return "Passou";
  } catch {
    return "Falhou";
  }
}

export function addEventsToUpdateDropdownSelectedItem(dropdownId, dropdownListItemsId){
    const dropdownItems = document.getElementById(dropdownListItemsId).children;
    const dropdownButton = document.getElementById(dropdownId);

    for(let i =0;i<dropdownItems.length;i++){
        dropdownItems[i].addEventListener('click', function(e) {
            e.preventDefault(); // evita comportamento padrão do link
            dropdownButton.textContent = this.textContent;
        });
    }
}

export function setDefaultDropdownSelectedItem(dropdownId, dropdownListItemsId, defaultItemIndex){
    const dropdownItems = document.getElementById(dropdownListItemsId).children;
    const dropdownButton = document.getElementById(dropdownId);

    dropdownButton.innerText = dropdownItems[defaultItemIndex].innerText;
}

export function formatUrlToExternUrl(url, useHTTPS=true, addWWW=true){
    if(String(url).indexOf("http") === -1 && String(url).indexOf("https") === -1){
        url = useHTTPS ? "https://"+url : "http://"+url;
    }

    if(addWWW){
        if(String(url).indexOf("www") === -1){
            let urlParts = String(url).split("//");
            url = urlParts[0] + "//www." + urlParts[1];
        }
    }


    return url;
}