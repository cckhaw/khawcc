import { parseYouTubeId, type ChapterMedia } from "@/lib/media";
import { YouTubeEmbed } from "./YouTubeEmbed";

/** Pictures and videos that accompany a chapter. */
export function ChapterMediaSection({ items, chapterTitle }: { items: ChapterMedia[]; chapterTitle: string }) {
  if (!items.length) return null;
  return (
    <section className="mt-14" aria-label="Pictures and videos">
      <h2 className="mb-5 text-xl font-semibold">Pictures &amp; videos</h2>
      <div className="space-y-8">
        {items.map((m, i) => {
          const id = m.type === "youtube" ? parseYouTubeId(m.url) : null;
          return (
            <figure key={`${m.url}-${i}`}>
              {m.type === "youtube" && id ? (
                <YouTubeEmbed id={id} title={m.caption || `Video for ${chapterTitle}`} />
              ) : (
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- uploaded or admin-provided image */}
                  <img src={m.url} alt={m.caption || `Picture for ${chapterTitle}`} loading="lazy" className="mx-auto h-auto max-h-[75vh] w-auto max-w-full rounded-2xl border border-line" />
                </a>
              )}
              {m.caption && <figcaption className="mt-2 text-center text-sm text-muted">{m.caption}</figcaption>}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
