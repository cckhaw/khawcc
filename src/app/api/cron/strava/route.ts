import { NextResponse } from "next/server";
import { revalidateAll } from "@/lib/actions/util";
import { syncStrava } from "@/lib/strava";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily job (see vercel.json crons). Vercel sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
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
