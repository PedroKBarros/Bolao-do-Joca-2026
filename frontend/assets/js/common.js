import { PAGE_CONFIGS, getFrontendBaseUrl, getBackendBaseUrl } from './config.js';

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

export async function haveRequest(endPoint, method = 'GET', reqJson=null, isJsonStr=true) {
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