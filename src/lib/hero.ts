/**
 * The big headline on the home page. Words wrapped in **double asterisks** get the colour gradient.
 * An empty value in the profile falls back to this default.
 */
export const DEFAULT_HERO_HEADLINE =
  "I lead large-scale technology and business transformations and **build AI‑powered products.**";

export type HeadlinePart = { text: string; accent: boolean };

export function headlineParts(src: string): HeadlinePart[] {
  const text = (src.trim() || DEFAULT_HERO_HEADLINE).replace(/\s+/g, " ");
  const parts: HeadlinePart[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), accent: false });
    parts.push({ text: m[1], accent: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), accent: false });
  return parts;
}
