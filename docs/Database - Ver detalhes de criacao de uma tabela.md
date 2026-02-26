# Database - Ver detalhes de criação de uma tabela

Para ver detalhes de criação de uma tabela, como colunas, tipos, chave primária, chaves estrangeiras e nome de constraints, podemos usar:
```
mysql -u root -p bj_2026 --execute="SHOW CREATE TABLE TABLE_NAME" 
```