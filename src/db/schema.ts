import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import type { ChapterMedia } from "../lib/media";
import type { ChapterStatus, ProjectCategory, ProjectStatus, SkillCategory } from "./constants";

export * from "./constants";


const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

/** Single-row configuration table (id is always 1). */
export const profileSettings = pgTable("profile_settings", {
  id: integer("id").primaryKey().default(1),
  fullName: text("full_name").notNull(),
  headline: text("headline").notNull(),
  location: text("location").notNull(),
  email: text("email").notNull().default(""),
  linkedinUrl: text("linkedin_url").notNull().default(""),
  githubUrl: text("github_url").notNull().default(""),
  instagramHandle: text("instagram_handle").notNull().default(""),
  /** Optional portrait (any https URL or /public path). Falls back to a monogram. */
  avatarUrl: text("avatar_url").notNull().default(""),
  /** Big home-page headline; **words** get the gradient. Empty = built-in default (src/lib/hero.ts). */
  heroHeadline: text("hero_headline").notNull().default(""),
  heroBio: text("hero_bio").notNull(),
  aboutNarrative: text("about_narrative").notNull().default(""),
  leadershipPhilosophy: text("leadership_philosophy").notNull().default(""),
  currentlyFocusedOn: text("currently_focused_on").notNull().default(""),
  updatedAt: updatedAt(),
});

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  roleTitle: text("role_title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull().default(""),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }),
  isCurrent: boolean("is_current").notNull().default(false),
  /** Company logo: https URL, /public path or /media/<id>. Empty = initial-letter tile. */
  logoUrl: text("logo_url").notNull().default(""),
  domainTag: text("domain_tag").notNull().default("Telco & BSS"),
  summary: text("summary").notNull().default(""),
  highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: updatedAt(),
});

export const skillsAndCredentials = pgTable("skills_and_credentials", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 64 }).$type<SkillCategory>().notNull(),
  items: jsonb("items").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: updatedAt(),
});

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: text("name").notNull(),
    url: text("url").notNull(),
    category: varchar("category", { length: 64 }).$type<ProjectCategory>().notNull(),
    /** Icon/logo shown on cards: https URL or /public path. Empty = initial-letter tile. */
    logoUrl: text("logo_url").notNull().default(""),
    tagline: text("tagline").notNull().default(""),
    description: text("description").notNull().default(""),
    techStack: jsonb("tech_stack").$type<string[]>().notNull().default([]),
    status: varchar("status", { length: 16 }).$type<ProjectStatus>().notNull().default("live"),
    featuredOnCv: boolean("featured_on_cv").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("projects_slug_idx").on(t.slug)],
);

export const bookParts = pgTable(
  "book_parts",
  {
    id: serial("id").primaryKey(),
    partNumber: integer("part_number").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("book_parts_part_number_idx").on(t.partNumber)],
);

export const bookChapters = pgTable(
  "book_chapters",
  {
    id: serial("id").primaryKey(),
    partId: integer("part_id").references(() => bookParts.id, { onDelete: "set null" }),
    /** Display label: "Preface", "1", "5.1", "Annex" ... */
    chapterNumber: varchar("chapter_number", { length: 16 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull().default(""),
    status: varchar("status", { length: 16 }).$type<ChapterStatus>().notNull().default("draft"),
    summary: text("summary").notNull().default(""),
    contentMarkdown: text("content_markdown").notNull().default(""),
    readingTimeMinutes: integer("reading_time_minutes").notNull().default(1),
    relatedProjectSlugs: jsonb("related_project_slugs").$type<string[]>().notNull().default([]),
    /** Pictures and YouTube links shown alongside the chapter. */
    media: jsonb("media").$type<ChapterMedia[]>().notNull().default([]),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: updatedAt(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("book_chapters_slug_idx").on(t.slug)],
);

/** Small key/value documents edited in the admin (e.g. the APAC map). */
export const siteContent = pgTable("site_content", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Images uploaded from the admin (stored in Postgres, served at /media/<id>). */
export const mediaFiles = pgTable("media_files", {
  id: serial("id").primaryKey(),
  mime: varchar("mime", { length: 64 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  dataBase64: text("data_base64").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profileSettings.$inferSelect;
export type Experience = typeof experiences.$inferSelect;
export type SkillGroup = typeof skillsAndCredentials.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type BookPart = typeof bookParts.$inferSelect;
export type BookChapter = typeof bookChapters.$inferSelect;
