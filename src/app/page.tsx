import Link from "next/link";
import { ChapterCard } from "@/components/ChapterCard";
import { ExperienceSnippet } from "@/components/ExperienceRow";
import { SocialLinks } from "@/components/Footer";
import { ArrowRight, PinIcon, PrintIcon } from "@/components/icons";
import { Markdown } from "@/components/Markdown";
import { Portrait } from "@/components/Portrait";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeader } from "@/components/ui/Section";
import { getExperiences, getLatestChapters, getProfile, getProjects } from "@/lib/data";
import { yearsBetween } from "@/lib/format";
import { PrintButton } from "@/components/PrintButton";

export const revalidate = 3600;

export default async function HomePage() {
  const [profile, experiences, projects, chapters] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects(),
    getLatestChapters(3),
  ]);
  const featured = projects.filter((p) => p.featuredOnCv);
  const earliest = experiences.reduce((m, e) => (e.startDate < m ? e.startDate : m), "2001-06-01");
  const years = Math.floor(yearsBetween(earliest, null));
  const [first, ...rest] = profile.fullName.split(" ");
  const headlineParts = profile.headline.split("·").map((s) => s.trim());

  const impact = [
    { k: `${years}+`, t: "Years in Telco & ICT", d: "From support desk to programme director, across Malaysia, Singapore and APAC." },
    { k: "Full-stack", t: "BSS transformations", d: "CRM, Product Catalog, Billing & Charging and integrations, migrated without breaking revenue." },
    { k: "0 → 1", t: "Digital product launches", d: "Five digital telco brands launched on one multi-tenant MVNE platform in ~18 months." },
    { k: "AI-native", t: "Software building", d: `${projects.length} products shipped on *.khaw.cc, built end to end with AI-assisted engineering.` },
  ];

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="canvas-glow" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 md:grid-cols-[1.15fr_0.85fr] md:pb-24 md:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-good/30 bg-good/10 px-3 py-1 text-xs font-medium text-good">
              Hello there!
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {first} <span className="text-gradient">{rest.join(" ")}</span>
            </h1>
            <p className="mt-4 text-xl font-medium tracking-tight text-fg/90 sm:text-2xl">
              {headlineParts[0]}
            </p>
            <p className="mt-1 text-base text-muted">{headlineParts.slice(1).join(" · ")}</p>
            <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-dim">
              <PinIcon width={13} height={13} /> {profile.location}
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">{profile.heroBio}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/book" className="btn btn-primary">
                Read Thinking in Signals <ArrowRight />
              </Link>
              <Link href="/projects" className="btn">
                Explore *.khaw.cc Lab
              </Link>
              <PrintButton href="/cv" className="btn no-print">
                <PrintIcon /> Print / Save CV
              </PrintButton>
            </div>
            <SocialLinks profile={profile} className="mt-8" />
          </div>
          <Portrait profile={profile} />
        </div>
      </section>

      {/* ---------------- Impact ---------------- */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {impact.map((i) => (
            <div key={i.t} className="glass p-6">
              <p className="font-mono text-3xl font-semibold tracking-tight text-gradient">{i.k}</p>
              <p className="mt-3 text-sm font-medium">{i.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{i.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- About ---------------- */}
      <section className="mx-auto mt-24 grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <SectionHeader eyebrow="About" title="Builder of systems, leader of teams" />
          <Markdown className="text-muted">{profile.aboutNarrative}</Markdown>
        </div>
        <div className="space-y-4">
          {profile.currentlyFocusedOn && (
            <div className="glass p-6">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-dim">Currently focused on</p>
              <Markdown className="prose-compact text-muted">{profile.currentlyFocusedOn}</Markdown>
            </div>
          )}
          {profile.leadershipPhilosophy && (
            <div className="glass p-6">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-dim">Leadership philosophy</p>
              <Markdown className="prose-compact text-muted">{profile.leadershipPhilosophy}</Markdown>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- Career highlights ---------------- */}
      <section className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Career"
          title="Featured career highlights"
          action={
            <Link href="/cv" className="hidden items-center gap-1.5 text-sm text-muted hover:text-fg sm:inline-flex">
              Full CV <ArrowRight />
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {experiences.slice(0, 3).map((e) => (
            <ExperienceSnippet key={e.id} e={e} />
          ))}
        </div>
      </section>

      {/* ---------------- Featured builds ---------------- */}
      <section className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="The Lab"
          title="Featured *.khaw.cc builds"
          action={
            <Link href="/projects" className="hidden items-center gap-1.5 text-sm text-muted hover:text-fg sm:inline-flex">
              All projects <ArrowRight />
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProjectCard key={p.id} p={p} compact />
          ))}
        </div>
      </section>

      {/* ---------------- Latest from the book ---------------- */}
      {chapters.length > 0 && (
        <section className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Work in progress"
            title="Latest from Thinking in Signals"
            action={
              <Link href="/book" className="hidden items-center gap-1.5 text-sm text-muted hover:text-fg sm:inline-flex">
                Table of contents <ArrowRight />
              </Link>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            {chapters.map((c) => (
              <ChapterCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
