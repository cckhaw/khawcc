import { ProjectLogo } from "./ProjectLogo";

/** One or two company logos side by side; falls back to an initial tile when there are none. */
export function CompanyLogos({ name, logos, size = 44 }: { name: string; logos: string[]; size?: number }) {
  const shown = logos.filter(Boolean).slice(0, 2);
  if (shown.length === 0) return <ProjectLogo name={name} logoUrl="" size={size} />;
  return (
    <span className="flex shrink-0 items-center gap-2">
      {shown.map((url) => (
        <ProjectLogo key={url} name={name} logoUrl={url} size={size} />
      ))}
    </span>
  );
}
