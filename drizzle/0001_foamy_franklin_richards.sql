ALTER TABLE `appointments` ADD `location` text;--> statement-breakpoint
ALTER TABLE `appointments` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `is_locked` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `tax_returns` ADD `federal_result` real;--> statement-breakpoint
ALTER TABLE `tax_returns` ADD `state_results` text;--> statement-breakpoint
ALTER TABLE `tax_returns` ADD `manual_release` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tax_returns` ADD `is_complimentary` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `last_login_at` integer;