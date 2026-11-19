"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { sanitizeApacDoc } from "@/lib/apac";
import { revalidateAll } from "./util";

const KEY = "apac_map";

export async function saveApacMap(fd: FormData) {
  await requireAdmin();
  const db = requireDb();
  let raw: unknown;
  try {
    raw = JSON.parse(String(fd.get("doc") ?? ""));
  } catch {
    throw new Error("Could not read the map data. Please reload the page and try again.");
  }
  const doc = sanitizeApacDoc(raw);
  if (!doc.items.length) throw new Error("Add at least one project before saving.");
  await db
    .insert(schema.siteContent)
    .values({ key: KEY, value: doc })
    .onConflictDoUpdate({ target: schema.siteContent.key, set: { value: doc, updatedAt: new Date() } });
  revalidateAll();
  revalidatePath("/apac-map");
  redirect("/admin/map?saved=1");
}
