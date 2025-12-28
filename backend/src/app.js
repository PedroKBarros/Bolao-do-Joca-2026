require('dotenv').config() // Necessário para qualquer módulo (arquivo JS) que precise acessar variáveis definidas no /backend/.env

//Configurando o Express:

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require("cookie-parser"); //Declarando o uso do cookie-parser para enviar de forma segura o token de acesso após login

const app = express();

app.use(express.json());

// prefixo da API
app.use('/api', authRoutes);

app.use(cookieParser());

module.exports = app;
