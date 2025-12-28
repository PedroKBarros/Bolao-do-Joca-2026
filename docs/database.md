# Banco de Dados - Documentação Geral

## Tecnologias

O banco de dados utiliza MySQL.

## Organização

O banco de dados está organizado com a seguinte hierarquia de pastas:

![alt text](database_organizacao.png)

* schema.sql → criação das tabelas.

* migrations/ → contém arquivos sql para cada alteração na estrutura do banco, ou seja, alterações em nome de tabelas, colunas, adição/remoção de tabelas, etc. Dessa forma, é possível desfazer alterações, caso necessário.

* seeds/ → arquivos sql para adicionar os dados iniciais as tabelas.