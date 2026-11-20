import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { getSession } from "@/lib/auth";
import { hasDb } from "@/db";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/skills", label: "Competencies" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/book", label: "Book" },
  { href: "/admin/map", label: "APAC map" },
  { href: "/admin/beyond", label: "Beyond the desk" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) return <>{children}</>; // login page renders its own shell

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
      {!hasDb() && (
        <p className="mb-6 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          <strong>Demo mode:</strong> <code className="font-mono">DATABASE_URL</code> is not set, so the site is serving
          bundled seed content and edits cannot be saved. Configure Neon, then run{" "}
          <code className="font-mono">npm run db:push &amp;&amp; npm run db:seed</code>.
        </p>
      )}
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-line pb-3 sm:mb-8 sm:pb-4">
        <nav className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" aria-label="Admin">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] text-muted transition hover:bg-card hover:text-fg">
              {t.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="flex shrink-0 items-center gap-3">
          <span className="hidden font-mono text-xs text-dim sm:inline">{session.email}</span>
          <button type="submit" className="btn btn-sm">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
