import "server-only";
import { revalidatePath } from "next/cache";

/** Every admin mutation calls this so changes go live immediately on Vercel. */
export function revalidateAll() {
  revalidatePath("/", "layout");
  for (const p of ["/", "/cv", "/projects", "/book"]) revalidatePath(p);
  revalidatePath("/book/[slug]", "page");
  revalidatePath("/admin", "layout");
}

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
/** Like `str` but keeps inner whitespace/newlines intact (Markdown). */
export const raw = (fd: FormData, k: string) => String(fd.get(k) ?? "").replace(/\r\n/g, "\n");
export const bool = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return v === "on" || v === "true" || v === "1";
};
export const int = (fd: FormData, k: string, fallback = 0) => {
  const n = Number.parseInt(String(fd.get(k) ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
};
export const lines = (fd: FormData, k: string) =>
  raw(fd, k)
    .split("\n")
    .map((l) => l.replace(/^\s*[-*•]\s+/, "").trim())
    .filter(Boolean);
export const tags = (fd: FormData, k: string) =>
  Array.from(new Set(str(fd, k).split(/[,\n]/).map((t) => t.trim()).filter(Boolean)));
/** "2019-12" | "2019-12-01" -> "2019-12-01" */
export const monthToDate = (v: string): string | null => {
  const m = /^(\d{4})-(\d{2})/.exec(v);
  return m ? `${m[1]}-${m[2]}-01` : null;
};
