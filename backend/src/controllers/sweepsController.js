const sweepsServ = require('../services/sweepsService');

async function getSweepstakes(req, res) {
  try {
    //Obtendo token:
    const token = req.cookies.auth_token;
    /*
    * Obtendo os dados dos bolões do usuário (bolões que ele participa, tendo criado ou não)
    * ou de todos os bolões do sistema, caso o usuário seja administrados:
    */
    res.status(200).json(await sweepsServ.getSweepstakes(token));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { getSweepstakes };