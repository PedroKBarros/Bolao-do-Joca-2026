# Database - Executando Scripts com Múltiplas Queries

## Introdução:
Scripts SQL com mais de uma querie não são executados, por padrão, pois o driver mysql12, utilizado nesse projeto, é configurado, por padrão, para não executar esse tipo de script por questões de segurança.

## Solução 1: transformando scripts com múltiplas queries em diversos scripts de uma query:
Via Javascript podemos obter o código de um script com múltiplas queries e manipulá-lo como string utilizando a função "split" para separar as queries. Dessa forma, podemos executá-las individualmente.
Exemplo:
```
    const sqlPath = path.join(__dirname, "abc.sql");
    const queriesStr = fs.readFileSync(sqlPath, "utf-8");

    const queries = queriesStr
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length); 
      
    for (const q of queries) {
      await dbConnection.query(q); //Executando individualmente cada query
    }
```

## Solução 2: habilitar execução de scripts com múltiplas queries:
Para habilitar a execução de scripts com múltiplas queries é necessário informar o atributo "multipleStatements" como "true" na configuração da conexão com a base de dados.
Observação: avaliar a necessidade e os riscos de utilizar essa solução ao invés da primeira solução.
Exemplo:
```
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    multipleStatements: true
  });
```