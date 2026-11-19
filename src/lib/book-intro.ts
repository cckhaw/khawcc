/** Editable text on the /book landing page (stored in site_content, key "book_intro"). */
export type BookIntro = {
  /** Paragraph under the "Thinking in Signals" title. */
  intro: string;
  /** Small label above the note's heading. */
  noteEyebrow: string;
  noteTitle: string;
  /** Markdown. */
  noteBody: string;
};

export const BOOK_INTRO_KEY = "book_intro";

export const DEFAULT_BOOK_INTRO: BookIntro = {
  intro:
    "Twenty-five years in telecommunications, platform engineering, leadership and team management: the networks, the people and the midnight escalations. Not a textbook. A signal that bent, roamed, dropped, reconnected, and always found its way forward.",
  noteEyebrow: "A book still being written",
  noteTitle: "Still a work in progress, and that’s the point.",
  noteBody: `I’m moving into the last mile of my career, and with it the quiet, deliberate work of planning for retirement. It turns out to be exactly the right season to write this book. When you start counting the years you have left to build, you start noticing what really mattered: the people, the midnight escalations you got through together, the platforms that quietly worked.

So *Thinking in Signals* isn’t finished, and I don’t want it to be yet. I’m writing it the way I lived the work: one chapter at a time, revising as I understand more, and sharing as I go. Chapters will change. New ones will appear. Some stories will deepen once I find the words for them.

If you’re somewhere in the middle of your own journey (tired, mid-migration, wondering whether it all adds up), I hope these pages remind you that a career is never a straight line. It’s a signal that bends, roams, drops and reconnects. The last mile isn’t where the signal ends. It’s where you finally get to pass it on.

**Come back often. Walk it with me.**`,
};

const str = (v: unknown, max: number, fallback: string) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : fallback);

export function sanitizeBookIntro(input: unknown): BookIntro {
  const r = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const d = DEFAULT_BOOK_INTRO;
  return {
    intro: typeof r.intro === "string" ? r.intro.trim().slice(0, 1500) : d.intro,
    noteEyebrow: typeof r.noteEyebrow === "string" ? r.noteEyebrow.trim().slice(0, 80) : d.noteEyebrow,
    noteTitle: str(r.noteTitle, 200, d.noteTitle),
    noteBody: typeof r.noteBody === "string" ? r.noteBody.replace(/\r\n/g, "\n").trim().slice(0, 8000) : d.noteBody,
  };
}
