ALTER TABLE `businesses` ADD `email` text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `businesses` DROP COLUMN `team_size`;--> statement-breakpoint
ALTER TABLE `businesses` DROP COLUMN `business_age`;
