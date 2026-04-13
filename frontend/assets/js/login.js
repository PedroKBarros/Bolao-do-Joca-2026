import { showModal, haveRequest, goToPage, showLoadingModal, loadModalInHtmlPage } from "./common.js";
import { PAGE_CONFIGS } from "./config.js";

const msgTitle = "Login";
const loginData = `
{
    "whatsappNumber": "",
    "password": ""
}
  `;

export var loginDataParsed;

export async function init(){
    await loadModalInHtmlPage();

    document.getElementById('login-confirm')
        .addEventListener('click', () => {
            checkIfIsFilledData();
    });
}

function checkIfIsFilledData(){
    let whatsappNumberField = document.getElementById("whatsapp-num");
    let passwordField = document.getElementById("password");
    
    if(whatsappNumberField.value === '' || passwordField.value === ''){
        showModal(msgTitle + " - Campos não preenchidos", "<p>Para realizar o login informe o número do Whatsapp e a senha.</p>", 
            true, "OK", null, false); 
        return;
    }
    storageLoginData();
    haveLoginRequest();
}

function storageLoginData(){

    let whatsappNumberField = document.getElementById("whatsapp-num");
    let passwordField = document.getElementById("password");

    loginDataParsed = JSON.parse(loginData);
    loginDataParsed.whatsappNumber = whatsappNumberField.value;
    loginDataParsed.password = passwordField.value;
}

async function haveLoginRequest(){
    try{
        showLoadingModal();

        const response = await haveRequest("/login", "POST", JSON.stringify(loginDataParsed));
        if(response.isSuccessStatus){
            goToPage(PAGE_CONFIGS.PG_SWEEPS_NAME);
        }else{
            showModal(msgTitle, "<p>"+response.body.message+"</p>", 
                true, "OK", null, false); 
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
        showModal(msgTitle + " - Erro", "<strong>Ocorreu um erro inesperado ao tentar realizar o login.</strong>"+
            "<br>Sugerimos que verifique se você está conectado a internet ou aguarde 10 minutos antes de tentar novamente."+
            "<br>Caso o problema persista, envie uma mensagem no grupo de Whatsapp do bolão informando o problema.<br>"+
            "Nesse caso, informe também os seguintes detalhes técnicos, por favor:<br><br>"+error.message, 
            true, "OK", null, false); 

    }

}

function goToLoginPage(){
    goToPage(PAGE_CONFIGS.PG_LOGIN_NAME);
}