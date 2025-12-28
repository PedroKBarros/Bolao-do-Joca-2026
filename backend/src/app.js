require('dotenv').config() // Necessário para qualquer módulo (arquivo JS) que precise acessar variáveis definidas no /backend/.env

//Configurando o Express:

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require("cookie-parser"); //Declarando o uso do cookie-parser para enviar de forma segura o token de acesso após login

const app = express();

app.use(express.json());
app.use(cookieParser());

// prefixo da API
app.use('/api', authRoutes);

module.exports = app;
