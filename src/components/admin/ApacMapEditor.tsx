"use client";

import { useRef, useState } from "react";
import { APAC_BASE_CSS, MAP_BORDERS, MAP_LAND, PinShape } from "@/components/ApacMap";
import { labelFor, MAP_H, MAP_W, type ApacDoc, type ApacItem } from "@/lib/apac";
import { saveApacMap } from "@/lib/actions/apac";
import { ArrowDown, ArrowUp } from "../icons";
import { SubmitButton } from "./ui";

const round = (n: number) => Math.round(n * 10) / 10;
const clampX = (n: number) => Math.min(MAP_W, Math.max(0, n));
const clampY = (n: number) => Math.min(MAP_H, Math.max(0, n));

export function ApacMapEditor({ initial }: { initial: ApacDoc }) {
  const [doc, setDoc] = useState<ApacDoc>(initial);
  const [sel, setSel] = useState(0);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<number | null>(null);

  const setItem = (i: number, p: Partial<ApacItem>) =>
    setDoc((d) => ({ ...d, items: d.items.map((it, k) => (k === i ? { ...it, ...p } : it)) }));

  /** Pointer position in map units. */
  function toMap(e: { clientX: number; clientY: number }) {
    const el = svg.current!;
    const pt = el.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = pt.matrixTransform(el.getScreenCTM()!.inverse());
    return { x: round(clampX(m.x)), y: round(clampY(m.y)) };
  }

  function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= doc.items.length) return;
    setDoc((s) => {
      const items = [...s.items];
      [items[i], items[j]] = [items[j], items[i]];
      return { ...s, items };
    });
    setSel(j);
  }

  function addItem() {
    setDoc((d) => ({
      ...d,
      items: [...d.items, { id: `n-${Date.now().toString(36)}`, text: "", place: "", tag: "", current: false, visible: true, x: MAP_W / 2, y: MAP_H / 2 }],
    }));
    setSel(doc.items.length);
  }

  const labels = (() => {
    // Letters follow the visible order, exactly like the public map.
    let n = 0;
    return doc.items.map((it) => (it.visible ? labelFor(n++) : "–"));
  })();

  return (
    <form action={saveApacMap} noValidate className="space-y-8">
      <style dangerouslySetInnerHTML={{ __html: APAC_BASE_CSS }} />
      <input type="hidden" name="doc" value={JSON.stringify(doc)} />
      <datalist id="apac-tags">{Array.from(new Set(doc.items.map((x) => x.tag).filter(Boolean))).map((t) => <option key={t} value={t} />)}</datalist>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.05fr]">
        {/* ---- Map: drag pins, or click to place the selected pin ---- */}
        <div className="apac sticky top-20 overflow-hidden rounded-3xl border border-line" style={{ background: "var(--apac-sea)" }}>
          <svg
            ref={svg}
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="block h-auto w-full touch-none select-none"
            role="application"
            aria-label="Map editor. Drag a pin, or click the map to move the selected pin."
            onPointerMove={(e) => {
              if (drag.current !== null) setItem(drag.current, toMap(e));
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerLeave={() => (drag.current = null)}
            onClick={(e) => {
              if ((e.target as Element).closest("[data-pin]")) return;
              if (doc.items[sel]) setItem(sel, toMap(e));
            }}
            style={{ cursor: "crosshair" }}
          >
            <path d={MAP_LAND} fill="var(--apac-land)" />
            <path d={MAP_BORDERS} fill="none" stroke="var(--apac-line)" strokeWidth="0.8" />
            {doc.items.map((it, i) => (
              <g
                key={it.id}
                data-pin
                transform={`translate(${it.x} ${it.y})`}
                opacity={it.visible ? 1 : 0.35}
                style={{ cursor: "grab" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as SVGGElement).setPointerCapture?.(e.pointerId);
                  drag.current = i;
                  setSel(i);
                }}
              >
                <PinShape label={labels[i]} hot={it.current} selected={sel === i} />
              </g>
            ))}
          </svg>
          <p className="border-t border-line px-4 py-2 text-xs" style={{ color: "var(--apac-soft)" }}>
            Drag a pin to move it, or select an item and click the map. The pin&rsquo;s tip marks the location.
          </p>
        </div>

        {/* ---- Items ---- */}
        <div className="space-y-4">
          <div className="glass p-5">
            <h2 className="mb-3 text-sm font-semibold">Headline numbers</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {doc.stats.map((s, i) => (
                <div key={i} className="space-y-1.5">
                  <input className="field" aria-label={`Number ${i + 1}`} value={s.value} maxLength={20} onChange={(e) => setDoc((d) => ({ ...d, stats: d.stats.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)) }))} />
                  <input className="field text-[13px]" aria-label={`Label ${i + 1}`} value={s.label} maxLength={40} onChange={(e) => setDoc((d) => ({ ...d, stats: d.stats.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) }))} />
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-3">
            {doc.items.map((it, i) => (
              <li
                key={it.id}
                className={`glass p-4 ${sel === i ? "!border-accent" : ""} ${it.visible ? "" : "opacity-70"}`}
                onFocusCapture={() => setSel(i)}
                onClick={() => setSel(i)}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: it.current ? "var(--accent)" : "#3a4350" }}>
                    {labels[i]}
                  </span>
                  <textarea
                    className="field min-h-[3.5rem] flex-1 text-[14px]"
                    aria-label={`Project ${labels[i]} description`}
                    value={it.text}
                    maxLength={700}
                    onChange={(e) => setItem(i, { text: e.target.value })}
                    placeholder="What you did, for whom…"
                  />
                  <div className="flex flex-col gap-1">
                    <button type="button" className="btn btn-sm !px-2" disabled={i === 0} aria-label="Move up" onClick={() => move(i, -1)}><ArrowUp width={13} height={13} /></button>
                    <button type="button" className="btn btn-sm !px-2" disabled={i === doc.items.length - 1} aria-label="Move down" onClick={() => move(i, 1)}><ArrowDown width={13} height={13} /></button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                  <input className="field !w-40 !py-1.5" aria-label="Place" placeholder="Place" value={it.place} maxLength={60} onChange={(e) => setItem(i, { place: e.target.value })} />
                  <input className="field !w-52 !py-1.5" aria-label="Theme" placeholder="Theme (filter chip)" list="apac-tags" value={it.tag} maxLength={40} onChange={(e) => setItem(i, { tag: e.target.value })} />
                  <label className="flex items-center gap-1.5"><input type="checkbox" checked={it.current} onChange={(e) => setItem(i, { current: e.target.checked })} /> Highlight (now)</label>
                  <label className="flex items-center gap-1.5"><input type="checkbox" checked={it.visible} onChange={(e) => setItem(i, { visible: e.target.checked })} /> Visible</label>
                  <details className="text-dim">
                    <summary className="cursor-pointer">Position</summary>
                    <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs">
                      X <input type="number" className="field !w-20 !py-1" value={it.x} min={0} max={MAP_W} step="any" onChange={(e) => setItem(i, { x: round(clampX(Number(e.target.value))) })} />
                      Y <input type="number" className="field !w-20 !py-1" value={it.y} min={0} max={MAP_H} step="any" onChange={(e) => setItem(i, { y: round(clampY(Number(e.target.value))) })} />
                    </div>
                  </details>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger ml-auto"
                    onClick={() => {
                      if (!window.confirm(`Remove project ${labels[i]}?`)) return;
                      setDoc((d) => ({ ...d, items: d.items.filter((_, k) => k !== i) }));
                      setSel(0);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="btn" onClick={addItem}>+ Add project</button>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-full border border-line bg-[var(--nav)] px-4 py-3 backdrop-blur-xl">
        <SubmitButton>Save map</SubmitButton>
        <span className="text-xs text-dim">Letters follow the order of visible projects.</span>
      </div>
    </form>
  );
}
