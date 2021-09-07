--
-- [Plural] posts
--
INSERT INTO `posts` (`title`, `userId`) VALUES ('post 1', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post 2', '1');
INSERT INTO `posts` (`title`, `userId`, `modifiedAt`) VALUES ('post 3', '2', '1622534471918');
INSERT INTO `posts` (`title`, `userId`, `createdAt`, `modifiedAt`) VALUES ('wer', '1', '1622531895686', '1622533911439');
INSERT INTO `posts` (`title`, `userId`, `createdAt`) VALUES ('123123', '1', '1622533033259');
INSERT INTO `posts` (`title`, `userId`, `createdAt`, `modifiedAt`) VALUES ('post 12345', '2', '1622533786270', '1622533843846');
INSERT INTO `posts` (`title`, `userId`, `createdAt`, `modifiedAt`) VALUES ('post 12345', '2', '1622533786270', '1622533843846');
INSERT INTO `posts` (`title`, `userId`, `createdAt`, `modifiedAt`) VALUES ('post 12345', '2', '1622533786270', '1622533843846');
INSERT INTO `posts` (`title`, `userId`, `createdAt`, `modifiedAt`) VALUES ('post 12345', '2', '1622533786270', '1622533843846');
INSERT INTO `posts` (`title`, `userId`, `createdAt`, `modifiedAt`) VALUES ('post 12345', '2', '1622533786270', '1622533843846');
INSERT INTO `posts` (`title`, `userId`, `createdAt`) VALUES ('post from ab', '1', '1622602808943');
INSERT INTO `posts` (`title`, `userId`, `createdAt`) VALUES ('post from ab', '1', '1622602808943');
INSERT INTO `posts` (`title`, `userId`, `createdAt`) VALUES ('post from ab', '1', '1622602808943');
INSERT INTO `posts` (`title`, `userId`, `createdAt`) VALUES ('post from ab', '1', '1622602808943');
INSERT INTO `posts` (`title`, `userId`, `createdAt`) VALUES ('post from ab', '1', '1622602808948');
INSERT INTO `posts` (`title`, `userId`, `createdAt`) VALUES ('post from ab', '1', '1622602808949');
INSERT INTO `posts` (`title`, `userId`, `createdAt`) VALUES ('post from ab', '1', '1622602808952');
INSERT INTO `posts` (`title`, `userId`, `createdAt`) VALUES ('post from ab', '1', '1622602808953');
INSERT INTO `posts` (`title`, `userId`, `createdAt`) VALUES ('post from ab', '1', '1622602808956');
INSERT INTO `posts` (`title`, `userId`, `createdAt`) VALUES ('post from ab', '1', '1622602839517');



--
-- [Plural] comments
--
INSERT INTO `comments` (`body`, `postId`) VALUES ('some comment 1', '1');
INSERT INTO `comments` (`body`, `postId`) VALUES ('some comment 2', '2');
INSERT INTO `comments` (`body`, `postId`) VALUES ('some comment 3', '3');
INSERT INTO `comments` (`body`, `postId`) VALUES ('some comment 4', '1');
INSERT INTO `comments` (`body`, `postId`) VALUES ('some comment 5', '1');



--
-- [Plural] users
--
INSERT INTO `users` (`name`, `token`) VALUES ('typicode', '123');
INSERT INTO `users` (`name`, `token`) VALUES ('luics', '1989');



--
-- [Singular] profile
--
INSERT INTO `profile` (`value`) VALUES ('{"name":"luics\'s blog","desc":"json-server demo server"}');

