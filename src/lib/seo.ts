/** Canonical site address (override with NEXT_PUBLIC_SITE_URL). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.khaw.cc").replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Trim to a search-snippet length at a word boundary. */
export function snippet(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").replace(/[*_`>#]/g, "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}
