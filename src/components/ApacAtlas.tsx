"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import dots from "@/data/apac-dots.json";
import { labelFor, layoutPins, MAP_H, MAP_W, type ApacDoc } from "@/lib/apac";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { PinShape } from "./ApacMap";
import { CountUp } from "./CountUp";
import { ArrowRight } from "./icons";

type VB = [number, number, number, number];
const REGIONS: { key: string; label: string; vb: VB }[] = [
  { key: "all", label: "All of APAC", vb: [0, 250, 900, 750] },
  { key: "sea", label: "Southeast Asia", vb: [175, 430, 300, 250] },
  { key: "north", label: "North Asia", vb: [330, 320, 288, 240] },
  { key: "south", label: "South Asia", vb: [50, 340, 288, 240] },
  { key: "oce", label: "Oceania", vb: [520, 780, 300, 250] },
];
const PIN = 1.7; // pin size in map units at the widest zoom

const CSS = `
.atlas{--atlas-ink:#eaf3f8;--atlas-soft:#9fbccd;--atlas-dot:rgba(160,210,240,.72);--atlas-arc:#ff9c7d;--atlas-card:rgba(8,28,40,.78);--atlas-line:rgba(160,205,235,.2);--apac-pin:#2f86b0;--apac-hot:#ff7a55;color:var(--atlas-ink);background:radial-gradient(60rem 30rem at 85% -10%,rgba(60,150,190,.28),transparent 60%),radial-gradient(40rem 24rem at 0% 100%,rgba(255,122,85,.12),transparent 60%),linear-gradient(165deg,#0a202d 0%,#0f3043 55%,#0b2431 100%)}
.atlas .chip{border:1px solid var(--atlas-line);border-radius:999px;padding:.38rem .9rem;font-size:.8rem;color:var(--atlas-soft);background:rgba(255,255,255,.04);transition:background .2s,color .2s,border-color .2s}
.atlas .chip:hover{color:#fff;border-color:rgba(255,255,255,.4)}
.atlas .chip[aria-pressed=true]{background:#eaf3f8;color:#0a202d;border-color:#eaf3f8;font-weight:600}
.atlas .row{display:flex;width:100%;gap:.75rem;border-radius:.7rem;padding:.55rem .7rem;text-align:left;font-size:.9rem;line-height:1.4;transition:background .2s,opacity .3s,box-shadow .2s}
.atlas .row:hover{background:rgba(255,255,255,.06)}
.atlas .row[aria-pressed=true]{background:rgba(255,255,255,.09);box-shadow:inset 3px 0 0 #ff7a55}
.atlas .pin-body{transform-box:fill-box;transform-origin:50% 100%;transition:transform .2s ease}
.atlas .pin:hover .pin-body,.atlas .pin:focus-visible .pin-body{transform:scale(1.18)}
.atlas .pin:focus-visible{outline:none}
.atlas .pin:focus-visible .pin-body{filter:drop-shadow(0 0 4px #fff)}
`;

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

function arcPath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny; // bulge upwards
  }
  const k = len * 0.28;
  return `M${a.x} ${a.y}Q${(a.x + b.x) / 2 + nx * k} ${(a.y + b.y) / 2 + ny * k} ${b.x} ${b.y}`;
}

