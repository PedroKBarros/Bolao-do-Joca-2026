-- Doc: show all tables in alphabetic order, yours columns and details of the columns,
-- like your type, if they are PK and more.
-- Observations:
-- 1. If a column is PK and FK, it will be show in two lines. The first line will show PK 
-- like true (1) and FK like false (0). The second line will show the same column, 
-- but with PK and FK like true (1); 
-- 2. The boolean type will show like 'tinyint'.

SELECT
    c.TABLE_NAME AS tb_name,
    c.COLUMN_NAME AS col_name,
    c.DATA_TYPE AS col_type,
    c.IS_NULLABLE AS can_null,
    (c.COLUMN_KEY = 'PRI') AS is_primary_key,
    (k.REFERENCED_TABLE_NAME IS NOT NULL) AS is_foreign_key,
    k.REFERENCED_TABLE_NAME AS referenced_table,
    k.REFERENCED_COLUMN_NAME AS referenced_column
FROM INFORMATION_SCHEMA.COLUMNS c
LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
    ON c.TABLE_SCHEMA = k.TABLE_SCHEMA
    AND c.TABLE_NAME = k.TABLE_NAME
    AND c.COLUMN_NAME = k.COLUMN_NAME
WHERE c.TABLE_SCHEMA = DATABASE()
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;