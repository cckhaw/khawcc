import { NextResponse } from "next/server";
import { requireDb, schema } from "@/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 3 * 1024 * 1024; // the editor downsizes first; this is the hard server limit

/** Admin-only image upload. Returns { url: "/media/<id>" }. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Use a JPEG, PNG or WebP image." }, { status: 415 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image is larger than 3 MB." }, { status: 413 });
    const buf = Buffer.from(await file.arrayBuffer());
    const [row] = await requireDb()
      .insert(schema.mediaFiles)
      .values({ mime: file.type, sizeBytes: buf.length, dataBase64: buf.toString("base64") })
      .returning({ id: schema.mediaFiles.id });
    return NextResponse.json({ url: `/media/${row.id}` });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed." }, { status: 500 });
  }
}
