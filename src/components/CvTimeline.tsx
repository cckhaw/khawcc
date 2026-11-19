"use client";

import { useEffect, useMemo, useState } from "react";
import type { Experience } from "@/db/schema";
import { fmtPeriod } from "@/lib/format";
import { ChevronDown } from "./icons";

/** Experience rows arrive with Markdown pre-rendered on the server. */
export type CvRole = Omit<Experience, "summary"> & { summaryNode: React.ReactNode };

export function CvTimeline({ roles }: { roles: CvRole[] }) {
  const tags = useMemo(() => ["All", ...Array.from(new Set(roles.map((r) => r.domainTag)))], [roles]);
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (window.location.search.includes("print=1")) {
      const t = setTimeout(() => window.print(), 450);
      return () => clearTimeout(t);
    }
  }, []);

  const allOpen = roles.every((r) => r.highlights.length === 0 || open[r.id]);
  function toggleAll() {
    setOpen(Object.fromEntries(roles.map((r) => [r.id, !allOpen])));
  }

  return (
    <div>
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by domain">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={filter === t}
              onClick={() => setFilter(t)}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] transition ${
                filter === t ? "border-fg bg-fg text-bg" : "border-line bg-card text-muted hover:text-fg"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button type="button" onClick={toggleAll} className="text-[13px] text-muted hover:text-fg">
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <ol className="relative space-y-5 border-l border-line pl-6 sm:pl-8">
        {roles.map((r) => {
          const hidden = filter !== "All" && r.domainTag !== filter;
          const isOpen = Boolean(open[r.id]);
          return (
            <li key={r.id} hidden={hidden} className={`cv-role relative ${hidden ? "cv-filtered" : ""}`}>
              <span
                className={`absolute -left-[31px] top-7 h-2.5 w-2.5 rounded-full border-2 sm:-left-[39px] ${
                  r.isCurrent ? "border-accent bg-accent" : "border-dim bg-bg"
                } no-print`}
              />
              <article className="glass p-6">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold leading-snug tracking-tight">{r.roleTitle}</h3>
                    <p className="mt-0.5 text-sm">
                      <span className="text-accent">{r.company}</span>
                      {r.location && <span className="text-dim"> · {r.location}</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-muted">{fmtPeriod(r.startDate, r.endDate, r.isCurrent)}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-dim">{r.domainTag}</p>
                  </div>
                </div>

                {r.summaryNode && <div className="mt-3 text-muted">{r.summaryNode}</div>}

                {r.highlights.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
                      aria-expanded={isOpen}
                      className="no-print mt-4 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-fg"
                    >
                      {isOpen ? "Hide" : "Show"} achievements ({r.highlights.length})
                      <ChevronDown className={`transition ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <ul
                      hidden={!isOpen}
                      className="cv-details mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted marker:text-dim"
                    >
                      {r.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
