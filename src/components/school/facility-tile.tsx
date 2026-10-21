/**
 * A facility tile that is honest when it has no photograph.
 *
 * Both secondary pages shipped four stand-ins that showed the wrong
 * building — the nursery campus captioned "Library", an aviation photo
 * captioned "Boarding". PRODUCT.md: no invented content, ever, and a parent
 * comparing schools reads these tiles as fact.
 *
 * So these slots carry no fallback. Until staff upload the real room the
 * tile renders as a light, labelled placeholder: visibly awaiting a
 * photograph rather than confidently showing the wrong one.
 */
import { Reveal } from "@/components/reveal";
import { slotPhoto, type SlotPhotoMap } from "@/lib/photo-slots";

export function FacilityTile({
  slotKey,
  label,
  photos,
  accent,
  delay = 0,
}: {
  slotKey: string;
  label: string;
  photos: SlotPhotoMap;
  accent: string;
  delay?: number;
}) {
  const photo = slotPhoto(photos, slotKey);
  const alt = photos[slotKey]?.alt_text ?? label;

  return (
    <Reveal direction="up" delay={delay}>
      {photo ? (
        <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl active:translate-y-0">
          <img
            width={800}
            height={600}
            src={photo.src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <h3 className="absolute inset-x-0 bottom-0 p-5 font-display text-lg font-bold text-white">
            {label}
          </h3>
        </div>
      ) : (
        /* No photograph yet: a light, clearly marked placeholder. These were
           tall dark gradient blocks, which on a phone read as broken black
           areas rather than as "photo to come". */
        <div
          className="flex aspect-[5/2] flex-col justify-end rounded-2xl border border-dashed p-5 sm:aspect-[4/3]"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
            background: `color-mix(in srgb, ${accent} 7%, white)`,
          }}
        >
          <h3 className="font-display text-lg font-bold" style={{ color: accent }}>
            {label}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            [Photograph to be provided by the school]
          </p>
        </div>
      )}
    </Reveal>
  );
}
