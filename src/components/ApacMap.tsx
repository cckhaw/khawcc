import map from "@/data/apac-map.json";
import { labelFor, MAP_H, MAP_W, type ApacDoc, type ApacItem } from "@/lib/apac";

export const PIN_PATH = "M0 0C-6 -9 -13 -14 -13 -22a13 13 0 1 1 26 0C13 -14 6 -9 0 0Z";
export const MAP_LAND = map.land;
export const MAP_BORDERS = map.borders;

/** Hover links between legend rows and map pins, with no JavaScript. */
const makeCss = (n: number) => {
  const hover = Array.from({ length: n }, (_, i) =>
    `.apac:has(.leg-${i}:hover) .pin-${i} .pin-body,.apac .pin-${i}:hover .pin-body{transform:scale(1.3)}` +
    `.apac:has(.pin-${i}:hover) .leg-${i},.apac .leg-${i}:hover{background:var(--apac-box)}`,
  ).join("");
  return `
.apac{--apac-land:#7aaed6;--apac-line:#fff;--apac-ink:#0d4664;--apac-soft:#3b6178;--apac-box:#dceaf7;--apac-sea:#e9f2fa;--apac-pin:#3a4350;--apac-hot:#d8482c;color:var(--apac-ink)}
:root[data-theme="dark"] .apac-site{--apac-land:#3d6283;--apac-line:#14110f;--apac-ink:#e8f1f8;--apac-soft:#a9bfd0;--apac-box:rgba(122,174,214,.14);--apac-sea:rgba(122,174,214,.07);--apac-pin:#f4eee7;--apac-hot:#ff8a66}
.apac .pin-body{transform-box:fill-box;transform-origin:50% 100%;transition:transform .18s ease}
.apac .leg{transition:background .15s}
${hover}`;
};

/** Palette variables for any element with the `apac` class (used by the admin editor). */
export const APAC_BASE_CSS = makeCss(0);

/** One map pin (tip at 0,0 of its parent transform). Shared with the admin editor. */
export function PinShape({ label, hot, selected = false }: { label: string; hot: boolean; selected?: boolean }) {
  return (
    <>
      <path d={PIN_PATH} fill={hot ? "var(--apac-hot)" : "var(--apac-pin)"} stroke={selected ? "var(--apac-hot)" : "#fff"} strokeWidth={selected ? 3 : 1.5} />
      <circle cy="-22" r="8.6" fill="#fff" />
      <text y="-18.4" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={hot ? "var(--apac-hot)" : "#1f2933"} style={{ fontFamily: "Inter Variable, system-ui, sans-serif" }}>
        {label}
      </text>
    </>
  );
}

function Pins({ items }: { items: ApacItem[] }) {
  return (
    <>
      {items.map((p, i) => (
        <g key={p.id} className={`pin-${i}`} transform={`translate(${p.x} ${p.y})`}>
          <title>{`${labelFor(i)}: ${p.text}`}</title>
          <g className="pin-body">
            <PinShape label={labelFor(i)} hot={p.current} />
          </g>
        </g>
      ))}
    </>
  );
}

function MapSvg({ items, fill = false }: { items: ApacItem[]; fill?: boolean }) {
  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio={fill ? "xMidYMid slice" : "xMidYMid meet"}
      role="img"
      aria-label={`Map of Asia-Pacific showing the locations of selected telecom projects, labelled A to ${labelFor(Math.max(0, items.length - 1))}`}
      className={fill ? "absolute inset-0 h-full w-full" : "block h-auto w-full"}
    >
      <path d={MAP_LAND} fill="var(--apac-land)" />
      <path d={MAP_BORDERS} fill="none" stroke="var(--apac-line)" strokeWidth="0.8" strokeLinejoin="round" />
      <Pins items={items} />
    </svg>
  );
}

function Legend({ items, compact = false }: { items: ApacItem[]; compact?: boolean }) {
  return (
    <ol className={compact ? "space-y-1" : "space-y-1.5"}>
      {items.map((p, i) => (
        <li key={p.id} className={`leg leg-${i} flex gap-3 rounded-lg px-2 py-1 ${compact ? "text-[15px] leading-snug" : "text-sm leading-snug"}`}>
          <span className="w-5 shrink-0 text-base font-bold" style={{ color: p.current ? "var(--apac-hot)" : "var(--apac-ink)" }}>
            {labelFor(i)}
          </span>
          <span className="min-w-0" style={{ color: "var(--apac-ink)" }}>
            {p.text}
            {p.current && (
              <span className="ml-2 inline-block rounded-full px-2 py-0.5 align-middle text-[10px] font-semibold" style={{ background: "var(--apac-hot)", color: "#fff" }}>
                NOW
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Responsive version for the website. */
export function ApacMap({ doc }: { doc: ApacDoc }) {
  const items = doc.items.filter((i) => i.visible);
  return (
    <div className="apac apac-site">
      <style dangerouslySetInnerHTML={{ __html: makeCss(items.length) }} />
      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="overflow-hidden rounded-3xl" style={{ background: "var(--apac-sea)" }}>
          <MapSvg items={items} />
        </div>
        <div>
          {doc.stats.length > 0 && (
            <ul className="mb-5 grid gap-2 text-center" style={{ gridTemplateColumns: `repeat(${doc.stats.length}, minmax(0, 1fr))` }}>
              {doc.stats.map((s) => (
                <li key={s.label} className="rounded-2xl px-2 py-3" style={{ background: "var(--apac-box)" }}>
                  <p className="font-display text-2xl font-semibold leading-none sm:text-3xl">{s.value}</p>
                  <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--apac-soft)" }}>
                    {s.label}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Legend items={items} />
        </div>
      </div>
    </div>
  );
}

/** Fixed-size poster (1200 px wide) for the shareable image. */
export function ApacPoster({ doc }: { doc: ApacDoc }) {
  const items = doc.items.filter((i) => i.visible);
  const font = "Inter Variable, system-ui, sans-serif";
  return (
    <div id="apac-poster" className="apac" style={{ width: 1200, background: "#fff", padding: "40px 44px 44px", fontFamily: font }}>
      <style dangerouslySetInnerHTML={{ __html: makeCss(items.length) }} />
      <div className="flex items-start justify-between gap-8">
        <h1 style={{ fontFamily: font, fontWeight: 800, fontSize: 44, lineHeight: 1.12, letterSpacing: "-0.01em", color: "#0d4664", maxWidth: 700 }}>
          TELECOM &amp; DIGITAL TRANSFORMATION ACROSS APAC
        </h1>
        {doc.stats.length > 0 && (
          <div style={{ background: "#dceaf7", borderRadius: 24, padding: "22px 34px", textAlign: "center", color: "#0d4664", minWidth: 280 }}>
            {doc.stats.map((s, i) => (
              <div key={s.label} style={{ marginBottom: i < doc.stats.length - 1 ? 8 : 0 }}>
                <p style={{ fontSize: i === 0 ? 46 : 38, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 20, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6 grid items-start gap-8" style={{ gridTemplateColumns: "600px 1fr" }}>
        <div style={{ background: "var(--apac-sea)", borderRadius: 28, alignSelf: "stretch", position: "relative", overflow: "hidden", minHeight: 720 }}>
          <MapSvg items={items} fill />
        </div>
        <Legend items={items} compact />
      </div>
    </div>
  );
}
