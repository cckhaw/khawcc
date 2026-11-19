#!/usr/bin/env python3
"""One-off helper: split the pandoc-converted manuscript into chapters JSON.
Usage: pandoc book.docx -t gfm --wrap=none -o book.md && python3 scripts/split-manuscript.py book.md src/db/seed-data/book-chapters.json
"""
import json, re, sys

src, out = sys.argv[1], sys.argv[2]
lines = open(src, encoding="utf-8").read().split("\n")
head = re.compile(r"^#{1,2} (Preface|Annex|\d+(?:\.\d+)?)(?:: ?(.*))?$")

chapters, cur = [], None
for ln in lines:
    m = head.match(ln)
    if m:
        cur = {"label": m.group(1), "title": (m.group(2) or m.group(1)).strip(), "lines": []}
        chapters.append(cur)
    elif cur is not None:
        cur["lines"].append(ln)

def slugify(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s

def clean(body_lines):
    out_lines, in_signal = [], False
    for ln in body_lines:
        if re.match(r"^###\s+\*?💡", ln):
            in_signal = True
            out_lines.append("> **💡 How to use this signal**")
            out_lines.append(">")
            continue
        if in_signal:
            out_lines.append(("> " + ln) if ln.strip() else ">")
            continue
        out_lines.append(re.sub(r"^### ", "## ", ln))
    text = "\n".join(out_lines).strip()
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"(\n>)+$", "", text)
    return text

def summary(text):
    for para in text.split("\n\n"):
        p = para.strip()
        if not p or p.startswith(("#", ">", "-", "1.")):
            continue
        p = re.sub(r"[*_`]", "", p)
        sents = re.split(r"(?<=[.!?])\s+", p)
        s = " ".join(sents[:2])
        return s if len(s) <= 240 else s[:237].rsplit(" ", 1)[0] + "…"
    return ""

res = []
for i, c in enumerate(chapters):
    body = clean(c["lines"])
    label = c["label"]
    slug = "preface" if label == "Preface" else "annex-" + slugify(c["title"]) if label == "Annex" else f"chapter-{label.replace('.', '-')}-{slugify(c['title'])}"
    res.append({
        "label": label, "slug": slug, "title": c["title"],
        "summary": summary(body), "content": body, "order": i + 1,
    })
json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for r in res: print(r["label"], "|", r["slug"], "|", len(r["content"].split()), "words")
