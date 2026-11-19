"use server";

import { redirect } from "next/navigation";
import { schema, requireDb } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { raw, revalidateAll, str } from "./util";

export async function saveProfile(fd: FormData) {
  await requireAdmin();
  const db = requireDb();
  const values = {
    id: 1,
    fullName: str(fd, "fullName") || "Khaw Cheng Chuan",
    headline: str(fd, "headline"),
    location: str(fd, "location"),
    email: str(fd, "email"),
    linkedinUrl: str(fd, "linkedinUrl"),
    githubUrl: str(fd, "githubUrl"),
    instagramHandle: str(fd, "instagramHandle"),
    avatarUrl: str(fd, "avatarUrl"),
    heroBio: raw(fd, "heroBio").trim(),
    aboutNarrative: raw(fd, "aboutNarrative").trim(),
    leadershipPhilosophy: raw(fd, "leadershipPhilosophy").trim(),
    currentlyFocusedOn: raw(fd, "currentlyFocusedOn").trim(),
    updatedAt: new Date(),
  };
  await db.insert(schema.profileSettings).values(values).onConflictDoUpdate({ target: schema.profileSettings.id, set: values });
  revalidateAll();
  redirect("/admin/profile?saved=1");
}
