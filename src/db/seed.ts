import { neon } from "@neondatabase/serverless";
import { and, eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { DEFAULT_BEYOND } from "../lib/beyond";
import { DEFAULT_BOOK_INTRO } from "../lib/book-intro";
import { DEFAULT_APAC_DOC } from "../data/apac-projects";
import { seedChapters, seedExperiences, seedParts, seedProfile, seedProjects, seedSkills } from "./seed-data";

/**
 * Idempotent seed: safe to run repeatedly.
 *  - profile / projects / parts / chapters: inserted only if missing (matched by id / slug / part number),
 *    so edits made in /admin are never overwritten.
 *  - experiences / skills: seeded only when their table is empty.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required to seed.");
  const db = drizzle(neon(url), { schema });

  await db.insert(schema.profileSettings).values(seedProfile).onConflictDoNothing();

  const [anyExp] = await db.select({ id: schema.experiences.id }).from(schema.experiences).limit(1);
  if (!anyExp) {
    await db.insert(schema.experiences).values(seedExperiences.map(({ id, createdAt, updatedAt, ...r }) => (void [id, createdAt, updatedAt], r)));
    console.log(`+ ${seedExperiences.length} experiences`);
  } else console.log("= experiences already present");
  // Backfill company logos on existing rows only where none is set (never overwrites admin edits).
  for (const e of seedExperiences) {
    if (!e.logoUrl) continue;
    await db
      .update(schema.experiences)
      .set({ logoUrl: e.logoUrl })
      .where(and(eq(schema.experiences.company, e.company), eq(schema.experiences.logoUrl, "")));
  }

  const [anySkill] = await db.select({ id: schema.skillsAndCredentials.id }).from(schema.skillsAndCredentials).limit(1);
  if (!anySkill) {
    await db.insert(schema.skillsAndCredentials).values(seedSkills.map(({ id, createdAt, updatedAt, ...r }) => (void [id, createdAt, updatedAt], r)));
    console.log(`+ ${seedSkills.length} skill groups`);
  } else console.log("= skills already present");

  await db
    .insert(schema.projects)
    .values(seedProjects.map(({ id, createdAt, updatedAt, ...r }) => (void [id, createdAt, updatedAt], r)))
    .onConflictDoNothing({ target: schema.projects.slug });
  // Backfill logos on existing rows only where none is set (never overwrites admin edits).
  for (const p of seedProjects) {
    await db
      .update(schema.projects)
      .set({ logoUrl: p.logoUrl })
      .where(and(eq(schema.projects.slug, p.slug), eq(schema.projects.logoUrl, "")));
  }
  // Drop the old visible "Placeholder" blurb (it just repeated the tagline); real descriptions are untouched.
  await db
    .update(schema.projects)
    .set({ description: "" })
    .where(like(schema.projects.description, "%Placeholder: refine this description%"));
  console.log(`✓ projects (${seedProjects.length} ensured)`);

  await db
    .insert(schema.bookParts)
    .values(seedParts.map(({ id, createdAt, updatedAt, ...r }) => (void [id, createdAt, updatedAt], r)))
    .onConflictDoNothing({ target: schema.bookParts.partNumber });
  const parts = await db.select().from(schema.bookParts);
  const partIdByNumber = new Map(parts.map((p) => [p.partNumber, p.id]));
  const seedPartNumber = new Map(seedParts.map((p) => [p.id, p.partNumber]));

  await db
    .insert(schema.bookChapters)
    .values(
      seedChapters.map(({ id, createdAt, updatedAt, partId, ...r }) => {
        void [id, createdAt, updatedAt];
        return { ...r, partId: partId ? (partIdByNumber.get(seedPartNumber.get(partId)!) ?? null) : null };
      }),
    )
    .onConflictDoNothing({ target: schema.bookChapters.slug });
  console.log(`✓ book (${seedParts.length} parts, ${seedChapters.length} chapters ensured)`);
  await db.insert(schema.siteContent).values({ key: "apac_map", value: DEFAULT_APAC_DOC }).onConflictDoNothing();
  console.log("✓ APAC map content ensured");
  await db.insert(schema.siteContent).values({ key: "book_intro", value: DEFAULT_BOOK_INTRO }).onConflictDoNothing();
  console.log("✓ book page text ensured");
  await db.insert(schema.siteContent).values({ key: "beyond_work", value: DEFAULT_BEYOND }).onConflictDoNothing();
  console.log("✓ beyond-the-desk strip ensured");
  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
