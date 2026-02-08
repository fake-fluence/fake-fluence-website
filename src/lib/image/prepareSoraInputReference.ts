export type SoraInputReference = {
  base64: string;
  mime: "image/jpeg";
  width: number;
  height: number;
};

export async function prepareSoraInputReference(
  imageBase64: string,
  options?: {
    width?: number;
    height?: number;
    blurPx?: number;
    jpegQuality?: number;
  }
): Promise<SoraInputReference> {
  const width = options?.width ?? 1280;
  const height = options?.height ?? 720;
  const blurPx = options?.blurPx ?? 24;
  const jpegQuality = options?.jpegQuality ?? 0.92;

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

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  // Background: cover + blur (fills 16:9 while keeping vibe)
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

  // Foreground: contain (keeps person/product fully visible)
  {
    const scale = Math.min(width / iw, height / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // IMPORTANT: Use JPEG to avoid any alpha-channel / inpaint-style handling.
  const out = canvas.toDataURL("image/jpeg", jpegQuality);
  const prefix = "data:image/jpeg;base64,";
  if (!out.startsWith(prefix)) {
    throw new Error("Unexpected canvas data URL format");
  }

  // Validate output dimensions by re-loading the resulting image
  const check = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to validate resized image"));
    el.src = out;
  });

  const cw = check.naturalWidth || check.width;
  const ch = check.naturalHeight || check.height;
  if (cw !== width || ch !== height) {
    throw new Error(`Prepared input reference is ${cw}x${ch}, expected ${width}x${height}`);
  }

  return {
    base64: out.slice(prefix.length),
    mime: "image/jpeg",
    width,
    height,
  };
}
