import type { Metadata } from "next";
import { CvTimeline, type CvRole } from "@/components/CvTimeline";
import { PrintIcon } from "@/components/icons";
import { InlineMarkdown } from "@/components/InlineMarkdown";
import { Markdown } from "@/components/Markdown";
import { JsonLd } from "@/components/JsonLd";
import { PrintButton } from "@/components/PrintButton";
import { getExperiences, getProfile, getSkills } from "@/lib/data";
import { personLd } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();
  const role = p.headline.split("·")[0].trim();
  return {
    title: "Experience & CV",
    description: `Career history, competencies and achievements of ${p.fullName}, ${role}: from technical support to leading enterprise platform and business transformations.`,
    alternates: { canonical: "/cv" },
    openGraph: {
      type: "profile",
      url: "/cv",
      title: `Experience & CV | ${p.fullName}`,
      description: `Career history, competencies and achievements of ${p.fullName}.`,
    },
  };
}

export default async function CvPage() {
  const [profile, experiences, skills] = await Promise.all([getProfile(), getExperiences(), getSkills()]);
  const roles: CvRole[] = experiences.map(({ summary, ...e }) => ({
    ...e,
    highlightNodes: e.highlights.map((h) => <InlineMarkdown key={h}>{h}</InlineMarkdown>),
    summaryNode: summary ? <Markdown className="prose-compact">{summary}</Markdown> : null,
  }));
  const groups = skills.filter((s) => s.items.length > 0);
  const contact = [profile.location, profile.email, profile.linkedinUrl, profile.githubUrl].filter(Boolean);

  return (
    <div className="relative overflow-hidden">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ProfilePage", url: absoluteUrl("/cv"), name: `${profile.fullName}: CV`, mainEntity: personLd(profile, experiences, skills) }} />
      <div className="canvas-glow" />
      <div className="mx-auto max-w-4xl px-5 pb-8 pt-14 sm:px-8 md:pt-20">
        <header className="mb-12">
          <p className="no-print eyebrow">Curriculum vitae</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{profile.fullName}</h1>
              <p className="mt-2 text-lg text-muted">{profile.headline}</p>
            </div>
            <PrintButton href="/cv" className="btn btn-primary no-print">
              <PrintIcon /> Download / Print PDF
            </PrintButton>
          </div>
          <p className="print-only mt-2 font-mono text-xs">{contact.join("  ·  ")}</p>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted">{profile.heroBio}</p>
        </header>

        <section aria-labelledby="exp">
          <h2 id="exp" className="mb-6 text-sm font-semibold tracking-wide text-dim">
            Experience
          </h2>
          <CvTimeline roles={roles} />
        </section>

        <section aria-labelledby="skills" className="mt-16 break-inside-avoid">
          <h2 id="skills" className="mb-6 text-sm font-semibold tracking-wide text-dim">
            Competencies, architecture &amp; credentials
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((g) => (
              <div key={g.id} className="glass break-inside-avoid p-6">
                <h3 className="mb-3 text-sm font-semibold">{g.category}</h3>
                <ul className="flex flex-wrap gap-1.5">
                  {g.items.map((it) => (
                    <li key={it} className="rounded-full border border-line px-2.5 py-1 text-[12.5px] text-muted">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
