/**
 * Shrink a staff upload before it reaches Supabase.
 *
 * The pages this feeds must hold 60fps on a mid-range Android over mobile
 * data (PRODUCT.md). The photographs they shipped with are build-optimised
 * WebP; an unprocessed 4MB phone JPEG in the same slot would undo that. So
 * every upload is downscaled and re-encoded here, in the browser, before it
 * is stored — no Supabase image-transformation add-on required.
 */

export const MAX_EDGE = 1600;
export const MAX_UPLOAD_BYTES = 400 * 1024;
const QUALITY = 0.82;

export type CompressResult = {
  blob: Blob;
  width: number;
  height: number;
  originalBytes: number;
  bytes: number;
  ext: "webp" | "png";
};

/** Box-fit preserving aspect. Never returns a dimension below 1px. */
export function fitWithin(w: number, h: number, maxEdge: number) {
  const longest = Math.max(w, h);
  if (longest <= maxEdge) return { width: w, height: h };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

export function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as an image."));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("The image could not be re-encoded."))),
      type,
      quality,
    );
  });
}

/**
 * PNG is preserved for images that carry transparency, because re-encoding
 * one to WebP with a flattened background would put a white box on the page.
 */
function hasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const { data } = ctx.getImageData(0, 0, w, h);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) return true;
  }
  return false;
}

export async function compressImage(file: File): Promise<CompressResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file — JPG, PNG or WebP.");
  }

  const img = await loadImage(file);
  const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, MAX_EDGE);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("This browser could not process the image.");
  ctx.drawImage(img, 0, 0, width, height);

  const transparent = file.type === "image/png" && hasTransparency(ctx, width, height);
  const ext = transparent ? "png" : "webp";
  const blob = await toBlob(canvas, transparent ? "image/png" : "image/webp", QUALITY);

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `This photo is still ${formatBytes(blob.size)} after compression, over the ` +
        `${formatBytes(MAX_UPLOAD_BYTES)} limit. Very detailed or very large images can do ` +
        `this. Try a photo with less fine detail, or crop it tighter before uploading.`,
    );
  }

  return { blob, width, height, originalBytes: file.size, bytes: blob.size, ext };
}
