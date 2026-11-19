import type { Project } from "@/db/schema";
import { hostOf } from "@/lib/format";
import { ArrowUpRight } from "./icons";
import { Markdown } from "./Markdown";
import { ProjectLogo } from "./ProjectLogo";
import { StatusBadge } from "./ui/StatusBadge";

export function ProjectCard({ p, compact = false, headingLevel = 3 }: { p: Project; compact?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="glass glass-hover flex h-full flex-col p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <ProjectLogo name={p.name} logoUrl={p.logoUrl} />
        <StatusBadge status={p.status} />
      </div>
      <Heading className="text-xl font-semibold tracking-tight">{p.name}</Heading>
      <p className="mt-0.5 font-mono text-[11px] text-dim">{hostOf(p.url)}</p>
      <p className="mt-2 text-sm text-muted">{p.tagline}</p>
      {!compact && p.description && (
        <Markdown className="prose-compact mt-4 text-muted">{p.description}</Markdown>
      )}
      {p.techStack.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {p.techStack.map((t) => (
            <li key={t} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-dim">
              {t}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-6">
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-fg hover:text-accent"
        >
          Launch App <ArrowUpRight />
        </a>
      </div>
    </article>
  );
}
