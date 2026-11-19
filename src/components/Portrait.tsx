import type { Profile } from "@/db/schema";

/** Portrait frame in the style of the reference layouts; monogram + signal rings when no photo is set. */
export function Portrait({ profile }: { profile: Profile }) {
  const initials = profile.fullName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3);
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
      <div
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] opacity-70 blur-[1px]"
        style={{ background: "linear-gradient(145deg, var(--accent), var(--accent-2))" }}
        aria-hidden
      />
      <div className="glass relative h-full w-full overflow-hidden rounded-[2rem] !border-line-strong">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided URL
          <img src={profile.avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-elev">
            <svg viewBox="0 0 200 250" className="absolute inset-0 h-full w-full" aria-hidden>
              {[28, 52, 76, 100, 124].map((r, i) => (
                <circle
                  key={r}
                  cx="100"
                  cy="125"
                  r={r}
                  fill="none"
                  stroke="var(--accent)"
                  strokeOpacity={0.5 - i * 0.08}
                  strokeWidth="0.8"
                />
              ))}
              <path
                d="M0 125 Q 25 60 50 125 T 100 125 T 150 125 T 200 125"
                fill="none"
                stroke="var(--accent-2)"
                strokeWidth="1.4"
                strokeOpacity="0.8"
              />
            </svg>
            <span className="relative font-mono text-6xl font-semibold tracking-tight text-gradient">{initials}</span>
          </div>
        )}
      </div>
      <div className="glass absolute -left-4 bottom-8 hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-medium sm:flex">
        <span className="h-2 w-2 animate-pulse rounded-full bg-good" />
        Building in public
      </div>
    </div>
  );
}
