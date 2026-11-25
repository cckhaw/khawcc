import type { Metadata } from "next";
import Link from "next/link";
import { ApacAtlas } from "@/components/ApacAtlas";
import { CareerRoute } from "@/components/CareerRoute";
import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { BeyondWork } from "@/components/BeyondWork";
import { ChapterCard } from "@/components/ChapterCard";
import { SocialLinks } from "@/components/Footer";
import { ArrowRight, PrintIcon } from "@/components/icons";
import { Markdown } from "@/components/Markdown";
import { Portrait } from "@/components/Portrait";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeader } from "@/components/ui/Section";
import { getApacDoc, getBeyond, getExperiences, getLatestChapters, getProfile, getProjects, getSkills } from "@/lib/data";
import { personLd, websiteLd } from "@/lib/jsonld";
import { snippet } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { yearsBetween } from "@/lib/format";
import { headlineParts as splitHeadline } from "@/lib/hero";
import { PrintButton } from "@/components/PrintButton";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();
  const role = p.headline.split("·")[0].trim();
  return {
    title: { absolute: `${p.fullName} | ${role}` },
    description: snippet(p.heroBio),
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [profile, experiences, projects, chapters, apac, skills, beyond] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects(),
    getLatestChapters(3),
    getApacDoc(),
    getSkills(),
    getBeyond(),
  ]);
  const featured = projects.filter((p) => p.featuredOnCv);
  const earliest = experiences.reduce((m, e) => (e.startDate < m ? e.startDate : m), "2001-06-01");
  const years = Math.floor(yearsBetween(earliest, null));
  const headlineParts = profile.headline.split("·").map((s) => s.trim());
  // Every employer, newest first. Short names for the long ones ("M1 Limited" -> "M1"); joint names stay whole
  // ("Acision / LogicaCMG"), and "A & B" shows the first company ("ADC Software Systems").
  const companies = Array.from(
    new Set(experiences.map((e) => e.company.split(" & ")[0].replace(/ (Limited|Networks)$/i, ""))),
  );

  const impact = [
    { k: `${years}+`, t: "Years in Telco & ICT", d: "From support desk to programme director, across Malaysia, Singapore and APAC." },
    { k: "Full-stack", t: "BSS transformations", d: "CRM, Product Catalog, Billing & Charging and integrations, migrated without breaking revenue." },
    { k: "0 → 1", t: "Digital product launches", d: "Five digital telco brands launched on one multi-tenant MVNE platform in ~18 months." },
    { k: "AI-native", t: "Software I build myself", d: `${projects.length} products shipped on *.khaw.cc, built end to end with AI-assisted engineering.` },
  ];

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [personLd(profile, experiences, skills), websiteLd(profile.fullName)] }} />
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="canvas-glow" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-10 pt-12 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:pb-14 md:pt-20">
          <div>
            <p className="eyebrow rise rise-1">
              Hi, I&rsquo;m {profile.fullName}
              <span className="text-dim"> · {profile.location.split("·")[0].trim()} &amp; Singapore</span>
            </p>
            <h1 className="rise rise-2 mt-5 text-[2.3rem] font-semibold leading-[1.1] sm:text-5xl lg:text-[3.4rem]">
              {splitHeadline(profile.heroHeadline).map((part, i) =>
                part.accent ? (
                  <span key={i} className="text-gradient">
                    {part.text}
                  </span>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </h1>
            <p className="rise rise-3 mt-6 max-w-xl text-lg leading-relaxed text-muted">{profile.heroBio}</p>
            <p className="rise rise-3 mt-3 text-sm text-dim">{headlineParts.join(" · ")}</p>

            <div className="rise rise-4 mt-8 flex flex-wrap items-center gap-3">
              <Link href="/book" className="btn btn-primary !px-5 !py-2.5">
                Read Thinking in Signals <ArrowRight />
              </Link>
              <Link href="/projects" className="btn !px-5 !py-2.5">
                Explore the *.khaw.cc Lab
              </Link>
              <PrintButton href="/cv" className="no-print inline-flex items-center gap-1.5 px-2 py-2 text-sm text-muted hover:text-fg">
                <PrintIcon /> Print / Save CV
              </PrintButton>
            </div>
            <SocialLinks profile={profile} className="rise rise-5 mt-8" hero />
          </div>
          <Portrait profile={profile} />
        </div>

        {companies.length > 0 && (
          <div className="mx-auto max-w-6xl px-5 pb-6 sm:px-8">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-dim">Worked with</span>
              {companies.map((c) => (
                <span key={c} className="font-display text-lg italic text-muted">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ---------------- Impact ---------------- */}
      <section className="mx-auto mt-14 max-w-6xl px-5 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {impact.map((i, n) => (
            <Reveal key={i.t} delay={n * 90} className="glass p-6">
              <p className="font-display text-4xl font-semibold tracking-tight text-accent">
                <CountUp value={i.k} />
              </p>
              <p className="mt-3 text-[15px] font-semibold">{i.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{i.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Selected work across APAC ---------------- */}
      <div className="mt-24">
        <ApacAtlas doc={apac} />
      </div>

      {/* ---------------- About ---------------- */}

      <section className="mx-auto mt-24 grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <SectionHeader eyebrow="About" title="Builder of systems, leader of people" />
          <Markdown className="text-muted">{profile.aboutNarrative}</Markdown>
        </div>
        <div className="space-y-4">
          {profile.currentlyFocusedOn && (
            <div className="glass p-6">
              <p className="mb-3 eyebrow">Currently focused on</p>
              <Markdown className="prose-compact text-muted">{profile.currentlyFocusedOn}</Markdown>
            </div>
          )}
          {profile.leadershipPhilosophy && (
            <div className="glass p-6">
              <p className="mb-3 eyebrow">Leadership philosophy</p>
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
            <Link href="/cv" className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-muted transition hover:text-accent">
              View all <ArrowRight />
            </Link>
          }
        />
        <Reveal>
          <CareerRoute
            roles={experiences.map((e) => ({
              id: e.id,
              roleTitle: e.roleTitle,
              company: e.company,
              location: e.location,
              startDate: e.startDate,
              endDate: e.endDate,
              isCurrent: e.isCurrent,
              logoUrl: e.logoUrl,
              logoUrl2: e.logoUrl2,
              blurb: snippet(e.summary, 220),
            }))}
          />
        </Reveal>
      </section>

      {/* ---------------- Featured builds ---------------- */}
      <section className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="The Lab"
          title="Featured *.khaw.cc builds"
          action={
            <Link href="/projects" className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-muted transition hover:text-accent">
              View all <ArrowRight />
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, n) => (
            <Reveal key={p.id} delay={(n % 3) * 90}>
              <ProjectCard p={p} compact />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Latest from the book ---------------- */}
      {chapters.length > 0 && (
        <section className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Book"
            title="Latest from Thinking in Signals"
            action={
              <Link href="/book" className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-muted transition hover:text-accent">
                View all <ArrowRight />
              </Link>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            {chapters.map((c, n) => (
              <Reveal key={c.id} delay={n * 100}>
                <ChapterCard c={c} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
      <BeyondWork doc={beyond} profile={profile} />
    </>
  );
}
