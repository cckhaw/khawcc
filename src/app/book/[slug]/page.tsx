import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ChapterMediaSection } from "@/components/ChapterMedia";
import { Markdown } from "@/components/Markdown";
import { ProjectCard } from "@/components/ProjectCard";
import { ReaderChrome } from "@/components/ReaderChrome";
import { ChapterBadge } from "@/components/ui/StatusBadge";
import { isAdmin } from "@/lib/auth";
import { getChapterBySlug, getChapters, getProfile, getProjectsBySlugs } from "@/lib/data";
import { absoluteUrl, SITE_URL, snippet } from "@/lib/seo";
import { extractToc } from "@/lib/markdown";

// Reads the admin cookie (draft preview), so this route renders per request.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getChapterBySlug(slug, { includeDrafts: await isAdmin() });
  if (!c) return {};
  const label = /^\d/.test(c.chapterNumber) ? `Chapter ${c.chapterNumber}` : c.chapterNumber;
  const description = snippet(c.summary || c.contentMarkdown, 158);
  return {
    title: c.title === c.chapterNumber ? `${c.title} | Thinking in Signals` : `${c.title} (${label}) | Thinking in Signals`,
    description,
    alternates: { canonical: `/book/${c.slug}` },
    // Draft previews (admin only) must never be indexed.
    robots: c.status === "draft" ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      url: `/book/${c.slug}`,
      title: `${c.title} | Thinking in Signals`,
      description,
      publishedTime: (c.publishedAt ?? c.createdAt).toISOString(),
      modifiedTime: c.updatedAt.toISOString(),
      section: "Thinking in Signals",
    },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { slug } = await params;
  const admin = await isAdmin();
  const chapter = await getChapterBySlug(slug, { includeDrafts: admin });
  if (!chapter) notFound();

  const [all, related, profile] = await Promise.all([
    getChapters({ includeDrafts: admin }),
    getProjectsBySlugs(chapter.relatedProjectSlugs),
    getProfile(),
  ]);
  const idx = all.findIndex((c) => c.id === chapter.id);
  const prev = idx > 0 ? all[idx - 1] : undefined;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;
  const toc = extractToc(chapter.contentMarkdown).filter((t) => t.level === 2 && !/how to use this signal/i.test(t.text));
  const numbered = /^\d/.test(chapter.chapterNumber);

  const url = absoluteUrl(`/book/${chapter.slug}`);
  return (
    <div className="mx-auto max-w-6xl px-5 pb-8 pt-10 sm:px-8 md:pt-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${url}#article`,
              headline: chapter.title,
              description: snippet(chapter.summary || chapter.contentMarkdown, 200),
              url,
              mainEntityOfPage: url,
              datePublished: (chapter.publishedAt ?? chapter.createdAt).toISOString(),
              dateModified: chapter.updatedAt.toISOString(),
              inLanguage: "en",
              wordCount: chapter.contentMarkdown.split(/\s+/).length,
              author: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: profile.fullName },
              isPartOf: { "@type": "Book", name: "Thinking in Signals", url: absoluteUrl("/book") },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
                { "@type": "ListItem", position: 2, name: "Thinking in Signals", item: absoluteUrl("/book") },
                { "@type": "ListItem", position: 3, name: chapter.title, item: url },
              ],
            },
          ],
        }}
      />
      {chapter.status === "draft" && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warn/40 bg-warn/10 px-5 py-3 text-sm text-warn">
          <span>Draft preview: only visible to you while signed in as admin.</span>
          <Link href={`/admin/book/${chapter.id}`} className="font-medium underline underline-offset-4">
            Edit chapter →
          </Link>
        </div>
      )}

      <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="mx-auto w-full max-w-[68ch] xl:mx-0">
          <Link href="/book" className="font-mono text-xs text-dim hover:text-fg">
            ← Thinking in Signals
          </Link>

          <ReaderChrome>
            <header className="mb-10 mt-6">
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-dim">
                <span>{numbered ? `Chapter ${chapter.chapterNumber}` : chapter.chapterNumber}</span>
                <span aria-hidden>·</span>
                <span>{chapter.readingTimeMinutes} min read</span>
                {chapter.status === "wip_published" && <ChapterBadge status="wip_published" />}
              </div>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">{chapter.title}</h1>
              {chapter.subtitle && <p className="mt-3 text-xl text-muted">{chapter.subtitle}</p>}
            </header>

            {chapter.status === "wip_published" && (
              <p className="mb-8 rounded-xl border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn">
                Work in progress: this chapter is still being edited and may change.
              </p>
            )}

            <article>
              <Markdown slugs>{chapter.contentMarkdown}</Markdown>
            </article>
          </ReaderChrome>

          <ChapterMediaSection items={chapter.media} chapterTitle={chapter.title} />

          {related.length > 0 && (
            <section className="mt-16" aria-label="Related case studies">
              <h2 className="mb-4 text-sm font-semibold tracking-wide text-dim">Related *.khaw.cc builds</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((p) => (
                  <ProjectCard key={p.id} p={p} compact />
                ))}
              </div>
            </section>
          )}

          <nav className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2" aria-label="Chapter navigation">
            {prev ? (
              <Link href={`/book/${prev.slug}`} className="glass glass-hover p-5">
                <span className="font-mono text-xs text-dim">← Previous</span>
                <span className="mt-1 block font-medium leading-snug">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/book/${next.slug}`} className="glass glass-hover p-5 sm:text-right">
                <span className="font-mono text-xs text-dim">Next →</span>
                <span className="mt-1 block font-medium leading-snug">{next.title}</span>
              </Link>
            )}
          </nav>
        </div>

        {toc.length > 1 && (
          <aside className="no-print hidden xl:block">
            <nav className="sticky top-24" aria-label="On this page">
              <p className="mb-3 eyebrow">On this page</p>
              <ul className="space-y-2 border-l border-line pl-4 text-[13px] leading-snug">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="text-muted hover:text-fg">
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>
    </div>
  );
}
