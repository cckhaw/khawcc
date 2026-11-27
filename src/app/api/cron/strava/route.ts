import { NextResponse } from "next/server";
import { revalidateAll } from "@/lib/actions/util";
import { syncStrava } from "@/lib/strava";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
// Same region as the database (Singapore) so each query is fast.
export const preferredRegion = "sin1";

/** Daily job (see vercel.json crons). Vercel sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(req: Request) {
  // Trim both sides: a secret pasted with a stray space or newline would never match the header Vercel sends.
  const secret = process.env.CRON_SECRET?.trim().replace(/^["']|["']$/g, "");
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!secret || given !== secret) {
    // Lengths only, never values: lets us tell "secret not set" from "secret differs" in the runtime logs.
    console.warn(`[cron/strava] unauthorized: secretSet=${Boolean(secret)} secretLen=${secret?.length ?? 0} headerLen=${given.length}`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { totals, syncedAt } = await syncStrava();
    revalidateAll();
    return NextResponse.json({ ok: true, syncedAt, ...totals });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Sync failed" }, { status: 500 });
  }
}
