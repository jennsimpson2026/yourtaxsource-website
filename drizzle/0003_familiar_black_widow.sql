ALTER TABLE `documents` ADD `tax_year` integer;--> statement-breakpoint
ALTER TABLE `documents` ADD `status` text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `review_feedback` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `reviewed_at` integer;--> statement-breakpoint
ALTER TABLE `documents` ADD `reviewed_by` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `documents_status_idx` ON `documents` (`status`);--> statement-breakpoint
CREATE INDEX `documents_tax_year_idx` ON `documents` (`tax_year`);