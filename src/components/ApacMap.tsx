"use client";

import { useState } from "react";
import map from "@/data/apac-map.json";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { headlineOf, labelFor, layoutPins, MAP_H, MAP_W, PIN_SCALE, type ApacDoc, type ApacItem } from "@/lib/apac";

export const PIN_PATH = "M0 0C-6 -9 -13 -14 -13 -22a13 13 0 1 1 26 0C13 -14 6 -9 0 0Z";
export const MAP_LAND = map.land;
export const MAP_BORDERS = map.borders;

/** Palette, hover links and the glow / breathing animation (no JS needed for hover). */
const makeCss = (n: number) => {
  const hover = Array.from({ length: n }, (_, i) =>
    `.apac:has(.leg-${i}:hover) .pin-${i} .pin-body,.apac .pin-${i}:hover .pin-body{transform:scale(1.2)}` +
    `.apac:has(.pin-${i}:hover) .leg-${i},.apac .leg-${i}:hover{background:var(--apac-box)}`,
  ).join("");
  return `
.apac{--apac-land:#7aaed6;--apac-line:#fff;--apac-ink:#0d4664;--apac-soft:#2f566d;--apac-box:#dceaf7;--apac-sea:#e9f2fa;--apac-pin:#3a4350;--apac-hot:#c43c22;color:var(--apac-ink)}
:root[data-theme="dark"] .apac-site{--apac-land:#3d6283;--apac-line:#14110f;--apac-ink:#e8f1f8;--apac-soft:#a9bfd0;--apac-box:rgba(122,174,214,.14);--apac-sea:rgba(122,174,214,.07);--apac-pin:#f4eee7;--apac-hot:#ff8a66}
.apac .pin-body{transform-box:fill-box;transform-origin:50% 100%;transition:transform .18s ease}
.apac .leg{transition:background .15s,box-shadow .15s}
.apac .leg.is-selected{background:var(--apac-box);box-shadow:inset 3px 0 0 var(--apac-hot)}
.apac .pin-static .pin-glow{opacity:.6}
${hover}`;
};

/** Palette variables for any element with the `apac` class (used by the admin editor). */
export const APAC_BASE_CSS = makeCss(0);

/** One map pin (tip at 0,0 of its parent transform). Shared with the admin editor. */
export function PinShape({ label, hot, selected = false, scale = PIN_SCALE }: { label: string; hot: boolean; selected?: boolean; scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <path d={PIN_PATH} fill={hot ? "var(--apac-hot)" : "var(--apac-pin)"} stroke={selected ? "var(--apac-hot)" : "#fff"} strokeWidth={selected ? 2.4 : 1.5} />
      <circle cy="-22" r="8.8" fill="#fff" />
      <text y="-18" textAnchor="middle" fontSize="12" fontWeight="700" fill={hot ? "var(--apac-hot)" : "#1f2933"} style={{ fontFamily: "Inter Variable, system-ui, sans-serif" }}>
        {label}
      </text>
    </g>
  );
}

