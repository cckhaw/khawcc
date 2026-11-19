"use server";

import { asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireDb, schema } from "@/db";
import type { SkillCategory } from "@/db/constants";
import { requireAdmin } from "@/lib/auth";
import { int, revalidateAll, str } from "./util";

const t = schema.skillsAndCredentials;

const Input = z.object({ category: z.string().min(1, "Group name is required").max(64) });

function parseItems(fd: FormData): string[] {
  try {
    const v = JSON.parse(String(fd.get("items") ?? "[]"));
    if (!Array.isArray(v)) return [];
    return Array.from(new Set(v.map((x) => String(x).trim().slice(0, 120)).filter(Boolean))).slice(0, 60);
  } catch {
    throw new Error("Could not read the list. Please reload the page and try again.");
  }
}

export async function saveSkillGroup(fd: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = int(fd, "id", 0);
  const { category } = Input.parse({ category: str(fd, "category") });
  const values = { category: category as SkillCategory, items: parseItems(fd), updatedAt: new Date() };
  if (id) await db.update(t).set(values).where(eq(t.id, id));
  else {
    const rows = await db.select({ s: t.sortOrder }).from(t).orderBy(asc(t.sortOrder));
    const last = rows.length ? rows[rows.length - 1].s : 0;
    await db.insert(t).values({ ...values, sortOrder: last + 10 });
  }
  revalidateAll();
  redirect("/admin/skills?saved=1");
}

export async function deleteSkillGroup(fd: FormData) {
  await requireAdmin();
  await requireDb().delete(t).where(eq(t.id, int(fd, "id")));
  revalidateAll();
  redirect("/admin/skills");
}

export async function moveSkillGroup(fd: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = int(fd, "id");
  const dir = str(fd, "dir") === "up" ? -1 : 1;
  const rows = await db.select({ id: t.id }).from(t).orderBy(asc(t.sortOrder), asc(t.id));
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i >= 0 && j >= 0 && j < rows.length) {
    [rows[i], rows[j]] = [rows[j], rows[i]];
    for (let k = 0; k < rows.length; k++) await db.update(t).set({ sortOrder: (k + 1) * 10 }).where(eq(t.id, rows[k].id));
  }
  revalidateAll();
  redirect("/admin/skills");
}
