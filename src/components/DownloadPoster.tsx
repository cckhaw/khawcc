"use client";

import { toPng } from "html-to-image";
import { useState } from "react";

/** Renders the poster element to a PNG in the browser and downloads it. */
export function DownloadPoster({ targetId = "apac-poster", filename = "telecom-digital-transformation-apac.png" }: { targetId?: string; filename?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    const el = document.getElementById(targetId);
    if (!el) return;
    setBusy(true);
    setError("");
    try {
      await document.fonts?.ready;
      const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      a.click();
    } catch {
      setError("Couldn’t create the image. Try a screenshot instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <button type="button" className="btn btn-primary" onClick={run} disabled={busy}>
        {busy ? "Creating image…" : "Download image (PNG)"}
      </button>
      {error && <span className="text-sm text-danger" role="status">{error}</span>}
    </div>
  );
}
