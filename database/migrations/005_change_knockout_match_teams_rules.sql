-- Remove table
DROP TABLE KNOCKOUT_MATCH_TEAMS_RULES;

CREATE TABLE IF NOT EXISTS KNOCKOUT_MATCH_TEAMS_RULES (
    knockout_stage_name VARCHAR(255),
    match_number INT,
    rule_team_1 VARCHAR(255) NOT NULL,
    rule_team_2 VARCHAR(255) NOT NULL,
    PRIMARY KEY(knockout_stage_name, match_number),    
    FOREIGN KEY(knockout_stage_name) REFERENCES KNOCKOUT_STAGES(name)
);
