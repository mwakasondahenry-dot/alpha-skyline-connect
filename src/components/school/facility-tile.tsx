/**
 * A facility tile that is honest when it has no photograph.
 *
 * Both secondary pages shipped four stand-ins that showed the wrong
 * building — the nursery campus captioned "Library", an aviation photo
 * captioned "Boarding". PRODUCT.md: no invented content, ever, and a parent
 * comparing schools reads these tiles as fact.
 *
 * So these slots carry no fallback. Until staff upload the real room the
 * tile renders as a labelled panel: visibly awaiting a photograph rather
 * than confidently showing the wrong one.
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
      <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl active:translate-y-0">
        {photo ? (
          <>
            <img
              width={800}
              height={600}
              src={photo.src}
              alt={alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${accent}, color-mix(in srgb, ${accent} 65%, black))`,
            }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--color-gold)" }}
          >
            Facility
          </span>
          <h3 className="mt-1 font-display text-lg font-bold text-white">{label}</h3>
          {!photo ? <p className="mt-1 text-[11px] text-white/70">Photograph coming soon</p> : null}
        </div>
      </div>
    </Reveal>
  );
}
