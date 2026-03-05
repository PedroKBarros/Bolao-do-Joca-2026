# Backend - Uso de Cors:

## Ambiente de Desenvolvimento:

No ambiente de desenvolvimento, para que o front-end não interfira no back-end e vice-versa, eles utilizam portas distintas.
* Front-end: 5500
* Back-end: 3000

Dessa forma, para que seja possível a comunicação entre front e back foi necessário configurar, no arquivo /backend/app.js a utilização de CORS indicando como origem o front-end:

```
app.use(cors({
  origin: "http://127.0.0.1:5500"
}));
```

## Ambiente de Produção:

Em produção o ideal é que tanto o front quanto o back estejam na mesma origem, para evitar problemas de CORS.

Ex.: https://meusite.com serve o frontend estático e o backend na mesma URL

Alternativa: usar subdomínios diferentes (api.meusite.com e www.meusite.com) e configurar CORS no backend.

Observação: ainda será definido como faremos em produção.