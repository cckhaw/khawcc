"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { Markdown as MarkdownExt } from "@tiptap/markdown";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { Markdown } from "../Markdown";

export type RichTextHandle = {
  /** Replace the whole document (used by the section organiser). */
  setMarkdown: (md: string) => void;
  /** Insert Markdown at the cursor (used for pictures). */
  insertMarkdown: (md: string) => void;
  /** Scroll/move the cursor to a heading by its text. */
  jumpTo: (heading: string) => void;
};

type Mode = "visual" | "markdown" | "split";

type Props = {
  /** Form field name; a hidden input carries the Markdown on submit. */
  name: string;
  /** Initial Markdown (the editor owns the value afterwards). */
  value: string;
  onChange?: (md: string) => void;
  placeholder?: string;
  /** "full": headings, quote, image, rule. "basic": bold/italic/link/lists only. */
  variant?: "full" | "basic";
  /** Adds a Markdown + live preview mode. */
  allowSplit?: boolean;
  minHeight?: string;
  ref?: Ref<RichTextHandle>;
};

function ToolbarButton({ active, disabled, label, onClick, children }: { active?: boolean; disabled?: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[13px] transition disabled:opacity-40 ${
        active ? "bg-accent/15 text-accent" : "text-muted hover:bg-accent/10 hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, variant }: { editor: Editor; variant: "full" | "basic" }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const c = () => editor.chain().focus();

  function setLink() {
    if (s.link) return void c().unsetLink().run();
    const href = window.prompt("Link address (https://…)");
    if (href) c().extendMarkRange("link").setLink({ href }).run();
  }
  function addImage() {
    const src = window.prompt("Image address (https://… or /media/…)");
    if (src) c().setImage({ src }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5" role="toolbar" aria-label="Formatting">
      <ToolbarButton label="Bold" active={s.bold} onClick={() => c().toggleBold().run()}><b>B</b></ToolbarButton>
      <ToolbarButton label="Italic" active={s.italic} onClick={() => c().toggleItalic().run()}><i className="font-serif">I</i></ToolbarButton>
      {variant === "full" && (
        <>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden />
          <ToolbarButton label="Heading" active={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
          <ToolbarButton label="Subheading" active={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        </>
      )}
      <span className="mx-1 h-5 w-px bg-line" aria-hidden />
      <ToolbarButton label="Bulleted list" active={s.bullet} onClick={() => c().toggleBulletList().run()}>• List</ToolbarButton>
      {variant === "full" && (
        <>
          <ToolbarButton label="Numbered list" active={s.ordered} onClick={() => c().toggleOrderedList().run()}>1. List</ToolbarButton>
          <ToolbarButton label="Quote / callout" active={s.quote} onClick={() => c().toggleBlockquote().run()}>❝</ToolbarButton>
        </>
      )}
      <ToolbarButton label={s.link ? "Remove link" : "Add link"} active={s.link} onClick={setLink}>Link</ToolbarButton>
      {variant === "full" && (
        <>
          <ToolbarButton label="Insert image by address" onClick={addImage}>Image</ToolbarButton>
          <ToolbarButton label="Divider" onClick={() => c().setHorizontalRule().run()}>―</ToolbarButton>
        </>
      )}
      <span className="mx-1 h-5 w-px bg-line" aria-hidden />
      <ToolbarButton label="Undo" disabled={!s.canUndo} onClick={() => c().undo().run()}>↶</ToolbarButton>
      <ToolbarButton label="Redo" disabled={!s.canRedo} onClick={() => c().redo().run()}>↷</ToolbarButton>
    </div>
  );
}

export function RichTextEditor({ name, value, onChange, placeholder, variant = "full", allowSplit = false, minHeight = "14rem", ref }: Props) {
  const [md, setMd] = useState(value);
  const [mode, setMode] = useState<Mode>("visual");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const mdRef = useRef(value);

  const commit = (next: string) => {
    mdRef.current = next;
    setMd(next);
    onChange?.(next);
  };

  const editor = useEditor({
    immediatelyRender: false, // Next.js SSR
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, ...(variant === "basic" ? { trailingNode: false } : {}) }),
      MarkdownExt,
      Image,
      TableKit,
      Placeholder.configure({ placeholder: placeholder ?? "Start writing…" }),
    ],
    content: value,
    contentType: "markdown",
    editorProps: {
      attributes: { class: "prose-khaw prose-compact rte-surface focus:outline-none", "aria-label": name, style: `min-height:${minHeight}` },
    },
    // Only adopt the editor's serialisation once the user actually edits in Visual mode,
    // so merely opening a field never rewrites existing content.
    onUpdate: ({ editor: e }) => commit(e.getMarkdown().replace(/&amp;/g, "&")), // serializer over-escapes ampersands
  });

  useImperativeHandle(ref, () => ({
    setMarkdown(next) {
      commit(next);
      editor?.commands.setContent(next, { contentType: "markdown", emitUpdate: false });
    },
    insertMarkdown(snippet) {
      if (mode === "visual" && editor) {
        editor.chain().focus().insertContent(snippet, { contentType: "markdown" }).run();
      } else {
        const el = textarea.current;
        const at = el ? el.selectionStart : mdRef.current.length;
        commit(mdRef.current.slice(0, at) + snippet + mdRef.current.slice(at));
      }
    },
    jumpTo(heading) {
      if (mode === "visual" && editor) {
        const el = Array.from(editor.view.dom.querySelectorAll("h2,h3")).find((h) => h.textContent?.trim() === heading.trim());
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (textarea.current) {
        const idx = mdRef.current.indexOf(`## ${heading}`);
        if (idx >= 0) {
          textarea.current.focus();
          textarea.current.setSelectionRange(idx, idx);
          textarea.current.scrollTop = Math.max(0, mdRef.current.slice(0, idx).split("\n").length - 2) * 22;
        }
      }
    },
  }));

  function switchTo(next: Mode) {
    if (next !== "markdown" && next !== "split" && mode !== "visual") {
      // returning to Visual: load the (possibly hand-edited) Markdown into the editor
      editor?.commands.setContent(mdRef.current, { contentType: "markdown", emitUpdate: false });
    }
    setMode(next);
  }

  const modeBtn = (m: Mode, label: string) => (
    <button
      key={m}
      type="button"
      aria-pressed={mode === m}
      onClick={() => switchTo(m)}
      className={`rounded-full px-3 py-1 text-xs transition ${mode === m ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="rte overflow-hidden rounded-xl border border-line bg-card focus-within:border-accent">
      <input type="hidden" name={name} value={md} />
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-2.5 py-1.5">
        {mode === "visual" && editor ? <Toolbar editor={editor} variant={variant} /> : <span className="px-2 text-xs text-dim">Markdown source</span>}
        <div className="flex gap-1">
          {modeBtn("visual", "Visual")}
          {modeBtn("markdown", "Markdown")}
          {allowSplit && modeBtn("split", "Markdown + preview")}
        </div>
      </div>

      {mode === "visual" ? (
        editor ? (
          <div className="p-4"><EditorContent editor={editor} /></div>
        ) : (
          <div className="p-4 text-sm text-dim" style={{ minHeight }}>Loading editor…</div>
        )
      ) : (
        <div className={mode === "split" ? "grid md:grid-cols-2 md:divide-x md:divide-[var(--line)]" : ""}>
          <textarea
            ref={textarea}
            value={md}
            onChange={(e) => commit(e.target.value)}
            spellCheck
            aria-label={`${name} (Markdown)`}
            className="w-full resize-y bg-transparent p-4 font-mono text-[13px] leading-[22px] outline-none"
            style={{ minHeight }}
          />
          {mode === "split" && (
            <div className="overflow-y-auto p-5" style={{ maxHeight: "70vh" }}>
              <Markdown className="prose-compact">{md || "_Nothing to preview yet._"}</Markdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
