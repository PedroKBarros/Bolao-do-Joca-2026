-- Remove FK from sweepstake_name column
ALTER TABLE sweepstake_logs
DROP FOREIGN KEY sweepstake_logs_ibfk_1;

-- Remove PK
ALTER TABLE sweepstake_logs
DROP PRIMARY KEY;

-- Add Column ID
ALTER TABLE sweepstake_logs
ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY;

-- Create index to replace PK index
ALTER TABLE sweepstake_logs
ADD INDEX idx_column_id (id);

-- Add new FK
ALTER TABLE sweepstake_logs
ADD CONSTRAINT fk_sweepstake_name
FOREIGN KEY (sweepstake_name)
REFERENCES sweepstake(name);