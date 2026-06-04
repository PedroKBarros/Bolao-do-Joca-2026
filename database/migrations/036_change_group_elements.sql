/*Reconfig FKs using ON UPDATE CASCADE:*/

ALTER TABLE group_elements
DROP FOREIGN KEY group_elements_ibfk_2;

ALTER TABLE group_elements
ADD CONSTRAINT fk_teams
FOREIGN KEY (team_name)
REFERENCES teams(name)
ON UPDATE CASCADE;