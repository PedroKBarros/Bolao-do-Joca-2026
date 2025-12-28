# Backend - Variáveis de Ambiente

Na raiz da pasta /backend existe o arquivo .env que contém as variáveis de ambiente especificas do projeto.
Para que qualquer arquivo/módulo JS tenha acesso a essas variáveis é necessário:

1. Instalar o pacote dotenv
```
npm install dotenv
```
2. Carregar o .env em arquivo/módulo JS que serão executados antes do(s) arquivo(s)/módulo(s) JS que acessarão as variáveis
```
require('dotenv').config()
```
    Obs.: isso foi feito em /backend/src/app.js

3. Para obter o valor de uma determinada variável do /backend/.env:
```
process.env.NOME_VARIAVEL
```
