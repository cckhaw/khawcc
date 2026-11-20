import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { CompanyLogos } from "@/components/CompanyLogos";
import { ConfirmButton } from "@/components/admin/ui";
import { ArrowDown, ArrowUp, EyeIcon, EyeOffIcon } from "@/components/icons";
import { deleteExperience, moveExperience, toggleExperience } from "@/lib/actions/experience";
import { requireAdmin } from "@/lib/auth";
import { getExperiences } from "@/lib/data";
import { fmtPeriod } from "@/lib/format";

export const metadata = { title: "Experience" };

export default async function AdminExperience({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const [rows, sp] = await Promise.all([getExperiences({ includeHidden: true }), searchParams]);
  const tagOptions = Array.from(new Set(["Telco & BSS", "Product & Platform", "Sales & Architecture", "Enterprise Networking", ...rows.map((r) => r.domainTag)]));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Experience</h1>
      {sp.saved && <p className="rounded-xl border border-good/40 bg-good/10 px-4 py-2 text-sm text-good">Saved. The site has been revalidated.</p>}

      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.id} className={`glass p-4 ${r.isVisible ? "" : "opacity-60"}`}>
            <div className="flex items-start gap-3">
              <CompanyLogos name={r.company} logos={[r.logoUrl, r.logoUrl2]} size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{r.roleTitle}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {r.company}
                  <span className="text-dim"> · {r.location}</span>
                </p>
                <p className="mt-1 font-mono text-[11px] text-dim">
                  {fmtPeriod(r.startDate, r.endDate, r.isCurrent)} · {r.domainTag}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <form action={moveExperience}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="dir" value="up" />
                <button className="btn btn-sm !px-2.5" disabled={i === 0} aria-label="Move up"><ArrowUp width={14} height={14} /></button></form>
              <form action={moveExperience}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="dir" value="down" />
                <button className="btn btn-sm !px-2.5" disabled={i === rows.length - 1} aria-label="Move down"><ArrowDown width={14} height={14} /></button></form>
              <form action={toggleExperience}>
                <input type="hidden" name="id" value={r.id} />
                <button className="btn btn-sm" aria-label={r.isVisible ? "Hide from site" : "Show on site"}>
                  {r.isVisible ? <><EyeIcon width={14} height={14} /> Visible</> : <><EyeOffIcon width={14} height={14} /> Hidden</>}
                </button>
              </form>
              <form action={deleteExperience} className="ml-auto">
                <input type="hidden" name="id" value={r.id} />
                <ConfirmButton message={`Delete “${r.roleTitle}” at ${r.company}?`}>Delete</ConfirmButton>
              </form>
            </div>
            <details className="mt-3 border-t border-line pt-3">
              <summary className="cursor-pointer text-[13px] text-muted hover:text-fg">Edit role details & achievements</summary>
              <div className="pt-4"><ExperienceForm e={r} tagOptions={tagOptions} /></div>
            </details>
          </li>
        ))}
      </ul>

      <section id="new" className="glass p-6">
        <h2 className="mb-4 text-lg font-semibold">Add a role</h2>
        <ExperienceForm tagOptions={tagOptions} />
      </section>
    </div>
  );
}
