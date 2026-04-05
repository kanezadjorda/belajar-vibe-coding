CREATE TABLE `test_connection` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`message` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `test_connection_id` PRIMARY KEY(`id`)
);
