# Middleware - Conceitos Iniciais

## Introdução:

Middleware é um código que fica NO MEIO do caminho da requisição.

Quando uma requisição chega no servidor, o fluxo é assim:

Requisição → Middleware(s) → Rota → Controller → Resposta

Um middleware é uma função que:

* Recebe a requisição (req)

* Pode ler ou modificar a requisição

* Pode bloquear a requisição

* Ou deixar passar para o próximo passo

## Assinatura da Função de um Middleware:

```
(req, res, next) => {
  // faz algo
  next();
}
```

* req → dados da requisição
  
* res → resposta
  
* next() → passa para o próximo middleware ou rota

Observação: Sem next(), a requisição para ali.


## Pasta backend/src/middlewares:

A pasta backend/src/middlewares serve para armazenar middlewares que não são específicos de uma rota, mas reutilizáveis.
Exemplos:

| Tipo                | Exemplo              |
| ------------------- | -------------------- |
| Autenticação        | verificar JWT        |
| Autorização         | checar permissões    |
| Logs                | registrar requisição |
| Validação           | validar dados        |
| CORS                | liberar origem       |
| Tratamento de erros | centralizar erros    |


## Exemplo:

No caso de uma requisição GET /api/users, caso houvesse motivo para configurarmos um middleware, o fluxo real de uma requisição para esse end-point seria:

Cliente
  
  ↓

Express

  ↓

(express.json)  ← middleware

  ↓

/api/users (rota)

  ↓

controller

  ↓

res.json()


## Resumo:

* Middleware é um interceptor de requisição;

* Executa antes da rota/controller;

* Serve para lógica transversal;

* Não é obrigatório em toda rota;

* Não configura regra de negócio nem acesso a dados.


## Diferença Entre Service, Controller e Model:

Ver doc "Diferença Entre Middleware, Service, Controller e Model.md".
