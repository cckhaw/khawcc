/** Client-safe enums (no drizzle imports). */
export const PROJECT_CATEGORIES = [
  "Flagship Platforms",
  "Endurance & Sports",
  "Utilities & Productivity",
  "Arcade & Games",
] as const;
export const PROJECT_STATUSES = ["live", "beta", "wip", "archived"] as const;
export const CHAPTER_STATUSES = ["draft", "wip_published", "published"] as const;
export const SKILL_CATEGORIES = [
  "Core Competencies",
  "Architecture & Stack",
  "Education & Certifications",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ChapterStatus = (typeof CHAPTER_STATUSES)[number];
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
