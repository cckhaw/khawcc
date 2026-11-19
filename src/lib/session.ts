/**
 * Edge-safe signed session tokens (HMAC-SHA256 via Web Crypto).
 * Used by both proxy.ts (edge) and server actions (node).
 */
export const SESSION_COOKIE = "kcc_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function key(secret: string, usage: KeyUsage[]) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usage);
}

export type SessionPayload = { email: string; exp: number };

export async function signSession(email: string, secret: string): Promise<string> {
  const payload: SessionPayload = { email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await key(secret, ["sign"]), enc.encode(body));
  return `${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined, secret: string | undefined): Promise<SessionPayload | null> {
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await key(secret, ["verify"]),
      fromB64url(sig) as BufferSource,
      enc.encode(body),
    );
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
