CREATE TABLE `engagement_letters` (
	`id` text PRIMARY KEY NOT NULL,
	`return_id` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`content` text NOT NULL,
	`signed_at` integer,
	`signature_data` text,
	`s3_key` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`return_id`) REFERENCES `tax_returns`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `engagement_letters_return_id_idx` ON `engagement_letters` (`return_id`);--> statement-breakpoint
CREATE TABLE `qbo_connection` (
	`id` text PRIMARY KEY NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`refresh_token_expires_at` integer NOT NULL,
	`realm_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` text NOT NULL,
	`token` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `invoices` ADD `qbo_invoice_id` text;--> statement-breakpoint
ALTER TABLE `invoices` ADD `qbo_sales_receipt_id` text;--> statement-breakpoint
ALTER TABLE `invoices` ADD `created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL;--> statement-breakpoint
CREATE INDEX `invoices_status_idx` ON `invoices` (`status`);--> statement-breakpoint
ALTER TABLE `profiles` ADD `qbo_customer_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `last_reminder_at` integer;--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `audit_logs_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `audit_logs_target_id_idx` ON `audit_logs` (`target_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_created_at_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `documents_category_idx` ON `documents` (`category`);--> statement-breakpoint
CREATE INDEX `documents_uploaded_at_idx` ON `documents` (`uploaded_at`);--> statement-breakpoint
CREATE INDEX `tax_returns_year_idx` ON `tax_returns` (`year`);--> statement-breakpoint
CREATE INDEX `tax_returns_status_idx` ON `tax_returns` (`status`);