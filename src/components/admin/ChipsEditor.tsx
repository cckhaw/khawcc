"use client";

import { useState } from "react";

/** Editable list of short items (competencies, tools, certifications) with a hidden JSON field. */
export function ChipsEditor({ name, initial, placeholder = "Type and press Enter" }: { name: string; initial: string[]; placeholder?: string }) {
  const [items, setItems] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");

  function add() {
    const parts = draft
      .split(/[\n;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    setItems((xs) => Array.from(new Set([...xs, ...parts])));
    setDraft("");
  }
  const move = (i: number, d: -1 | 1) =>
    setItems((xs) => {
      const j = i + d;
      if (j < 0 || j >= xs.length) return xs;
      const c = [...xs];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  const edit = (i: number, v: string) => setItems((xs) => xs.map((x, k) => (k === i ? v : x)));

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items.map((s) => s.trim()).filter(Boolean))} />
      {items.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <input
                value={it}
                onChange={(e) => edit(i, e.target.value)}
                aria-label={`Item ${i + 1}`}
                className="field min-w-0 flex-1 !py-1.5 text-[14px]"
              />
              <button type="button" className="btn btn-sm !px-2" disabled={i === 0} aria-label="Move up" onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="btn btn-sm !px-2" disabled={i === items.length - 1} aria-label="Move down" onClick={() => move(i, 1)}>↓</button>
              <button type="button" className="btn btn-sm btn-danger !px-2.5" aria-label={`Remove ${it}`} onClick={() => setItems((xs) => xs.filter((_, k) => k !== i))}>×</button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          aria-label="Add an item"
          className="field min-w-0 flex-1 !py-1.5 text-[14px]"
        />
        <button type="button" className="btn btn-sm shrink-0" onClick={add}>Add</button>
      </div>
    </div>
  );
}
