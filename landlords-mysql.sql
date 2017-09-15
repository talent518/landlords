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
/*Table structure for table `desk_action_logs` */

DROP TABLE IF EXISTS `desk_action_logs`;

CREATE TABLE `desk_action_logs` (
  `logId` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '出牌日志',
  `uid` int(11) unsigned NOT NULL COMMENT '出牌人用户ID',
  `deskId` int(11) unsigned NOT NULL COMMENT '桌ID',
  `openGames` int(11) unsigned NOT NULL COMMENT '开局次数',
  `actionType` smallint(2) NOT NULL COMMENT '操作类型',
  `weightPosition` enum('a','b','c') DEFAULT NULL COMMENT '桌位',
  `beforeCards` varchar(100) DEFAULT NULL COMMENT '出牌前手中的牌',
  `leads` varchar(100) DEFAULT NULL COMMENT '出的牌',
  `leadName` varchar(20) DEFAULT NULL COMMENT '出牌规则名(英文)',
  `leadLabel` varchar(20) DEFAULT NULL COMMENT '出牌规则名(中文)',
  `isRobot` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否机器人处理',
  `dateline` int(10) NOT NULL COMMENT '出牌时间戳',
  `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '出牌时间',
  PRIMARY KEY (`logId`),
  KEY `deskId` (`deskId`,`openGames`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='桌位玩家出牌日志表';

/*Table structure for table `desks` */

DROP TABLE IF EXISTS `desks`;

CREATE TABLE `desks` (
  `deskId` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '桌ID',
  `openGames` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '开局次数',
  `isPlaying` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否正在玩',
  `players` smallint(1) unsigned NOT NULL DEFAULT '0' COMMENT '玩家数',
  `weightPosition` enum('a','b','c') DEFAULT NULL COMMENT '牌权桌位',
  `weightDateline` int(10) DEFAULT NULL COMMENT '牌权的拿到时间戳',
  `weightTime` timestamp NULL DEFAULT NULL COMMENT '牌权的拿到时间',
  `landlordPosition` enum('a','b','c') DEFAULT NULL COMMENT '地主桌位',
  `aUid` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '玩家A用户ID',
  `aGotReady` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '玩家A准备好',
  `aCards` varchar(100) DEFAULT NULL COMMENT '玩家A的牌',
  `aLeads` varchar(100) DEFAULT NULL COMMENT '玩家A已出牌',
  `aIsSeed` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '玩家A是否明牌',
  `aIsRobot` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '玩家A是否机器代出',
  `aDateline` int(10) NOT NULL DEFAULT '0' COMMENT '玩家A占座时间戳',
  `aTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '玩家A占座时间',
  `bUid` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '玩家B用户ID',
  `bGotReady` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '玩家B准备好',
  `bCards` varchar(100) DEFAULT NULL COMMENT '玩家B的牌',
  `bLeads` varchar(100) DEFAULT NULL COMMENT '玩家B已出牌',
  `bIsSeed` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '玩家B是否明牌',
  `bIsRobot` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '玩家B是否机器代出',
  `bDateline` int(10) NOT NULL DEFAULT '0' COMMENT '玩家B占座时间戳',
  `bTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '玩家B占座时间',
  `cUid` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '玩家C用户ID',
  `cGotReady` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '玩家C准备好',
  `cCards` varchar(100) DEFAULT NULL COMMENT '玩家C的牌',
  `cLeads` varchar(100) DEFAULT NULL COMMENT '玩家C已出牌',
  `cIsSeed` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '玩家C是否明牌',
  `cIsRobot` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '玩家C是否机器代出',
  `cDateline` int(10) NOT NULL DEFAULT '0' COMMENT '玩家C占座时间戳',
  `cTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '玩家C占座时间',
  `cards` varchar(10) DEFAULT NULL COMMENT '底牌',
  PRIMARY KEY (`deskId`),
  KEY `players` (`players`,`deskId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 MIN_ROWS=50 COMMENT='牌桌主表';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户桌位得分日志表';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户主表';

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
