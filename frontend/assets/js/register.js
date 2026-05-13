import { showModal, addHtmlInShowedModal, makeRequest, handleRequest, goToPage, 
    loadModalInHtmlPage, showLoadingModal, hideModal } from "./common.js";
import { PAGE_CONFIGS } from "./config.js";

const msgTitle = "Cadastro";
var answer;
const registerData = `
{
    "name": "",
    "whatsappNumber": "",
    "password": "",
    "passwordConfirmation": "",
    "isAdmin": false,
    "keyword": ""
}
  `;

var registerDataParsed;

export async function init(){
    document.getElementById('register-confirm')
        .addEventListener('click', () => {
            checkIfIsFilledData();
    });

    await loadModalInHtmlPage();

}


function checkIfIsFilledData(){
    let userNameField = document.getElementById("user-name");
    let whatsappNumberField = document.getElementById("whatsapp-num");
    let passwordField = document.getElementById("password");
    let passwordConfirmField = document.getElementById("password-confirm");
    
    if(userNameField.value === '' || whatsappNumberField.value === '' || passwordField.value === '' || passwordConfirmField.value === ''){
        showModal(msgTitle + " - Campos não preenchidos", "<p>Para realizar o cadastro todos os campos devem ser preenchidos.</p>",
             true, "OK", null, false); 
        return;
    } 

    checkIfPasswordsAreEquals();
}

function checkIfPasswordsAreEquals(){
    let passwordField = document.getElementById("password");
    let passwordConfirmField = document.getElementById("password-confirm");
    
    if(passwordField.value !== passwordConfirmField.value){
        showModal(msgTitle +" - Senhas diferentes", "<p>As senhas informadas não são iguais.</p>", 
            true, "OK", null, false); 
        return;
    } 
    showQuestionModal();
}

function storageRegisterData(){

    let userNameField = document.getElementById("user-name");
    let whatsappNumberField = document.getElementById("whatsapp-num");
    let passwordField = document.getElementById("password");
    let passwordConfirmField = document.getElementById("password-confirm");

    registerDataParsed = JSON.parse(registerData);
    registerDataParsed.name = userNameField.value;
    registerDataParsed.whatsappNumber = whatsappNumberField.value;
    registerDataParsed.password = passwordField.value;
    registerDataParsed.passwordConfirmation = passwordConfirmField.value;
    registerDataParsed.keyword = answer;

}

function generateHtmlQuestionModal(){
    let questionModalHtml=  `
    <p class="app-modal-txt">Para confirmar que você conhece o Joca, informe a sigla do clube que ele costuma frequentar:</p>
    <input type="text" class="app-field app-big-field" id="answer" placeholder="">
    <p class="app-obs-txt">Você pode ver a sigla no grupo do Whatsapp.</p>
    `;
    return questionModalHtml;
}

function showQuestionModal(){

    showModal(msgTitle + " - Pergunta", generateHtmlQuestionModal(), 
    true, "CONFIRMAR", storageQuestionAnswer, true, "CANCELAR", null, true); 
}

function storageQuestionAnswer(){
    answer = document.getElementById("answer").value;
    if(answer === ''){
        console.log("teste");
        addHtmlInShowedModal(`<p class="app-modal-txt app-red-txt">Ops! Você não informou a sigla.</p>`);
        return;
    }
    console.log(answer);
    storageRegisterData();
    showWhatsappNumberConfirmation();
}

function showWhatsappNumberConfirmation(){
    let whatsappNum = document.getElementById('whatsapp-num').value;
    showModal(msgTitle + " - Confirmação do Whatsapp", "<p>Você confirma o cadastro com número de Whatsapp '" + whatsappNum + 
        "'?<br><br><strong>Atenção:</strong> ao confirmar, o número não poderá ser alterado posteriormente.</p>", 
        true, "CONFIRMAR", haveRegisterRequest, true, "CANCELAR", null, true); 
}

async function haveRegisterRequest(){
    await handleRequest(() => makeRequest("/register", "POST", JSON.stringify(registerDataParsed)), 
    () => showModal(msgTitle, "<p>Cadastro realizado com sucesso!<br>Você será redicionado a página de login.</p>", 
                true, "OK", goToLoginPage, false), true, null, true, msgTitle);

}

function goToLoginPage(){
    goToPage(PAGE_CONFIGS.PG_LOGIN_NAME);
}