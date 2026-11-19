const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2019-12-01" -> "Dec 2019" (no timezone surprises). */
export function fmtMonth(d: string | null | undefined): string {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${MONTHS[Number(m) - 1] ?? ""} ${y}`.trim();
}

export function fmtPeriod(start: string, end: string | null, current: boolean): string {
  return `${fmtMonth(start)} – ${current || !end ? "Present" : fmtMonth(end)}`;
}

export function yearsBetween(start: string, end: string | null): number {
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  return Math.max(0, (e - s) / (365.25 * 24 * 3600 * 1000));
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export const STATUS_LABEL = { live: "LIVE", beta: "BETA", wip: "WIP", archived: "ARCHIVED" } as const;
export const CHAPTER_STATUS_LABEL = {
  draft: "Draft",
  wip_published: "Work in Progress",
  published: "Published",
} as const;
