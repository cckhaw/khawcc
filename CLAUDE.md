# khawcc: portfolio, CV, admin CMS, "Thinking in Signals"

Next.js (App Router) + TypeScript + Tailwind v4 · Neon Postgres + Drizzle · deployed on Vercel.

## Architecture
- `src/app/` public pages (`/`, `/cv`, `/projects`, `/book`, `/book/[slug]`) and `/admin/*` CMS.
- `src/db/schema.ts` Drizzle tables (profile_settings, experiences, skills_and_credentials, projects, book_parts, book_chapters). Enums in `src/db/constants.ts` (client-safe). Migrations in `drizzle/`.
- `src/db/seed-data/` initial content (book chapters come from the manuscript: `book-chapters.json`, produced by `scripts/split-manuscript.py`). `src/db/seed.ts` is idempotent.
- `src/lib/data.ts` the only read layer. **Without `DATABASE_URL` it serves the seed data (demo mode)**; admin writes then throw.
- `src/lib/actions/*` Server Actions. Every one starts with `requireAdmin()` and ends with `revalidateAll()` (`revalidatePath('/', 'layout')` + `/cv`, `/projects`, `/book`).
- Auth: HMAC-signed HTTP-only cookie (`src/lib/session.ts`, Web Crypto) checked in `src/proxy.ts` (Next 16 "middleware"), in admin pages and in actions. `/book/[slug]` is dynamic so admins can preview drafts.
- Markdown: `src/components/Markdown.tsx` (react-markdown, gfm, highlight, heading slugs); `src/lib/markdown.ts` (word count, reading time, TOC, section split).

## Commands
`npm run dev | build | lint | typecheck`
`npm run db:generate` (new migration from schema) · `db:migrate` (apply migrations over HTTP via `src/db/migrate.ts`) · `db:push` (sync schema directly) · `db:seed` · `hash-password -- "pass"`

## Environment (`.env.example`)
`DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (or preferred `ADMIN_PASSWORD_HASH`), `SESSION_SECRET` (16+ chars).

## UI rules
- Tokens are CSS variables in `globals.css` (dark `#0A0A0C` default, light via `data-theme="light"`); use `bg-bg text-fg text-muted border-line`, `.glass` cards, `.btn`, `.field`.
- Inter for UI, JetBrains Mono for dates/metrics/URLs. Reader measure `max-w-[68ch]`.
- Anything hidden when printing gets `.no-print`; `@media print` forces black-on-white and expands all CV roles.
- New admin mutations must call `revalidateAll()`; new public data goes through `src/lib/data.ts`.
