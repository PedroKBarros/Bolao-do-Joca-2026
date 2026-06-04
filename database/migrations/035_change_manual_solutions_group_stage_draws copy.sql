/*Reconfig FKs using ON UPDATE CASCADE:*/

ALTER TABLE manual_solutions_group_stage_draws
DROP FOREIGN KEY manual_solutions_group_stage_draws_ibfk_1;

ALTER TABLE manual_solutions_group_stage_draws
ADD CONSTRAINT fk_group_elements
FOREIGN KEY (group_letter, team_name)
REFERENCES group_elements(group_letter, team_name)
ON UPDATE CASCADE;