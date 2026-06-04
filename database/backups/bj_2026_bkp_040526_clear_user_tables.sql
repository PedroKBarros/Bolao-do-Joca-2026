-- MySQL dump 10.13  Distrib 8.0.27, for Win64 (x86_64)
--
-- Host: localhost    Database: bj_2026
-- ------------------------------------------------------
-- Server version	8.0.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `bj_2026`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `bj_2026` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `bj_2026`;

--
-- Table structure for table `cup_groups`
--

DROP TABLE IF EXISTS `cup_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cup_groups` (
  `letter` char(1) NOT NULL,
  PRIMARY KEY (`letter`),
  CONSTRAINT `chk_letter_range` CHECK ((`letter` between _cp850'A' and _cp850'L'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cup_groups`
--

LOCK TABLES `cup_groups` WRITE;
/*!40000 ALTER TABLE `cup_groups` DISABLE KEYS */;
INSERT INTO `cup_groups` VALUES ('A'),('B'),('C'),('D'),('E'),('F'),('G'),('H'),('I'),('J'),('K'),('L');
/*!40000 ALTER TABLE `cup_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_elements`
--

DROP TABLE IF EXISTS `group_elements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_elements` (
  `group_letter` char(1) NOT NULL,
  `team_name` varchar(255) NOT NULL,
  PRIMARY KEY (`group_letter`,`team_name`),
  KEY `fk_teams` (`team_name`),
  CONSTRAINT `fk_teams` FOREIGN KEY (`team_name`) REFERENCES `teams` (`name`) ON UPDATE CASCADE,
  CONSTRAINT `group_elements_ibfk_1` FOREIGN KEY (`group_letter`) REFERENCES `cup_groups` (`letter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_elements`
--

LOCK TABLES `group_elements` WRITE;
/*!40000 ALTER TABLE `group_elements` DISABLE KEYS */;
INSERT INTO `group_elements` VALUES ('A','África do Sul'),('E','Alemanha'),('H','Arábia Saudita'),('J','Argélia'),('J','Argentina'),('D','Austrália'),('J','Áustria'),('G','Bélgica'),('B','Bósnia e Herzegovínia'),('C','Brasil'),('H','Cabo Verde'),('B','Canadá'),('B','Catar'),('K','Colômbia'),('A','Coreia do Sul'),('E','Costa do Marfim'),('L','Croácia'),('E','Curaçao'),('G','Egito'),('E','Equador'),('C','Escócia'),('H','Espanha'),('D','Estados Unidos'),('I','França'),('L','Gana'),('C','Haiti'),('F','Holanda'),('L','Inglaterra'),('G','Irã'),('I','Iraque'),('F','Japão'),('J','Jordânia'),('C','Marrocos'),('A','México'),('I','Noruega'),('G','Nova Zelândia'),('L','Panamá'),('D','Paraguai'),('K','Portugal'),('K','RD Congo'),('A','República Tcheca'),('I','Senegal'),('F','Suécia'),('B','Suíça'),('F','Tunísia'),('D','Turquia'),('H','Uruguai'),('K','Uzbequistão');
/*!40000 ALTER TABLE `group_elements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_matches`
--

DROP TABLE IF EXISTS `group_matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_matches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_letter_1` char(1) NOT NULL,
  `team_name_1` varchar(255) NOT NULL,
  `group_letter_2` char(1) NOT NULL,
  `team_name_2` varchar(255) NOT NULL,
  `match_info` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_group_elements_1` (`group_letter_1`,`team_name_1`),
  KEY `fk_group_elements_2` (`group_letter_2`,`team_name_2`),
  CONSTRAINT `fk_group_elements_1` FOREIGN KEY (`group_letter_1`, `team_name_1`) REFERENCES `group_elements` (`group_letter`, `team_name`) ON UPDATE CASCADE,
  CONSTRAINT `fk_group_elements_2` FOREIGN KEY (`group_letter_2`, `team_name_2`) REFERENCES `group_elements` (`group_letter`, `team_name`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_matches`
--

LOCK TABLES `group_matches` WRITE;
/*!40000 ALTER TABLE `group_matches` DISABLE KEYS */;
INSERT INTO `group_matches` VALUES (1,'A','México','A','África do Sul','11/jun 16h, México'),(3,'A','Coreia do Sul','A','República Tcheca','11/jun 23h, México'),(4,'A','República Tcheca','A','África do Sul','18/jun 13h, Estados Unidos'),(5,'A','México','A','Coreia do Sul','18/jun 22h, México'),(6,'A','República Tcheca','A','México','24/jun 22h, México'),(7,'A','África do Sul','A','Coreia do Sul','24/jun 22h, México'),(8,'B','Canadá','B','Bósnia e Herzegovínia','12/jun 16h, Canadá'),(9,'B','Catar','B','Suíça','13/jun 16h, Estados Unidos'),(10,'B','Suíça','B','Bósnia e Herzegovínia','18/jun 16h, Estados Unidos'),(11,'B','Canadá','B','Catar','18/jun 19h, Canadá'),(12,'B','Suíça','B','Canadá','24/jun 16h, Canadá'),(13,'B','Bósnia e Herzegovínia','B','Catar','24/jun 16h, Estados Unidos'),(14,'C','Brasil','C','Marrocos','13/jun 19h, Estados Unidos'),(15,'C','Haiti','C','Escócia','13/jun 22h, Estados Unidos'),(16,'C','Brasil','C','Haiti','19/jun 22h, Estados Unidos'),(17,'C','Escócia','C','Marrocos','19/jun 19h, Estados Unidos'),(18,'C','Escócia','C','Brasil','24/jun 19h, Estados Unidos'),(19,'C','Marrocos','C','Haiti','24/jun 19h, Estados Unidos'),(20,'D','Estados Unidos','D','Paraguai','12/jun 22h, Estados Unidos'),(21,'D','Austrália','D','Turquia','14/jun 1h, Canadá'),(22,'D','Turquia','D','Paraguai','20/jun 1h, Estados Unidos'),(23,'D','Estados Unidos','D','Austrália','19/jun 16h, Estados Unidos'),(24,'D','Turquia','D','Estados Unidos','25/jun 23h, Estados Unidos'),(25,'D','Paraguai','D','Austrália','25/jun 23h, Estados Unidos'),(26,'E','Alemanha','E','Curaçao','14/jun 14h, Estados Unidos'),(27,'E','Costa do Marfim','E','Equador','14/jun 20h, Estados Unidos'),(28,'E','Alemanha','E','Costa do Marfim','20/jun 17h, Canadá'),(29,'E','Equador','E','Curaçao','20/jun 21h, Estados Unidos'),(30,'E','Equador','E','Alemanha','25/jun 17h, Estados Unidos'),(31,'E','Curaçao','E','Costa do Marfim','25/jun 17h, Estados Unidos'),(32,'F','Holanda','F','Japão','14/jun 17h, Estados Unidos'),(33,'F','Suécia','F','Tunísia','14/jun 23h, México'),(34,'F','Holanda','F','Suécia','20/jun 14h, Estados Unidos'),(35,'F','Tunísia','F','Japão','21/jun 1h, México'),(36,'F','Tunísia','F','Holanda','25/jun 20h, Estados Unidos'),(37,'F','Japão','F','Suécia','25/jun 20h, Estados Unidos'),(38,'G','Bélgica','G','Egito','15/jun 16h, Estados Unidos'),(39,'G','Irã','G','Nova Zelândia','15/jun 22h, Estados Unidos'),(40,'G','Bélgica','G','Irã','21/jun 16h, Estados Unidos'),(41,'G','Nova Zelândia','G','Egito','21/jun 22h, Canadá'),(42,'G','Nova Zelândia','G','Bélgica','27/jun 0h, Canadá'),(43,'G','Egito','G','Irã','27/jun 0h, Estados Unidos'),(44,'H','Espanha','H','Cabo Verde','15/jun 13h, Estados Unidos'),(45,'H','Arábia Saudita','H','Uruguai','15/jun 19h, Estados Unidos'),(46,'H','Espanha','H','Arábia Saudita','21/jun 13h, Estados Unidos'),(47,'H','Uruguai','H','Cabo Verde','21/jun 19h, Estados Unidos'),(48,'H','Uruguai','H','Espanha','26/jun 21h, México'),(49,'H','Cabo Verde','H','Arábia Saudita','26/jun 21h, Estados Unidos'),(50,'I','França','I','Senegal','16/jun 16h, Estados Unidos'),(51,'I','Iraque','I','Noruega','16/jun 19h, Estados Unidos'),(52,'I','França','I','Iraque','22/jun 18h, Estados Unidos'),(53,'I','Noruega','I','Senegal','22/jun 21h, Estados Unidos'),(54,'I','Noruega','I','França','26/jun 16h, Estados Unidos'),(55,'I','Senegal','I','Iraque','26/jun 16h, Canadá'),(56,'J','Argentina','J','Argélia','16/jun 22h, Estados Unidos'),(57,'J','Áustria','J','Jordânia','17/jun 1h, Estados Unidos'),(58,'J','Argentina','J','Áustria','22/jun 14h, Estados Unidos'),(59,'J','Jordânia','J','Argélia','17/jun 0h, Estados Unidos'),(60,'J','Jordânia','J','Argentina','27/jun 23h, Estados Unidos'),(61,'J','Argélia','J','Áustria','27/jun 23h, Estados Unidos'),(62,'K','Portugal','K','RD Congo','17/jun 14h, Estados Unidos'),(63,'K','Uzbequistão','K','Colômbia','17/jun 23h, México'),(64,'K','Portugal','K','Uzbequistão','23/jun 14h, Estados Unidos'),(65,'K','Colômbia','K','RD Congo','23/jun 23h, México'),(66,'K','Colômbia','K','Portugal','27/jun 20h30, Estados Unidos'),(67,'K','RD Congo','K','Uzbequistão','27/jun 20h30, Estados Unidos'),(68,'L','Inglaterra','L','Croácia','17/jun 17h, Estados Unidos'),(69,'L','Gana','L','Panamá','17/jun 20h, Canadá'),(70,'L','Inglaterra','L','Gana','23/jun 17h, Estados Unidos'),(71,'L','Panamá','L','Croácia','23/jun 20h, Canadá'),(72,'L','Panamá','L','Inglaterra','27/jun 18h, Estados Unidos'),(73,'L','Croácia','L','Gana','27/jun 18h, Estados Unidos');
/*!40000 ALTER TABLE `group_matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_matches_predictions`
--

DROP TABLE IF EXISTS `group_matches_predictions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_matches_predictions` (
  `sweepstake_users_id` int NOT NULL,
  `group_match_id` int NOT NULL,
  `score_team_1` int NOT NULL,
  `pts_team_1` int NOT NULL,
  `score_team_2` int NOT NULL,
  `pts_team_2` int NOT NULL,
  PRIMARY KEY (`sweepstake_users_id`,`group_match_id`),
  KEY `group_match_id` (`group_match_id`),
  CONSTRAINT `fk_gmpid_suid` FOREIGN KEY (`sweepstake_users_id`) REFERENCES `sweepstake_users` (`id`),
  CONSTRAINT `group_matches_predictions_ibfk_2` FOREIGN KEY (`group_match_id`) REFERENCES `group_matches` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_matches_predictions`
--

LOCK TABLES `group_matches_predictions` WRITE;
/*!40000 ALTER TABLE `group_matches_predictions` DISABLE KEYS */;
/*!40000 ALTER TABLE `group_matches_predictions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knockout_match_teams_rules`
--

DROP TABLE IF EXISTS `knockout_match_teams_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knockout_match_teams_rules` (
  `knockout_stage_name` varchar(255) NOT NULL,
  `match_number` int NOT NULL,
  `rule_team_1` varchar(255) NOT NULL,
  `rule_team_2` varchar(255) NOT NULL,
  `match_info` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`knockout_stage_name`,`match_number`),
  CONSTRAINT `fk_knockout_match_rules` FOREIGN KEY (`knockout_stage_name`) REFERENCES `knockout_stages` (`name`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knockout_match_teams_rules`
--

LOCK TABLES `knockout_match_teams_rules` WRITE;
/*!40000 ALTER TABLE `knockout_match_teams_rules` DISABLE KEYS */;
INSERT INTO `knockout_match_teams_rules` VALUES ('32-Avos de Final',73,'2┬║ Grupo A','2┬║ Grupo B','28/jun de 2026 16h, Estados Unidos'),('32-Avos de Final',74,'1┬║ Grupo E','3┬║ Col. Grupos A/B/C/D/F','29/jun de 2026 14h, Estados Unidos'),('32-Avos de Final',75,'1┬║ Grupo F','2┬║ Grupo C','29/jun de 2026 17:30h, M├®xico'),('32-Avos de Final',76,'1┬║ Grupo C','2┬║ Grupo F','29/jun de 2026 22h, M├®xico'),('32-Avos de Final',77,'1┬║ Grupo I','3┬║ Col. Grupos C/D/F/G/H','30/jun de 2026 14h, Estados Unidos'),('32-Avos de Final',78,'2┬║ Grupo E','2┬║ Grupo I','30/jun de 2026 18h, Estados Unidos'),('32-Avos de Final',79,'1┬║ Grupo A','3┬║ Col. Grupos C/E/F/H/I','30/jun de 2026 22h, M├®xico'),('32-Avos de Final',80,'1┬║ Grupo L','3┬║ Col. Grupos E/H/I/J/K','01/jul de 2026 13h, Estados Unidos'),('32-Avos de Final',81,'1┬║ Grupo D','3┬║ Col. Grupos B/E/F/I/J','01/jul de 2026 17h, Estados Unidos'),('32-Avos de Final',82,'1┬║ Grupo G','3┬║ Col. Grupos A/E/H/I/J','01/jul de 2026 21h, Estados Unidos'),('32-Avos de Final',83,'2┬║ Grupo K','2┬║ Grupo L','02/jul de 2026 16h, Estados Unidos'),('32-Avos de Final',84,'1┬║ Grupo H','2┬║ Grupo J','02/jul de 2026 20h, Estados Unidos'),('32-Avos de Final',85,'1┬║ Grupo B','3┬║ Col. Grupos E/F/G/I/J','02/jul de 2026 ?h, Canad├í'),('32-Avos de Final',86,'1┬║ Grupo J','2┬║ Grupo H','03/jul de 2026 00h, Estados Unidos'),('32-Avos de Final',87,'1┬║ Grupo K','3┬║ Col. Grupos D/E/I/J/L','03/jul de 2026 15h, Estados Unidos'),('32-Avos de Final',88,'2┬║ Grupo D','2┬║ Grupo G','03/jul de 2026 ?h, Estados Unidos'),('Disputa do 3º Lugar',103,'Perd. Jogo 101','Perd. Jogo 102','18/jul de 2026 18h, Estados Unidos'),('Final',104,'Venc. Jogo 101','Venc. Jogo 102','19/jul de 2026 16h, Estados Unidos'),('Oitavas de Final',89,'Venc. Jogo 74','Venc. Jogo 77','04/jul de 2026 14h, Estados Unidos'),('Oitavas de Final',90,'Venc. Jogo 73','Venc. Jogo 75','04/jul de 2026 18h, Estados Unidos'),('Oitavas de Final',91,'Venc. Jogo 76','Venc. Jogo 78','05/jul de 2026 17h, Estados Unidos'),('Oitavas de Final',92,'Venc. Jogo 79','Venc. Jogo 80','05/jul de 2026 21h, M├®xico'),('Oitavas de Final',93,'Venc. Jogo 83','Venc. Jogo 84','06/jul de 2026 16h, Estados Unidos'),('Oitavas de Final',94,'Venc. Jogo 81','Venc. Jogo 82','06/jul de 2026 21h, Estados Unidos'),('Oitavas de Final',95,'Venc. Jogo 86','Venc. Jogo 88','07/jul de 2026 13h, Estados Unidos'),('Oitavas de Final',96,'Venc. Jogo 85','Venc. Jogo 87','07/jul de 2026 17h, Estados Unidos'),('Quartas de Final',97,'Venc. Jogo 89','Venc. Jogo 90','09/jul de 2026 17h, Estados Unidos'),('Quartas de Final',98,'Venc. Jogo 93','Venc. Jogo 94','10/jul de 2026 16h, Estados Unidos'),('Quartas de Final',99,'Venc. Jogo 91','Venc. Jogo 92','11/jul de 2026 18h, Estados Unidos'),('Quartas de Final',100,'Venc. Jogo 95','Venc. Jogo 96','11/jul de 2026 22h, Estados Unidos'),('semifinal',101,'Venc. Jogo 97','Venc. Jogo 98','14/jul de 2026 16h, Estados Unidos'),('semifinal',102,'Venc. Jogo 99','Venc. Jogo 100','15/jul de 2026 16h, Estados Unidos');
/*!40000 ALTER TABLE `knockout_match_teams_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knockout_stages`
--

DROP TABLE IF EXISTS `knockout_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knockout_stages` (
  `name` varchar(255) NOT NULL,
  `order_num` int NOT NULL,
  PRIMARY KEY (`name`),
  CONSTRAINT `chk_order_range` CHECK ((`order_num` between _cp850'1' and _cp850'6'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knockout_stages`
--

LOCK TABLES `knockout_stages` WRITE;
/*!40000 ALTER TABLE `knockout_stages` DISABLE KEYS */;
INSERT INTO `knockout_stages` VALUES ('32-Avos de Final',1),('Disputa do 3º Lugar',5),('Final',6),('Oitavas de Final',2),('Quartas de Final',3),('Semifinal',4);
/*!40000 ALTER TABLE `knockout_stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manual_solutions_group_stage_draws`
--

DROP TABLE IF EXISTS `manual_solutions_group_stage_draws`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manual_solutions_group_stage_draws` (
  `id` int NOT NULL AUTO_INCREMENT,
  `place` int NOT NULL,
  `sweepstake_user_id` int NOT NULL,
  `group_letter` char(1) NOT NULL,
  `team_name` varchar(255) NOT NULL,
  `is_not_more_valid` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `sweepstake_user_id` (`sweepstake_user_id`),
  KEY `fk_group_elements` (`group_letter`,`team_name`),
  CONSTRAINT `fk_group_elements` FOREIGN KEY (`group_letter`, `team_name`) REFERENCES `group_elements` (`group_letter`, `team_name`) ON UPDATE CASCADE,
  CONSTRAINT `manual_solutions_group_stage_draws_ibfk_2` FOREIGN KEY (`sweepstake_user_id`) REFERENCES `sweepstake_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manual_solutions_group_stage_draws`
--

LOCK TABLES `manual_solutions_group_stage_draws` WRITE;
/*!40000 ALTER TABLE `manual_solutions_group_stage_draws` DISABLE KEYS */;
/*!40000 ALTER TABLE `manual_solutions_group_stage_draws` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sweepstake`
--

DROP TABLE IF EXISTS `sweepstake`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sweepstake` (
  `name` varchar(255) NOT NULL,
  `keyword_hash` varchar(255) NOT NULL,
  `quota` decimal(10,2) DEFAULT NULL,
  `group_link` varchar(600) DEFAULT NULL,
  `start_date_participation` timestamp NOT NULL,
  `final_date_participation` timestamp NOT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0',
  `status` varchar(255) NOT NULL,
  `author_user_id` int DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `fk_user_id` (`author_user_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`author_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sweepstake`
--

LOCK TABLES `sweepstake` WRITE;
/*!40000 ALTER TABLE `sweepstake` DISABLE KEYS */;
/*!40000 ALTER TABLE `sweepstake` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sweepstake_logs`
--

DROP TABLE IF EXISTS `sweepstake_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sweepstake_logs` (
  `sweepstake_name` varchar(255) NOT NULL,
  `date_and_hour` timestamp NOT NULL,
  `user_id` int NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `details` varchar(1275) DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_column_id` (`id`),
  KEY `fk_sweepstake_name` (`sweepstake_name`),
  CONSTRAINT `fk_sweepstake_name` FOREIGN KEY (`sweepstake_name`) REFERENCES `sweepstake` (`name`),
  CONSTRAINT `sweepstake_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sweepstake_logs`
--

LOCK TABLES `sweepstake_logs` WRITE;
/*!40000 ALTER TABLE `sweepstake_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `sweepstake_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sweepstake_users`
--

DROP TABLE IF EXISTS `sweepstake_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sweepstake_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sweepstake_name` varchar(255) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sweepstake_name` (`sweepstake_name`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `sweepstake_users_ibfk_1` FOREIGN KEY (`sweepstake_name`) REFERENCES `sweepstake` (`name`),
  CONSTRAINT `sweepstake_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sweepstake_users`
--

LOCK TABLES `sweepstake_users` WRITE;
/*!40000 ALTER TABLE `sweepstake_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `sweepstake_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES ('África do Sul'),('Alemanha'),('Arábia Saudita'),('Argélia'),('Argentina'),('Austrália'),('Áustria'),('Bélgica'),('Bósnia e Herzegovínia'),('Brasil'),('Cabo Verde'),('Canadá'),('Catar'),('Colômbia'),('Coreia do Sul'),('Costa do Marfim'),('Croácia'),('Curaçao'),('Egito'),('Equador'),('Escócia'),('Espanha'),('Estados Unidos'),('França'),('Gana'),('Haiti'),('Holanda'),('Inglaterra'),('Irã'),('Iraque'),('Japão'),('Jordânia'),('Marrocos'),('México'),('Noruega'),('Nova Zelândia'),('Panamá'),('Paraguai'),('Portugal'),('RD Congo'),('República Tcheca'),('Senegal'),('Suécia'),('Suíça'),('Tunísia'),('Turquia'),('Uruguai'),('Uzbequistão');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_knockout_stage_predictions`
--

DROP TABLE IF EXISTS `user_knockout_stage_predictions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_knockout_stage_predictions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sweepstake_users_id` int NOT NULL,
  `team_1_name` varchar(255) NOT NULL,
  `team_2_name` varchar(255) NOT NULL,
  `score_team_1` int DEFAULT NULL,
  `score_team_2` int DEFAULT NULL,
  `team_1_chosen_by_user` tinyint(1) NOT NULL DEFAULT '0',
  `team_2_chosen_by_user` tinyint(1) NOT NULL DEFAULT '0',
  `match_number` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ukspid_suid` (`sweepstake_users_id`),
  KEY `fk_teams_1` (`team_1_name`),
  KEY `fk_teams_2` (`team_2_name`),
  CONSTRAINT `fk_teams_1` FOREIGN KEY (`team_1_name`) REFERENCES `teams` (`name`) ON UPDATE CASCADE,
  CONSTRAINT `fk_teams_2` FOREIGN KEY (`team_2_name`) REFERENCES `teams` (`name`) ON UPDATE CASCADE,
  CONSTRAINT `fk_ukspid_suid` FOREIGN KEY (`sweepstake_users_id`) REFERENCES `sweepstake_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=851 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_knockout_stage_predictions`
--

LOCK TABLES `user_knockout_stage_predictions` WRITE;
/*!40000 ALTER TABLE `user_knockout_stage_predictions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_knockout_stage_predictions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password_hash` varchar(255) NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(255) NOT NULL,
  `whatsapp_number` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `whatsapp_number` (`whatsapp_number`)
) ENGINE=InnoDB AUTO_INCREMENT=678 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'$2b$10$w.PKr7eG4KH7nDva1QVS4u1VkBSaiiehmg6emep6dstP0CmB2Ckei',1,'2026-06-04 23:15:28','Pedro','+5521985573708');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_knockout_stages_status`
--

DROP TABLE IF EXISTS `users_knockout_stages_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_knockout_stages_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sweepstake_user_id` int NOT NULL,
  `knockout_stages_name` varchar(255) NOT NULL,
  `is_all_filled` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `sweepstake_user_id` (`sweepstake_user_id`),
  KEY `fk_users_knockout_status` (`knockout_stages_name`),
  CONSTRAINT `fk_users_knockout_status` FOREIGN KEY (`knockout_stages_name`) REFERENCES `knockout_stages` (`name`) ON UPDATE CASCADE,
  CONSTRAINT `users_knockout_stages_status_ibfk_1` FOREIGN KEY (`sweepstake_user_id`) REFERENCES `sweepstake_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_knockout_stages_status`
--

LOCK TABLES `users_knockout_stages_status` WRITE;
/*!40000 ALTER TABLE `users_knockout_stages_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_knockout_stages_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'bj_2026'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-04 20:21:10
