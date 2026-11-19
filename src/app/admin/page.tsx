import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminStats } from "@/lib/data";

export default async function AdminDashboard() {
  await requireAdmin();
  const s = await getAdminStats();
  const stats = [
    { k: s.roles, l: "Total roles" },
    { k: s.liveProjects, l: "Live projects", sub: `${s.projects} total` },
    { k: s.published, l: "Published chapters" },
    { k: s.drafts, l: "Draft chapters" },
  ];
  const quick = [
    { href: "/admin/experience#new", l: "Add a role" },
    { href: "/admin/projects#new", l: "Add a *.khaw.cc project" },
    { href: "/admin/book/new", l: "Write a chapter" },
    { href: "/admin/profile", l: "Edit profile & bio" },
  ];
  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((x) => (
          <div key={x.l} className="glass p-6">
            <p className="font-mono text-4xl font-semibold text-gradient">{x.k}</p>
            <p className="mt-2 text-sm text-muted">{x.l}</p>
            {x.sub && <p className="font-mono text-xs text-dim">{x.sub}</p>}
          </div>
        ))}
      </div>
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-dim">Quick create</h2>
        <div className="flex flex-wrap gap-3">
          {quick.map((q) => (
            <Link key={q.href} href={q.href} className="btn">
              {q.l}
            </Link>
          ))}
          <Link href="/" className="btn">
            View site ↗
          </Link>
        </div>
      </section>
    </div>
  );
}
