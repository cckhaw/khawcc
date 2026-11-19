import type { Profile } from "@/db/schema";

/**
 * Hero portrait in the style of the reference: a warm gradient frame with the
 * person cut out and breaking the top edge, plus a few hand-placed decorations.
 * Light mode shows one photo, dark mode the other (swapped in CSS, no flash).
 */
export function Portrait({ profile }: { profile: Profile }) {
  const custom = profile.avatarUrl;
  const img = "absolute bottom-0 left-1/2 w-auto max-w-none -translate-x-1/2 select-none object-contain object-bottom";
  return (
    <div className="relative mx-auto w-full max-w-[26rem]">
      <div className="relative aspect-[4/5]">
        {/* gradient frame (bottom 82%) */}
        <div
          className="absolute inset-x-0 bottom-0 h-[82%] rounded-[1.75rem]"
          style={{ background: "linear-gradient(150deg, var(--frame-1), var(--frame-2))" }}
          aria-hidden
        />
        {/* decorations */}
        <svg className="absolute -left-6 top-[22%] h-24 w-24" viewBox="0 0 100 100" fill="none" aria-hidden>
          <path d="M0 100V0h100" stroke="var(--deco)" strokeOpacity="0.0" />
          <path d="M5 95A90 90 0 0 1 95 5" stroke="var(--accent-2)" strokeWidth="1.5" opacity="0.7" />
          <path d="M5 70A65 65 0 0 1 70 5" stroke="var(--accent-2)" strokeWidth="1.5" opacity="0.45" />
        </svg>
        <svg className="absolute -right-5 top-[30%] h-32 w-12" viewBox="0 0 48 128" aria-hidden>
          {Array.from({ length: 5 }).flatMap((_, r) =>
            Array.from({ length: 2 }).map((__, c) => (
              <path key={`${r}-${c}`} d={`M${12 + c * 24} ${10 + r * 26}v10M${7 + c * 24} ${15 + r * 26}h10`} stroke="var(--deco)" strokeWidth="2" strokeLinecap="round" />
            )),
          )}
        </svg>
        <svg className="absolute -bottom-4 -left-4 h-20 w-28" viewBox="0 0 112 80" aria-hidden>
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M${i * 12} 80L${i * 12 + 40} 0`} stroke="var(--deco)" strokeWidth="1.4" opacity="0.7" />
          ))}
        </svg>

        {/* person: clipped to the frame's rounded bottom, free to overflow at the top */}
        <div className="absolute inset-0" style={{ clipPath: "inset(-10% -20% 0 -20% round 0 0 1.75rem 1.75rem)" }}>
          {custom ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided URL
            <img src={custom} alt={profile.fullName} className={`${img} h-[96%]`} />
          ) : (
            <>
              {/* eslint-disable @next/next/no-img-element -- static, pre-optimised cut-outs */}
              <img src="/img/portrait-light.webp" alt={profile.fullName} width={627} height={838} className={`portrait-light ${img} h-full`} fetchPriority="high" />
              <img src="/img/portrait-dark.webp" alt={profile.fullName} width={761} height={835} className={`portrait-dark ${img} h-[92%]`} loading="lazy" />
              {/* eslint-enable @next/next/no-img-element */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
