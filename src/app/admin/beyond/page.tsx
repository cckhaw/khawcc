import { headers } from "next/headers";
import Link from "next/link";
import { BeyondEditor } from "@/components/admin/BeyondEditor";
import { ConfirmButton } from "@/components/admin/ui";
import { hasDb } from "@/db";
import { disconnectStrava, syncStravaNow } from "@/lib/actions/beyond";
import { requireAdmin } from "@/lib/auth";
import { getBeyond } from "@/lib/data";
import { getAuth, stravaConfigured } from "@/lib/strava";

export const metadata = { title: "Beyond the desk" };

const NOTE: Record<string, { tone: "good" | "warn"; text: string }> = {
  connected: { tone: "good", text: "Strava connected and the numbers were updated." },
  synced: { tone: "good", text: "Synced. The numbers on the home page are up to date." },
  disconnected: { tone: "good", text: "Strava disconnected. The last numbers stay until you edit them." },
  denied: { tone: "warn", text: "Strava access was not approved." },
  state: { tone: "warn", text: "The sign-in check failed. Please try connecting again." },
  unconfigured: { tone: "warn", text: "Strava is not set up on the server yet (see below)." },
};

export default async function AdminBeyond({ searchParams }: { searchParams: Promise<{ saved?: string; strava?: string; msg?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const doc = await getBeyond();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const configured = stravaConfigured();
  const auth = configured && hasDb() ? await getAuth().catch(() => null) : null;
  const note = sp.strava === "error" ? { tone: "warn" as const, text: `Strava error: ${sp.msg ?? "something went wrong"}` } : sp.strava ? NOTE[sp.strava] : undefined;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Beyond the desk</h1>
        <p className="mt-1 text-sm text-muted">
          The quiet Strava / Instagram strip near the bottom of the home page. Your Strava and Instagram links are set in{" "}
          <Link href="/admin/profile" className="text-accent underline underline-offset-2">Profile</Link>.
        </p>
      </div>
      {sp.saved && <p className="rounded-xl border border-good/40 bg-good/10 px-4 py-2 text-sm text-good">Saved. The site has been revalidated.</p>}
      {note && (
        <p className={`rounded-xl border px-4 py-2 text-sm ${note.tone === "good" ? "border-good/40 bg-good/10 text-good" : "border-warn/40 bg-warn/10 text-warn"}`}>{note.text}</p>
      )}

      <section className="glass p-4 sm:p-5" aria-labelledby="strava-conn">
        <h2 id="strava-conn" className="text-sm font-semibold">Strava connection</h2>
        {!configured ? (
          <div className="mt-2 space-y-2 text-sm text-muted">
            <p>One-time setup to let the site read your Strava totals every day:</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Create an app at <a className="text-accent underline underline-offset-2" href="https://www.strava.com/settings/api" target="_blank" rel="noopener noreferrer">strava.com/settings/api</a> and set its <em>Authorization Callback Domain</em> to <code className="font-mono text-xs">{host}</code> (just the domain, no https://).</li>
              <li>In Vercel (Project, Settings, Environment Variables) add <code className="font-mono text-xs">STRAVA_CLIENT_ID</code>, <code className="font-mono text-xs">STRAVA_CLIENT_SECRET</code> and <code className="font-mono text-xs">CRON_SECRET</code> (any long random text), then redeploy.</li>
              <li>Come back here and press <strong>Connect Strava</strong>.</li>
            </ol>
          </div>
        ) : auth ? (
          <div className="mt-2 space-y-3 text-sm">
            <p className="text-muted">
              Connected{auth.athleteName ? ` as ${auth.athleteName}` : ""}. A daily job (03:30 Malaysia time) refreshes the numbers when automatic updates are switched on below.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <form action={syncStravaNow}><button className="btn btn-sm">Sync now</button></form>
              <form action={disconnectStrava}><ConfirmButton message="Disconnect Strava? The daily update will stop.">Disconnect</ConfirmButton></form>
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-3 text-sm">
            <p className="text-muted">Not connected yet. You&rsquo;ll be sent to Strava to approve read-only access to your activities; only the four totals are stored.</p>
            <a href="/api/admin/strava/connect" className="btn btn-primary btn-sm">Connect Strava</a>
            <p className="text-xs text-dim">
              Strava will send you back to <code className="font-mono">{host}</code>, so that exact domain must be the &ldquo;Authorization Callback Domain&rdquo; in your Strava app. If it shows
              &ldquo;redirect_uri invalid&rdquo;, either change the domain in Strava or open this page from the address you registered there.
            </p>
          </div>
        )}
      </section>

      <BeyondEditor initial={doc} stravaConnected={Boolean(auth)} />
    </div>
  );
}
