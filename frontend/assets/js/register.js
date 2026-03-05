import { showModalWithHtmlContent, showModalWithTextContent, addHtmlInShowedModal, haveRequest, goToPage} from "./common.js";
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

document.getElementById('register-confirm')
    .addEventListener('click', () => {
        checkIfIsFilledData();
});

function checkIfIsFilledData(){
    let userNameField = document.getElementById("user-name");
    let whatsappNumberField = document.getElementById("whatsapp-num");
    let passwordField = document.getElementById("password");
    let passwordConfirmField = document.getElementById("password-confirm");
    
    if(userNameField.value === '' || whatsappNumberField.value === '' || passwordField.value === '' || passwordConfirmField.value === ''){
        showModalWithTextContent(msgTitle + " - Campos não preenchidos", "Para realizar o cadastro todos os campos devem ser preenchidos.", true, "OK", null, false); 
        return;
    } 

    checkIfPasswordsAreEquals();
}

function checkIfPasswordsAreEquals(){
    let passwordField = document.getElementById("password");
    let passwordConfirmField = document.getElementById("password-confirm");
    
    if(passwordField.value !== passwordConfirmField.value){
        showModalWithTextContent(msgTitle +" - Senhas diferentes", "As senhas informadas não são iguais.", true, "OK", null, false); 
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
    return  `
    <p class="app-modal-txt">Para confirmar que você conhece o Joca, informe a sigla do clube que ele costuma frequentar:</p>
    <input type="text" class="app-field app-big-field" id="answer" placeholder="">
    <p class="app-obs-txt">Você pode ver a sigla no grupo do Whatsapp.</p>
    `;
}

function showQuestionModal(){

    showModalWithHtmlContent(msgTitle + " - Pergunta", generateHtmlQuestionModal(), true, "CONFIRMAR", storageQuestionAnswer, true, "CANCELAR"); 
}

function storageQuestionAnswer(){
    answer = document.getElementById("answer").value;
    if(answer === ''){
        showQuestionModal();
        addHtmlInShowedModal(`<p class="app-modal-txt app-red-txt">Ops! Você não informou a sigla.</p>`);
        return;
    }
    console.log(answer);
    storageRegisterData();
    showWhatsappNumberConfirmation();
}

function showWhatsappNumberConfirmation(){
    let whatsappNum = document.getElementById('whatsapp-num').value;
    showModalWithTextContent(msgTitle + " - Confirmação do Whatsapp", "Você confirma o cadastro com número de Whatsapp '" + whatsappNum + 
        "'?<br><br><strong>Atenção:</strong> ao confirmar, o número não poderá ser alterado posteriormente.", 
        true, "CONFIRMAR", haveRegisterRequest); 
}

async function haveRegisterRequest(){
    try{
        const response = await haveRequest("/register", "POST", JSON.stringify(registerDataParsed));
        if(response.isSuccessStatus){
            showModalWithTextContent(msgTitle, "Cadastro realizado com sucesso!<br>Você será redicionado a página de login.", 
                true, "OK", goToLoginPage, false);
        }else{
            showModalWithTextContent(msgTitle, response.body.message, 
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
        showModalWithTextContent(msgTitle + " - Erro", "<strong>Ocorreu um erro inesperado ao tentar realizar o cadastro.</strong>"+
            "<br>Sugerimos que verifique se você está conectado a internet ou aguarde 10 minutos antes de tentar novamente."+
            "<br>Caso o problema persista, envie uma mensagem no grupo de Whatsapp do bolão informando o problema.<br>"+
            "Nesse caso, informe também os seguintes detalhes técnicos, por favor:<br><br>"+error.message, 
            true, "OK", null, false); 
    }

}

function goToLoginPage(){
    goToPage(PAGE_CONFIGS.PG_LOGIN_NAME);
}