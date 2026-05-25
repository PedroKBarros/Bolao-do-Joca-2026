require('dotenv').config();
const envFileHandle = require('./config/env');

const app = require('./app');

const PORT = envFileHandle.port|| 3000;

const HOST = envFileHandle.isProductionEnv ? '127.0.0.1' : '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
