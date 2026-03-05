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

export function showModalWithHtmlContent(title, htmlContent, showPositiveButtonText=true, positiveButtonText='CONFIRMAR', 
    positiveButtonCallFunc=null,  showNegativeButtonText=true, negativeButtonText='CANCELAR', negativeButtonCallFunc=null){

    removeLastHtmlModal();
    const modalHTML = generateModalWithHtmlContent(title, htmlContent, showPositiveButtonText=true, 
        positiveButtonText='CONFIRMAR', showNegativeButtonText=true, negativeButtonText='CANCELAR');

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const myModal = new bootstrap.Modal(document.getElementById('modal'), {
        backdrop: 'static',  // não fecha ao clicar fora
        keyboard: false      // não fecha ao pressionar ESC
    });

    myModal.show();

    //Adicionando eventos nos botões da modal:
    addEventsInModalButtons(negativeButtonCallFunc, positiveButtonCallFunc);

}

function removeLastHtmlModal(){
    let modal = document.getElementById("modal");
    let backdropFadeShow = document.getElementsByClassName("modal-backdrop fade show")[0];
    if(modal !== null && modal !== undefined){
        modal.remove();
        if(backdropFadeShow !== null && backdropFadeShow !== undefined){
            backdropFadeShow.remove();
        }
    }
}

function generateModalWithHtmlContent(title, htmlContent, showPositiveButtonText=true, positiveButtonText='CONFIRMAR', 
    showNegativeButtonText=true, negativeButtonText='CANCELAR'){
    let modalFooterHtmlContent = '';
    let modalHTML = `
    <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
        <div class="modal-header">
            <h1 class="app-modal-title">` + title + `</h1>
        </div>
        <div class="modal-body">` + htmlContent + `</div>
        <div class="modal-footer">`;
    if(showNegativeButtonText){
        modalFooterHtmlContent+=`
        <button id="negative-btn-modal" type="button" class="app-btn app-medium-btn app-negative-btn-color" data-bs-dismiss="modal">`
         + negativeButtonText + `</button>`;
    }
    
    if(showPositiveButtonText){
        modalFooterHtmlContent+=`
        <button id="positive-btn-modal" type="button" class="app-btn app-medium-btn app-positive-btn-color" data-bs-dismiss="modal">`
         + positiveButtonText + `</button>`;
    } 
        
    modalHTML += modalFooterHtmlContent + `
        </div>
        </div>
    </div>
    </div>
    `;

    return modalHTML;
}

export function showModalWithTextContent(title, textContent, showPositiveButtonText=true, 
    positiveButtonText='CONFIRMAR', positiveButtonCallFunc=null,
    showNegativeButtonText=true, negativeButtonText='CANCELAR', negativeButtonCallFunc=null){

    removeLastHtmlModal();

    const modalHTML = generateModalWithTextContentHTML(title, textContent, showPositiveButtonText, 
    positiveButtonText, showNegativeButtonText, negativeButtonText);

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    const myModal = new bootstrap.Modal(document.getElementById('modal'), {
        backdrop: 'static',  // não fecha ao clicar fora
        keyboard: false      // não fecha ao pressionar ESC
    });

    //Adicionando eventos nos botões da modal:
    addEventsInModalButtons(negativeButtonCallFunc, positiveButtonCallFunc);

    myModal.show();
}

function generateModalWithTextContentHTML(title, textContent, showPositiveButtonText=true, 
    positiveButtonText='CONFIRMAR', showNegativeButtonText=true, 
    negativeButtonText='CANCELAR'){
    let modalFooterHtmlContent = '';
    let modalHTML = `
    <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
        <div class="modal-header">
            <h1 class="app-modal-title">` + title + `</h1>
        </div>
        <div class="modal-body"><p class="app-modal-txt">` + textContent + `</p></div>
        <div class="modal-footer">`;
    if(showNegativeButtonText){
        modalFooterHtmlContent+=`
        <button id="negative-btn-modal" type="button" class="app-btn app-medium-btn app-negative-btn-color" data-bs-dismiss="modal">`
         + negativeButtonText + `</button>`;
    }
    
    if(showPositiveButtonText){
        modalFooterHtmlContent+=`
        <button id="positive-btn-modal" type="button" class="app-btn  app-medium-btn app-positive-btn-color" data-bs-dismiss="modal">`
         + positiveButtonText + `</button>`;
    } 
        
    modalHTML += modalFooterHtmlContent + `
        </div>
        </div>
    </div>
    </div>
    `;

    return modalHTML;

}

export function addHtmlInShowedModal(htmlContent){
    let modalBody = document.getElementsByClassName("modal-body")[0];
    modalBody.insertAdjacentHTML("beforeend", htmlContent);
}

function addEventsInModalButtons(negativeButtonFunc, positiveButtonFunc){
    if(negativeButtonFunc){
        addEventInElement("negative-btn-modal", "click", negativeButtonFunc);
    }
    if(positiveButtonFunc){
        addEventInElement("positive-btn-modal", "click", positiveButtonFunc);
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
    throw new Error("Erro de rede: " + error.message);
  }
}