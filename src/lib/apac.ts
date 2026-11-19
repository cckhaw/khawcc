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

/** Pins are drawn this many times larger than the 26-unit base shape. */
export const PIN_SCALE = 2;

/**
 * Where to draw each pin so neighbours don't overlap: a few rounds of gentle repulsion,
 * with a spring back to the true location. Deterministic (same on server and client).
 */
export function layoutPins(items: { x: number; y: number }[], scale = PIN_SCALE): { x: number; y: number }[] {
  const minD = 30 * scale;
  const t = items.map((i) => ({ x: i.x, y: i.y }));
  for (let iter = 0; iter < 80; iter++) {
    for (let i = 0; i < t.length; i++) {
      for (let j = i + 1; j < t.length; j++) {
        let dx = t[i].x - t[j].x;
        let dy = t[i].y - t[j].y;
        let d = Math.hypot(dx, dy);
        if (d >= minD) continue;
        if (d < 0.01) {
          dx = 1;
          dy = 0;
          d = 1;
        }
        const push = (minD - d) / 2;
        t[i].x += (dx / d) * push;
        t[i].y += (dy / d) * push;
        t[j].x -= (dx / d) * push;
        t[j].y -= (dy / d) * push;
      }
    }
    for (let i = 0; i < t.length; i++) {
      t[i].x += (items[i].x - t[i].x) * 0.012;
      t[i].y += (items[i].y - t[i].y) * 0.012;
      t[i].x = Math.min(MAP_W - 20, Math.max(20, t[i].x));
      t[i].y = Math.min(MAP_H - 4, Math.max(22 * scale + 4, t[i].y));
    }
  }
  return t.map((p) => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }));
}
