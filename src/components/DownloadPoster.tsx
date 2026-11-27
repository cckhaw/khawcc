"use client";

import { toPng } from "html-to-image";
import { useState } from "react";

/**
 * Renders the poster element to a PNG in the browser.
 * Desktop: downloads the file. Phones/tablets (where `download` links are unreliable, especially iOS Safari):
 * opens the share sheet ("Save Image", WhatsApp, LinkedIn...) and, if that is unavailable, shows the image to
 * press-and-hold and save.
 */
export function DownloadPoster({ targetId = "apac-poster", filename = "telecom-digital-transformation-apac.png" }: { targetId?: string; filename?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");

  async function run() {
    const el = document.getElementById(targetId);
    if (!el) return;
    setBusy(true);
    setError("");
    setPreview("");
    try {
      await document.fonts?.ready;
      const opts = { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true };
      // Safari often renders the first pass without images/fonts; a throw-away pass warms them up.
      await toPng(el, opts).catch(() => undefined);
      const dataUrl = await toPng(el, opts);
      const blob = await (await fetch(dataUrl)).blob();
      const touch = window.matchMedia?.("(pointer: coarse)").matches;

      if (touch) {
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: "Telecom & digital transformation across APAC" });
            return;
          } catch (e) {
            if (e instanceof DOMException && e.name === "AbortError") return; // they closed the sheet
          }
        }
        setPreview(dataUrl); // last resort: press and hold the picture
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } catch (e) {
      setError(`Couldn’t create the image (${e instanceof Error ? e.message.slice(0, 80) : "unknown error"}). Try a screenshot instead.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" onClick={run} disabled={busy}>
          {busy ? "Creating image…" : "Download image (PNG)"}
        </button>
        {error && <span className="text-sm text-danger" role="status">{error}</span>}
      </div>
      {preview && (
        <div className="mt-4 max-w-md">
          <p className="mb-2 text-sm text-muted" role="status">
            Press and hold the picture, then choose <strong>Save to Photos</strong> (or Save image).
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- a one-off data URL made in the browser */}
          <img src={preview} alt="Telecom and digital transformation across APAC map, ready to save" className="w-full rounded-xl border border-line" />
        </div>
      )}
    </div>
  );
}
