# khawcc: portfolio, CV, admin CMS, "Thinking in Signals"

Next.js (App Router) + TypeScript + Tailwind v4 · Neon Postgres + Drizzle · deployed on Vercel.

## Architecture
- `src/app/` public pages (`/`, `/cv`, `/projects`, `/book`, `/book/[slug]`) and `/admin/*` CMS.
- `src/db/schema.ts` Drizzle tables (profile_settings, experiences, skills_and_credentials, projects, book_parts, book_chapters). Enums in `src/db/constants.ts` (client-safe). Migrations in `drizzle/`.
- `src/db/seed-data/` initial content (book chapters come from the manuscript: `book-chapters.json`, produced by `scripts/split-manuscript.py`). `src/db/seed.ts` is idempotent.
- `src/lib/data.ts` the only read layer. **Without `DATABASE_URL` it serves the seed data (demo mode)**; admin writes then throw.
- `src/lib/actions/*` Server Actions. Every one starts with `requireAdmin()` and ends with `revalidateAll()` (`revalidatePath('/', 'layout')` + `/cv`, `/projects`, `/book`).
- Auth: HMAC-signed HTTP-only cookie (`src/lib/session.ts`, Web Crypto) checked in `src/proxy.ts` (Next 16 "middleware"), in admin pages and in actions. `/book/[slug]` is dynamic so admins can preview drafts.
- Chapter media: `book_chapters.media` (jsonb: images + YouTube links, edited in the chapter editor, shown under the chapter). Uploaded images live in `media_files` (base64 in Postgres), uploaded via `POST /api/admin/media` (admin only) and served at `/media/<id>`; helpers in `src/lib/media.ts`.
- Admin editing: every Markdown field uses the TipTap WYSIWYG `src/components/admin/RichTextEditor.tsx` (Visual / Markdown / Markdown + preview). It stores Markdown (DB and renderers unchanged); achievements are stored as a bullet list parsed into `experiences.highlights` and rendered with `InlineMarkdown`.
- APAC map: one JSON document in `site_content` (key `apac_map`: headline stats + items with text, place, highlight, visible and pin x/y in map units), edited in `/admin/map` (drag pins) and rendered by `src/components/ApacMap.tsx` on the home page and `/apac-map` (shareable image, PNG download in the browser). Land shapes: `src/data/apac-map.json` from `scripts/build-apac-map.mjs`; defaults in `src/data/apac-projects.ts`.
- Motion: `Reveal` (scroll-in fade/rise via `.js .reveal`, class `js` set by the theme script so no-JS stays visible), `CountUp`, `.rise` hero entrance, NavBar scroll-progress line, `CareerRoute` (animated wavy career timeline on the home page). Animations play even when the device asks for reduced motion (owner's choice, they are gentle); visitors can pause them with the toggle in the atlas header, stored in `localStorage` key `motion` and mirrored as `html[data-motion=off]` (`useReducedMotion` / `setMotionOff` in `src/lib/use-reduced-motion.ts`; CSS keys off `data-motion`, not the OS media query). Looping SVG motion uses SMIL (CSS keyframes failed on iOS).
- Home atlas: `src/components/ApacAtlas.tsx` (themed with the site tokens, light and dark: dot-matrix land from `src/data/apac-dots.json`, arcs + signal pulses from the `current` pin, region zoom, theme filter chips from `ApacItem.tag`, selection card, list). `scripts/build-apac-map.mjs` generates both map JSON files. `/apac-map` poster and the admin editor still use the light `ApacMap`/`ApacPoster`.
- CV competency boxes live in `skills_and_credentials` and are edited in `/admin/skills` (groups + reorderable items).
- Book landing text (intro + "still being written" note) is a `site_content` document (key `book_intro`, `src/lib/book-intro.ts`), edited at the top of `/admin/book`.
- Home hero headline: `profile_settings.hero_headline` (`**words**` get the gradient; empty falls back to `src/lib/hero.ts`), edited in `/admin/profile`.
- SEO: `src/lib/seo.ts` (SITE_URL, snippet), `src/lib/jsonld.ts` + `src/components/JsonLd.tsx` (Person / WebSite / ProfilePage / ItemList / Book / Article JSON-LD), `src/app/robots.ts`, `sitemap.ts` (published chapters only), `book/feed.xml` (RSS), per-page metadata + canonical URLs, `icon.png` / `apple-icon.png` / `favicon.ico`. Drafts and /admin are noindex. Lighthouse target: SEO 100, a11y 100.
- "Beyond the desk" strip (Strava numbers, links, up to 6 Instagram photos): `site_content` key `beyond_work` (`src/lib/beyond.ts`), edited in `/admin/beyond`; Strava URL and Instagram handle are profile fields; rendered by `src/components/BeyondWork.tsx` near the bottom of the home page.
- Strava daily sync: Vercel Cron (`vercel.json`, 19:30 UTC) calls `GET /api/cron/strava` (Bearer `CRON_SECRET`), which runs `syncStrava()` in `src/lib/strava.ts` (OAuth tokens stored in `site_content` key `strava_auth`, connected via `/api/admin/strava/connect` + `callback`; env `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`). It reads lifetime totals from `/athletes/{id}/stats` (one call; falls back to paging `/athlete/activities` and summing, pure logic in `strava-stats.ts`) and rewrites the numbers in the `beyond_work` document when `strava.auto` is on.
- Markdown: `src/components/Markdown.tsx` (react-markdown, gfm, highlight, heading slugs); `src/lib/markdown.ts` (word count, reading time, TOC, section split).

## Commands
`npm run dev | build | lint | typecheck`
`npm run db:generate` (new migration from schema) · `db:migrate` (apply migrations over HTTP via `src/db/migrate.ts`) · `db:push` (sync schema directly) · `db:seed` · `hash-password -- "pass"`

## Environment (`.env.example`)
`DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (or preferred `ADMIN_PASSWORD_HASH`), `SESSION_SECRET` (16+ chars).

## UI rules
- Warm, human look: light mode is the default (warm paper `#f7f4ef`), dark mode is warm ink (`#14110f`); tokens are CSS variables in `globals.css` (`data-theme="dark"` switches). Use `bg-bg text-fg text-muted border-line`, `.glass` (paper card), `.btn`, `.btn-primary`, `.field`, `.eyebrow`.
- Fraunces (`font-display`, applied to h1-h3) for headlines, Inter for UI, JetBrains Mono only for dates/URLs/code. Avoid uppercase-mono "tech" labels.
- Hero portrait: `public/img/portrait-light.webp` (light mode) and `portrait-dark.webp` (dark mode) are background-removed cut-outs made by `scripts/cutout.py`; `profile.avatarUrl` overrides both.
- Reader measure `max-w-[68ch]`.
- Anything hidden when printing gets `.no-print`; `@media print` forces black-on-white and expands all CV roles.
- New admin mutations must call `revalidateAll()`; new public data goes through `src/lib/data.ts`.
