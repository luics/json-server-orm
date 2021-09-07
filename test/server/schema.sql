--
-- [Plural] comments
--
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `body` VARCHAR(140) NOT NULL,
  `postId` DOUBLE NOT NULL,
  PRIMARY KEY (`id`)
);


--
-- [Plural] posts
--
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(50) NOT NULL,
  `userId` BIGINT NOT NULL,
  `tags` JSON ,
  `meta` JSON ,
  `private` BOOLEAN ,
  `weight` DOUBLE ,
  `test` TINYINT ,
  PRIMARY KEY (`id`)
);


--
-- [Singular] profile
--
DROP TABLE IF EXISTS `profile`;
CREATE TABLE `profile` (
  `value` JSON NOT NULL
);


--
-- [Plural] users
--
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(20) NOT NULL,
  `token` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
);

