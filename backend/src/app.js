require('dotenv').config() // Necessário para qualquer módulo (arquivo JS) que precise acessar variáveis definidas no /backend/.env

//Configurando o Express:

const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());

// prefixo da API
app.use('/api', authRoutes);

module.exports = app;