function Pins({
  items,
  selected,
  onSelect,
  animated,
}: {
  items: ApacItem[];
  selected: number | null;
  onSelect?: (i: number) => void;
  animated: boolean;
}) {
  const shown = layoutPins(items);
  const reduced = useReducedMotion();
  const order = items.map((_, i) => i).sort((a, b) => Number(a === selected) - Number(b === selected)); // selected on top
  const head = 22 * PIN_SCALE;
  return (
    <>
      <filter id="apac-blur" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
      {/* leader lines for pins nudged away from their true location */}
      {items.map((p, i) => {
        const d = Math.hypot(shown[i].x - p.x, shown[i].y - p.y);
        return d > 4 ? (
          <g key={`lead-${p.id}`} pointerEvents="none">
            <line x1={p.x} y1={p.y} x2={shown[i].x} y2={shown[i].y} stroke="var(--apac-pin)" strokeWidth="2" opacity=".55" />
            <circle cx={p.x} cy={p.y} r="3.6" fill="var(--apac-pin)" stroke="#fff" strokeWidth="1" />
          </g>
        ) : null;
      })}
      {order.map((i) => {
        const p = items[i];
        const on = p.current || selected === i;
        const label = labelFor(i);
        return (
          <g
            key={p.id}
            className={`pin-${i} ${on ? (animated ? "pin-live" : "pin-static") : ""}`}
            transform={`translate(${shown[i].x} ${shown[i].y})`}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-pressed={onSelect ? selected === i : undefined}
            aria-label={`${label}: ${headlineOf(p.text)}`}
            style={onSelect ? { cursor: "pointer", outline: "none" } : undefined}
            onClick={onSelect ? () => onSelect(i) : undefined}
            onKeyDown={onSelect ? (e) => (e.key === "Enter" || e.key === " " ? (e.preventDefault(), onSelect(i)) : undefined) : undefined}
          >
            <title>{`${label}: ${headlineOf(p.text)}`}</title>
            {on && (
              <>
                {/* Pulse and breathing use SMIL (<animate>), which iPhone Safari runs reliably.
                    With "Reduce Motion" on, only a gentle glow fades in and out (no movement). */}
                {animated && !reduced &&
                  [0, 1.2].map((delay) => (
                    <circle key={delay} className="pin-ring" cy={-head / 2} r={14 * PIN_SCALE * 0.5} fill="none" stroke="var(--apac-hot)" strokeWidth="3.5" opacity="0">
                      <animate attributeName="r" values={`${14 * PIN_SCALE * 0.5};${14 * PIN_SCALE * 1.6}`} dur="2.4s" begin={`${delay}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.75;0" dur="2.4s" begin={`${delay}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                <circle className="pin-glow" cy={-head / 2} r={17 * PIN_SCALE * 0.95} fill="var(--apac-hot)" opacity=".5" filter="url(#apac-blur)">
                  {animated && (
                    <animate
                      attributeName="opacity"
                      values={reduced ? "0.4;0.75;0.4" : "0.35;0.95;0.35"}
                      dur={reduced ? "3.6s" : "2.4s"}
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
              </>
            )}
            <circle cy={-head / 2} r={15 * PIN_SCALE} fill="transparent" /> {/* generous tap target */}
            <g className="pin-body">
              <g className="pin-breathe">
                {on && animated && !reduced && (
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    values="1;1.14;1"
                    keyTimes="0;0.5;1"
                    calcMode="spline"
                    keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                )}
                <PinShape label={label} hot={p.current} selected={selected === i} />
              </g>
            </g>
          </g>
        );
      })}
    </>
  );
}

function MapSvg({ items, selected, onSelect, animated, fill = false }: { items: ApacItem[]; selected: number | null; onSelect?: (i: number) => void; animated: boolean; fill?: boolean }) {
  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio={fill ? "xMidYMid slice" : "xMidYMid meet"}
      role="group"
      aria-label={`Map of Asia-Pacific showing the locations of selected telecom projects, labelled A to ${labelFor(Math.max(0, items.length - 1))}`}
      className={fill ? "absolute inset-0 h-full w-full" : "block h-auto w-full"}
    >
      <path d={MAP_LAND} fill="var(--apac-land)" />
      <path d={MAP_BORDERS} fill="none" stroke="var(--apac-line)" strokeWidth="0.8" strokeLinejoin="round" />
      <Pins items={items} selected={selected} onSelect={onSelect} animated={animated} />
    </svg>
  );
}

function Legend({ items, selected, onSelect, compact = false }: { items: ApacItem[]; selected: number | null; onSelect?: (i: number) => void; compact?: boolean }) {
  return (
    <ol className={compact ? "space-y-1" : "space-y-1.5"}>
      {items.map((p, i) => {
        const inner = (
          <>
            <span className="w-5 shrink-0 text-base font-bold" style={{ color: p.current ? "var(--apac-hot)" : "var(--apac-ink)" }}>
              {labelFor(i)}
            </span>
            <span className="min-w-0" style={{ color: "var(--apac-ink)" }}>
              {headlineOf(p.text)}
              {p.current && (
                <span className="ml-2 inline-block rounded-full px-2 py-0.5 align-middle text-[10px] font-semibold" style={{ background: "var(--apac-hot)", color: "#fff" }}>
                  NOW
                </span>
              )}
            </span>
          </>
        );
        const cls = `leg leg-${i} flex w-full gap-3 rounded-lg px-2 py-1.5 text-left ${compact ? "text-[15px] leading-snug" : "text-sm leading-snug"} ${selected === i ? "is-selected" : ""}`;
        return (
          <li key={p.id}>
            {onSelect ? (
              <button type="button" className={cls} aria-pressed={selected === i} onClick={() => onSelect(i)}>
                {inner}
              </button>
            ) : (
              <div className={cls}>{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Responsive, interactive version for the website. Tapping a project or pin keeps it highlighted. */
export function ApacMap({ doc }: { doc: ApacDoc }) {
  const items = doc.items.filter((i) => i.visible);
  const [selected, setSelected] = useState<number | null>(() => {
    const i = items.findIndex((x) => x.current);
    return i >= 0 ? i : null;
  });
  const toggle = (i: number) => setSelected((s) => (s === i ? null : i));
  return (
    <div className="apac apac-site">
      <style dangerouslySetInnerHTML={{ __html: makeCss(items.length) }} />
      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="overflow-hidden rounded-3xl lg:sticky lg:top-20" style={{ background: "var(--apac-sea)" }}>
          <MapSvg items={items} selected={selected} onSelect={toggle} animated />
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
          <p className="mb-2 text-xs" style={{ color: "var(--apac-soft)" }}>
            Tap a project or a pin to keep it highlighted on the map.
          </p>
          <Legend items={items} selected={selected} onSelect={toggle} />
        </div>
      </div>
    </div>
  );
}

/** Fixed-size poster (1200 px wide) for the shareable image. Static: the "now" pin keeps a soft glow. */
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
          <MapSvg items={items} selected={null} animated={false} fill />
        </div>
        <Legend items={items} selected={null} compact />
      </div>
    </div>
  );
}
