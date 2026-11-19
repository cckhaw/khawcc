"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon, LockIcon, MenuIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/cv", label: "Experience (CV)" },
  { href: "/projects", label: "Projects (*.khaw.cc)" },
  { href: "/book", label: "Thinking in Signals" },
];

export function NavBar({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(false);

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
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-line bg-[var(--nav)] backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8" aria-label="Primary">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" onClick={() => setOpen(false)}>
          <span className="font-mono text-[15px]">
            {initials}
            <span className="text-accent">.</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active(l.href) ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-[13px] transition ${
                  active(l.href) ? "bg-card text-fg" : "text-muted hover:text-fg"
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
              className="hidden items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[11px] font-medium text-accent sm:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Admin Mode
            </Link>
          )}
          <Link
            href={admin ? "/admin" : "/admin/login"}
            aria-label="Admin"
            title="Admin"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-dim transition hover:text-fg"
          >
            <LockIcon />
          </Link>
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
