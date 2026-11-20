ALTER TABLE "profile_settings" ADD COLUMN "strava_url" text DEFAULT '' NOT NULL;
--> statement-breakpoint
-- Fill in the owner's links only where they are still blank (never overwrites edits made in /admin/profile).
UPDATE "profile_settings" SET "strava_url" = 'https://www.strava.com/athletes/3375135' WHERE "strava_url" = '';
--> statement-breakpoint
UPDATE "profile_settings" SET "instagram_handle" = 'botak.on.wheels' WHERE "instagram_handle" = '';
