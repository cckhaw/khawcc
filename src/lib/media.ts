/** Client-safe helpers for chapter media (pictures + YouTube links). */
export type ChapterMedia = {
  type: "image" | "youtube";
  /** image: https URL, /public path or /media/<id> (uploaded); youtube: the watch/share URL */
  url: string;
  caption: string;
};

export const MAX_MEDIA_PER_CHAPTER = 12;

/** Extract the 11-char video id from watch / youtu.be / shorts / embed / live URLs (or a bare id). */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^(www|m)\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else {
        const m = /^\/(?:embed|shorts|live|v)\/([\w-]{11})/.exec(u.pathname);
        id = m ? m[1] : null;
      }
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** Accept only safe image sources: https URLs, site-relative paths. */
export function isSafeImageUrl(u: string): boolean {
  return /^https:\/\/[^\s]+$/i.test(u) || /^\/(?!\/)[^\s]*$/.test(u);
}

/** Validate/normalise untrusted JSON from the editor. */
export function sanitizeMedia(input: unknown): ChapterMedia[] {
  if (!Array.isArray(input)) return [];
  const out: ChapterMedia[] = [];
  for (const raw of input.slice(0, MAX_MEDIA_PER_CHAPTER)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const caption = typeof r.caption === "string" ? r.caption.trim().slice(0, 300) : "";
    const url = typeof r.url === "string" ? r.url.trim() : "";
    if (r.type === "youtube") {
      const id = parseYouTubeId(url);
      if (id) out.push({ type: "youtube", url: `https://www.youtube.com/watch?v=${id}`, caption });
    } else if (r.type === "image" && isSafeImageUrl(url)) {
      out.push({ type: "image", url, caption });
    }
  }
  return out;
}
