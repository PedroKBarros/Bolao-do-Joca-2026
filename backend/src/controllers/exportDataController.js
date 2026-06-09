const exportServ = require('../services/exportDataService');
const envFileHandle = require('../config/env');

async function exportUserFilledInSweeps(req, res){
  try {
    const { sweepsName, userIdInSweepstake } = req.query;

    //Obtendo token:
    const cookieName = envFileHandle.cookieName;
    const token = req.cookies[cookieName];
    
    let pdfBuffer = await exportServ.exportUserFilledInSweeps(token, sweepsName, userIdInSweepstake);
    if (!Buffer.isBuffer(pdfBuffer)) {
      throw new Error('O serviço não retornou um PDF válido.');
    }
    
    res.setHeader(
        'Content-Type',
        'application/pdf'
    );

    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${sweepsName}.pdf"`
    );
    res.status(200).send(pdfBuffer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }  
}

async function exportAllFilledInSweeps(req, res){

}

module.exports = { exportUserFilledInSweeps, exportAllFilledInSweeps };