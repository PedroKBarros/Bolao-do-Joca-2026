require('dotenv').config(); // Necessário para qualquer módulo (arquivo JS) que precise acessar variáveis definidas no /backend/.env
const envFileHandle = require('./config/env');
const cors = require("cors");
const express = require('express');
//Declarando o uso do cookie-parser para enviar de 
// forma segura o token de acesso após login:
const cookieParser = require("cookie-parser");

const authRoutes = require('./routes/authRoutes');
const registerRoutes = require('./routes/registerRoutes');
const meRoutes = require('./routes/meRoutes');
const sweepsRoutes = require('./routes/sweepsRoutes');
const matchesRoutes = require('./routes/matchesRoutes');
const predictionsRoutes = require('./routes/predictionsRoutes');
const drawsRoutes = require('./routes/drawsRoutes');

const app = express();

if(!envFileHandle.isProductionEnv){
  app.use(cors({
    origin: "http://127.0.0.1:5500", //Cors adicionado, pois no ambiente de desenvolvimento a porta do front-end é 5500, diferente da 3000 do back.
    methods: ["GET", "POST"],
    credentials: true // permite cookies
  }));
}

app.use(express.json());
app.use(cookieParser());

app.use('/api', authRoutes);
app.use('/api', registerRoutes);
app.use('/api', meRoutes);
app.use('/api', sweepsRoutes);
app.use('/api', matchesRoutes);
app.use('/api', predictionsRoutes);
app.use('/api', drawsRoutes);

//"/api" é o prefixo da API.

module.exports = app;
