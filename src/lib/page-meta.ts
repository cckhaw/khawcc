import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type PageMeta = { title: string; description: string };

function isPrivate(ip: string): boolean {
  if (ip.includes(":")) {
    const l = ip.toLowerCase();
    return l === "::1" || l === "::" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") || l.startsWith("::ffff:127.") || l.startsWith("::ffff:10.") || l.startsWith("::ffff:192.168.");
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127)
  );
}

async function assertPublic(u: URL) {
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http(s) URLs are supported.");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivate(a.address))) throw new Error("That address is not publicly reachable.");
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

function metaContent(html: string, key: string): string {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${key}["'][^>]*>`, "i");
  const tag = re.exec(html)?.[0];
  const c = tag && /content=["']([^"']*)["']/i.exec(tag);
  return c ? decode(c[1]) : "";
}

/** Fetch a page (SSRF-guarded, size/time limited) and pull title + description. */
export async function fetchPageMeta(input: string): Promise<PageMeta> {
  let url = new URL(input);
  for (let hop = 0; hop < 4; hop++) {
    await assertPublic(url);
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": "Mozilla/5.0 (compatible; MetaFetcher/1.0)", accept: "text/html" },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = new URL(res.headers.get("location")!, url);
      continue;
    }
    if (!res.ok) throw new Error(`The site responded with HTTP ${res.status}.`);
    const reader = res.body?.getReader();
    let html = "";
    const dec = new TextDecoder();
    let bytes = 0;
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      html += dec.decode(value, { stream: true });
      if (bytes > 512_000 || /<\/head>/i.test(html)) {
        await reader.cancel();
        break;
      }
    }
    const title = metaContent(html, "og:title") || decode(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "");
    const description = metaContent(html, "og:description") || metaContent(html, "description");
    if (!title && !description) throw new Error("No title or description found on that page.");
    return { title, description };
  }
  throw new Error("Too many redirects.");
}
