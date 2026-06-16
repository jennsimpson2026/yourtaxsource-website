CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`content` text NOT NULL,
	`tax_return_id` text,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tax_return_id`) REFERENCES `tax_returns`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `messages_sender_id_idx` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `messages_recipient_id_idx` ON `messages` (`recipient_id`);--> statement-breakpoint
CREATE INDEX `messages_tax_return_id_idx` ON `messages` (`tax_return_id`);