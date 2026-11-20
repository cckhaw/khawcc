"use server";

import { asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { isSafeImageUrl } from "@/lib/media";
import { bool, int, lines, monthToDate, raw, revalidateAll, str } from "./util";

const t = schema.experiences;

const Input = z.object({
  roleTitle: z.string().min(1, "Role title is required"),
  company: z.string().min(1, "Company is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date is required"),
});

const safeLogo = (u: string) => {
  if (u && !isSafeImageUrl(u)) throw new Error("Logo must be an https URL or an uploaded image.");
  return u;
};

export async function saveExperience(fd: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = int(fd, "id", 0);
  const isCurrent = bool(fd, "isCurrent");
  const base = Input.parse({
    roleTitle: str(fd, "roleTitle"),
    company: str(fd, "company"),
    startDate: monthToDate(str(fd, "startDate")),
  });
  const values = {
    ...base,
    location: str(fd, "location"),
    logoUrl: safeLogo(str(fd, "logoUrl")),
    logoUrl2: safeLogo(str(fd, "logoUrl2")),
    endDate: isCurrent ? null : monthToDate(str(fd, "endDate")),
    isCurrent,
    domainTag: str(fd, "domainTag") || "Telco & BSS",
    summary: raw(fd, "summary").trim(),
    highlights: lines(fd, "highlights"),
    isVisible: bool(fd, "isVisible"),
    updatedAt: new Date(),
  };
  if (id) {
    await db.update(t).set(values).where(eq(t.id, id));
  } else {
    const [top] = await db.select({ s: t.sortOrder }).from(t).orderBy(asc(t.sortOrder)).limit(1);
    await db.insert(t).values({ ...values, sortOrder: (top?.s ?? 10) - 10 });
  }
  revalidateAll();
  redirect("/admin/experience?saved=1");
}

export async function deleteExperience(fd: FormData) {
  await requireAdmin();
  await requireDb().delete(t).where(eq(t.id, int(fd, "id")));
  revalidateAll();
  redirect("/admin/experience");
}

export async function toggleExperience(fd: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = int(fd, "id");
  const [row] = await db.select({ v: t.isVisible }).from(t).where(eq(t.id, id));
  if (row) await db.update(t).set({ isVisible: !row.v, updatedAt: new Date() }).where(eq(t.id, id));
  revalidateAll();
  redirect("/admin/experience");
}

export async function moveExperience(fd: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = int(fd, "id");
  const dir = str(fd, "dir") === "up" ? -1 : 1;
  const rows = await db.select({ id: t.id }).from(t).orderBy(asc(t.sortOrder), asc(t.id));
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i >= 0 && j >= 0 && j < rows.length) {
    [rows[i], rows[j]] = [rows[j], rows[i]];
    // Renumber so equal/legacy sort values can never make a move a no-op.
    for (let k = 0; k < rows.length; k++) await db.update(t).set({ sortOrder: (k + 1) * 10 }).where(eq(t.id, rows[k].id));
  }
  revalidateAll();
  redirect("/admin/experience");
}
