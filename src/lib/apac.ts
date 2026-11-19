/** Client-safe types and helpers for the "Telecom & digital transformation across APAC" map. */
export type ApacItem = {
  /** Stable id (not shown). */
  id: string;
  text: string;
  /** Short place label, used for the pin's accessible name. */
  place: string;
  /** Highlight (coral) as the current / most recent engagement. */
  current: boolean;
  visible: boolean;
  /** Pin tip position in map units (see MAP_W / MAP_H). */
  x: number;
  y: number;
};
export type ApacStat = { value: string; label: string };
export type ApacDoc = { stats: ApacStat[]; items: ApacItem[] };

/** Size of the map's coordinate space (matches src/data/apac-map.json). */
export const MAP_W = 900;
export const MAP_H = 1100;

/** A, B, … Z, then 27, 28, … */
export const labelFor = (index: number) => (index < 26 ? String.fromCharCode(65 + index) : String(index + 1));

const clamp = (n: unknown, lo: number, hi: number, fallback: number) => {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback;
};
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Validate/normalise untrusted JSON from the editor (or the database). */
export function sanitizeApacDoc(input: unknown): ApacDoc {
  const r = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const items: ApacItem[] = (Array.isArray(r.items) ? r.items : []).slice(0, 60).flatMap((raw, i) => {
    const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const text = str(o.text, 400);
    if (!text) return [];
    return [
      {
        id: str(o.id, 40) || `item-${i}`,
        text,
        place: str(o.place, 60),
        current: Boolean(o.current),
        visible: o.visible !== false,
        x: Math.round(clamp(o.x, 0, MAP_W, MAP_W / 2) * 10) / 10,
        y: Math.round(clamp(o.y, 0, MAP_H, MAP_H / 2) * 10) / 10,
      },
    ];
  });
  const stats: ApacStat[] = (Array.isArray(r.stats) ? r.stats : []).slice(0, 4).flatMap((raw) => {
    const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const value = str(o.value, 20);
    const label = str(o.label, 40);
    return value && label ? [{ value, label }] : [];
  });
  return { stats, items };
}
