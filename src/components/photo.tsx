import type { ImgHTMLAttributes } from "react";
import { srcSetFor } from "@/lib/responsive-photos";

/**
 * A drop-in <img> that serves a bundled photograph at the size the slot
 * needs.
 *
 * It takes every prop an <img> takes. When `src` is one of the photographs
 * in src/assets, it adds the build-time `srcset` (see
 * src/lib/responsive-photos.ts) and the `sizes` you pass; a photograph from
 * Supabase storage or any other URL renders as a plain <img>, so the
 * component is safe on every image call site.
 *
 * `sizes` is the layout's promise to the browser about how wide the image
 * will be drawn. Give it whenever the slot is narrower than the viewport,
 * e.g. "(min-width: 1024px) 33vw, 50vw" for a tile in a three-up grid that
 * stacks two-up on phones. Without it the browser assumes full width.
 */
export function Photo({
  src,
  sizes,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { src: string | undefined }) {
  const srcSet = srcSetFor(src);
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? phoneCapped(sizes ?? "100vw") : undefined}
      {...rest}
    />
  );
}

/**
 * Caps what a phone downloads at about twice its CSS pixels.
 *
 * The audience is a mid-range Android on mobile data, and those screens are
 * 2.75x to 3x. Left to itself a 3x phone asks for a 1200-pixel file to fill
 * a 390-pixel slot, which is the whole original photograph again. A 2x file
 * is indistinguishable at that size, so the phone rule here declares the
 * slot at two thirds of its real width: 100vw becomes 67vw, 390 x 0.67 x 3 =
 * 784 device pixels, and the 800 variant is chosen; a 2x phone lands on the
 * same 800 file. Tablets and desktops keep the honest value.
 *
 * Only a trailing vw default is rewritten; rem and px slots are already
 * small, and conditions the caller wrote are kept ahead of the new one.
 */
function phoneCapped(sizes: string): string {
  const parts = sizes.split(",").map((s) => s.trim());
  const last = parts[parts.length - 1];
  const vw = /^(\d+(?:\.\d+)?)vw$/.exec(last);
  if (!vw) return sizes;
  const capped = Math.round(parseFloat(vw[1]) * 0.67);
  return [`(max-width: 639px) ${capped}vw`, ...parts].join(", ");
}
