import type { Experience } from "@/db/schema";
import { saveExperience } from "@/lib/actions/experience";
import { Field, SubmitButton } from "./ui";

export function ExperienceForm({ e, tagOptions }: { e?: Experience; tagOptions: string[] }) {
  return (
    <form action={saveExperience} className="grid gap-4 sm:grid-cols-2">
      {e && <input type="hidden" name="id" value={e.id} />}
      <Field label="Role title" className="sm:col-span-2"><input name="roleTitle" defaultValue={e?.roleTitle} required className="field" /></Field>
      <Field label="Company"><input name="company" defaultValue={e?.company} required className="field" /></Field>
      <Field label="Location"><input name="location" defaultValue={e?.location} className="field" /></Field>
      <Field label="Start"><input name="startDate" type="month" defaultValue={e?.startDate.slice(0, 7)} required className="field" /></Field>
      <Field label="End" hint="Ignored when “Current role” is ticked.">
        <input name="endDate" type="month" defaultValue={e?.endDate?.slice(0, 7) ?? ""} className="field" />
      </Field>
      <Field label="Domain tag" hint="Drives the filter pills on /cv.">
        <input name="domainTag" list="domain-tags" defaultValue={e?.domainTag ?? "Telco & BSS"} className="field" />
        <datalist id="domain-tags">{tagOptions.map((t) => <option key={t} value={t} />)}</datalist>
      </Field>
      <div className="flex items-center gap-6 pt-6">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isCurrent" defaultChecked={e?.isCurrent} /> Current role</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isVisible" defaultChecked={e?.isVisible ?? true} /> Visible</label>
      </div>
      <Field label="Summary (Markdown)" className="sm:col-span-2"><textarea name="summary" rows={3} defaultValue={e?.summary} className="field" /></Field>
      <Field label="Highlights" hint="One bullet per line." className="sm:col-span-2">
        <textarea name="highlights" rows={6} defaultValue={e?.highlights.join("\n")} className="field" />
      </Field>
      <div className="sm:col-span-2"><SubmitButton>{e ? "Save role" : "Add role"}</SubmitButton></div>
    </form>
  );
}
