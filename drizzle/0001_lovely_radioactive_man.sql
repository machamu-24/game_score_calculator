CREATE TABLE `chip_logs` (
	`id` varchar(255) NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`timestamp` bigint NOT NULL,
	`amounts` json NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chip_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_results` (
	`id` varchar(255) NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`timestamp` bigint NOT NULL,
	`ranks` json NOT NULL,
	`adjustments` json NOT NULL,
	`finalPoints` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `registered_players` (
	`id` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`color` varchar(50),
	`createdAt` bigint NOT NULL,
	CONSTRAINT `registered_players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_histories` (
	`id` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`date` bigint NOT NULL,
	`gameCount` int NOT NULL,
	`players` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_histories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`startedAt` bigint NOT NULL,
	`endedAt` bigint,
	`rankPoints` json NOT NULL,
	`players` json NOT NULL,
	`finalScores` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `chip_logs_sessionId_idx` ON `chip_logs` (`sessionId`);--> statement-breakpoint
CREATE INDEX `chip_logs_timestamp_idx` ON `chip_logs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `game_results_sessionId_idx` ON `game_results` (`sessionId`);--> statement-breakpoint
CREATE INDEX `game_results_timestamp_idx` ON `game_results` (`timestamp`);--> statement-breakpoint
CREATE INDEX `registered_players_userId_idx` ON `registered_players` (`userId`);--> statement-breakpoint
CREATE INDEX `session_histories_userId_idx` ON `session_histories` (`userId`);--> statement-breakpoint
CREATE INDEX `session_histories_sessionId_idx` ON `session_histories` (`sessionId`);--> statement-breakpoint
CREATE INDEX `session_histories_date_idx` ON `session_histories` (`date`);--> statement-breakpoint
CREATE INDEX `sessions_userId_idx` ON `sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `sessions_startedAt_idx` ON `sessions` (`startedAt`);