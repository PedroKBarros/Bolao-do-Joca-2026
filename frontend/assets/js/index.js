import { PAGE_CONFIGS } from "./config.js";
import { goToPage } from "./common.js";

document.getElementById('login')
    .addEventListener('click', () => {
        goToPage(PAGE_CONFIGS.PG_LOGIN_NAME);
});

document.getElementById('register')
    .addEventListener('click', () => {
        goToPage(PAGE_CONFIGS.PG_REGISTER_NAME);
});