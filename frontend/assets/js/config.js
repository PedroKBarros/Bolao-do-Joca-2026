export const ENV_CONFIGS = {
    ENV: "dev",
    BASE_URL_DEV_ENV: "http://127.0.0.1:5500/",
    BASE_URL_PROD_ENV: "http://127.0.0.1:3000/",
    BACKEND_BASE_URL_DEV_ENV: "http://127.0.0.1:3000/api",
    BACKEND_BASE_URL_PROD_ENV: "http://127.0.0.1:3000/api"
};

export const PAGE_CONFIGS = {
    PG_HOME_NAME: "index",
    PG_REGISTER_NAME: "register",
    PG_LOGIN_NAME: "login",
    PG_SWEEPS_NAME: "userSweeps",
    PG_GROUP_STAGE_MATCHES_PREDICT: "groupStageMatchesPredict"
}

export function getFrontendBaseUrl(){
    return ENV_CONFIGS.ENV === "dev" ? ENV_CONFIGS.BASE_URL_DEV_ENV : ENV_CONFIGS.BASE_URL_PROD_ENV;
}

export function getBackendBaseUrl(){
    return ENV_CONFIGS.ENV === "dev" ? ENV_CONFIGS.BACKEND_BASE_URL_DEV_ENV : ENV_CONFIGS.BACKEND_BASE_URL_PROD_ENV;
}