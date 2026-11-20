/** Largest file the server accepts (see /api/admin/media); we aim a little below it. */
const TARGET_BYTES = 2.6 * 1024 * 1024;

const toBlob = (canvas: HTMLCanvasElement, type: string, q?: number) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));

/**
 * Encode a canvas as WebP when the browser really supports it. Safari ignores the request and silently
 * hands back a (huge, lossless) PNG, so the returned type is checked and JPEG is used instead.
 * Small images that may carry transparency (logos) fall back to PNG.
 */
async function encode(canvas: HTMLCanvasElement, keepAlpha: boolean): Promise<Blob> {
  const webp = await toBlob(canvas, "image/webp", 0.85);
  if (webp && webp.type === "image/webp") return webp;
  if (keepAlpha) {
    const png = await toBlob(canvas, "image/png");
    if (png && png.size < TARGET_BYTES) return png;
  }
  const jpeg = await toBlob(canvas, "image/jpeg", 0.85);
  if (!jpeg) throw new Error("Couldn’t process this image in your browser.");
  return jpeg;
}

/** Downscale (long side <= maxDim) and compress an image so it is safely under the upload limit. */
export async function prepareImage(file: File, maxDim = 1800): Promise<{ blob: Blob; ext: string }> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Use a JPEG, PNG or WebP image.");
  const bmp = await createImageBitmap(file);
  const keepAlpha = maxDim <= 600; // logos and icons keep their transparency
  let w = Math.max(1, Math.round(bmp.width * Math.min(1, maxDim / Math.max(bmp.width, bmp.height))));
  let h = Math.max(1, Math.round(bmp.height * Math.min(1, maxDim / Math.max(bmp.width, bmp.height))));
  for (let attempt = 0; attempt < 6; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    if (!keepAlpha) {
      ctx.fillStyle = "#ffffff"; // JPEG has no transparency
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob = await encode(canvas, keepAlpha);
    if (blob.size <= TARGET_BYTES) return { blob, ext: blob.type === "image/png" ? "png" : blob.type === "image/jpeg" ? "jpg" : "webp" };
    w = Math.max(1, Math.round(w * 0.78)); // still too big: shrink and try again
    h = Math.max(1, Math.round(h * 0.78));
  }
  throw new Error("This image is still too large after resizing. Try a smaller or simpler picture.");
}

/** Client-side: prepare an image and upload it to the admin media store. Returns its /media/<id> address. */
export async function uploadImage(file: File, maxDim = 1800): Promise<string> {
  const { blob, ext } = await prepareImage(file, maxDim);
  const fd = new FormData();
  fd.append("file", blob, file.name.replace(/\.\w+$/, "") + "." + ext);
  const res = await fetch("/api/admin/media", { method: "POST", body: fd });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? `Upload failed (${res.status}).`);
  return data.url;
}
