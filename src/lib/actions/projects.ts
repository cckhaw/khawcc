"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireDb, schema } from "@/db";
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/markdown";
import { fetchPageMeta, type PageMeta } from "@/lib/page-meta";
import { bool, int, raw, revalidateAll, str, tags } from "./util";

const t = schema.projects;

const Input = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Enter a full URL, e.g. https://app.khaw.cc"),
  category: z.enum(PROJECT_CATEGORIES),
  status: z.enum(PROJECT_STATUSES),
});

export async function saveProject(fd: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = int(fd, "id", 0);
  const base = Input.parse({
    name: str(fd, "name"),
    url: str(fd, "url"),
    category: str(fd, "category"),
    status: str(fd, "status"),
  });
  const slug = slugify(str(fd, "slug") || base.name);
  if (!slug) throw new Error("Could not derive a slug.");
  const values = {
    ...base,
    slug,
    tagline: str(fd, "tagline"),
    description: raw(fd, "description").trim(),
    techStack: tags(fd, "techStack"),
    featuredOnCv: bool(fd, "featuredOnCv"),
    sortOrder: int(fd, "sortOrder", 0),
    updatedAt: new Date(),
  };
  if (id) await db.update(t).set(values).where(eq(t.id, id));
  else await db.insert(t).values(values);
  revalidateAll();
  redirect("/admin/projects?saved=1");
}

export async function deleteProject(fd: FormData) {
  await requireAdmin();
  await requireDb().delete(t).where(eq(t.id, int(fd, "id")));
  revalidateAll();
  redirect("/admin/projects");
}

/** "Fetch Meta Title/Description" helper: inspects a URL and returns prefill values. */
export async function fetchMetaAction(url: string): Promise<PageMeta | { error: string }> {
  await requireAdmin();
  try {
    return await fetchPageMeta(url);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not fetch that URL." };
  }
}
