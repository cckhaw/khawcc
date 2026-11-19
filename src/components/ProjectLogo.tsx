/** Project icon tile; falls back to the project's initial when no logo is set. */
export function ProjectLogo({ name, logoUrl, size = 44 }: { name: string; logoUrl: string; size?: number }) {
  const box = { width: size, height: size };
  if (!logoUrl) {
    return (
      <span
        aria-hidden
        style={box}
        className="flex shrink-0 items-center justify-center rounded-xl bg-accent/10 font-display text-lg font-semibold text-accent"
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static icons from many origins
    <img
      src={logoUrl}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      style={box}
      className="shrink-0 rounded-xl border border-line bg-white object-contain p-1"
    />
  );
}
