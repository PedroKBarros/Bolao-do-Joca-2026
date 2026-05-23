# Database - Desabilitar Checagem de FK

Em alguns casos pode ser necessário desabilitar a checagem de chaves estrangeiras para que se possa alterá-las sem que o MySQL retorne um erro de violação delas. Para isso é necessário executar o seguinte SQL:
```
SET FOREIGN_KEY_CHECKS = 0
```

**IMPORTANTE: depois de realizar as alterações necessárias é fundamental reabilitar a checagem através do seguinte comando:**
```
SET FOREIGN_KEY_CHECKS = 1
```