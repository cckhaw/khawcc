import "server-only";
import { asc, desc, eq, getTableColumns, inArray, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import {
  seedChapters,
  seedExperiences,
  seedParts,
  seedProfile,
  seedProjects,
  seedSkills,
} from "@/db/seed-data";
import { DEFAULT_APAC_DOC } from "@/data/apac-projects";
import { sanitizeApacDoc, type ApacDoc } from "@/lib/apac";
import { BEYOND_KEY, DEFAULT_BEYOND, sanitizeBeyond, type BeyondDoc } from "@/lib/beyond";
import { BOOK_INTRO_KEY, DEFAULT_BOOK_INTRO, sanitizeBookIntro, type BookIntro } from "@/lib/book-intro";
import type { BookChapter, BookPart, Experience, Profile, Project, SkillGroup } from "@/db/schema";

/**
 * Read layer. With DATABASE_URL set, everything comes from Neon.
 * Without it, the bundled seed data is served (demo mode) so the site and
 * `next build` work on a fresh clone.
 */

const byOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

export async function getProfile(): Promise<Profile> {
  const db = getDb();
  if (!db) return seedProfile;
  const [row] = await db.select().from(schema.profileSettings).where(eq(schema.profileSettings.id, 1));
  return row ?? seedProfile;
}

export async function getExperiences(opts: { includeHidden?: boolean } = {}): Promise<Experience[]> {
  const db = getDb();
  if (!db) return [...seedExperiences].sort(byOrder).filter((e) => opts.includeHidden || e.isVisible);
  const q = db.select().from(schema.experiences);
  const rows = await (opts.includeHidden ? q : q.where(eq(schema.experiences.isVisible, true))).orderBy(
    asc(schema.experiences.sortOrder),
    asc(schema.experiences.id),
  );
  return rows;
}

export async function getSkills(): Promise<SkillGroup[]> {
  const db = getDb();
  if (!db) return [...seedSkills].sort(byOrder);
  return db.select().from(schema.skillsAndCredentials).orderBy(asc(schema.skillsAndCredentials.sortOrder));
}

export async function getProjects(opts: { includeArchived?: boolean } = {}): Promise<Project[]> {
  const db = getDb();
  if (!db)
    return [...seedProjects].sort(byOrder).filter((p) => opts.includeArchived || p.status !== "archived");
  const q = db.select().from(schema.projects);
  return (opts.includeArchived ? q : q.where(ne(schema.projects.status, "archived"))).orderBy(
    asc(schema.projects.sortOrder),
    asc(schema.projects.id),
  );
}

export async function getProjectsBySlugs(slugs: string[]): Promise<Project[]> {
  if (!slugs.length) return [];
  const db = getDb();
  if (!db) return seedProjects.filter((p) => slugs.includes(p.slug));
  return db.select().from(schema.projects).where(inArray(schema.projects.slug, slugs));
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const db = getDb();
  if (!db) return seedProjects.find((p) => p.id === id);
  const [row] = await db.select().from(schema.projects).where(eq(schema.projects.id, id));
  return row;
}

export async function getParts(): Promise<BookPart[]> {
  const db = getDb();
  if (!db) return [...seedParts].sort(byOrder);
  return db.select().from(schema.bookParts).orderBy(asc(schema.bookParts.sortOrder), asc(schema.bookParts.partNumber));
}

export type ChapterListItem = Omit<BookChapter, "contentMarkdown">;

const stripContent = ({ contentMarkdown, ...rest }: BookChapter): ChapterListItem => {
  void contentMarkdown;
  return rest;
};

/** Column map without the (large) markdown body, for list queries. */
const listColumns = () => {
  const { contentMarkdown, ...cols } = getTableColumns(schema.bookChapters);
  void contentMarkdown;
  return cols;
};

/** Chapter list without the markdown body. Drafts only when `includeDrafts`. */
export async function getChapters(opts: { includeDrafts?: boolean } = {}): Promise<ChapterListItem[]> {
  const db = getDb();
  if (!db) {
    return seedChapters
      .filter((c) => opts.includeDrafts || c.status !== "draft")
      .sort(byOrder)
      .map(stripContent);
  }
  const t = schema.bookChapters;
  const q = db.select(listColumns()).from(t);
  return (opts.includeDrafts ? q : q.where(ne(t.status, "draft"))).orderBy(asc(t.sortOrder), asc(t.id));
}

export async function getChapterBySlug(slug: string, opts: { includeDrafts?: boolean } = {}): Promise<BookChapter | undefined> {
  const db = getDb();
  let row: BookChapter | undefined;
  if (!db) row = seedChapters.find((c) => c.slug === slug);
  else {
    [row] = await db.select().from(schema.bookChapters).where(eq(schema.bookChapters.slug, slug));
  }
  if (!row) return undefined;
  if (row.status === "draft" && !opts.includeDrafts) return undefined;
  return row;
}

export async function getChapterById(id: number): Promise<BookChapter | undefined> {
  const db = getDb();
  if (!db) return seedChapters.find((c) => c.id === id);
  const [row] = await db.select().from(schema.bookChapters).where(eq(schema.bookChapters.id, id));
  return row;
}

export async function getLatestChapters(limit = 3): Promise<ChapterListItem[]> {
  const db = getDb();
  if (!db) {
    return seedChapters
      .filter((c) => c.status !== "draft")
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0) || byOrder(b, a))
      .slice(0, limit)
      .map(stripContent);
  }
  const t = schema.bookChapters;
  return db
    .select(listColumns())
    .from(t)
    .where(ne(t.status, "draft"))
    .orderBy(desc(t.publishedAt), desc(t.sortOrder))
    .limit(limit);
}

export async function getAdminStats() {
  const [exps, projs, chapters] = await Promise.all([
    getExperiences({ includeHidden: true }),
    getProjects({ includeArchived: true }),
    getChapters({ includeDrafts: true }),
  ]);
  return {
    roles: exps.length,
    liveProjects: projs.filter((p) => p.status === "live").length,
    projects: projs.length,
    published: chapters.filter((c) => c.status !== "draft").length,
    drafts: chapters.filter((c) => c.status === "draft").length,
  };
}

export const APAC_KEY = "apac_map";

/** The APAC map document: from the database when edited/seeded, otherwise the built-in default. */
export async function getApacDoc(): Promise<ApacDoc> {
  const db = getDb();
  if (!db) return DEFAULT_APAC_DOC;
  const [row] = await db.select().from(schema.siteContent).where(eq(schema.siteContent.key, APAC_KEY));
  if (!row) return DEFAULT_APAC_DOC;
  const doc = sanitizeApacDoc(row.value);
  return doc.items.length ? doc : DEFAULT_APAC_DOC;
}

/** Text at the top of /book: from the database when edited, otherwise the built-in default. */
export async function getBookIntro(): Promise<BookIntro> {
  const db = getDb();
  if (!db) return DEFAULT_BOOK_INTRO;
  const [row] = await db.select().from(schema.siteContent).where(eq(schema.siteContent.key, BOOK_INTRO_KEY));
  return row ? sanitizeBookIntro(row.value) : DEFAULT_BOOK_INTRO;
}

/** The "Beyond the desk" strip: from the database when edited, otherwise the built-in default. */
export async function getBeyond(): Promise<BeyondDoc> {
  const db = getDb();
  if (!db) return DEFAULT_BEYOND;
  const [row] = await db.select().from(schema.siteContent).where(eq(schema.siteContent.key, BEYOND_KEY));
  return row ? sanitizeBeyond(row.value) : DEFAULT_BEYOND;
}
