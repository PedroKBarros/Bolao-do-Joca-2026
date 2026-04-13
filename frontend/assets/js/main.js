import { init as initIndex } from "./index.js";
import { init as initLogin } from "./login.js";
import { init as initRegister } from "./register.js";
import { init as initUserSweeps } from "./userSweeps.js";

document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    console.log(page);
    if (page === "index") initIndex();
    if (page === "login") initLogin();
    if (page === "register") initRegister();
    if(page === "userSweeps") initUserSweeps();
});