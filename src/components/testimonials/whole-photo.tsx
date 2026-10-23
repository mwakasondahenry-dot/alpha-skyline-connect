/**
 * A person's photo shown whole, never cropped.
 *
 * Story photos come in every shape: phone selfies, studio head-and-shoulders,
 * full-length shots in a suit. Cropping them to one frame cut faces off. Here
 * the picture is contained inside the frame, and a blurred, darkened copy of
 * the same picture fills whatever edges are left, so a tall photo and a wide
 * one both sit in the same slot with the whole person visible. Both layers
 * are the same URL, so it downloads once.
 *
 * The small copy (src/lib/testimonial-photo.ts) is tried first; if it has not
 * been made yet the original loads instead.
 */
import { useState } from "react";
import { smallPhotoUrl } from "@/lib/testimonial-photo";

export function WholePhoto({
  src,
  name,
  className = "",
  initialClassName = "",
}: {
  src: string | null;
  /** The person's name: its first letter stands in when there is no photo. */
  name: string;
  /** Size and shape of the frame, e.g. "h-30 w-24 rounded-xl". */
  className?: string;
  /** Type size for the initial. */
  initialClassName?: string;
}) {
  const small = smallPhotoUrl(src);
  const [url, setUrl] = useState(small ?? src);

  if (!url) {
    return (
      <span
        aria-hidden
        className={`grid shrink-0 place-items-center bg-[var(--color-deep-blue)] font-display font-extrabold text-[var(--color-gold)] ${className} ${initialClassName}`}
      >
        {name.trim().charAt(0).toUpperCase()}
      </span>
    );
  }

  const fallBack = () => {
    if (url !== src) setUrl(src);
  };

  /* A server-rendered image can fail before React attaches onError, so the
     ref checks for a load that already broke. */
  const checkLoaded = (img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth === 0) fallBack();
  };

  return (
    <span
      aria-hidden
      className={`relative isolate block shrink-0 overflow-hidden bg-[var(--color-deep-blue)] ${className}`}
    >
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        onError={fallBack}
        className="absolute inset-0 -z-10 h-full w-full scale-125 object-cover opacity-70 blur-md"
      />
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        onError={fallBack}
        ref={checkLoaded}
        className="block h-full w-full object-contain"
      />
    </span>
  );
}
