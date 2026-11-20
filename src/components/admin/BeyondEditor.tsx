"use client";

import { useRef, useState } from "react";
import { MAX_BEYOND_PHOTOS, type BeyondDoc } from "@/lib/beyond";
import { saveBeyond } from "@/lib/actions/beyond";
import { uploadImage } from "@/lib/image-upload";
import { ArrowDown, ArrowUp } from "../icons";
import { SubmitButton } from "./ui";

export function BeyondEditor({ initial }: { initial: BeyondDoc }) {
  const [doc, setDoc] = useState<BeyondDoc>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const set = (p: Partial<BeyondDoc>) => setDoc((d) => ({ ...d, ...p }));
  const setStat = (i: number, p: Partial<BeyondDoc["stats"][number]>) => set({ stats: doc.stats.map((s, k) => (k === i ? { ...s, ...p } : s)) });
  const setPhoto = (i: number, p: Partial<BeyondDoc["photos"][number]>) => set({ photos: doc.photos.map((x, k) => (k === i ? { ...x, ...p } : x)) });
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= doc.photos.length) return;
    const c = [...doc.photos];
    [c[i], c[j]] = [c[j], c[i]];
    set({ photos: c });
  };

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMsg("");
    try {
      const added: BeyondDoc["photos"] = [];
      for (const f of Array.from(files)) {
        if (doc.photos.length + added.length >= MAX_BEYOND_PHOTOS) break;
        added.push({ url: await uploadImage(f, 900), alt: "", href: "" });
      }
      set({ photos: [...doc.photos, ...added] });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }

  return (
    <form action={saveBeyond} className="space-y-6">
      <input type="hidden" name="doc" value={JSON.stringify(doc)} />

      <div className="glass space-y-4 p-4 sm:p-5">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={doc.enabled} onChange={(e) => set({ enabled: e.target.checked })} /> Show this strip on the home page
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-muted">Heading</span>
          <input className="field" value={doc.heading} maxLength={80} onChange={(e) => set({ heading: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-muted">Short intro</span>
          <textarea className="field" rows={3} value={doc.intro} maxLength={500} onChange={(e) => set({ intro: e.target.value })} />
        </label>
      </div>

      <div className="glass p-4 sm:p-5">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">Numbers (up to 4)</h2>
          <p className="text-xs text-dim">Type your own figures from Strava, e.g. “1,200 km” / “ridden this year”.</p>
        </div>
        <div className="space-y-2">
          {doc.stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input className="field !w-28 shrink-0" aria-label={`Number ${i + 1}`} value={s.value} maxLength={20} onChange={(e) => setStat(i, { value: e.target.value })} />
              <input className="field min-w-0 flex-1" aria-label={`Label ${i + 1}`} value={s.label} maxLength={40} onChange={(e) => setStat(i, { label: e.target.value })} />
              <button type="button" className="btn btn-sm btn-danger !px-2.5" aria-label="Remove" onClick={() => set({ stats: doc.stats.filter((_, k) => k !== i) })}>×</button>
            </div>
          ))}
        </div>
        {doc.stats.length < 4 && (
          <button type="button" className="btn btn-sm mt-3" onClick={() => set({ stats: [...doc.stats, { value: "", label: "" }] })}>+ Add number</button>
        )}
      </div>

      <div className="glass p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">Photos ({doc.photos.length}/{MAX_BEYOND_PHOTOS})</h2>
          <p className="text-xs text-dim">Save a photo from Instagram, upload it here, and paste the post link so it opens on click.</p>
        </div>
        <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => upload(e.target.files)} />
        <button type="button" className="btn btn-sm" disabled={busy || doc.photos.length >= MAX_BEYOND_PHOTOS} onClick={() => file.current?.click()}>
          {busy ? "Uploading…" : "Upload photos"}
        </button>
        {msg && <p role="status" className="mt-2 text-sm text-danger">{msg}</p>}
        {doc.photos.length > 0 && (
          <ul className="mt-4 space-y-3">
            {doc.photos.map((p, i) => (
              <li key={`${p.url}-${i}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                <img src={p.url} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-line object-cover" />
                <div className="min-w-0 flex-1 basis-48 space-y-1.5">
                  <input className="field !py-1.5 text-[13px]" placeholder="Short description (for accessibility)" aria-label="Description" value={p.alt} maxLength={160} onChange={(e) => setPhoto(i, { alt: e.target.value })} />
                  <input className="field !py-1.5 font-mono text-[12px]" placeholder="Instagram post link (https://instagram.com/p/…)" aria-label="Post link" value={p.href} maxLength={500} onChange={(e) => setPhoto(i, { href: e.target.value })} />
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" className="btn btn-sm !px-2" disabled={i === 0} aria-label="Move earlier" onClick={() => move(i, -1)}><ArrowUp width={13} height={13} /></button>
                  <button type="button" className="btn btn-sm !px-2" disabled={i === doc.photos.length - 1} aria-label="Move later" onClick={() => move(i, 1)}><ArrowDown width={13} height={13} /></button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => set({ photos: doc.photos.filter((_, k) => k !== i) })}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-full border border-line bg-[var(--nav)] px-4 py-3 backdrop-blur-xl">
        <SubmitButton>Save</SubmitButton>
        <span className="text-xs text-dim">Strava and Instagram links come from Profile.</span>
      </div>
    </form>
  );
}
