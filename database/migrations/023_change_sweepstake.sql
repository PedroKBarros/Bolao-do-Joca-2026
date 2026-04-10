-- Add author_user_id and FK
ALTER TABLE sweepstake
ADD COLUMN author_user_id INT;

ALTER TABLE sweepstake
ADD CONSTRAINT fk_user_id
FOREIGN KEY (author_user_id)
REFERENCES users(id);
