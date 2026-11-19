import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Markdown } from "@/components/Markdown";
import { ChapterBadge } from "@/components/ui/StatusBadge";
import { getBookIntro, getChapters, getParts } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Thinking in Signals",
  description: "A serialized, work-in-progress book on 25 years of telecom, platform engineering and leadership.",
};

const label = (n: string) => (/^\d/.test(n) ? n : n);

export default async function BookPage() {
  const [parts, all, intro] = await Promise.all([getParts(), getChapters({ includeDrafts: true }), getBookIntro()]);
  const visible = all.filter((c) => c.status !== "draft");
  const first = visible[0];

  const groups = [
    ...parts.map((p) => ({ key: `p${p.id}`, title: `Part ${p.partNumber} · ${p.title}`, desc: p.description, items: visible.filter((c) => c.partId === p.id) })),
    { key: "none", title: "More", desc: "", items: visible.filter((c) => !parts.some((p) => p.id === c.partId)) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="relative overflow-hidden">
      <div className="canvas-glow" />
      <div className="mx-auto max-w-4xl px-5 pb-8 pt-14 sm:px-8 md:pt-20">
        <header>
          <p className="eyebrow">Work in progress · serialized</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">
            Thinking in <span className="text-gradient">Signals</span>
          </h1>
          {intro.intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{intro.intro}</p>}
          {first && (
            <Link href={`/book/${first.slug}`} className="btn btn-primary mt-8">
              Start reading <ArrowRight />
            </Link>
          )}
        </header>

        {(intro.noteTitle || intro.noteBody) && (
          <section className="glass mt-12 p-7 sm:p-9" aria-labelledby="wip-note">
            {intro.noteEyebrow && <p className="eyebrow">{intro.noteEyebrow}</p>}
            <h2 id="wip-note" className="mt-2 text-2xl font-semibold leading-snug sm:text-3xl">
              {intro.noteTitle}
            </h2>
            <Markdown className="mt-5 leading-relaxed text-muted">{intro.noteBody}</Markdown>
          </section>
        )}

        <section className="mt-14" aria-label="Table of contents">
          <h2 className="mb-8 text-sm font-semibold tracking-wide text-dim">Table of contents</h2>
          <div className="space-y-12">
            {groups.map((g) => (
              <div key={g.key}>
                <h3 className="text-xl font-semibold tracking-tight">{g.title}</h3>
                {g.desc && <p className="mt-1 text-sm text-muted">{g.desc}</p>}
                <ol className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                  {g.items.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/book/${c.slug}`}
                        className="flex items-start gap-4 bg-card px-5 py-4 transition hover:bg-[var(--card-hover)]"
                      >
                        <span className="w-14 shrink-0 pt-0.5 font-mono text-xs text-dim">{label(c.chapterNumber)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium leading-snug">{c.title}</span>
                          {c.summary && <span className="mt-1 line-clamp-2 block text-sm text-muted">{c.summary}</span>}
                          {c.status === "wip_published" && (
                            <span className="mt-2 block sm:hidden">
                              <ChapterBadge status={c.status} />
                            </span>
                          )}
                        </span>
                        <span className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                          {c.status === "wip_published" && <ChapterBadge status={c.status} />}
                          <span className="font-mono text-[11px] text-dim">{c.readingTimeMinutes} min</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
