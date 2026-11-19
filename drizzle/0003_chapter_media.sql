CREATE TABLE "media_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"mime" varchar(64) NOT NULL,
	"size_bytes" integer NOT NULL,
	"data_base64" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_chapters" ADD COLUMN "media" jsonb DEFAULT '[]'::jsonb NOT NULL;