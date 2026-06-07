import { PAGE_CONFIGS } from "./config.js";
import { goToPage } from "./common.js";

export function init(){
    showFinishMsg();
}

function showFinishMsg(){

    let thaksHtmlElement = document.getElementById("thanksForUser");
    thaksHtmlElement.innerHTML = `${sessionStorage.getItem("userName")}, suas respostas no bolão 
    '${sessionStorage.getItem("fillingSweepstake")}' foram salvas com sucesso.<br>
    Agora vamos nos divertir!!!`;
}
