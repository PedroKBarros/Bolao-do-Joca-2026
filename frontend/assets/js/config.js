export const ENV_CONFIGS = {
    ENV: document.URL.includes("bjcdm.tech") ? "prod" : "dev",
    //BASE_URL_DEV_ENV: "http://127.0.0.1:5500/",
    FRONTEND_DEV_BASE_URL: "http://127.0.0.1:5500/",
    BACKEND_DEV_BASE_URL: "http://127.0.0.1:3000/api",
    FRONTEND_PROD_BASE_URL: "",
    BACKEND_PROD_BASE_URL: "/api"
    //BASE_URL_PROD_ENV: "http://127.0.0.1:3000/",
    //BACKEND_BASE_URL_DEV_ENV: "http://127.0.0.1:3000/api",
    //BACKEND_BASE_URL_PROD_ENV: "http://127.0.0.1:3000/api"
};

export const PAGE_CONFIGS = {
    PG_HOME_NAME: "index",
    PG_REGISTER_NAME: "register",
    PG_LOGIN_NAME: "login",
    PG_SWEEPS_NAME: "userSweeps",
    PG_GROUP_STAGE_MATCHES_PREDICT: "groupStageMatchesPredict"
}

export function getFrontendBaseUrl(){
    return ENV_CONFIGS.ENV === "dev" ? ENV_CONFIGS.FRONTEND_DEV_BASE_URL : ENV_CONFIGS.FRONTEND_PROD_BASE_URL;
}

export function getBackendBaseUrl(){
    return ENV_CONFIGS.ENV === "dev" ? ENV_CONFIGS.BACKEND_DEV_BASE_URL : ENV_CONFIGS.BACKEND_PROD_BASE_URL;
}