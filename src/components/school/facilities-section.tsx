import { useEffect, useState } from "react";
import {
  getFacilitiesBySchool,
  getFacilityPhotosBySchool,
  type PublicFacilityItem,
  type PublicFacilityPhoto,
} from "@/lib/alpha-content.functions";
import type { SchoolSlug } from "@/integrations/alpha-supabase/types";

export function SchoolFacilitiesSection({
  slug,
  accent = "var(--color-deep-blue)",
}: {
  slug: SchoolSlug;
  accent?: string;
}) {
  const [items, setItems] = useState<PublicFacilityItem[] | null>(null);
  const [photos, setPhotos] = useState<PublicFacilityPhoto[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getFacilitiesBySchool({ data: { slug } }),
      getFacilityPhotosBySchool({ data: { slug } }),
    ])
      .then(([f, p]) => {
        if (cancelled) return;
        setItems(f);
        setPhotos(p);
      })
      .catch(() => { if (!cancelled) { setItems([]); setPhotos([]); } });
    return () => { cancelled = true; };
  }, [slug]);

  if (!items || items.length === 0) return null;

  const photosByFacility = new Map<string, PublicFacilityPhoto[]>();
  for (const p of photos) {
    const list = photosByFacility.get(p.facility_id) ?? [];
    list.push(p);
    photosByFacility.set(p.facility_id, list);
  }

  return (
    <section className="bg-[var(--color-off-white)] py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
              Our facilities
            </p>
            <h2 className="font-display text-3xl font-semibold text-[var(--color-deep-blue)] sm:text-4xl">
              Spaces built for learning
            </h2>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => {
            const extra = photosByFacility.get(f.id) ?? [];
            return (
              <article
                key={f.id}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {f.image_url ? (
                  <div className="aspect-[4/3] overflow-hidden bg-black/5">
                    <img
                      src={f.image_url}
                      alt={f.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-[var(--color-deep-blue)]/10 to-[var(--color-gold)]/10" />
                )}
                <div className="p-5">
                  {f.category ? (
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>
                      {f.category}
                    </p>
                  ) : null}
                  <h3 className="mt-1 font-display text-lg font-semibold text-[var(--color-deep-blue)]">{f.name}</h3>
                  {f.description ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink)]/75">{f.description}</p>
                  ) : null}
                  {extra.length > 0 ? (
                    <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto pb-1">
                      {extra.map((p) => (
                        <a
                          key={p.id}
                          href={p.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block shrink-0"
                          title={p.caption ?? ""}
                        >
                          <img
                            src={p.image_url}
                            alt={p.caption ?? `${f.name} photo`}
                            loading="lazy"
                            className="h-16 w-24 rounded-lg object-cover ring-1 ring-black/5 transition hover:opacity-90"
                          />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
