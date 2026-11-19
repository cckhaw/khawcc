"use client";

import { useEffect, useState } from "react";

/** Sticky reading-progress bar + serif/sans toggle. Wraps the article body. */
export function ReaderChrome({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [serif, setSerif] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem("reader-font");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a stored preference after hydration
      if (v) setSerif(v === "serif");
    } catch {}
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, (h.scrollTop / max) * 100)) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  function pick(s: boolean) {
    setSerif(s);
    try {
      localStorage.setItem("reader-font", s ? "serif" : "sans");
    } catch {}
  }

  return (
    <>
      <div className="no-print fixed inset-x-0 top-14 z-40 h-0.5 bg-transparent" aria-hidden>
        <div
          className="h-full origin-left"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }}
        />
      </div>
      <div className="no-print mb-6 flex items-center justify-end gap-1 text-[12px]" role="group" aria-label="Typeface">
        <span className="mr-2 font-mono text-dim">Typeface</span>
        {[
          { s: false, l: "Sans" },
          { s: true, l: "Serif" },
        ].map((o) => (
          <button
            key={o.l}
            type="button"
            aria-pressed={serif === o.s}
            onClick={() => pick(o.s)}
            className={`rounded-full border px-3 py-1 transition ${
              serif === o.s ? "border-fg bg-fg text-bg" : "border-line text-muted hover:text-fg"
            } ${o.s ? "font-serif" : ""}`}
          >
            {o.l}
          </button>
        ))}
      </div>
      <div className={serif ? "prose-serif-wrap" : ""} data-serif={serif}>
        {children}
      </div>
    </>
  );
}
