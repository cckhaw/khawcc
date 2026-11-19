/** Client-side: downscale an image (keeps transparency via WebP) and upload it to the admin media store. */
export async function uploadImage(file: File, maxDim = 1800): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Use a JPEG, PNG or WebP image.");
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const toBlob = (type: string, q: number) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));
  const blob = (await toBlob("image/webp", 0.9)) ?? (await toBlob("image/png", 1)) ?? file;
  const fd = new FormData();
  fd.append("file", blob, file.name.replace(/\.\w+$/, "") + ".webp");
  const res = await fetch("/api/admin/media", { method: "POST", body: fd });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? `Upload failed (${res.status}).`);
  return data.url;
}
