import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { authorizeUrl, stravaConfigured } from "@/lib/strava";

export const dynamic = "force-dynamic";

/** Starts the Strava OAuth flow (admin only). */
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin/login", req.url));
  if (!stravaConfigured()) return NextResponse.redirect(new URL("/admin/beyond?strava=unconfigured", req.url));
  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(authorizeUrl(state));
  res.cookies.set("strava_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/admin/strava", maxAge: 600 });
  return res;
}
