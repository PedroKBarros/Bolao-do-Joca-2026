import { ENV_CONFIGS } from './config.js';

export function goToPage(htmlFileName){
    if(!String(htmlFileName).includes('.html')){
        htmlFileName+='.html';
    }

    if(String(htmlFileName).indexOf('/') === 0){
        window.location.href = ENV_CONFIGS.BASE_URL_DEV_ENV + htmlFileName;
    }else{
        window.location.href = ENV_CONFIGS.BASE_URL_DEV_ENV + '/' + htmlFileName;
    }     
}

export function showModal(title, htmlContent, showPositiveButton=true, positiveButtonText='CONFIRMAR', 
    positiveButtonCallFunc=null,  showNegativeButton=true, negativeButtonText='CANCELAR', 
    negativeButtonCallFunc=null, removeDefaultHideModalWhenClickPosBtn=false){

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

export function hideModal()
{
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("appModal"));
    /*
    * Obs.: utilizar getOrCreateInstance garante que se a modal já estiver em memória, 
    * por ter sido criada anteriormente, ela não será criada novamente.
    */
    modal.hide();
}

export async function loadModalInHtmlPage(){
    const response = await fetch("/frontend/assets/components/modal.html");
    const html = await response.text();
    document.getElementById("modalComponent").innerHTML = html;
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

export async function haveRequest(endPoint, method = 'GET', reqJson=null, isJsonStr=true) {
  try {
    let requestOptions = {
        method: method,
        headers: { "Content-Type": "application/json" },
    };
    if(method !== 'GET'){
        if(isJsonStr === false){
            requestOptions.body = JSON.stringify(reqJson);
        }else{
            requestOptions.body = reqJson;
        }

    }
    const response = await fetch("http://127.0.0.1:3000/api" + endPoint, requestOptions);
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
    throw new Error("Erro de rede: " + error.message + "<br>Navegador Online: " + navigator.onLine + "<br>Resultado Ping: " + await checkNetworkConnection());
  }
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