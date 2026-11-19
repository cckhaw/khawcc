"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export type FilterItem = { id: number; category: string; status: string; node: ReactNode };

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "beta", label: "Beta / WIP" },
] as const;

export function ProjectFilter({ items, categories }: { items: FilterItem[]; categories: string[] }) {
  const [cat, setCat] = useState("All");
  const [st, setSt] = useState<(typeof STATUS_FILTERS)[number]["key"]>("all");

  const shown = items.filter(
    (i) =>
      (cat === "All" || i.category === cat) &&
      (st === "all" || (st === "live" ? i.status === "live" : i.status === "beta" || i.status === "wip")),
  );

  const pill = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-[13px] transition ${
      active ? "border-fg bg-fg text-bg" : "border-line bg-card text-muted hover:text-fg"
    }`;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {["All", ...categories].map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} className={pill(cat === c)} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((s) => (
            <button key={s.key} type="button" aria-pressed={st === s.key} className={pill(st === s.key)} onClick={() => setSt(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="glass p-8 text-center text-sm text-muted">No projects match these filters yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((i) => (
            <div key={i.id}>{i.node}</div>
          ))}
        </div>
      )}
    </div>
  );
}
