import { Field, SubmitButton } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { getProfile } from "@/lib/data";
import { saveProfile } from "@/lib/actions/profile";

export default async function AdminProfile({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const [p, sp] = await Promise.all([getProfile(), searchParams]);
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
      {sp.saved && <p className="mt-4 rounded-xl border border-good/40 bg-good/10 px-4 py-2 text-sm text-good">Saved. The site has been revalidated.</p>}
      <form action={saveProfile} className="mt-8 space-y-6">
        <div className="glass grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Full name"><input name="fullName" defaultValue={p.fullName} required className="field" /></Field>
          <Field label="Location"><input name="location" defaultValue={p.location} className="field" /></Field>
          <Field label="Headline" className="sm:col-span-2"><input name="headline" defaultValue={p.headline} className="field" /></Field>
          <Field label="Email (public)"><input name="email" type="email" defaultValue={p.email} className="field" /></Field>
          <Field label="LinkedIn URL"><input name="linkedinUrl" defaultValue={p.linkedinUrl} className="field" /></Field>
          <Field label="GitHub URL"><input name="githubUrl" defaultValue={p.githubUrl} className="field" /></Field>
          <Field label="Instagram handle"><input name="instagramHandle" defaultValue={p.instagramHandle} placeholder="@handle" className="field" /></Field>
          <Field label="Portrait image URL" hint="Optional. Leave blank to show the monogram." className="sm:col-span-2">
            <input name="avatarUrl" defaultValue={p.avatarUrl} placeholder="https://… or /me.jpg (file in /public)" className="field" />
          </Field>
        </div>
        <div className="glass space-y-4 p-6">
          <Field label="Hero bio"><textarea name="heroBio" defaultValue={p.heroBio} rows={3} className="field" /></Field>
          <Field label="About narrative (Markdown)"><textarea name="aboutNarrative" defaultValue={p.aboutNarrative} rows={10} className="field font-mono text-[13px]" /></Field>
          <Field label="Leadership philosophy (Markdown)"><textarea name="leadershipPhilosophy" defaultValue={p.leadershipPhilosophy} rows={6} className="field font-mono text-[13px]" /></Field>
          <Field label="Currently focused on (Markdown)"><textarea name="currentlyFocusedOn" defaultValue={p.currentlyFocusedOn} rows={5} className="field font-mono text-[13px]" /></Field>
        </div>
        <SubmitButton>Save profile</SubmitButton>
      </form>
    </div>
  );
}
