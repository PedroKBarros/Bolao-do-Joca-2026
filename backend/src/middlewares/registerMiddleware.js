
function registerMiddleware(req, res, next) {
  try{
    let { keyword } = req.body;
    console.log(req.body);
    console.log(keyword);
    const expected_keyword = String(process.env.KEYWORD_TO_REGISTER).toUpperCase();
    keyword = String(keyword).toUpperCase();
    if (!keyword) {
        return res.status(400).json({ message: 'Palavra-chave para realizar cadastro não foi recebida' });
    }

    if(keyword !== expected_keyword)
    {
        return res.status(400).json({ message: 'Palavra-chave para realizar cadastro incorreta' });
    }

    next();
  }catch(err){
        return res.status(500).json({ message: 'Ocorreu um erro inesperado durante validacao da palavra-chave para realização de cadastro de usuário' });
  }

}

module.exports = {registerMiddleware};
