/*Reconfig FKs using ON UPDATE CASCADE:*/

ALTER TABLE group_matches
DROP FOREIGN KEY group_matches_ibfk_1;

ALTER TABLE group_matches
DROP FOREIGN KEY group_matches_ibfk_2;

ALTER TABLE group_matches
ADD CONSTRAINT fk_group_elements_1
FOREIGN KEY (group_letter_1, team_name_1)
REFERENCES group_elements(group_letter, team_name)
ON UPDATE CASCADE;

ALTER TABLE group_matches
ADD CONSTRAINT fk_group_elements_2
FOREIGN KEY (group_letter_2, team_name_2)
REFERENCES group_elements(group_letter, team_name)
ON UPDATE CASCADE;