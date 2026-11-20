import type { Profile } from "@/db/schema";
import type { BeyondDoc } from "@/lib/beyond";
import { ArrowUpRight, InstagramIcon, StravaIcon } from "./icons";

/** A deliberately quiet strip near the bottom of the home page: endurance stats, links and a few photos. */
export function BeyondWork({ doc, profile }: { doc: BeyondDoc; profile: Profile }) {
  if (!doc.enabled) return null;
  const handle = profile.instagramHandle.replace(/^@/, "");
  const links = [
    profile.stravaUrl && { href: profile.stravaUrl, label: "Strava", Icon: StravaIcon, text: "Follow on Strava" },
    handle && { href: `https://instagram.com/${handle}`, label: "Instagram", Icon: InstagramIcon, text: `@${handle}` },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof StravaIcon; text: string }[];

  return (
    <section className="no-print mx-auto mt-24 max-w-6xl px-5 sm:px-8" aria-labelledby="beyond-title">
      <div className="border-t border-line pt-10">
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <p className="eyebrow">Off the clock</p>
            <h2 id="beyond-title" className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              {doc.heading}
            </h2>
            {doc.intro && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">{doc.intro}</p>}

            {doc.stats.length > 0 && (
              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
                {doc.stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span className="font-display text-2xl font-semibold tracking-tight">{s.value}</span>
                      <span className="mt-0.5 block text-xs text-dim">{s.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {doc.strava.auto && doc.stats.length > 0 && (
              <p className="mt-3 text-[11px] text-dim">
                Powered by{" "}
                <a href={profile.stravaUrl || "https://www.strava.com"} target="_blank" rel="noopener noreferrer" className="font-semibold underline-offset-2 hover:underline">
                  Strava
                </a>
              </p>
            )}

            {links.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {links.map(({ href, label, Icon, text }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center gap-1.5 text-muted transition hover:text-accent">
                      <Icon width={15} height={15} /> {text} <ArrowUpRight width={12} height={12} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {doc.photos.length > 0 && (
            <ul className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Recent photos">
              {doc.photos.map((p, i) => {
                const img = (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded photos
                  <img
                    src={p.url}
                    alt={p.alt || "Photo from a ride or run"}
                    loading="lazy"
                    className="aspect-square w-full rounded-xl border border-line object-cover grayscale-[35%] transition duration-300 group-hover:grayscale-0"
                  />
                );
                return (
                  <li key={`${p.url}-${i}`} className="group">
                    {p.href ? (
                      <a href={p.href} target="_blank" rel="noopener noreferrer" aria-label={p.alt || "Open on Instagram"} className="block">
                        {img}
                      </a>
                    ) : (
                      img
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
