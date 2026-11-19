# khawcc

Personal portfolio, interactive CV, admin CMS and the serialized book *Thinking in Signals*.

```bash
cp .env.example .env.local   # fill in values
npm install
npm run db:push && npm run db:seed
npm run dev
```
Without `DATABASE_URL` the site runs in demo mode on bundled seed content. See `CLAUDE.md` for details.
