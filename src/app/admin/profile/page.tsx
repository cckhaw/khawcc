import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Block, Field, SubmitButton } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { getProfile } from "@/lib/data";
import { DEFAULT_HERO_HEADLINE } from "@/lib/hero";
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
          <Field label="Home page headline" hint="The big line at the top of the home page. Put **double asterisks** around the words that should be coloured, e.g. I lead big programmes and **build AI-powered products.**">
            <textarea name="heroHeadline" defaultValue={p.heroHeadline || DEFAULT_HERO_HEADLINE} rows={2} maxLength={240} className="field text-[15px]" />
          </Field>
          <Field label="Hero bio"><textarea name="heroBio" defaultValue={p.heroBio} rows={3} className="field" /></Field>
          <Block label="About narrative"><RichTextEditor name="aboutNarrative" value={p.aboutNarrative} minHeight="14rem" /></Block>
          <Block label="Leadership philosophy"><RichTextEditor name="leadershipPhilosophy" value={p.leadershipPhilosophy} minHeight="10rem" /></Block>
          <Block label="Currently focused on"><RichTextEditor name="currentlyFocusedOn" value={p.currentlyFocusedOn} minHeight="8rem" variant="basic" /></Block>
        </div>
        <SubmitButton>Save profile</SubmitButton>
      </form>
    </div>
  );
}
