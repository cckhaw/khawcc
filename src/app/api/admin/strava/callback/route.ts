import { NextResponse } from "next/server";
import { revalidateAll } from "@/lib/actions/util";
import { isAdmin } from "@/lib/auth";
import { connectWithCode, syncStrava } from "@/lib/strava";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Strava redirects here after the owner approves access. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const back = (q: string) => NextResponse.redirect(new URL(`/admin/beyond?${q}`, url));
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin/login", url));

  const cookieState = (req.headers.get("cookie") ?? "").match(/strava_oauth_state=([a-f0-9]+)/)?.[1];
  const code = url.searchParams.get("code");
  if (url.searchParams.get("error") || !code) return back("strava=denied");
  if (!cookieState || cookieState !== url.searchParams.get("state")) return back("strava=state");

  try {
    await connectWithCode(code);
    await syncStrava();
    revalidateAll();
    const res = back("strava=connected");
    res.cookies.delete({ name: "strava_oauth_state", path: "/api/admin/strava" });
    return res;
  } catch (e) {
    return back(`strava=error&msg=${encodeURIComponent(e instanceof Error ? e.message.slice(0, 160) : "failed")}`);
  }
}
