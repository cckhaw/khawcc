import { isSafeImageUrl } from "./media";

/** The quiet "Beyond the desk" strip on the home page (site_content, key "beyond_work"). */
export type BeyondPhoto = { url: string; alt: string; href: string };
export type BeyondStat = { value: string; label: string };
/** Daily Strava sync state (the numbers themselves live in `stats`). */
export type BeyondStrava = { auto: boolean; syncedAt: string };
export type BeyondDoc = {
  enabled: boolean;
  heading: string;
  intro: string;
  stats: BeyondStat[];
  photos: BeyondPhoto[];
  strava: BeyondStrava;
};

export const BEYOND_KEY = "beyond_work";
export const MAX_BEYOND_PHOTOS = 6;

/** Figures taken from the Strava account on 2026-11-19. Edit them in /admin/beyond. */
export const DEFAULT_BEYOND: BeyondDoc = {
  enabled: true,
  heading: "Beyond the desk",
  intro:
    "Away from work I’m usually on a bike or out for a run. Endurance sport is where I practise the same patience big programmes ask for: pace yourself, show up again tomorrow, and finish.",
  stats: [
    { value: "828", label: "rides logged" },
    { value: "526", label: "runs logged" },
    { value: "200 km", label: "longest ride (Audax)" },
  ],
  photos: [],
  strava: { auto: false, syncedAt: "" },
};

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function sanitizeBeyond(input: unknown): BeyondDoc {
  const r = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const stats: BeyondStat[] = (Array.isArray(r.stats) ? r.stats : []).slice(0, 4).flatMap((raw) => {
    const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const value = text(o.value, 20);
    const label = text(o.label, 40);
    return value && label ? [{ value, label }] : [];
  });
  const photos: BeyondPhoto[] = (Array.isArray(r.photos) ? r.photos : []).slice(0, MAX_BEYOND_PHOTOS).flatMap((raw) => {
    const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const url = text(o.url, 500);
    const href = text(o.href, 500);
    if (!isSafeImageUrl(url)) return [];
    return [{ url, alt: text(o.alt, 160), href: /^https:\/\//i.test(href) ? href : "" }];
  });
  return {
    enabled: r.enabled !== false,
    heading: text(r.heading, 80) || DEFAULT_BEYOND.heading,
    intro: text(r.intro, 500),
    stats,
    photos,
    strava: {
      auto: Boolean((r.strava as Record<string, unknown> | undefined)?.auto),
      syncedAt: text((r.strava as Record<string, unknown> | undefined)?.syncedAt, 40),
    },
  };
}
