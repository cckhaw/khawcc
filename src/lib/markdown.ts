import GithubSlugger from "github-slugger";

const WORDS_PER_MINUTE = 220;

/** Strip fenced code, then count words. */
export function wordCount(md: string): number {
  const text = md.replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`~|-]/g, " ");
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

export function readingTime(md: string): number {
  return Math.max(1, Math.ceil(wordCount(md) / WORDS_PER_MINUTE));
}

export type TocItem = { id: string; text: string; level: 2 | 3 };

const inline = (s: string) =>
  s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim();

/** Table of contents (h2/h3). Ids match rehype-slug (both use github-slugger). */
export function extractToc(md: string): TocItem[] {
  const slugger = new GithubSlugger();
  const out: TocItem[] = [];
  let fence = false;
  for (const line of md.split("\n")) {
    if (/^\s*```/.test(line)) fence = !fence;
    if (fence) continue;
    const m = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = inline(m[2]);
    const id = slugger.slug(text);
    if (m[1].length > 1) out.push({ id, text, level: m[1].length as 2 | 3 });
  }
  return out;
}

export type Section = { heading: string; level: number; body: string };

/** Split markdown into an intro block + `##` sections (used by the section organiser). */
export function splitSections(md: string): { intro: string; sections: Section[] } {
  const lines = md.split("\n");
  const sections: Section[] = [];
  const intro: string[] = [];
  let cur: { heading: string; level: number; lines: string[] } | null = null;
  let fence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) fence = !fence;
    const m = !fence ? /^(##)\s+(.+?)\s*$/.exec(line) : null;
    if (m) {
      if (cur) sections.push({ heading: cur.heading, level: 2, body: cur.lines.join("\n").trim() });
      cur = { heading: m[2], level: 2, lines: [] };
    } else if (cur) cur.lines.push(line);
    else intro.push(line);
  }
  if (cur) sections.push({ heading: cur.heading, level: 2, body: cur.lines.join("\n").trim() });
  return { intro: intro.join("\n").trim(), sections };
}

export function joinSections(intro: string, sections: Section[]): string {
  const parts = [intro.trim()].filter(Boolean);
  for (const s of sections) parts.push(`## ${s.heading}\n\n${s.body}`.trim());
  return parts.join("\n\n") + "\n";
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
