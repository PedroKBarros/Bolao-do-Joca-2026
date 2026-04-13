import { goToPage, showLoadingModal, goToHomePage, haveRequest, loadModalInHtmlPage, 
    showModal, hideModal, loadHtmlComponentInHtmlPage, getHtmlOfComponent} from "./common.js";
import { PAGE_CONFIGS } from "./config.js";

const msgTitle = "Bolões";
const adminSweepsListTitle = "Bolões do Sistema";
const userSweepsListTitle = "Seus Bolões";
var userData;
var sweepsData;

export async function init(){
    await loadModalInHtmlPage();
    definePageUI();
}

async function definePageUI() {
    await haveUserDataRequest();
    await haveSweepstakesDataRequest();
    defineWelcomeMsgUI();
    if(userData.isAdmin === 0){
        document.getElementById("create-sweepstacke").hidden = true;
    }
    //TODO: obter os bolões do usuário (criar end-point + query) e 
    // caso ele possua / esteja em bolões, exibir a lista (componentizar a lista)

    defineSweepsListUI();
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
    for(let i=0;i<sweepsData.length;i++){
        listArea.innerHTML += listItemHtml;
        document.getElementsByName("listItemTitle")[i].innerText = sweepsData[i].name;
        document.getElementsByName("listItemContentPr1")[i].innerText = "Criado por: " + sweepsData[i].author_name;
        document.getElementsByName("listItemContentPr2")[i].innerText = "Status: " + sweepsData[i].status;
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