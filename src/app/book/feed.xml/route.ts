import { getChapters, getProfile } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS feed of published chapters, newest first. */
export async function GET() {
  const [chapters, profile] = await Promise.all([getChapters(), getProfile()]);
  const items = [...chapters]
    .sort((a, b) => (b.publishedAt ?? b.createdAt).getTime() - (a.publishedAt ?? a.createdAt).getTime())
    .map(
      (c) => `
    <item>
      <title>${esc(c.title)}</title>
      <link>${absoluteUrl(`/book/${c.slug}`)}</link>
      <guid isPermaLink="true">${absoluteUrl(`/book/${c.slug}`)}</guid>
      <pubDate>${(c.publishedAt ?? c.createdAt).toUTCString()}</pubDate>
      <description>${esc(c.summary)}</description>
    </item>`,
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Thinking in Signals</title>
  <link>${absoluteUrl("/book")}</link>
  <description>${esc(`A serialized book by ${profile.fullName} on telecom, platforms and leadership.`)}</description>
  <language>en</language>${items}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
