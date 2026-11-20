"use server";

import { redirect } from "next/navigation";
import { requireDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { BEYOND_KEY, sanitizeBeyond } from "@/lib/beyond";
import { disconnect, syncStrava } from "@/lib/strava";
import { revalidateAll } from "./util";

export async function saveBeyond(fd: FormData) {
  await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(String(fd.get("doc") ?? ""));
  } catch {
    throw new Error("Could not read the form. Please reload the page and try again.");
  }
  const doc = sanitizeBeyond(raw);
  await requireDb()
    .insert(schema.siteContent)
    .values({ key: BEYOND_KEY, value: doc })
    .onConflictDoUpdate({ target: schema.siteContent.key, set: { value: doc, updatedAt: new Date() } });
  revalidateAll();
  redirect("/admin/beyond?saved=1");
}

/** "Sync now" button in /admin/beyond. */
export async function syncStravaNow() {
  await requireAdmin();
  let q = "strava=synced";
  try {
    await syncStrava();
  } catch (e) {
    q = `strava=error&msg=${encodeURIComponent(e instanceof Error ? e.message.slice(0, 160) : "failed")}`;
  }
  revalidateAll();
  redirect(`/admin/beyond?${q}`);
}

export async function disconnectStrava() {
  await requireAdmin();
  await disconnect();
  revalidateAll();
  redirect("/admin/beyond?strava=disconnected");
}
