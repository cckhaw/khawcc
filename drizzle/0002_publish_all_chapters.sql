-- One-time data migration: publish every chapter that is still a draft.
UPDATE "book_chapters"
SET "status" = 'published',
    "published_at" = COALESCE("published_at", now()),
    "updated_at" = now()
WHERE "status" = 'draft';
