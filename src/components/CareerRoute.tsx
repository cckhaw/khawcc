"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fmtPeriod } from "@/lib/format";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { CompanyLogos } from "./CompanyLogos";

export type RouteRole = {
  id: number;
  roleTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  logoUrl: string;
  logoUrl2: string;
  blurb: string;
};

const W = 1100;
const H = 250;
const MID = 122;
const AMP = 20;
const yearOf = (d: string) => Number(d.slice(0, 4)) + (Number(d.slice(5, 7)) - 1) / 12;
const shortName = (c: string) => c.split(" & ")[0].replace(/ (Limited|Networks)$/i, "");

/** A wavy "route" through the career: nodes appear as the line draws itself; hover or tap a stop for details. */
export function CareerRoute({ roles }: { roles: RouteRole[] }) {
  const reduced = useReducedMotion();
  const ordered = useMemo(() => [...roles].sort((a, b) => a.startDate.localeCompare(b.startDate)), [roles]);
  const [active, setActive] = useState(Math.max(0, ordered.length - 1));
  const [drawn, setDrawn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced || !("IntersectionObserver" in window)) {
      setDrawn(true); // eslint-disable-line react-hooks/set-state-in-effect -- show everything at once
      return;
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setDrawn(true), io.disconnect()), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const { xs, path } = useMemo(() => {
    const t0 = ordered.length ? yearOf(ordered[0].startDate) : 0;
    const t1 = new Date().getFullYear() + 0.9;
    let xs = ordered.map((r) => 60 + ((yearOf(r.startDate) - t0) / Math.max(1, t1 - t0)) * (W - 160));
    for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + 84); // keep labels apart
    const last = xs[xs.length - 1] ?? 0;
    if (last > W - 70) xs = xs.map((x) => 60 + ((x - 60) / (last - 60)) * (W - 130));
    const y = (x: number) => MID + AMP * Math.sin((x / W) * Math.PI * 3.2);
    const pts: string[] = [];
    for (let x = 20; x <= W - 20; x += 8) pts.push(`${pts.length ? "L" : "M"}${x} ${y(x).toFixed(1)}`);
    return { xs: xs.map((x) => ({ x, y: y(x) })), path: pts.join("") };
  }, [ordered]);

  if (!ordered.length) return null;
  const a = ordered[active];

  return (
    <div ref={ref} className="route">
      <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto min-w-[860px] w-full" role="group" aria-label="Career route, oldest to newest">
          <path d={path} fill="none" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="round" />
          <path
            d={path}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={1}
            style={{ strokeDasharray: 1, strokeDashoffset: drawn ? 0 : 1, transition: reduced ? "none" : "stroke-dashoffset 2.6s cubic-bezier(.55,.1,.3,1)" }}
          />
          {ordered.map((r, i) => {
            const { x, y } = xs[i];
            const up = i % 2 === 0;
            const on = i === active;
            const delay = reduced ? 0 : (x / W) * 2.4;
            return (
              <g
                key={r.id}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`${r.company}, ${r.roleTitle}, ${fmtPeriod(r.startDate, r.endDate, r.isCurrent)}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? (e.preventDefault(), setActive(i)) : undefined)}
                style={{ cursor: "pointer", outline: "none", opacity: drawn ? 1 : 0, transition: reduced ? "none" : `opacity .5s ${delay}s` }}
              >
                <line x1={x} y1={y} x2={x} y2={up ? y - 34 : y + 34} stroke="var(--line-strong)" strokeWidth="1" />
                <circle cx={x} cy={y} r={on ? 9 : 6.5} fill={on ? "var(--accent)" : "var(--bg)"} stroke="var(--accent)" strokeWidth="2.5" style={{ transition: "r .25s, fill .25s" }} />
                {r.isCurrent && !reduced && (
                  <circle cx={x} cy={y} r="9" fill="none" stroke="var(--accent)" strokeWidth="2">
                    <animate attributeName="r" values="9;22" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )}
                <text x={x < 110 ? 12 : x} y={up ? y - 56 : y + 58} textAnchor={x < 110 ? "start" : "middle"} fontSize="13" fontWeight={on ? 700 : 600} fill={on ? "var(--accent)" : "var(--fg)"} style={{ fontFamily: "var(--font-sans)" }}>
                  {shortName(r.company)}
                </text>
                <text x={x < 110 ? 12 : x} y={up ? y - 41 : y + 73} textAnchor={x < 110 ? "start" : "middle"} fontSize="11" fill="var(--dim)" style={{ fontFamily: "var(--font-mono)" }}>
                  {r.startDate.slice(0, 4)}
                </text>
                <circle cx={x} cy={y} r="22" fill="transparent" />
              </g>
            );
          })}
        </svg>
      </div>

      <div key={a.id} className="route-card glass mt-2 flex flex-wrap items-start gap-4 p-5">
        <CompanyLogos name={a.company} logos={[a.logoUrl, a.logoUrl2]} size={44} />
        <div className="min-w-0 flex-1 basis-64">
          <p className="font-display text-lg font-semibold leading-snug">{a.roleTitle}</p>
          <p className="mt-0.5 text-sm">
            <span className="text-accent">{a.company}</span>
            <span className="text-dim"> · {a.location}</span>
          </p>
          {a.blurb && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{a.blurb}</p>}
        </div>
        <p className="font-mono text-xs text-dim">{fmtPeriod(a.startDate, a.endDate, a.isCurrent)}</p>
      </div>
    </div>
  );
}
