-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: myfamilybank
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `spese`
--

DROP TABLE IF EXISTS `spese`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spese` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_utente` int DEFAULT NULL,
  `codice_famiglia` int DEFAULT NULL,
  `importo` decimal(5,2) DEFAULT NULL,
  `categoria` varchar(30) DEFAULT NULL,
  `data` date DEFAULT NULL,
  `nota` text,
  PRIMARY KEY (`id`),
  KEY `id_utente` (`id_utente`),
  KEY `codice_famiglia` (`codice_famiglia`),
  CONSTRAINT `spese_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `spese_ibfk_2` FOREIGN KEY (`codice_famiglia`) REFERENCES `famiglia` (`codice`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `spese_chk_1` CHECK ((`importo` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spese`
--

LOCK TABLES `spese` WRITE;
/*!40000 ALTER TABLE `spese` DISABLE KEYS */;
INSERT INTO `spese` VALUES (18,10,12,12.00,'Cibo','2023-05-07','prova'),(19,9,12,5.00,'Cibo','2023-05-06','bar'),(20,9,12,90.00,'Trasporti','2023-05-01','treno'),(21,10,12,20.00,'Istruzione','2023-05-03','libri'),(22,10,12,25.00,'Abbigliamento','2023-05-04','pantalone'),(23,10,12,9.00,'Bellezza','2023-05-08','cosmetici'),(26,10,12,5.00,'Cultura','2023-05-08','cinema'),(27,10,12,30.00,'Salute','2023-05-01','radiografia'),(29,9,12,2.00,'Cibo','2023-05-09','caffe');
/*!40000 ALTER TABLE `spese` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-05-09  9:52:50
