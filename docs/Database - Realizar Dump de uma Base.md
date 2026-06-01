# Database - Realizar Dump de uma Base

## Introdução:
Há diversos motivos para realizar um dump (cópia) de uma base de dados, como, por exemplo, a criação de uma base de testes.

## Dump com dados:
Para realizar dump da estrutura das tabelas e de seus respectivos dados, executar:
```
mysqldump -u root -p --single-transaction --routines --triggers --default-character-set=utf8mb4 --databases bj_2026 > schema_tests.sql
```
Repare que 'bj_2026' é o nome da base a partir da qual o dump será realizado e o "schema_tests.sql" é o arquivo para o qual o resultado do dump deverá ser armazenado. Após realizar o dump, basta importar esse arquivo na base desejada com o comando:
```
 mysql -u appuser -p bj_2026 < database/backups/bj_2026_bkp_010626.sql
```
 Repare que 'bj2026_tests' é o nome da base de dados que receberá a mesma estrutura e os mesmos dados da base "bj2026".

Observação: o arquivo SQL com resultado do dump costuma ser composto de mais de uma query. Por padrão, o driver mysql12, utilzado nesse projeto, não permite a execução de scripts SQL com mais de uma query por questões de segurança. O doc "aaaa" apresenta soluções para essa limitação.

## Dump sem dados:
Para realizar dump apenas da estrutura das tabelas devemos adicionar o parâmetro "--no-data":
```
mysqldump --no-data -u root -p --single-transaction --routines --triggers --default-character-set=utf8mb4 --databases bj_2026 > schema_tests.sql
```
Repare que 'bj_2026' é o nome da base a partir da qual o dump será realizado e o "schema_tests.sql" é o arquivo para o qual o resultado do dump deverá ser armazenado. Após realizar o dump, basta importar esse arquivo na base desejada com o comando:
```
mysql -u root -p bj_2026 < schema_tests.sql
```
 Repare que 'bj2026_tests' é o nome da base de dados que receberá a mesma estrutura da base "bj2026".

Observação: o arquivo SQL com resultado do dump costuma ser composto de mais de uma query. Por padrão, o driver mysql12, utilzado nesse projeto, não permite a execução de scripts SQL com mais de uma query por questões de segurança. O doc "aaaa" apresenta soluções para essa limitação. 