-- One-time: remove "Amdocs → Huawei migration" from the CV's Architecture & Stack list.
UPDATE "skills_and_credentials"
SET "items" = "items" - 'Amdocs → Huawei migration', "updated_at" = now()
WHERE "category" = 'Architecture & Stack';
