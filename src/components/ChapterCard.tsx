import Link from "next/link";
import type { ChapterListItem } from "@/lib/data";
import { ChapterBadge } from "./ui/StatusBadge";

export function ChapterCard({ c }: { c: ChapterListItem }) {
  return (
    <Link href={`/book/${c.slug}`} className="glass glass-hover flex h-full flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-dim">
          {/^\d/.test(c.chapterNumber) ? `Chapter ${c.chapterNumber}` : c.chapterNumber}
        </span>
        <span className="font-mono text-[11px] text-dim">{c.readingTimeMinutes} min read</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight">{c.title}</h3>
      {c.summary && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{c.summary}</p>}
      <div className="mt-auto flex items-center justify-between pt-5">
        {c.status === "wip_published" ? <ChapterBadge status={c.status} /> : <span />}
        <span className="text-sm text-fg">Read →</span>
      </div>
    </Link>
  );
}
