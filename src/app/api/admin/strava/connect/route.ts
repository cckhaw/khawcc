import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { allowedOrigin, authorizeUrl, stravaConfigured } from "@/lib/strava";

export const dynamic = "force-dynamic";

/** Starts the Strava OAuth flow (admin only). */
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin/login", req.url));
  if (!stravaConfigured()) return NextResponse.redirect(new URL("/admin/beyond?strava=unconfigured", req.url));
  // Strava sends the browser back to the address the admin is using now (it must match the app's callback domain).
  const origin = new URL(req.url).origin;
  if (!allowedOrigin(origin)) return NextResponse.redirect(new URL("/admin/beyond?strava=unconfigured", req.url));
  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(authorizeUrl(state, origin));
  res.cookies.set("strava_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/admin/strava", maxAge: 600 });
  return res;
}
