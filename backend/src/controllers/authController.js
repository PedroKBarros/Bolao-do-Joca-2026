const authService = require('../services/authService');
const envFileHandle = require('../config/env');

async function login(req, res) {
  const { whatsappNumber, password } = req.body;

  try {
      // Enviando token como cookie para garantir maior segurança no
      // armazenamento dele no lado do client:
      const token = await authService.login(whatsappNumber, password);
      const cookieName = envFileHandle.isProductionEnv ? "__Host-auth_token" : "auth_token";
      /*Obs.: usar o prefixo "__Host-" impede a definição por subdomínios e melhora a segurança
       *contra cookie injection. Só é usado em prod, pois obrigatoriamente a conexão tem que usar 
       *HTTPS, além de ter que ter path:"/", secure:true e não poder usar o atributo Domain.
       */
      res.cookie(cookieName, token, {
      httpOnly: true,       // JS não acessa
      secure: envFileHandle.isProductionEnv,
      sameSite: "lax",   // proteção CSRF
      path: "/", //Define para quais caminhos do site o navegador enviará o cookie. O "/" indica que o cookie deve ser enviado para todas as rotas do domínio
      maxAge: envFileHandle.cookieLifetime
    });
    res.status(200).json({ message: "Login efetuado com sucesso!" });
  } catch (err) {
    console.log("ERRO DO 401: " + err.message);
    res.status(401).json({ message: err.message });
  }
}

async function logout(req, res) {
  try {
    await authService.logout(res);
    res.status(200).json({ message: "Logout efetuado com sucesso!" });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

module.exports = { login, logout };
