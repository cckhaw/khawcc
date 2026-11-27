"use client";

import { useEffect, useRef, useState } from "react";

const PARSE = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/;

/** Counts a number up from zero the first time it scrolls into view ("1,234 km" keeps its prefix/suffix). */
export function CountUp({ value, duration = 1500, className }: { value: string; duration?: number; className?: string }) {
  const m = PARSE.exec(value);
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !m || !("IntersectionObserver" in window) || document.documentElement.dataset.motion === "off") return;
    const target = Number(m[2].replace(/,/g, ""));
    const decimals = (m[2].split(".")[1] ?? "").length;
    const withCommas = m[2].includes(",");
    let raf = 0;
    const fmt = (n: number) => (withCommas ? n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : n.toFixed(decimals));
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - k, 3);
          setShown(`${m[1]}${fmt(target * eased)}${m[3]}`);
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- m is derived from value
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden>{shown ?? value}</span>
    </span>
  );
}
