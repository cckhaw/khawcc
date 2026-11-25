-- Add a "theme" (tag) to each seeded APAC map project that does not have one yet (powers the filter chips).
-- Only items still carrying their original seed ids are touched; anything added or edited in /admin/map keeps its own value.
UPDATE "site_content"
SET "value" = jsonb_set(
  "value",
  '{items}',
  (
    SELECT COALESCE(jsonb_agg(
      CASE
        WHEN coalesce(e->>'tag', '') <> '' THEN e
        ELSE e || jsonb_build_object('tag', CASE e->>'id'
          WHEN 'seed-A' THEN 'Platforms & transformation'
          WHEN 'seed-P' THEN 'Platforms & transformation'
          WHEN 'seed-D' THEN 'Prepaid & charging'
          WHEN 'seed-E' THEN 'Prepaid & charging'
          WHEN 'seed-G' THEN 'Prepaid & charging'
          WHEN 'seed-H' THEN 'Prepaid & charging'
          WHEN 'seed-K' THEN 'Prepaid & charging'
          WHEN 'seed-B' THEN 'Wi-Fi & roaming'
          WHEN 'seed-C' THEN 'Wi-Fi & roaming'
          WHEN 'seed-F' THEN 'Wi-Fi & roaming'
          WHEN 'seed-I' THEN 'Wi-Fi & roaming'
          WHEN 'seed-L' THEN 'Wi-Fi & roaming'
          WHEN 'seed-M' THEN 'Wi-Fi & roaming'
          WHEN 'seed-N' THEN 'Wi-Fi & roaming'
          WHEN 'seed-J' THEN 'Policy control'
          WHEN 'seed-O' THEN 'Policy control'
          ELSE ''
        END)
      END
      ORDER BY ord
    ), '[]'::jsonb)
    FROM jsonb_array_elements("value"->'items') WITH ORDINALITY AS t(e, ord)
  )
)
WHERE "key" = 'apac_map' AND jsonb_typeof("value"->'items') = 'array';
