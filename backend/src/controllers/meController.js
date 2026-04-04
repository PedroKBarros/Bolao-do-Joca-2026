const meServ = require('../services/meService');

async function getLoggedInUserData(req, res) {
  try {
    //Obtendo token:
    const token = req.cookies.auth_token;
    //Apesar do middleware verificar se usuário está autenticado, vamos verificar novamente:
    if (!token) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    //Obtendo os dados do usuário que estão no payload do token:
    res.status(200).json(meServ.getLoggedInUserData(token));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { getLoggedInUserData };