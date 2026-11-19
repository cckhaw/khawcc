import map from "@/data/apac-map.json";
import { APAC_PROJECTS, APAC_STATS } from "@/data/apac-projects";

const PIN = "M0 0C-6 -9 -13 -14 -13 -22a13 13 0 1 1 26 0C13 -14 6 -9 0 0Z";

/** Hover links between legend rows and map pins, with no JavaScript. */
const hoverCss = APAC_PROJECTS.map(
  ({ id }) =>
    `.apac:has(.leg-${id}:hover) .pin-${id} .pin-body,.apac .pin-${id}:hover .pin-body{transform:scale(1.3)}` +
    `.apac:has(.pin-${id}:hover) .leg-${id},.apac .leg-${id}:hover{background:var(--apac-box)}`,
).join("");

const css = `
.apac{--apac-land:#7aaed6;--apac-line:#fff;--apac-ink:#0d4664;--apac-soft:#3b6178;--apac-box:#dceaf7;--apac-sea:#e9f2fa;--apac-pin:#3a4350;--apac-hot:#d8482c;color:var(--apac-ink)}
:root[data-theme="dark"] .apac-site{--apac-land:#3d6283;--apac-line:#14110f;--apac-ink:#e8f1f8;--apac-soft:#a9bfd0;--apac-box:rgba(122,174,214,.14);--apac-sea:rgba(122,174,214,.07);--apac-pin:#f4eee7;--apac-hot:#ff8a66}
.apac .pin-body{transform-box:fill-box;transform-origin:50% 100%;transition:transform .18s ease}
.apac .leg{transition:background .15s}
${hoverCss}`;

function Pins() {
  return (
    <>
      {APAC_PROJECTS.map((p) => {
        const [x, y] = (map.pins as Record<string, number[]>)[p.id];
        const hot = Boolean(p.current);
        return (
          <g key={p.id} className={`pin-${p.id}`} transform={`translate(${x} ${y})`}>
            <title>{`${p.id}: ${p.text}`}</title>
            <g className="pin-body">
              <path d={PIN} fill={hot ? "var(--apac-hot)" : "var(--apac-pin)"} stroke="#fff" strokeWidth="1.5" />
              <circle cy="-22" r="8.6" fill="#fff" />
              <text y="-18.4" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={hot ? "var(--apac-hot)" : "#1f2933"} style={{ fontFamily: "Inter Variable, system-ui, sans-serif" }}>
                {p.id}
              </text>
            </g>
          </g>
        );
      })}
    </>
  );
}

function MapSvg({ fill = false }: { fill?: boolean }) {
  return (
    <svg
      viewBox={`0 0 ${map.width} ${map.height}`}
      preserveAspectRatio={fill ? "xMidYMid slice" : "xMidYMid meet"}
      role="img"
      aria-label="Map of Asia-Pacific showing the locations of selected telecom projects, labelled A to P"
      className={fill ? "absolute inset-0 h-full w-full" : "block h-auto w-full"}
    >
      <path d={map.land} fill="var(--apac-land)" />
      <path d={map.borders} fill="none" stroke="var(--apac-line)" strokeWidth="0.8" strokeLinejoin="round" />
      <Pins />
    </svg>
  );
}

function Legend({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={compact ? "space-y-1" : "space-y-1.5"}>
      {APAC_PROJECTS.map((p) => (
        <li key={p.id} className={`leg leg-${p.id} flex gap-3 rounded-lg px-2 py-1 ${compact ? "text-[15px] leading-snug" : "text-sm leading-snug"}`}>
          <span className="w-5 shrink-0 text-base font-bold" style={{ color: p.current ? "var(--apac-hot)" : "var(--apac-ink)" }}>
            {p.id}
          </span>
          <span className="min-w-0" style={{ color: "var(--apac-ink)" }}>
            {p.text}
            {p.current && (
              <span className="ml-2 inline-block rounded-full px-2 py-0.5 align-middle text-[10px] font-semibold" style={{ background: "var(--apac-hot)", color: "#fff" }}>
                2026 · NOW
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Responsive version for the website. */
export function ApacMap() {
  return (
    <div className="apac apac-site">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="overflow-hidden rounded-3xl" style={{ background: "var(--apac-sea)" }}>
          <MapSvg />
        </div>
        <div>
          <ul className="mb-5 grid grid-cols-3 gap-2 text-center">
            {APAC_STATS.map((s) => (
              <li key={s.label} className="rounded-2xl px-2 py-3" style={{ background: "var(--apac-box)" }}>
                <p className="font-display text-2xl font-semibold leading-none sm:text-3xl">{s.value}</p>
                <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--apac-soft)" }}>
                  {s.label}
                </p>
              </li>
            ))}
          </ul>
          <Legend />
        </div>
      </div>
    </div>
  );
}

/** Fixed-size poster (1200 px wide) used to export the LinkedIn image. */
export function ApacPoster() {
  return (
    <div id="apac-poster" className="apac" style={{ width: 1200, background: "#fff", padding: "40px 44px 44px", fontFamily: "Inter Variable, system-ui, sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="flex items-start justify-between gap-8">
        <h1 style={{ fontFamily: "Inter Variable, system-ui, sans-serif", fontWeight: 800, fontSize: 44, lineHeight: 1.12, letterSpacing: "-0.01em", color: "#0d4664", maxWidth: 700 }}>
          TELECOM &amp; DIGITAL TRANSFORMATION ACROSS APAC
        </h1>
        <div style={{ background: "#dceaf7", borderRadius: 24, padding: "22px 34px", textAlign: "center", color: "#0d4664", minWidth: 280 }}>
          <p style={{ fontSize: 46, fontWeight: 800, lineHeight: 1 }}>15</p>
          <p style={{ fontSize: 20, letterSpacing: "0.04em", marginBottom: 8 }}>COUNTRIES</p>
          <p style={{ fontSize: 34, fontWeight: 800, lineHeight: 1 }}>30+</p>
          <p style={{ fontSize: 20, letterSpacing: "0.04em", marginBottom: 8 }}>MAJOR PROJECTS</p>
          <p style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>MILLIONS</p>
          <p style={{ fontSize: 20, letterSpacing: "0.04em" }}>OF USERS</p>
        </div>
      </div>
      <div className="mt-6 grid items-start gap-8" style={{ gridTemplateColumns: "600px 1fr" }}>
        <div style={{ background: "var(--apac-sea)", borderRadius: 28, alignSelf: "stretch", position: "relative", overflow: "hidden", minHeight: 720 }}>
          <MapSvg fill />
        </div>
        <Legend compact />
      </div>
    </div>
  );
}
