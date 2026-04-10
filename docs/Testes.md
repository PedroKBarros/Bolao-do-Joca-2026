# Testes

## Testes Unitários:

### Tecnologias e Organização dos Testes:

* Os testes unitários do backend e do banco de dados estão contidos na pasta /backend/tests. Essa pasta contém as subpastas /database e /backend;
* Até o momento estamos utilizando Jest + Javascript para elaboração e execução deles.

### Instalação e Configuração do Jest:
Para instalar o Jest:
```
npm install --save-dev jest
```
No package.json adicionar:
```
"scripts": {
  "test": "jest --detectOpenHandles --runInBand"
}
```

### Execução dos Testes com Jest:
Os testes baseados em Jest devem ser executados a partir da pasta /backend, utilizando-se do seguinte comando:
```
npx jest "tests/database_tests/db.test.js"
```
Observação: para gerar um relatório tanto no terminal quanto como arquivo HTML, adicionar o parâmetro --coverage. A pasta backend/covarage contendo o relatório será automaticamente criada (ela é ignorada pelo git).
```
npx jest --coverage "tests/database_tests/db.test.js"
```

### Extensão do Jest para VSCode:
O Jest possui extensão oficial para o VSCode. O nome da extensão é "Jest" desenvolvida pela Orta e mantida pela comunidade.

### Atualização dos Snapshots de Testes que Falharam:
Estamos utilizando o recurso de snapshot do Jest, que torna desnecessária a necessidade de criamos e mantermos arquivos com os resultados esperados. Nesse contexto, quando um teste falha, caso a análise conclua que a falha foi devido a diferenças com o resultado esperado (snapshot) e que é necessário atualizar o resultado esperado, podemos fazer isso de duas formas:
* Executar novamente o teste com a flag "-u" para que o snapshot seja atualizado:

```
npx jest tests/database_tests/db.test.js -u
```
* Executar comando que atualiza TODOS os snapshots de TODOS os testes que falharam:

```
npx jest -u
```



