import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChapterEditor } from "@/components/admin/ChapterEditor";
import { requireAdmin } from "@/lib/auth";
import { getChapterById, getParts, getProjects } from "@/lib/data";

export const metadata = { title: "Edit chapter" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; preview?: string }> };

export default async function EditChapter({ params, searchParams }: Props) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const chapter = isNew ? undefined : await getChapterById(Number(id));
  if (!isNew && !chapter) notFound();
  if (chapter && sp.preview) redirect(`/book/${chapter.slug}`); // admin cookie lets drafts render

  const [parts, projects] = await Promise.all([getParts(), getProjects({ includeArchived: true })]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/book" className="font-mono text-xs text-dim hover:text-fg">← All chapters</Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{isNew ? "New chapter" : chapter!.title}</h1>
        </div>
      </div>
      {sp.saved && <p className="rounded-xl border border-good/40 bg-good/10 px-4 py-2 text-sm text-good">Saved. The site has been revalidated.</p>}
      <ChapterEditor
        key={chapter?.updatedAt?.toString() ?? "new"}
        chapter={chapter}
        parts={parts}
        projects={projects.map((p) => ({ slug: p.slug, name: p.name }))}
      />
    </div>
  );
}