/** Animated, filterable, zoomable map of the work across APAC (dark band on the home page). */
export function ApacAtlas({ doc }: { doc: ApacDoc }) {
  const items = useMemo(() => doc.items.filter((i) => i.visible), [doc.items]);
  const reduced = useReducedMotion();
  const hub = Math.max(0, items.findIndex((i) => i.current));
  const [region, setRegion] = useState("all");
  const [tag, setTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<number>(hub);
  const [inView, setInView] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const vbRef = useRef<VB>(REGIONS[0].vb);

  const tags = useMemo(() => Array.from(new Set(items.map((i) => i.tag).filter(Boolean))), [items]);
  const match = (i: number) => !tag || items[i].tag === tag;
  const z = REGIONS.find((r) => r.key === region)!.vb[2] / MAP_W;

  // Pins nudged apart (computed for the pin size at this zoom, so zooming in naturally separates clusters).
  const shown = useMemo(() => layoutPins(items.map((i) => ({ x: i.x, y: i.y })), PIN * z), [items, z]);

  // Start the intro sequence when the map scrolls into view.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (reduced || !("IntersectionObserver" in window)) {
      setInView(true); // eslint-disable-line react-hooks/set-state-in-effect -- show everything immediately
      return;
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setInView(true), io.disconnect()), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  // Smoothly fly the viewBox to the chosen region (imperative: no React re-render per frame).
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const to = REGIONS.find((r) => r.key === region)!.vb;
    if (reduced) {
      vbRef.current = [...to] as VB;
      el.setAttribute("viewBox", to.join(" "));
      return;
    }
    const from = [...vbRef.current];
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = clamp((t - t0) / 950, 0, 1);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const cur = from.map((f, i) => f + (to[i] - f) * e) as VB;
      vbRef.current = cur;
      el.setAttribute("viewBox", cur.map((n) => n.toFixed(1)).join(" "));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [region, reduced]);

  // Keep the selected row visible inside the list (scrolls the list only, never the page).
  useEffect(() => {
    const ul = list.current;
    const row = ul?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!ul || !row) return;
    const top = row.offsetTop - ul.offsetTop;
    if (top < ul.scrollTop || top + row.offsetHeight > ul.scrollTop + ul.clientHeight) ul.scrollTo({ top: top - 12, behavior: reduced ? "auto" : "smooth" });
  }, [selected, reduced]);

  if (!items.length) return null;

  function choose(i: number) {
    setSelected(i);
    // pull the map to the region that contains it if it is currently out of view
    const [x0, y0, w, h] = REGIONS.find((r) => r.key === region)!.vb;
    const p = items[i];
    if (region !== "all" && !(p.x > x0 && p.x < x0 + w && p.y > y0 && p.y < y0 + h)) {
      const r = REGIONS.slice(1).find(({ vb }) => p.x > vb[0] && p.x < vb[0] + vb[2] && p.y > vb[1] && p.y < vb[1] + vb[3]);
      setRegion(r ? r.key : "all");
    }
  }
  function step(dir: 1 | -1) {
    const order = items.map((_, i) => i).filter(match);
    if (!order.length) return;
    const at = order.indexOf(selected);
    choose(order[(at + dir + order.length) % order.length]);
  }
  function pickTag(t: string | null) {
    setTag(t);
    const first = items.findIndex((i) => !t || i.tag === t);
    if (first >= 0 && t && items[selected]?.tag !== t) choose(first);
  }

  const sel = items[selected];
  const strokeBase = 1.7 * z;
  const dur = reduced ? "0s" : undefined;

  return (
    <section className="atlas relative overflow-hidden" aria-labelledby="apac-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[0.8rem] font-semibold tracking-wide text-[#ff9c7d]">Selected work</p>
            <h2 id="apac-title" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Telecom &amp; digital transformation across APAC
            </h2>
            <p className="mt-3 leading-relaxed text-[color:var(--atlas-soft)]">
              Signals sent from Kuala Lumpur across the region: Wi-Fi roaming hubs, policy managers, prepaid migrations, MVNE platforms, and the Maxis
              transformation I&rsquo;m leading now. Tap a pin, filter by theme, or zoom into a region.
            </p>
          </div>
          <Link href="/apac-map" className="no-print inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-[color:var(--atlas-soft)] transition hover:text-white">
            Get the shareable image <ArrowRight />
          </Link>
        </div>

        {/* controls */}
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Zoom to a region">
            {REGIONS.map((r) => (
              <button key={r.key} type="button" className="chip" aria-pressed={region === r.key} onClick={() => setRegion(r.key)}>
                {r.label}
              </button>
            ))}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by theme">
              <button type="button" className="chip" aria-pressed={tag === null} onClick={() => pickTag(null)}>
                All themes
              </button>
              {tags.map((t) => (
                <button key={t} type="button" className="chip" aria-pressed={tag === t} onClick={() => pickTag(t === tag ? null : t)}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* ---------------- map ---------------- */}
          <div ref={wrap} className="relative overflow-hidden rounded-3xl border" style={{ borderColor: "var(--atlas-line)", background: "rgba(5,20,30,.45)" }}>
            <svg
              ref={svg}
              viewBox={REGIONS[0].vb.join(" ")}
              className="block h-auto w-full"
              style={{ aspectRatio: "1.2" }}
              role="group"
              aria-label={`Map of Asia-Pacific with ${items.length} project locations, labelled A to ${labelFor(items.length - 1)}`}
            >
              {/* dot-matrix land, revealed band by band */}
              {dots.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke="var(--atlas-dot)"
                  strokeWidth="4.6"
                  strokeLinecap="round"
                  fill="none"
                  style={{ opacity: inView ? 1 : 0, transition: reduced ? "none" : `opacity .7s ease ${i * 75}ms` }}
                />
              ))}

              {/* arcs from the hub, with signal pulses travelling along them */}
              {items.map((it, i) => {
                if (i === hub) return null;
                const d = arcPath(items[hub], it);
                const on = i === selected;
                const dim = !match(i);
                return (
                  <g key={`arc-${it.id}`} style={{ opacity: dim ? 0.12 : 1, transition: "opacity .35s" }} pointerEvents="none">
                    <path
                      d={d}
                      fill="none"
                      stroke="var(--atlas-arc)"
                      strokeLinecap="round"
                      pathLength={1}
                      style={{
                        strokeWidth: on ? strokeBase * 2 : strokeBase,
                        opacity: on ? 1 : 0.5,
                        strokeDasharray: 1,
                        strokeDashoffset: inView ? 0 : 1,
                        transition: reduced ? "none" : `stroke-dashoffset 1.4s ease ${0.5 + i * 0.06}s, stroke-width .3s, opacity .3s`,
                      }}
                    />
                    {!reduced && inView && !dim && (
                      <circle r={(on ? 4.6 : 3.2) * z} fill="#fff" opacity="0">
                        <animateMotion dur={`${on ? 2.2 : 3.4 + (i % 5) * 0.55}s`} begin={`${2 + ((i * 0.43) % 2.6)}s`} repeatCount="indefinite" path={d} />
                        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" dur={`${on ? 2.2 : 3.4 + (i % 5) * 0.55}s`} begin={`${2 + ((i * 0.43) % 2.6)}s`} repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* true locations of nudged pins */}
              {items.map((it, i) =>
                Math.hypot(shown[i].x - it.x, shown[i].y - it.y) > 3 * z ? (
                  <g key={`lead-${it.id}`} pointerEvents="none" style={{ opacity: inView && match(i) ? 1 : 0, transition: "opacity .4s" }}>
                    <line x1={it.x} y1={it.y} x2={shown[i].x} y2={shown[i].y} stroke="#fff" strokeOpacity=".5" strokeWidth={1.4 * z} />
                    <circle cx={it.x} cy={it.y} r={3 * z} fill="#fff" />
                  </g>
                ) : null,
              )}

              {/* pins (selected on top) */}
              {items
                .map((_, i) => i)
                .sort((a, b) => Number(a === selected) - Number(b === selected))
                .map((i) => {
                  const it = items[i];
                  const live = i === selected || i === hub;
                  const dim = !match(i);
                  const delay = inView ? 1 + i * 0.07 : 0;
                  const r = PIN * 26 * 0.5;
                  return (
                    <g
                      key={it.id}
                      className="pin"
                      role="button"
                      tabIndex={0}
                      aria-pressed={i === selected}
                      aria-label={`${labelFor(i)}: ${it.text}`}
                      onClick={() => choose(i)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? (e.preventDefault(), choose(i)) : undefined)}
                      style={{
                        cursor: "pointer",
                        transform: `translate(${shown[i].x}px, ${shown[i].y + (inView ? 0 : -70 * z)}px)`,
                        opacity: inView ? (dim ? 0.22 : 1) : 0,
                        transition: reduced ? "none" : `transform .8s cubic-bezier(.3,1.5,.5,1) ${delay}s, opacity .5s ${dim ? 0 : delay}s`,
                      }}
                    >
                      <g style={{ transform: `scale(${z})`, transition: reduced ? "none" : "transform .95s ease" }}>
                        <title>{`${labelFor(i)}: ${it.text}`}</title>
                        {live && !reduced && (
                          <>
                            {[0, 1.2].map((dl) => (
                              <circle key={dl} cy={-11 * PIN} r={r} fill="none" stroke="var(--apac-hot)" strokeWidth="3" opacity="0">
                                <animate attributeName="r" values={`${r};${r * 3}`} dur="2.4s" begin={`${dl}s`} repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.8;0" dur="2.4s" begin={`${dl}s`} repeatCount="indefinite" />
                              </circle>
                            ))}
                          </>
                        )}
                        <circle cy={-11 * PIN} r={r * 1.1} fill="transparent" />
                        <g className="pin-body">
                          <g>
                            {live && !reduced && (
                              <animateTransform attributeName="transform" type="scale" values="1;1.13;1" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="2.4s" repeatCount="indefinite" />
                            )}
                            <PinShape label={labelFor(i)} hot={it.current} selected={i === selected} scale={PIN} />
                          </g>
                        </g>
                      </g>
                    </g>
                  );
                })}
            </svg>

            {/* selected project */}
            <div
              className="border-t p-4"
              style={{ borderColor: "var(--atlas-line)", background: "var(--atlas-card)" }}
              aria-live="polite"
            >
              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--atlas-soft)" }}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: sel.current ? "#ff7a55" : "#2f86b0", color: sel.current ? "#0a202d" : "#fff" }}>
                  {labelFor(selected)}
                </span>
                <span>{[sel.place, sel.tag].filter(Boolean).join(" · ")}</span>
                {sel.current && <span className="rounded-full bg-[#ff7a55] px-2 py-0.5 text-[10px] font-bold text-[#0a202d]">NOW</span>}
              </div>
              <p key={selected} className="mt-2 text-[0.92rem] leading-snug text-white" style={{ animation: reduced ? undefined : "route-card-in .35s ease-out backwards" }}>
                {sel.text}
              </p>
              <div className="mt-3 flex gap-2">
                <button type="button" className="chip !px-3 !py-1" onClick={() => step(-1)} aria-label="Previous project">
                  ←
                </button>
                <button type="button" className="chip !px-3 !py-1" onClick={() => step(1)} aria-label="Next project">
                  →
                </button>
              </div>
            </div>
          </div>

          {/* ---------------- stats + list ---------------- */}
          <div>
            {doc.stats.length > 0 && (
              <ul className="mb-5 grid gap-3 text-center" style={{ gridTemplateColumns: `repeat(${doc.stats.length}, minmax(0, 1fr))` }}>
                {doc.stats.map((s) => (
                  <li key={s.label} className="rounded-2xl border px-2 py-4" style={{ borderColor: "var(--atlas-line)", background: "rgba(255,255,255,.04)" }}>
                    <p className="font-display text-2xl font-semibold leading-none text-white sm:text-3xl">
                      <CountUp value={s.value} />
                    </p>
                    <p className="mt-2 text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--atlas-soft)" }}>
                      {s.label}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <ul ref={list} className="relative max-h-[30rem] space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin]" style={{ scrollbarColor: "rgba(255,255,255,.25) transparent" }}>
              {items.map((it, i) => (
                <li key={it.id} style={{ opacity: match(i) ? 1 : 0.35, transition: "opacity .3s" }}>
                  <button type="button" className="row" aria-pressed={i === selected} onClick={() => choose(i)}>
                    <span className="w-5 shrink-0 font-bold" style={{ color: it.current ? "#ff9c7d" : "#fff" }}>
                      {labelFor(i)}
                    </span>
                    <span className="min-w-0" style={{ color: "var(--atlas-ink)" }}>
                      {it.text}
                      {it.current && <span className="ml-2 inline-block rounded-full bg-[#ff7a55] px-2 py-0.5 align-middle text-[10px] font-semibold text-white">NOW</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* viewBox attribute is driven imperatively above; MAP_H is only used to document the full extent */}
      <span hidden data-extent={`${MAP_W}x${MAP_H}`} data-dur={dur} />
    </section>
  );
}
