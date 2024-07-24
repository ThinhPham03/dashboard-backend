/*
 Navicat Premium Dump SQL

 Source Server         : MySQL57
 Source Server Type    : MySQL
 Source Server Version : 50744 (5.7.44-log)
 Source Host           : localhost:3307
 Source Schema         : tedis

 Target Server Type    : MySQL
 Target Server Version : 50744 (5.7.44-log)
 File Encoding         : 65001

 Date: 24/07/2024 21:46:54
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tbl_account_staff_settings
-- ----------------------------
DROP TABLE IF EXISTS `tbl_account_staff_settings`;
CREATE TABLE `tbl_account_staff_settings`  (
  `settingId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `settingName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `tedisPositionId` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `isSelect` tinyint(1) NOT NULL DEFAULT 0,
  `setting` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  PRIMARY KEY (`settingId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of tbl_account_staff_settings
-- ----------------------------
INSERT INTO `tbl_account_staff_settings` VALUES (1, 'Demo', 'U01O01', 0, '{\"rows\":[\"Product Name\",\"Customer Name\",\"Year\",\"Month\",\"Sales Value\",\"Target Value\"],\"vals\":[\"Sales Value\",\"Target Value\"],\"aggregatorName\":\"Sum over Sum\",\"cols\":[],\"sorters\":{},\"valueFilter\":{},\"rowOrder\":\"key_a_to_z\",\"colOrder\":\"key_a_to_z\",\"rendererName\":\"Table\"}');

SET FOREIGN_KEY_CHECKS = 1;
