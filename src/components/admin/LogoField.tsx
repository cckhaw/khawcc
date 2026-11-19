"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/image-upload";
import { ProjectLogo } from "../ProjectLogo";

/**
 * Logo picker: paste an https address or upload an image.
 * The form value lives in a plain <input name=…>, so it works with form actions and
 * programmatic fills (dispatch an `input` event to refresh the preview).
 */
export function LogoField({ name = "logoUrl", label, defaultValue = "", fallbackName }: { name?: string; label: string; defaultValue?: string; fallbackName: string }) {
  const input = useRef<HTMLInputElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function set(v: string) {
    if (input.current) input.current.value = v;
    setUrl(v);
  }

  async function onFile(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    setMsg("");
    try {
      set(await uploadImage(f, 512));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }

  return (
    <div role="group" aria-label={label}>
      <span className="mb-1.5 block text-[13px] font-medium text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        <ProjectLogo name={fallbackName || "?"} logoUrl={url} size={48} />
        <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        <button type="button" className="btn btn-sm" disabled={busy} onClick={() => file.current?.click()}>
          {busy ? "Uploading…" : "Upload"}
        </button>
        {url && (
          <button type="button" className="btn btn-sm btn-danger" onClick={() => set("")}>
            Remove
          </button>
        )}
      </div>
      <input
        ref={input}
        name={name}
        defaultValue={defaultValue}
        onInput={(e) => setUrl(e.currentTarget.value)}
        placeholder="…or paste an image address (https://…)"
        aria-label={`${label} address`}
        className="field mt-2 w-full font-mono text-[13px]"
      />
      {msg && <p role="status" className="mt-1 text-xs text-danger">{msg}</p>}
      <span className="mt-1 block text-xs text-dim">Shown as a small square. Leave blank for an initial letter.</span>
    </div>
  );
}
