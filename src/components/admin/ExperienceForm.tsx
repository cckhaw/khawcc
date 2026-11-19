import type { Experience } from "@/db/schema";
import { saveExperience } from "@/lib/actions/experience";
import { LogoField } from "./LogoField";
import { RichTextEditor } from "./RichTextEditor";
import { Block, Field, SubmitButton } from "./ui";

export function ExperienceForm({ e, tagOptions }: { e?: Experience; tagOptions: string[] }) {
  return (
    <form action={saveExperience} className="grid gap-4 sm:grid-cols-2">
      {e && <input type="hidden" name="id" value={e.id} />}
      <Field label="Role title" className="sm:col-span-2"><input name="roleTitle" defaultValue={e?.roleTitle} required className="field" /></Field>
      <Field label="Company"><input name="company" defaultValue={e?.company} required className="field" /></Field>
      <Field label="Location"><input name="location" defaultValue={e?.location} className="field" /></Field>
      <div className="sm:col-span-2"><LogoField label="Company logo" defaultValue={e?.logoUrl} fallbackName={e?.company ?? ""} /></div>
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
      <Block label="Summary" className="sm:col-span-2"><RichTextEditor name="summary" value={e?.summary ?? ""} minHeight="6rem" variant="basic" /></Block>
      <Block label="Achievements" hint="One bullet per achievement. Use B for bold." className="sm:col-span-2"><RichTextEditor name="highlights" value={(e?.highlights ?? []).map((h) => `- ${h}`).join("\n")} minHeight="8rem" variant="basic" placeholder="Add achievements as a bulleted list…" /></Block>
      <div className="sm:col-span-2"><SubmitButton>{e ? "Save role" : "Add role"}</SubmitButton></div>
    </form>
  );
}
