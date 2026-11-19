import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 font-mono text-xs uppercase tracking-[0.18em] text-dim">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
