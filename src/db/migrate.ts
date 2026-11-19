import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

/** Applies SQL migrations from ./drizzle over Neon's HTTP driver (no WebSocket needed, works in CI). */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required to migrate.");
  await migrate(drizzle(neon(url)), { migrationsFolder: "./drizzle" });
  console.log("✓ migrations applied");
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
