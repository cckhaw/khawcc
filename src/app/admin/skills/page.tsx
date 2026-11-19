import { ChipsEditor } from "@/components/admin/ChipsEditor";
import { ConfirmButton, Field, SubmitButton } from "@/components/admin/ui";
import { ArrowDown, ArrowUp } from "@/components/icons";
import { SKILL_CATEGORIES } from "@/db/constants";
import { deleteSkillGroup, moveSkillGroup, saveSkillGroup } from "@/lib/actions/skills";
import { requireAdmin } from "@/lib/auth";
import { getSkills } from "@/lib/data";

export const metadata = { title: "Competencies" };

function Move({ id, dir, disabled }: { id: number; dir: "up" | "down"; disabled: boolean }) {
  return (
    <form action={moveSkillGroup}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dir" value={dir} />
      <button className="btn btn-sm !px-2" disabled={disabled} aria-label={`Move group ${dir}`}>
        {dir === "up" ? <ArrowUp width={14} height={14} /> : <ArrowDown width={14} height={14} />}
      </button>
    </form>
  );
}

export default async function AdminSkills({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const [groups, sp] = await Promise.all([getSkills(), searchParams]);
  const names = Array.from(new Set([...SKILL_CATEGORIES, ...groups.map((g) => g.category)]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Competencies</h1>
        <p className="mt-1 text-sm text-muted">The skills, architecture and credentials boxes at the bottom of the CV. Groups with no items are hidden.</p>
      </div>
      {sp.saved && <p className="rounded-xl border border-good/40 bg-good/10 px-4 py-2 text-sm text-good">Saved. The site has been revalidated.</p>}

      <datalist id="skill-groups">{names.map((n) => <option key={n} value={n} />)}</datalist>

      <ul className="space-y-4">
        {groups.map((g, i) => (
          <li key={g.id} className="glass p-4 sm:p-5">
            <form action={saveSkillGroup} className="space-y-4">
              <input type="hidden" name="id" value={g.id} />
              <Field label="Group name">
                <input name="category" list="skill-groups" defaultValue={g.category} required className="field" />
              </Field>
              <div>
                <span className="mb-1.5 block text-[13px] font-medium text-muted">Items</span>
                <ChipsEditor name="items" initial={g.items} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SubmitButton>Save group</SubmitButton>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <span className="text-xs text-dim">Position {i + 1} of {groups.length}</span>
              <div className="ml-auto flex items-center gap-2">
                <Move id={g.id} dir="up" disabled={i === 0} />
                <Move id={g.id} dir="down" disabled={i === groups.length - 1} />
                <form action={deleteSkillGroup}>
                  <input type="hidden" name="id" value={g.id} />
                  <ConfirmButton message={`Delete the group “${g.category}”?`}>Delete group</ConfirmButton>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <section className="glass p-4 sm:p-5">
        <h2 className="mb-4 text-lg font-semibold">Add a group</h2>
        <form action={saveSkillGroup} className="space-y-4">
          <Field label="Group name">
            <input name="category" list="skill-groups" required placeholder="e.g. Languages" className="field" />
          </Field>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-muted">Items</span>
            <ChipsEditor name="items" initial={[]} />
          </div>
          <SubmitButton>Add group</SubmitButton>
        </form>
      </section>
    </div>
  );
}
