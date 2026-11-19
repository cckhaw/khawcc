import { CHAPTER_STATUS_LABEL, STATUS_LABEL } from "@/lib/format";
import type { ChapterStatus, ProjectStatus } from "@/db/schema";

const tone: Record<ProjectStatus, string> = {
  live: "text-good border-good/30 bg-good/10",
  beta: "text-warn border-warn/30 bg-warn/10",
  wip: "text-accent border-accent/30 bg-accent/10",
  archived: "text-dim border-line bg-card",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider ${tone[status]}`}
    >
      {status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {STATUS_LABEL[status]}
    </span>
  );
}

const chTone: Record<ChapterStatus, string> = {
  draft: "text-dim border-line bg-card",
  wip_published: "text-warn border-warn/30 bg-warn/10",
  published: "text-good border-good/30 bg-good/10",
};

export function ChapterBadge({ status }: { status: ChapterStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider ${chTone[status]}`}
    >
      {CHAPTER_STATUS_LABEL[status]}
    </span>
  );
}
