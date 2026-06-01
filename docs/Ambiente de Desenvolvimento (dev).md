# Ambiente de Desenvolvimento (dev)

## Introdução:
O ambiente de desenvolvimento, abreviado como "dev" nos arquivos de configuração da aplicação, é a máquina de cada desenvolvedor. Portanto, não existe um único ambiente de desenvolvimento, já que ele não é um servidor específico.

## Tecnologias Utilizadas:

* Frontend: Boostrap 5, HTML 5, CSS 3 e Javascript;
* Backend: Node.js, Express, JWT, bcrypt, cookie-parser, cors, dotenv, jsonwebtoken, mysql12
* Base de Dados: MYSQL
* Testes: supertest (testes feitos pelo backend)
* Infra: Liveserver (frontend) e nodemon (backend)

## Endereços do Frontend e do Backend:
* Frontend: 127.0.0.1:5500
* Backend: 0.0.0.0:3000

## Uso de CORs:
Devido ao frontend e o backend utilizarem portas diferentes, no ambiente de desenvolvimento o backend automaticamente habilita o uso de CORs.

## Bases de Dados:
O ambiente de desenvolvimento possui uma base MySQL utilizada também para execução de testes.
* Nome base: bj_2026
* Tipo de conexão: via pool
* Limite de conexões: 10
* Limite de Fila: 0
* Porta: 3306
Observação: inicialmente, cogitou-se configurar duas bases no ambiente, para deixar uma delas dedicada aos testes.

## Procedimento para Executar a Aplicação em Ambiente de Desenvolvimento:

1. Abra um terminal
2. Acesse :\Users\pedro\OneDrive\Projetos\web\bolao_joca_2026\backend
3. Inicie o backend executando:
   ```npm run dev```
Observação: o "dev" é um script definido no package.json que executa o script /backend/src/server.js via nodemon.
   
4. Verifique se foi exibida a mensagem "Servidor rodando em http://0.0.0.0:3000" no terminal
5. Abra a pasta "/frontend" no VSCode (é para abrir o VSCode a partir dessa pasta)
Obs.: o passo 5 é necessário, pois com objetivo de facilitar a configuração do ambiente de produção, os arquivos HTML foram colocados na raíz da pasta "/frontend" e todos os caminhos relativos contidos nos arquivos HTML e nos scripts JS começam a partir dessa pasta. 
6. Inicie o frontend executando o Live Server (opção "Go Live")
7. Quando o navegador abrir, altere o endereço para "http://127.0.0.1:5500/index.html"
8. Divirta-se!

## Diferenças entre o ambiente de desenvolvimento e o ambiente de produção:

* Produção não utiliza CORs, pois tanto o frontend quanto o backend rodam em uma mesma porta;
* Produção não utiliza nodemon para executar o backend. Ao invés disso, ela utiliza nginx.
* Não executamos testes em produção!