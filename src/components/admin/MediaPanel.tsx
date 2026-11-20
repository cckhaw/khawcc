"use client";

import { useRef, useState } from "react";
import { MAX_MEDIA_PER_CHAPTER, parseYouTubeId, isSafeImageUrl, youtubeThumb, type ChapterMedia } from "@/lib/media";
import { uploadImage } from "@/lib/image-upload";
import { ArrowDown, ArrowUp } from "../icons";

export function MediaPanel({
  initial,
  onInsert,
}: {
  initial: ChapterMedia[];
  /** Insert a markdown snippet into the chapter text at the cursor. */
  onInsert: (md: string) => void;
}) {
  const [items, setItems] = useState<ChapterMedia[]>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const full = items.length >= MAX_MEDIA_PER_CHAPTER;

  const add = (m: ChapterMedia) => setItems((xs) => [...xs, m].slice(0, MAX_MEDIA_PER_CHAPTER));
  const patch = (i: number, p: Partial<ChapterMedia>) => setItems((xs) => xs.map((x, k) => (k === i ? { ...x, ...p } : x)));
  const move = (i: number, d: -1 | 1) =>
    setItems((xs) => {
      const j = i + d;
      if (j < 0 || j >= xs.length) return xs;
      const c = [...xs];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  // Not <form>s: this panel lives inside the chapter form, and forms can't nest.
  const enter = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fn();
    }
  };
  function addImageUrl() {
    if (!isSafeImageUrl(imgUrl.trim())) return setMsg("Enter an https image URL.");
    add({ type: "image", url: imgUrl.trim(), caption: "" });
    setImgUrl("");
    setMsg("");
  }
  function addYoutube() {
    const id = parseYouTubeId(ytUrl);
    if (!id) return setMsg("That doesn’t look like a YouTube link.");
    add({ type: "youtube", url: `https://www.youtube.com/watch?v=${id}`, caption: "" });
    setYtUrl("");
    setMsg("");
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMsg("");
    try {
      for (const f of Array.from(files)) {
        if (items.length >= MAX_MEDIA_PER_CHAPTER) break;
        if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
          setMsg(`${f.name}: use JPEG, PNG or WebP.`);
          continue;
        }
        try {
          add({ type: "image", url: await uploadImage(f, 1800), caption: "" });
        } catch (e) {
          setMsg(`${f.name}: ${e instanceof Error ? e.message : "Upload failed."}`);
        }
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section className="glass p-5" aria-label="Pictures and videos">
      <input type="hidden" name="media" value={JSON.stringify(items)} />
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Pictures &amp; videos</h2>
        <p className="text-xs text-dim">
          {items.length}/{MAX_MEDIA_PER_CHAPTER} · shown with the chapter · save the chapter to keep changes
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => upload(e.target.files)} />
          <button type="button" className="btn w-full" disabled={busy || full} onClick={() => fileRef.current?.click()}>
            {busy ? "Uploading…" : "Upload pictures"}
          </button>
          <p className="mt-1 text-xs text-dim">Resized to 1800px and stored securely.</p>
        </div>
        <div className="flex gap-2">
          <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} onKeyDown={enter(addImageUrl)} placeholder="Image URL (https://…)" className="field !py-1.5 text-[13px]" disabled={full} />
          <button type="button" className="btn btn-sm shrink-0" disabled={full} onClick={addImageUrl}>Add</button>
        </div>
        <div className="flex gap-2">
          <input value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} onKeyDown={enter(addYoutube)} placeholder="YouTube link" className="field !py-1.5 text-[13px]" disabled={full} />
          <button type="button" className="btn btn-sm shrink-0" disabled={full} onClick={addYoutube}>Add</button>
        </div>
      </div>
      {msg && <p role="status" className="mt-3 text-sm text-danger">{msg}</p>}

      {items.length > 0 && (
        <ul className="mt-5 space-y-3">
          {items.map((m, i) => {
            const yt = m.type === "youtube" ? parseYouTubeId(m.url) : null;
            return (
              <li key={`${m.url}-${i}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3">
                <div className="flex flex-col gap-1">
                  <button type="button" className="btn btn-sm !px-2" disabled={i === 0} aria-label="Move up" onClick={() => move(i, -1)}><ArrowUp width={13} height={13} /></button>
                  <button type="button" className="btn btn-sm !px-2" disabled={i === items.length - 1} aria-label="Move down" onClick={() => move(i, 1)}><ArrowDown width={13} height={13} /></button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of arbitrary sources */}
                <img src={yt ? youtubeThumb(yt) : m.url} alt="" className="h-16 w-24 shrink-0 rounded-lg border border-line object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[11px] text-dim">{m.type === "youtube" ? "▶ YouTube · " : "Image · "}{m.url}</p>
                  <input value={m.caption} onChange={(e) => patch(i, { caption: e.target.value })} placeholder="Caption (optional)" maxLength={300} className="field mt-1 !py-1.5 text-[13px]" />
                </div>
                {m.type === "image" && (
                  <button type="button" className="btn btn-sm" onClick={() => onInsert(`\n\n![${m.caption || "Picture"}](${m.url})\n\n`)}>
                    Insert in text
                  </button>
                )}
                <button type="button" className="btn btn-sm btn-danger" onClick={() => setItems((xs) => xs.filter((_, k) => k !== i))}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
