require('dotenv').config()

const isProductionEnv = process.env.BACKEND_ENV === "prod";
const cookieName = isProductionEnv ? "__Host-auth_token" : "auth_token";
/*Obs.: usar o prefixo "__Host-" impede a definição por subdomínios e melhora a segurança
  *contra cookie injection. Só é usado em prod, pois obrigatoriamente a conexão tem que usar 
  *HTTPS, além de ter que ter path:"/", secure:true e não poder usar o atributo Domain.
  */

module.exports = {
  isProductionEnv,
  cookieName,
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