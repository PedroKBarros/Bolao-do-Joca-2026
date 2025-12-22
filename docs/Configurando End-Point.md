# Exemplo de Implementação de End-Point GET /api/users


O end-point GET /api/users deverá retornar uma lista de usuários (mock ou do banco).

-> Consulte o documento backend.md para ver como a estrutura de pastas está organizada e qual o objetivo de cada pasta.

## 1. Iniciar o servidor:

* Processo único? sim
* Arquivo: backend/src/server.js
* Código:

```
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

```

## 2. Configurar o Express:

* Processo único? não. Código deve ser atualizado a cada configuração de end-point.
* Arquivo: backend/src/app.js
* Código:

```

const express = require('express');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());

// prefixo da API
app.use('/api/users', userRoutes);

module.exports = app;

```

## 3. Definir Rota:

* Processo único? não. Para cada end-point deve ser adicionado arquivo .js no backend/src/routes.
* Arquivo: backend/src/routes/userRoutes.js
* Código:

```

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users
router.get('/', userController.getAllUsers);

module.exports = router;

```

## 4. Implementar Recebimento da Requisição:
* Processo único? não. Para cada end-point deve ser adicionado arquivo .js em backend/src/controllers.
* Arquivo: backend/src/controllers/userController.js
* Código:

```

const userService = require('../services/userService');

async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
}

module.exports = {
  getAllUsers
};

```

## 5. Implementar Regra de Negócio:
* Processo único? não. Para cada end-point deve ser adicionado arquivo .js em backend/src/services.
* Arquivo: backend/src/services/userService.js
* Código:

```

const userModel = require('../models/userModel');

async function getAllUsers() {
  return await userModel.findAll();
}

module.exports = {
  getAllUsers
};

```

## 6. Implementar Acesso aos Dados:
* Processo único? não. Para cada end-point deve ser adicionado arquivo .js em backend/src/models.
* Arquivo: backend/src/models/userModel.js
* Código (exemplo sem acesso ao banco, apenas um mock):

```

async function findAll() {
  return [
    { id: 1, name: 'João', email: 'joao@email.com' },
    { id: 2, name: 'Maria', email: 'maria@email.com' }
  ];
}

module.exports = {
  findAll
};

```

Observação: se for implementar acesso a um banco, basta trocar isso por MySQL sem mudar controller nem service.

## Fluxo da Requisição:

GET /api/users

  ↓

routes/userRoutes.js

  ↓

controllers/userController.js

  ↓

services/userService.js

  ↓

models/userModel.js

  ↓

res.json()

## 7. Testando a Requisição:

No navegador ou Postman, acesse:
http://localhost:3000/api/users

Resposta esperada:
[
  { "id": 1, "name": "João", "email": "joao@email.com" },
  { "id": 2, "name": "Maria", "email": "maria@email.com" }
]