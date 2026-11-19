import Link from "next/link";
import { ConfirmButton, Field, SubmitButton } from "@/components/admin/ui";
import { ArrowDown, ArrowUp } from "@/components/icons";
import { ChapterBadge } from "@/components/ui/StatusBadge";
import { deleteChapter, deletePart, moveChapter, movePart, savePart } from "@/lib/actions/book";
import { requireAdmin } from "@/lib/auth";
import { getChapters, getParts } from "@/lib/data";

export const metadata = { title: "Book" };

function Move({ action, id, dir, disabled }: { action: (fd: FormData) => Promise<void>; id: number; dir: "up" | "down"; disabled?: boolean }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dir" value={dir} />
      <button className="btn btn-sm !px-2" disabled={disabled} aria-label={`Move ${dir}`}>
        {dir === "up" ? <ArrowUp width={14} height={14} /> : <ArrowDown width={14} height={14} />}
      </button>
    </form>
  );
}

export default async function AdminBook() {
  await requireAdmin();
  const [parts, chapters] = await Promise.all([getParts(), getChapters({ includeDrafts: true })]);
  const groups = [
    ...parts.map((p) => ({ part: p, items: chapters.filter((c) => c.partId === p.id) })),
    { part: null, items: chapters.filter((c) => !parts.some((p) => p.id === c.partId)) },
  ];
  const nextPartNo = Math.max(0, ...parts.map((p) => p.partNumber)) + 1;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Thinking in Signals</h1>
        <Link href="/admin/book/new" className="btn btn-primary">New chapter</Link>
      </div>

      <div className="space-y-8">
        {groups.map(({ part, items }, gi) => (
          <section key={part?.id ?? "none"}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {part && (
                <div className="flex gap-1">
                  <Move action={movePart} id={part.id} dir="up" disabled={gi === 0} />
                  <Move action={movePart} id={part.id} dir="down" disabled={gi === parts.length - 1} />
                </div>
              )}
              <h2 className="flex-1 text-lg font-semibold">{part ? `Part ${part.partNumber} · ${part.title}` : "Unassigned chapters"}</h2>
              {part && (
                <form action={deletePart}>
                  <input type="hidden" name="id" value={part.id} />
                  <ConfirmButton message="Delete this part? Its chapters are kept and become unassigned.">Delete part</ConfirmButton>
                </form>
              )}
            </div>
            {part && (
              <details className="mb-3">
                <summary className="cursor-pointer text-[13px] text-muted hover:text-fg">Edit part</summary>
                <form action={savePart} className="glass mt-3 grid gap-3 p-4 sm:grid-cols-[6rem_1fr]">
                  <input type="hidden" name="id" value={part.id} />
                  <Field label="Number"><input name="partNumber" type="number" defaultValue={part.partNumber} className="field" /></Field>
                  <Field label="Title"><input name="title" defaultValue={part.title} required className="field" /></Field>
                  <Field label="Description" className="sm:col-span-2"><textarea name="description" rows={2} defaultValue={part.description} className="field" /></Field>
                  <div className="sm:col-span-2"><SubmitButton>Save part</SubmitButton></div>
                </form>
              </details>
            )}
            {items.length === 0 ? (
              <p className="text-sm text-dim">No chapters.</p>
            ) : (
              <ul className="space-y-2">
                {items.map((c, i) => (
                  <li key={c.id} className="glass p-3">
                    <div className="flex items-start gap-3">
                      <span className="w-12 shrink-0 pt-0.5 font-mono text-xs text-dim">{c.chapterNumber}</span>
                      <div className="min-w-0 flex-1">
                        <Link href={`/admin/book/${c.id}`} className="font-medium leading-snug hover:text-accent">{c.title}</Link>
                        <p className="mt-0.5 break-all font-mono text-[11px] text-dim">/{c.slug} · {c.readingTimeMinutes} min</p>
                      </div>
                      <ChapterBadge status={c.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Move action={moveChapter} id={c.id} dir="up" disabled={i === 0} />
                      <Move action={moveChapter} id={c.id} dir="down" disabled={i === items.length - 1} />
                      <Link href={`/book/${c.slug}`} target="_blank" className="btn btn-sm">
                        {c.status === "draft" ? "Preview Draft" : "View"}
                      </Link>
                      <Link href={`/admin/book/${c.id}`} className="btn btn-sm">Edit</Link>
                      <form action={deleteChapter} className="ml-auto">
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmButton message={`Delete chapter “${c.title}”? This cannot be undone.`}>Delete</ConfirmButton>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <section className="glass p-6">
        <h2 className="mb-4 text-lg font-semibold">Add a part</h2>
        <form action={savePart} className="grid gap-3 sm:grid-cols-[6rem_1fr]">
          <Field label="Number"><input name="partNumber" type="number" defaultValue={nextPartNo} className="field" /></Field>
          <Field label="Title"><input name="title" required className="field" /></Field>
          <Field label="Description" className="sm:col-span-2"><textarea name="description" rows={2} className="field" /></Field>
          <div className="sm:col-span-2"><SubmitButton>Add part</SubmitButton></div>
        </form>
      </section>
    </div>
  );
}
