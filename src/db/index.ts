import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Returns a Drizzle client, or `null` when DATABASE_URL is not configured.
 * When null, the public site falls back to the bundled seed data (demo mode)
 * and admin mutations refuse to run.
 */
function create() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return drizzle(neon(url), { schema });
}

type Db = NonNullable<ReturnType<typeof create>>;
const g = globalThis as unknown as { __db?: Db | null };

export function getDb(): Db | null {
  if (g.__db === undefined) g.__db = create();
  return g.__db;
}

export function requireDb(): Db {
  const db = getDb();
  if (!db) {
    throw new Error(
      "DATABASE_URL is not configured. Add it to .env.local and run `npm run db:push && npm run db:seed`.",
    );
  }
  return db;
}

export const hasDb = () => Boolean(process.env.DATABASE_URL);
export { schema };
