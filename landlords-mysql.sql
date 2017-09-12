/*
SQLyog Ultimate v12.09 (64 bit)
MySQL - 5.6.21 : Database - landlords
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*Table structure for table `desk_lead_logs` */

DROP TABLE IF EXISTS `desk_lead_logs`;

CREATE TABLE `desk_lead_logs` (
  `logId` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '出牌日志',
  `uid` int(11) unsigned NOT NULL COMMENT '出牌人用户ID',
  `deskId` int(11) unsigned NOT NULL COMMENT '桌ID',
  `deskPosition` enum('a','b','c') NOT NULL COMMENT '桌位',
  `beforeCards` varchar(100) NOT NULL COMMENT '出牌前手中的牌',
  `beforeLeads` varchar(100) NOT NULL COMMENT '出牌前已出牌',
  `leads` varchar(100) NOT NULL COMMENT '出的牌',
  `isRobot` tinyint(1) unsigned NOT NULL COMMENT '是否机器人出牌',
  `dateline` int(10) NOT NULL COMMENT '出牌时间戳',
  `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '出牌时间',
  PRIMARY KEY (`logId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='桌位玩家出牌日志表';

/*Data for the table `desk_lead_logs` */

/*Table structure for table `desks` */

DROP TABLE IF EXISTS `desks`;

CREATE TABLE `desks` (
  `deskId` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '桌ID',
  `isPlaying` tinyint(1) unsigned NOT NULL COMMENT '是否正在玩',
  `players` smallint(1) unsigned NOT NULL COMMENT '玩家数',
  `weightPosition` enum('a','b','c') DEFAULT NULL COMMENT '牌权桌位',
  `weightDateline` int(10) DEFAULT NULL COMMENT '牌权的拿到时间戳',
  `weightTime` timestamp NULL DEFAULT NULL COMMENT '牌权的拿到时间',
  `landlordPosition` enum('a','b','c') DEFAULT NULL COMMENT '地主桌位',
  `aUid` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '玩家A用户ID',
  `aGotReady` tinyint(1) unsigned NOT NULL COMMENT '玩家A准备好',
  `aCards` varchar(100) DEFAULT NULL COMMENT '玩家A的牌',
  `aLeads` varchar(100) DEFAULT NULL COMMENT '玩家A已出牌',
  `aIsSeed` tinyint(1) unsigned NOT NULL COMMENT '玩家A是否明牌',
  `aIsRobot` tinyint(1) unsigned NOT NULL COMMENT '玩家A是否机器代出',
  `aDateline` int(10) NOT NULL DEFAULT '0' COMMENT '玩家A占座时间戳',
  `aTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '玩家A占座时间',
  `bUid` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '玩家B用户ID',
  `bGotReady` tinyint(1) unsigned NOT NULL COMMENT '玩家B准备好',
  `bCards` varchar(100) DEFAULT NULL COMMENT '玩家B的牌',
  `bLeads` varchar(100) DEFAULT NULL COMMENT '玩家B已出牌',
  `bIsSeed` tinyint(1) unsigned NOT NULL COMMENT '玩家B是否明牌',
  `bIsRobot` tinyint(1) unsigned NOT NULL COMMENT '玩家B是否机器代出',
  `bDateline` int(10) NOT NULL DEFAULT '0' COMMENT '玩家B占座时间戳',
  `bTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '玩家B占座时间',
  `cUid` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '玩家C用户ID',
  `cGotReady` tinyint(1) unsigned NOT NULL COMMENT '玩家C准备好',
  `cCards` varchar(100) DEFAULT NULL COMMENT '玩家C的牌',
  `cLeads` varchar(100) DEFAULT NULL COMMENT '玩家C已出牌',
  `cIsSeed` tinyint(1) unsigned NOT NULL COMMENT '玩家C是否明牌',
  `cIsRobot` tinyint(1) unsigned NOT NULL COMMENT '玩家C是否机器代出',
  `cDateline` int(10) NOT NULL DEFAULT '0' COMMENT '玩家C占座时间戳',
  `cTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '玩家C占座时间',
  `cards` varchar(10) DEFAULT NULL COMMENT '底牌',
  PRIMARY KEY (`deskId`),
  KEY `players` (`players`,`deskId`)
) ENGINE=MyISAM AUTO_INCREMENT=51 DEFAULT CHARSET=utf8 MIN_ROWS=50 COMMENT='牌桌主表';

/*Data for the table `desks` */

insert  into `desks`(`deskId`,`isPlaying`,`players`,`weightPosition`,`weightDateline`,`weightTime`,`landlordPosition`,`aUid`,`aGotReady`,`aCards`,`aLeads`,`aIsSeed`,`aIsRobot`,`aDateline`,`aTime`,`bUid`,`bGotReady`,`bCards`,`bLeads`,`bIsSeed`,`bIsRobot`,`bDateline`,`bTime`,`cUid`,`cGotReady`,`cCards`,`cLeads`,`cIsSeed`,`cIsRobot`,`cDateline`,`cTime`,`cards`) values (1,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'2017-04-21 17:56:16',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(2,1,3,NULL,NULL,NULL,NULL,1,1,'CQ,S3,DK,DA,BJ,C7,C6,S5,SK,CJ,HJ,S7,C5,C2,CA,S4,DQ',NULL,0,0,1492768576,'2017-04-21 17:56:16',2,1,'D5,HK,CK,H3,LJ,C8,SJ,C4,H10,S9,H2,HA,S10,C10,H5,D2,C9',NULL,0,0,1505200290,'2017-09-12 15:11:30',3,1,'S2,D10,D7,D8,D4,S6,H7,D6,C3,D9,SA,D3,H9,H6,S8,HQ,SQ',NULL,0,0,1505200342,'2017-09-12 15:12:22','DJ,H8,H4'),(3,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(4,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(5,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(6,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(7,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(8,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(9,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(10,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(11,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(12,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(13,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(14,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(15,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(16,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(17,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(18,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(19,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(20,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(21,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(22,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(23,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(24,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(25,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(26,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(27,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(28,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(29,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(30,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(31,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(32,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(33,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(34,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(35,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(36,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(37,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(38,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(39,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(40,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(41,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(42,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(43,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(44,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(45,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(46,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(47,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(48,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(49,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL),(50,0,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',0,0,NULL,NULL,0,0,0,'0000-00-00 00:00:00',NULL);

/*Table structure for table `user_score_logs` */

DROP TABLE IF EXISTS `user_score_logs`;

CREATE TABLE `user_score_logs` (
  `logId` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '得分日志ID',
  `uid` int(11) unsigned NOT NULL COMMENT '用户ID',
  `deskId` int(11) unsigned NOT NULL COMMENT '桌ID',
  `deskPosition` enum('a','b','c') NOT NULL COMMENT '桌位',
  `beforeScores` int(11) unsigned NOT NULL COMMENT '得分前积分数',
  `scores` int(11) unsigned NOT NULL COMMENT '得分',
  `dateline` int(10) NOT NULL COMMENT '得分时间戳',
  `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '得分时间',
  PRIMARY KEY (`logId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='用户桌位得分日志表';

/*Data for the table `user_score_logs` */

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `uid` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` char(32) NOT NULL COMMENT '密码',
  `salt` char(6) NOT NULL COMMENT '安全码',
  `deskId` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '桌ID',
  `deskPosition` enum('a','b','c') DEFAULT NULL COMMENT '桌位',
  `scores` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '积分数',
  `isWoman` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否女性',
  `dateline` int(10) NOT NULL DEFAULT '0' COMMENT '注册时间戳',
  `createTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP COMMENT '注册时间',
  `lastLoginDateline` int(10) NOT NULL DEFAULT '0' COMMENT '最后登录时间戳',
  `lastLoginTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '最后登录时间',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `username` (`username`),
  KEY `username_password` (`username`,`password`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='用户主表';

/*Data for the table `users` */

insert  into `users`(`uid`,`username`,`password`,`salt`,`deskId`,`deskPosition`,`scores`,`isWoman`,`dateline`,`createTime`,`lastLoginDateline`,`lastLoginTime`) values (1,'admin','151f908d951edb10ac14e914a275ca7d','894662',2,'a',0,0,1492768565,'2017-09-12 15:09:41',1505200181,'2017-09-12 15:09:41'),(2,'abao','db783cddf95d0ca438ff20f55d845453','927744',2,'b',0,0,1492768950,'2017-09-12 15:11:30',1505200282,'2017-09-12 15:11:22'),(3,'talent518','4ae1c5e968900c7c0a335daf90aa7d89','615094',2,'c',0,0,1505200330,'2017-09-12 15:12:22',1505200339,'2017-09-12 15:12:19');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
