"use client";

import { useMemo, useRef, useState } from "react";
import { CHAPTER_STATUSES } from "@/db/constants";
import type { BookChapter, BookPart, Project } from "@/db/schema";
import { saveChapter } from "@/lib/actions/book";
import { CHAPTER_STATUS_LABEL } from "@/lib/format";
import { joinSections, readingTime, slugify, splitSections, wordCount } from "@/lib/markdown";
import { ArrowDown, ArrowUp } from "../icons";
import { MediaPanel } from "./MediaPanel";
import { RichTextEditor, type RichTextHandle } from "./RichTextEditor";
import { Field, SubmitButton } from "./ui";

type Props = {
  chapter?: BookChapter;
  parts: BookPart[];
  projects: Pick<Project, "slug" | "name">[];
};

export function ChapterEditor({ chapter, parts, projects }: Props) {
  const [content, setContent] = useState(chapter?.contentMarkdown ?? "");
  const [title, setTitle] = useState(chapter?.title ?? "");
  const [slug, setSlug] = useState(chapter?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(chapter));
  const [newSection, setNewSection] = useState("");
  const editor = useRef<RichTextHandle>(null);

  const words = useMemo(() => wordCount(content), [content]);
  const minutes = useMemo(() => readingTime(content), [content]);
  const parsed = useMemo(() => splitSections(content), [content]);

  const apply = (md: string) => {
    setContent(md);
    editor.current?.setMarkdown(md);
  };
  function moveSection(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= parsed.sections.length) return;
    const s = [...parsed.sections];
    [s[i], s[j]] = [s[j], s[i]];
    apply(joinSections(parsed.intro, s));
  }
  function removeSection(i: number) {
    if (!window.confirm(`Remove section “${parsed.sections[i].heading}” and its text?`)) return;
    apply(joinSections(parsed.intro, parsed.sections.filter((_, k) => k !== i)));
  }
  function addSection() {
    const h = newSection.trim();
    if (!h) return;
    apply(joinSections(parsed.intro, [...parsed.sections, { heading: h, level: 2, body: "" }]));
    setNewSection("");
  }
  const jumpTo = (heading: string) => editor.current?.jumpTo(heading);

  return (
    <form action={saveChapter} className="space-y-6">
      {chapter && <input type="hidden" name="id" value={chapter.id} />}

      <div className="glass grid gap-4 p-6 sm:grid-cols-6">
        <Field label="Title" className="sm:col-span-4">
          <input
            name="title"
            value={title}
            required
            className="field"
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="No. / label" hint="1, 5.1, Preface…" className="sm:col-span-2">
          <input name="chapterNumber" defaultValue={chapter?.chapterNumber} required maxLength={16} className="field" />
        </Field>
        <Field label="Subtitle" className="sm:col-span-4"><input name="subtitle" defaultValue={chapter?.subtitle} className="field" /></Field>
        <Field label="Slug" className="sm:col-span-2">
          <input name="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} className="field font-mono text-[13px]" />
        </Field>
        <Field label="Part" className="sm:col-span-3">
          <select name="partId" defaultValue={chapter?.partId ?? ""} className="field">
            <option value="">(No part)</option>
            {parts.map((p) => <option key={p.id} value={p.id}>Part {p.partNumber} · {p.title}</option>)}
          </select>
        </Field>
        <Field label="Status" className="sm:col-span-3">
          <select name="status" defaultValue={chapter?.status ?? "draft"} className="field">
            {CHAPTER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "wip_published" ? "Work in Progress (Public)" : CHAPTER_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Summary" hint="Shown on cards and the table of contents." className="sm:col-span-6">
          <textarea name="summary" rows={2} defaultValue={chapter?.summary} className="field" />
        </Field>
        {projects.length > 0 && (
          <fieldset className="sm:col-span-6">
            <legend className="mb-1.5 text-[13px] font-medium text-muted">Related *.khaw.cc projects</legend>
            <div className="flex flex-wrap gap-2">
              {projects.map((p) => (
                <label key={p.slug} className="has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:checked]:text-fg flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1 text-[13px] text-muted">
                  <input type="checkbox" name="related" value={p.slug} defaultChecked={chapter?.relatedProjectSlugs.includes(p.slug)} className="sr-only" />
                  {p.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
        <div>
          <RichTextEditor
            ref={editor}
            name="contentMarkdown"
            value={chapter?.contentMarkdown ?? ""}
            onChange={setContent}
            allowSplit
            minHeight="65vh"
            placeholder="Start writing your chapter…"
          />
          <p className="mt-2 text-right font-mono text-xs text-dim">{words.toLocaleString()} words · {minutes} min read</p>
        </div>

        <aside className="glass h-fit p-4">
          <p className="mb-3 eyebrow">Sections</p>
          {parsed.sections.length === 0 && <p className="text-xs text-dim">No <code>##</code> sections yet.</p>}
          <ol className="space-y-1">
            {parsed.sections.map((s, i) => (
              <li key={`${s.heading}-${i}`} className="flex items-center gap-1 rounded-lg px-1 py-1 text-[13px] hover:bg-card">
                <button type="button" onClick={() => jumpTo(s.heading)} className="min-w-0 flex-1 truncate text-left text-muted hover:text-fg" title={s.heading}>
                  {s.heading}
                </button>
                <button type="button" aria-label="Move section up" disabled={i === 0} onClick={() => moveSection(i, -1)} className="btn btn-sm !px-1.5"><ArrowUp width={12} height={12} /></button>
                <button type="button" aria-label="Move section down" disabled={i === parsed.sections.length - 1} onClick={() => moveSection(i, 1)} className="btn btn-sm !px-1.5"><ArrowDown width={12} height={12} /></button>
                <button type="button" aria-label="Remove section" onClick={() => removeSection(i)} className="btn btn-sm btn-danger !px-1.5">×</button>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex gap-2">
            <input value={newSection} onChange={(e) => setNewSection(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSection(); } }} placeholder="New section title" className="field !py-1.5 text-[13px]" />
            <button type="button" onClick={addSection} className="btn btn-sm">Add</button>
          </div>
        </aside>
      </div>

      <MediaPanel initial={chapter?.media ?? []} onInsert={(md) => editor.current?.insertMarkdown(md)} />

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-full border border-line bg-[var(--nav)] px-4 py-3 backdrop-blur-xl">
        <SubmitButton name="intent" value="save">Save chapter</SubmitButton>
        <SubmitButton name="intent" value="preview" className="btn">Save &amp; preview</SubmitButton>
        {chapter && (
          <a href={`/book/${chapter.slug}`} target="_blank" rel="noopener noreferrer" className="btn">
            Preview {chapter.status === "draft" ? "draft" : "live"} ↗
          </a>
        )}
      </div>
    </form>
  );
}
