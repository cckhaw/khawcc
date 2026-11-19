import "server-only";
import { createHash, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./session";

const secret = () => process.env.SESSION_SECRET;

function safeEqual(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

function checkPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (stored) {
    const [scheme, saltHex, hashHex] = stored.split(":");
    if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, "hex");
    return safeEqual(scryptSync(password, Buffer.from(saltHex, "hex"), expected.length), expected);
  }
  const plain = process.env.ADMIN_PASSWORD;
  if (!plain) return false;
  // Hash both sides so lengths match for the constant-time compare.
  const h = (s: string) => createHash("sha256").update(s).digest();
  return safeEqual(h(password), h(plain));
}

export function authConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_EMAIL && (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD) && secret() && secret()!.length >= 16,
  );
}

export async function login(email: string, password: string): Promise<boolean> {
  if (!authConfigured()) return false;
  const emailOk = email.trim().toLowerCase() === process.env.ADMIN_EMAIL!.trim().toLowerCase();
  const passOk = checkPassword(password);
  if (!(emailOk && passOk)) {
    await new Promise((r) => setTimeout(r, 700)); // blunt brute-force friction
    return false;
  }
  const token = await signSession(process.env.ADMIN_EMAIL!.trim().toLowerCase(), secret()!);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return true;
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySession(token, secret());
}

export async function isAdmin(): Promise<boolean> {
  return (await getSession()) !== null;
}

/** Call at the top of every admin page and Server Action. */
export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}
