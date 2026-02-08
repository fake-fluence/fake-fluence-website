export async function prepareSoraInputReference(
  imageBase64: string,
  options?: {
    width?: number;
    height?: number;
    blurPx?: number;
  }
): Promise<string> {
  const width = options?.width ?? 1280;
  const height = options?.height ?? 720;
  const blurPx = options?.blurPx ?? 24;

  if (!imageBase64) {
    throw new Error("No imageBase64 provided");
  }

  // gpt-image returns base64 without a prefix
  const src = `data:image/png;base64,${imageBase64}`;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to load base64 image"));
    el.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;

  // Background: cover + blur (fills 16:9 while keeping the vibe)
  {
    const scale = Math.max(width / iw, height / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;

    ctx.save();
    ctx.filter = `blur(${blurPx}px)`;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  // Foreground: contain (ensures the whole person/product remains visible)
  {
    const scale = Math.min(width / iw, height / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);
  }

  const out = canvas.toDataURL("image/png");
  const prefix = "data:image/png;base64,";
  if (!out.startsWith(prefix)) {
    throw new Error("Unexpected canvas data URL format");
  }

  return out.slice(prefix.length);
}
