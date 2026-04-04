require('dotenv').config() // Necessário para qualquer módulo (arquivo JS) que precise acessar variáveis definidas no /backend/.env
const cors = require("cors");

//Configurando o Express:

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const registerRoutes = require('./routes/registerRoutes');
const meRoutes = require('./routes/meRoutes');
//Declarando o uso do cookie-parser para enviar de 
// forma segura o token de acesso após login:
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({
  origin: "http://127.0.0.1:5500", //Cors adicionado, pois no ambiente de desenvolvimento a porta do front-end é 5500, diferente da 3000 do back.
  methods: ["GET", "POST"],
  credentials: true // permite cookies
}));
//TODO: em produção tornar a porta do front e do back a mesma e remover cors.

app.use(express.json());
app.use(cookieParser());

// prefixo da API
app.use('/api', authRoutes);
app.use('/api', registerRoutes);
app.use('/api', meRoutes);

module.exports = app;
