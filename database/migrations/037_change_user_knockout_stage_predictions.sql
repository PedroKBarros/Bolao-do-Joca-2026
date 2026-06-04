/*Reconfig FKs using ON UPDATE CASCADE:*/

ALTER TABLE user_knockout_stage_predictions
DROP FOREIGN KEY user_knockout_stage_predictions_ibfk_3;

ALTER TABLE user_knockout_stage_predictions
DROP FOREIGN KEY user_knockout_stage_predictions_ibfk_4;

ALTER TABLE user_knockout_stage_predictions
ADD CONSTRAINT fk_teams_1
FOREIGN KEY (team_1_name)
REFERENCES teams(name)
ON UPDATE CASCADE;

ALTER TABLE user_knockout_stage_predictions
ADD CONSTRAINT fk_teams_2
FOREIGN KEY (team_2_name)
REFERENCES teams(name)
ON UPDATE CASCADE;