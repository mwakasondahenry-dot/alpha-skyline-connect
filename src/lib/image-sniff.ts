/**
 * Accepted image types, keyed by the magic bytes that actually identify them.
 *
 * The browser-supplied Content-Type is a claim, not evidence — it is trivially
 * forged and is never consulted. The extension written to storage is derived
 * from whichever signature matches here, so a .png holding a script is stored
 * as whatever it really is, or rejected.
 */
const SIGNATURES: ReadonlyArray<{
  ext: string;
  mime: string;
  match: (b: Uint8Array) => boolean;
}> = [
  {
    ext: "jpg",
    mime: "image/jpeg",
    match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "png",
    mime: "image/png",
    match: (b) =>
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    ext: "webp",
    mime: "image/webp",
    // "RIFF" .... "WEBP"
    match: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

export function sniffImage(bytes: Uint8Array) {
  return SIGNATURES.find((s) => s.match(bytes)) ?? null;
}
