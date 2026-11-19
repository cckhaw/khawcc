import type { Experience } from "@/db/schema";
import { fmtPeriod } from "@/lib/format";
import { Markdown } from "./Markdown";
import { ProjectLogo } from "./ProjectLogo";

export function ExperienceSnippet({ e }: { e: Experience }) {
  return (
    <article className="glass glass-hover flex h-full flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-dim">{fmtPeriod(e.startDate, e.endDate, e.isCurrent)}</p>
        <ProjectLogo name={e.company} logoUrl={e.logoUrl} size={36} />
      </div>
      <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight">{e.roleTitle}</h3>
      <p className="mt-1 text-sm text-accent">
        {e.company}
        {e.location ? <span className="text-dim"> · {e.location}</span> : null}
      </p>
      <Markdown className="prose-compact mt-4 text-muted">{e.summary}</Markdown>
    </article>
  );
}
