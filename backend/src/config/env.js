require('dotenv').config()

const isProductionEnv = process.env.BACKEND_ENV === "prod";

module.exports = {
  isProductionEnv,
  port: process.env.PORT,
  backendEnv: process.env.BACKEND_ENV,

  jwtSecret: process.env.JWT_CHAVE_TOKEN,

  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  
  keywordToRegisterUser: process.env.KEYWORD_TO_REGISTER,

  cookieLifetime: Number(process.env.COOKIE_LIFETIME_MILISECONDS),
  cookieTokenLifetime: process.env.COOKIE_TOKEN_LIFETIME_HOURS
};