CREATE TABLE `workflows` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`data` text,
	`result` text,
	`error` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD `status` text DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE `engagement_letters` ADD `consent_agreed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `engagement_letters` ADD `consent_electronic` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `engagement_letters` ADD `consent_responsibility` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tax_returns` ADD `tax_prep_fee` real DEFAULT 0;