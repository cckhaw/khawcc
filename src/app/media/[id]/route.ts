import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

type Ctx = { params: Promise<{ id: string }> };

/** Serves images uploaded through the admin. Content is immutable per id, so cache hard. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const n = Number(id);
  const db = getDb();
  if (!db || !Number.isInteger(n)) return new Response("Not found", { status: 404 });
  const [row] = await db.select().from(schema.mediaFiles).where(eq(schema.mediaFiles.id, n));
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(row.dataBase64, "base64"), {
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(row.sizeBytes),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
