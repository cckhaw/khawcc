"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/cv", label: "Experience (CV)" },
  { href: "/projects", label: "Projects (*.khaw.cc)" },
  { href: "/book", label: "Book" },
];

export function NavBar({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  // Thin reading-progress line under the bar (chapters have their own reader progress, so skip those).
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0})`;
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
  }, [pathname]);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((d: { admin: boolean }) => alive && setAdmin(Boolean(d.admin)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname]);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="no-print sticky top-0 z-50 border-b border-line bg-[var(--nav)] backdrop-blur-xl backdrop-saturate-150">
      {!pathname.startsWith("/book/") && !pathname.startsWith("/admin") && (
        <div
          ref={bar}
          aria-hidden
          className="pointer-events-none absolute -bottom-px left-0 h-[2px] w-full origin-left"
          style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-2))", transform: "scaleX(0)" }}
        />
      )}
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8" aria-label="Primary">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" onClick={() => setOpen(false)}>
          <span className="font-display text-[17px] font-semibold tracking-tight">{name}</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active(l.href) ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-[13px] transition ${
                  active(l.href) ? "bg-accent/10 text-accent font-medium" : "text-muted hover:text-fg"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {admin && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent sm:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Admin Mode
            </Link>
          )}
          <ThemeToggle />
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-muted md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line px-5 pb-4 md:hidden">
          <ul className="flex flex-col py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-2 py-2.5 text-sm ${active(l.href) ? "text-fg" : "text-muted"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {admin && (
              <li>
                <Link href="/admin" onClick={() => setOpen(false)} className="block px-2 py-2.5 text-sm text-accent">
                  Admin Mode →
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
