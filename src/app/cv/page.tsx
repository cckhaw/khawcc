import type { Metadata } from "next";
import { CvTimeline, type CvRole } from "@/components/CvTimeline";
import { PrintIcon } from "@/components/icons";
import { Markdown } from "@/components/Markdown";
import { PrintButton } from "@/components/PrintButton";
import { getExperiences, getProfile, getSkills } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Experience (CV)" };

export default async function CvPage() {
  const [profile, experiences, skills] = await Promise.all([getProfile(), getExperiences(), getSkills()]);
  const roles: CvRole[] = experiences.map(({ summary, ...e }) => ({
    ...e,
    summaryNode: summary ? <Markdown className="prose-compact">{summary}</Markdown> : null,
  }));
  const groups = skills.filter((s) => s.items.length > 0);
  const contact = [profile.location, profile.email, profile.linkedinUrl, profile.githubUrl].filter(Boolean);

  return (
    <div className="relative overflow-hidden">
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
