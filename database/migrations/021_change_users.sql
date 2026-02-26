-- Remove FK and FK column
ALTER TABLE USERS
DROP FOREIGN KEY fk_users_sweepstake,
DROP COLUMN sweepstake_name;