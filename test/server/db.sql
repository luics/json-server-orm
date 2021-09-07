--
-- [Plural] posts
--
INSERT INTO `posts` (`title`, `userId`) VALUES ('post 1', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post 2', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post 3', '2');
INSERT INTO `posts` (`title`, `userId`) VALUES ('wer', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('123123', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post 12345', '2');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post 12345', '2');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post 12345', '2');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post 12345', '2');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post 12345', '2');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post from ab', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post from ab', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post from ab', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post from ab', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post from ab', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post from ab', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post from ab', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post from ab', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post from ab', '1');
INSERT INTO `posts` (`title`, `userId`) VALUES ('post from ab', '1');



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

