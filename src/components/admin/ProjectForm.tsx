"use client";

import { useRef, useState, useTransition } from "react";
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/db/constants";
import type { Project } from "@/db/schema";
import { fetchMetaAction, saveProject } from "@/lib/actions/projects";
import { LogoField } from "./LogoField";
import { RichTextEditor, type RichTextHandle } from "./RichTextEditor";
import { Block, Field, SubmitButton } from "./ui";

export function ProjectForm({ p }: { p?: Project }) {
  const ref = useRef<HTMLFormElement>(null);
  const descRef = useRef<RichTextHandle>(null);
  const [msg, setMsg] = useState<string>("");
  const [busy, start] = useTransition();

  function fill(name: string, value: string, onlyIfEmpty = true) {
    const el = ref.current?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
    if (el && value && (!onlyIfEmpty || !el.value.trim())) {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true })); // refresh previews bound to the field
    }
  }

  function fetchMeta() {
    const url = (ref.current?.elements.namedItem("url") as HTMLInputElement | null)?.value.trim();
    if (!url) return setMsg("Enter a URL first.");
    setMsg("Fetching…");
    start(async () => {
      const r = await fetchMetaAction(url);
      if ("error" in r) return setMsg(r.error);
      fill("name", r.title.split(/\s[|\-–·:]\s/)[0].trim());
      fill("tagline", r.description.length > 140 ? r.description.slice(0, 137).trimEnd() + "…" : r.description);
      const descEl = ref.current?.elements.namedItem("description") as HTMLInputElement | null;
      if (r.description && !descEl?.value.trim()) descRef.current?.setMarkdown(r.description);
      fill("logoUrl", r.icon);
      setMsg(`Prefilled empty fields from “${r.title || url}”.`);
    });
  }

  return (
    <form ref={ref} action={saveProject} className="grid gap-4 sm:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <Field label="URL" className="sm:col-span-2">
        <div className="flex gap-2">
          <input name="url" type="url" defaultValue={p?.url} placeholder="https://name.khaw.cc" required className="field" />
          <button type="button" onClick={fetchMeta} disabled={busy} className="btn shrink-0">
            {busy ? "Fetching…" : "Fetch meta"}
          </button>
        </div>
        {msg && <span className="mt-1 block text-xs text-dim" role="status">{msg}</span>}
      </Field>
      <Field label="Name"><input name="name" defaultValue={p?.name} required className="field" /></Field>
      <Field label="Slug" hint="Auto-generated from the name if blank."><input name="slug" defaultValue={p?.slug} className="field font-mono text-[13px]" /></Field>
      <Field label="Category">
        <select name="category" defaultValue={p?.category ?? PROJECT_CATEGORIES[0]} className="field">
          {PROJECT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Status">
        <select name="status" defaultValue={p?.status ?? "live"} className="field">
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <div className="sm:col-span-2"><LogoField label="Logo / icon" defaultValue={p?.logoUrl} fallbackName={p?.name ?? ""} /></div>
      <Field label="Tagline" className="sm:col-span-2"><input name="tagline" defaultValue={p?.tagline} className="field" /></Field>
      <Block label="Description" className="sm:col-span-2"><RichTextEditor ref={descRef} name="description" value={p?.description ?? ""} minHeight="8rem" /></Block>
      <Field label="Tech stack" hint="Comma-separated tags." className="sm:col-span-2"><input name="techStack" defaultValue={p?.techStack.join(", ")} className="field" /></Field>
      <Field label="Sort order" hint="Lower numbers first."><input name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 100} className="field" /></Field>
      <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" name="featuredOnCv" defaultChecked={p?.featuredOnCv} /> Featured on CV / home</label>
      <div className="sm:col-span-2"><SubmitButton>{p ? "Save project" : "Add project"}</SubmitButton></div>
    </form>
  );
}
