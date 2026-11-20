import "server-only";
import { eq } from "drizzle-orm";
import { requireDb, schema } from "@/db";
import { BEYOND_KEY, DEFAULT_BEYOND, sanitizeBeyond } from "./beyond";
import { aggregateActivities, totalsToStats, type Activity, type Totals } from "./strava-stats";
import { SITE_URL } from "./seo";

/**
 * Strava integration: OAuth tokens live in the database (they rotate on every refresh),
 * and a daily job (Vercel Cron -> /api/cron/strava) rewrites the "Beyond the desk" numbers.
 * Env: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET (from https://www.strava.com/settings/api), CRON_SECRET.
 */
export const STRAVA_AUTH_KEY = "strava_auth";
const API = "https://www.strava.com/api/v3";
const OAUTH = "https://www.strava.com/oauth";

export type StravaAuth = { accessToken: string; refreshToken: string; expiresAt: number; athleteId: number; athleteName: string };

export const stravaConfigured = () => Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET);
export const redirectUri = () => `${SITE_URL}/api/admin/strava/callback`;

export function authorizeUrl(state: string): string {
  const q = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID ?? "",
    redirect_uri: redirectUri(),
    response_type: "code",
    approval_prompt: "auto",
    // activity:read_all so private activities are counted too; only totals are stored.
    scope: "read,activity:read_all",
    state,
  });
  return `${OAUTH}/authorize?${q}`;
}

async function tokenRequest(params: Record<string, string>) {
  const res = await fetch(`${OAUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.STRAVA_CLIENT_ID ?? "", client_secret: process.env.STRAVA_CLIENT_SECRET ?? "", ...params }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Strava token request failed (${res.status}).`);
  return (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athlete?: { id: number; firstname?: string; lastname?: string };
  };
}

export async function getAuth(): Promise<StravaAuth | null> {
  const [row] = await requireDb().select().from(schema.siteContent).where(eq(schema.siteContent.key, STRAVA_AUTH_KEY));
  const v = row?.value as Partial<StravaAuth> | undefined;
  return v?.refreshToken && v.athleteId ? (v as StravaAuth) : null;
}

async function saveAuth(a: StravaAuth) {
  await requireDb()
    .insert(schema.siteContent)
    .values({ key: STRAVA_AUTH_KEY, value: a })
    .onConflictDoUpdate({ target: schema.siteContent.key, set: { value: a, updatedAt: new Date() } });
}

export async function disconnect() {
  await requireDb().delete(schema.siteContent).where(eq(schema.siteContent.key, STRAVA_AUTH_KEY));
}

/** Exchange the one-time code from the OAuth redirect and remember the tokens. */
export async function connectWithCode(code: string): Promise<StravaAuth> {
  const t = await tokenRequest({ grant_type: "authorization_code", code });
  if (!t.athlete?.id) throw new Error("Strava did not return an athlete.");
  const auth: StravaAuth = {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    expiresAt: t.expires_at,
    athleteId: t.athlete.id,
    athleteName: [t.athlete.firstname, t.athlete.lastname].filter(Boolean).join(" "),
  };
  await saveAuth(auth);
  return auth;
}

/** A valid access token; refreshes (and stores the rotated refresh token) when it is about to expire. */
async function accessToken(auth: StravaAuth): Promise<string> {
  if (auth.expiresAt - 300 > Date.now() / 1000) return auth.accessToken;
  const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: auth.refreshToken });
  await saveAuth({ ...auth, accessToken: t.access_token, refreshToken: t.refresh_token, expiresAt: t.expires_at });
  return t.access_token;
}

async function fetchAllActivities(token: string): Promise<Activity[]> {
  const all: Activity[] = [];
  for (let page = 1; page <= 60; page++) {
    const res = await fetch(`${API}/athlete/activities?per_page=200&page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`Strava activities request failed (${res.status}).`);
    const batch = (await res.json()) as Activity[];
    all.push(...batch);
    if (batch.length < 200) break;
  }
  return all;
}

/** Read Strava, then rewrite the numbers in the "Beyond the desk" document. */
export async function syncStrava(): Promise<{ totals: Totals; syncedAt: string }> {
  if (!stravaConfigured()) throw new Error("STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET are not set.");
  const auth = await getAuth();
  if (!auth) throw new Error("Strava is not connected yet. Connect it in /admin/beyond.");
  const totals = aggregateActivities(await fetchAllActivities(await accessToken(auth)));

  const db = requireDb();
  const [row] = await db.select().from(schema.siteContent).where(eq(schema.siteContent.key, BEYOND_KEY));
  const doc = row ? sanitizeBeyond(row.value) : DEFAULT_BEYOND;
  const syncedAt = new Date().toISOString();
  const next = { ...doc, stats: totalsToStats(totals), strava: { auto: true, syncedAt } };
  await db
    .insert(schema.siteContent)
    .values({ key: BEYOND_KEY, value: next })
    .onConflictDoUpdate({ target: schema.siteContent.key, set: { value: next, updatedAt: new Date() } });
  return { totals, syncedAt };
}
