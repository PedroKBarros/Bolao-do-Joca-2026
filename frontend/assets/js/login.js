import { showModal, makeRequest, handleRequest, goToPage, showLoadingModal, loadModalInHtmlPage } from "./common.js";
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
    await handleRequest(() => makeRequest("/login", "POST", JSON.stringify(loginDataParsed)), 
    () => goToPage(PAGE_CONFIGS.PG_SWEEPS_NAME), true, null, true, msgTitle);
}

function goToLoginPage(){
    goToPage(PAGE_CONFIGS.PG_LOGIN_NAME);
}