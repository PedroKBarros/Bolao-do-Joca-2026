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

async function getAllSweepstakesNames(req, res) {
  try {
    /*
    * Obtendo os nomes de todos os bolões do sistema (bolões que ele participa ou não):
    */
    res.status(200).json(await sweepsServ.getAllSweepstakesNames());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function createSweepstake(req, res) {
  try {
    //Obtendo token:
    const token = req.cookies.auth_token;

    const { sweepsName, sweepsKeyword, sweepsQuota, sweepsStartDateParticipation, 
      sweepsEndDateParticipation, sweepsWhatsappGroupLink } = req.body;

    await sweepsServ.createSweepstake(token, sweepsName, sweepsKeyword, sweepsQuota, 
          sweepsStartDateParticipation, sweepsEndDateParticipation, sweepsWhatsappGroupLink);

    res.status(200).json({ message: "Bolão criado com sucesso!" });
  } catch (err) {
    console.log("Retorno");
    res.status(400).json({ message: err.message });
  }
}

async function joinSweepstake(req, res) {
  try {
    const token = req.cookies.auth_token;
    const { sweepsName, sweepsKeyword } = req.body;

    await sweepsServ.joinSweepstake(token, sweepsName, sweepsKeyword);

    res.status(200).json({ message: "Participante foi adicionado ao bolão com sucesso!" });
  } catch (err) {
    console.log("Retorno");
    res.status(400).json({ message: err.message });
  }
}


module.exports = { getSweepstakes, getAllSweepstakesNames, createSweepstake, joinSweepstake };