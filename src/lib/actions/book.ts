"use server";

import { asc, eq, max } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireDb, schema } from "@/db";
import { CHAPTER_STATUSES } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { readingTime, slugify } from "@/lib/markdown";
import { int, raw, revalidateAll, str } from "./util";

const ch = schema.bookChapters;
const pt = schema.bookParts;

/* ---------------- Parts ---------------- */

export async function savePart(fd: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = int(fd, "id", 0);
  const title = z.string().min(1, "Part title is required").parse(str(fd, "title"));
  const values = {
    partNumber: int(fd, "partNumber", 1),
    title,
    description: raw(fd, "description").trim(),
    updatedAt: new Date(),
  };
  if (id) await db.update(pt).set(values).where(eq(pt.id, id));
  else {
    const [m] = await db.select({ m: max(pt.sortOrder) }).from(pt);
    await db.insert(pt).values({ ...values, sortOrder: (m?.m ?? 0) + 10 });
  }
  revalidateAll();
  redirect("/admin/book");
}

export async function deletePart(fd: FormData) {
  await requireAdmin();
  await requireDb().delete(pt).where(eq(pt.id, int(fd, "id"))); // chapters keep existing (part_id -> null)
  revalidateAll();
  redirect("/admin/book");
}

export async function movePart(fd: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = int(fd, "id");
  const dir = str(fd, "dir") === "up" ? -1 : 1;
  const rows = await db.select({ id: pt.id }).from(pt).orderBy(asc(pt.sortOrder), asc(pt.id));
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i >= 0 && j >= 0 && j < rows.length) {
    [rows[i], rows[j]] = [rows[j], rows[i]];
    for (let k = 0; k < rows.length; k++) await db.update(pt).set({ sortOrder: (k + 1) * 10 }).where(eq(pt.id, rows[k].id));
  }
  revalidateAll();
  redirect("/admin/book");
}

/* ---------------- Chapters ---------------- */

const ChapterInput = z.object({
  title: z.string().min(1, "Title is required"),
  chapterNumber: z.string().min(1, "Chapter number/label is required").max(16),
  status: z.enum(CHAPTER_STATUSES),
});

export async function saveChapter(fd: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = int(fd, "id", 0);
  const base = ChapterInput.parse({
    title: str(fd, "title"),
    chapterNumber: str(fd, "chapterNumber"),
    status: str(fd, "status"),
  });
  const content = raw(fd, "contentMarkdown");
  const slug = slugify(str(fd, "slug") || `${/^\d/.test(base.chapterNumber) ? `chapter-${base.chapterNumber}-` : ""}${base.title}`);
  if (!slug) throw new Error("Could not derive a slug.");
  const partId = int(fd, "partId", 0) || null;
  const related = fd.getAll("related").map(String).filter(Boolean);

  const [existing] = id ? await db.select({ p: ch.publishedAt }).from(ch).where(eq(ch.id, id)) : [];
  const publishedAt = base.status === "draft" ? (existing?.p ?? null) : (existing?.p ?? new Date());

  const values = {
    ...base,
    slug,
    partId,
    subtitle: str(fd, "subtitle"),
    summary: raw(fd, "summary").trim(),
    contentMarkdown: content,
    readingTimeMinutes: readingTime(content), // authoritative, recomputed server-side
    relatedProjectSlugs: related,
    publishedAt,
    updatedAt: new Date(),
  };

  let savedId = id;
  if (id) await db.update(ch).set(values).where(eq(ch.id, id));
  else {
    const [m] = await db.select({ m: max(ch.sortOrder) }).from(ch);
    const [row] = await db.insert(ch).values({ ...values, sortOrder: (m?.m ?? 0) + 10 }).returning({ id: ch.id });
    savedId = row.id;
  }
  revalidateAll();
  redirect(`/admin/book/${savedId}?saved=1${str(fd, "intent") === "preview" ? "&preview=1" : ""}`);
}

export async function deleteChapter(fd: FormData) {
  await requireAdmin();
  await requireDb().delete(ch).where(eq(ch.id, int(fd, "id")));
  revalidateAll();
  redirect("/admin/book");
}

export async function moveChapter(fd: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = int(fd, "id");
  const dir = str(fd, "dir") === "up" ? -1 : 1;
  const rows = await db
    .select({ id: ch.id, partId: ch.partId })
    .from(ch)
    .orderBy(asc(ch.sortOrder), asc(ch.id));
  const i = rows.findIndex((r) => r.id === id);
  if (i < 0) return;
  // Swap with the nearest neighbour in the same part.
  let j = i + dir;
  while (j >= 0 && j < rows.length && rows[j].partId !== rows[i].partId) j += dir;
  if (j >= 0 && j < rows.length) {
    [rows[i], rows[j]] = [rows[j], rows[i]];
    for (let k = 0; k < rows.length; k++) await db.update(ch).set({ sortOrder: (k + 1) * 10 }).where(eq(ch.id, rows[k].id));
  }
  revalidateAll();
  redirect("/admin/book");
}
