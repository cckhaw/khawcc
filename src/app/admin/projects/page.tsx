import { ProjectForm } from "@/components/admin/ProjectForm";
import { ConfirmButton } from "@/components/admin/ui";
import { ProjectLogo } from "@/components/ProjectLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { deleteProject } from "@/lib/actions/projects";
import { requireAdmin } from "@/lib/auth";
import { getProjects } from "@/lib/data";

export const metadata = { title: "Projects" };

export default async function AdminProjects({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const [rows, sp] = await Promise.all([getProjects({ includeArchived: true }), searchParams]);
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Projects <span className="text-gradient">*.khaw.cc</span></h1>
      {sp.saved && <p className="rounded-xl border border-good/40 bg-good/10 px-4 py-2 text-sm text-good">Saved. The site has been revalidated.</p>}

      <section id="new" className="glass p-6">
        <h2 className="mb-1 text-lg font-semibold">Quick add</h2>
        <p className="mb-4 text-sm text-muted">New subdomains appear on /projects automatically, no code changes.</p>
        <ProjectForm />
      </section>

      <ul className="space-y-3">
        {rows.map((p) => (
          <li key={p.id} className="glass p-4">
            <div className="flex items-start gap-3">
              <ProjectLogo name={p.name} logoUrl={p.logoUrl} size={40} />
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{p.name} <span className="font-mono text-xs text-dim">/{p.slug}</span></p>
                <p className="mt-0.5 break-words text-sm text-muted">{p.category}{p.featuredOnCv ? " · ★ featured" : ""}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-dim">{p.url}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={p.status} />
              <span className="font-mono text-[11px] text-dim">order #{p.sortOrder}</span>
              <form action={deleteProject} className="ml-auto">
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton message={`Delete ${p.name}?`}>Delete</ConfirmButton>
              </form>
            </div>
            <details className="mt-3 border-t border-line pt-3">
              <summary className="cursor-pointer text-[13px] text-muted hover:text-fg">Edit</summary>
              <div className="pt-4"><ProjectForm p={p} /></div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
