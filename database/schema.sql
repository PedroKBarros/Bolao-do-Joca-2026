CREATE DATABASE IF NOT EXISTS bj_2026;
USE bj_2026;

CREATE TABLE IF NOT EXISTS SWEEPSTAKE (
    name VARCHAR(255) PRIMARY KEY,
    keyword_hash VARCHAR(255) NOT NULL,
    quota DECIMAL(10,2),
    group_link VARCHAR(600)
);

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS CUP_GROUPS (
    letter CHAR(1) PRIMARY KEY CHECK (letter IN ('A', 'L'))
);

CREATE TABLE IF NOT EXISTS TEAMS (
    name VARCHAR(255) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS GROUP_ELEMENTS (
    group_letter CHAR(1) NOT NULL,
    team_name VARCHAR(255),
    PRIMARY KEY(group_letter, team_name),
    FOREIGN KEY (group_letter) REFERENCES CUP_GROUPS(letter),
    FOREIGN KEY (team_name) REFERENCES TEAMS(name)    
);

CREATE TABLE IF NOT EXISTS GROUP_MATCHES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_letter_1 CHAR(1) NOT NULL,
    team_name_1 VARCHAR(255),
    group_letter_2 CHAR(1) NOT NULL,
    team_name_2 VARCHAR(255) NOT NULL,
    match_info VARCHAR(255) NOT NULL,
    FOREIGN KEY(group_letter_1, team_name_1) REFERENCES GROUP_ELEMENTS(group_letter, team_name),
    FOREIGN KEY(group_letter_2, team_name_2) REFERENCES GROUP_ELEMENTS(group_letter, team_name)          
);

CREATE TABLE IF NOT EXISTS GROUP_MATCHES_PREDICTIONS (
    user_id INT NOT NULL,
    group_match_id INT NOT NULL,
    score_team_1 INT NOT NULL,
    pts_team_1 INT NOT NULL,
    score_team_2 INT NOT NULL,
    pts_team_2 INT NOT NULL,
    PRIMARY KEY(user_id, group_match_id),
    FOREIGN KEY(user_id) REFERENCES USERS(id),
    FOREIGN KEY(group_match_id) REFERENCES GROUP_MATCHES(id)       
);

CREATE TABLE IF NOT EXISTS RANKING_GROUP_STAGE_PREDICTIONS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    group_letter CHAR(1) NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    team_placement INT NOT NULL,
    placement_by_user BOOLEAN NOT NULL DEFAULT FALSE,
    team_pts INT NOT NULL,
    goals_scored INT NOT NULL,
    goals_received INT NOT NULL,
    goals_difference INT NOT NULL,                
    FOREIGN KEY(user_id) REFERENCES USERS(id),
    FOREIGN KEY(group_letter, team_name) REFERENCES GROUP_ELEMENTS(group_letter, team_name)
);

CREATE TABLE IF NOT EXISTS KNOCKOUT_STAGES (
    name VARCHAR(255) PRIMARY KEY,
    order_num INT CHECK(order_num IN (1, 6)) NOT NULL
);

CREATE TABLE IF NOT EXISTS KNOCKOUT_MATCH_TEAMS_RULES (
    knockout_stage_name VARCHAR(255) PRIMARY KEY,
    rule_team_1 VARCHAR(255) NOT NULL,
    rule_team_2 VARCHAR(255) NOT NULL,    
    FOREIGN KEY(knockout_stage_name) REFERENCES KNOCKOUT_STAGES(name)
);

CREATE TABLE IF NOT EXISTS USER_KNOCKOUT_STAGE_PREDICTIONS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    knockout_stage_name VARCHAR(255),
    user_id INT NOT NULL, 
    team_1_name VARCHAR(255) NOT NULL,
    team_2_name VARCHAR(255) NOT NULL,
    score_team_1 INT NOT NULL,
    score_team_2 INT NOT NULL,
    team_1_chosen_by_user BOOLEAN NOT NULL DEFAULT FALSE,
    team_2_chosen_by_user BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY(knockout_stage_name) REFERENCES KNOCKOUT_STAGES(name),
    FOREIGN KEY(user_id) REFERENCES USERS(id),
    FOREIGN KEY(team_1_name) REFERENCES TEAMS(name),
    FOREIGN KEY(team_2_name) REFERENCES TEAMS(name)          
);

CREATE TABLE IF NOT EXISTS SWEEPSTAKE_USERS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sweepstake_name VARCHAR(255),
    user_id INT,    
    FOREIGN KEY(sweepstake_name) REFERENCES SWEEPSTAKE(name),
    FOREIGN KEY(user_id) REFERENCES USERS(id)
);

CREATE TABLE IF NOT EXISTS SWEEPSTAKE_LOGS (
    sweepstake_name VARCHAR(255) PRIMARY KEY,
    date_and_hour TIMESTAMP NOT NULL,
    user_id INT NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    details VARCHAR(1275),   
    FOREIGN KEY(sweepstake_name) REFERENCES SWEEPSTAKE(name),
    FOREIGN KEY(user_id) REFERENCES USERS(id)
);