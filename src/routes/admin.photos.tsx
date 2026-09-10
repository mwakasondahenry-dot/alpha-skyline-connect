import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { slotsBySection, type SlotPhotoMap } from "@/lib/photo-slots";
import { PhotoSlotCard } from "@/components/admin/photo-slot-card";
import type { SchoolSlug } from "@/integrations/alpha-supabase/types";

export const Route = createFileRoute("/admin/photos")({
  head: () => ({ meta: [{ title: "School Photos · Alpha Admin" }] }),
  component: AdminPhotos,
});

const SCHOOLS: { value: SchoolSlug; label: string }[] = [
  { value: "nursery-primary", label: "Nursery & Primary" },
  { value: "alpha-high", label: "Alpha High" },
  { value: "alpha-girls", label: "Alpha Girls" },
];

function AdminPhotos() {
  const { client, session } = useAdminAuth();
  const [school, setSchool] = useState<SchoolSlug>("nursery-primary");
  const [photos, setPhotos] = useState<SlotPhotoMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    setError(null);
    const { data, error } = await client
      .from("photo_slots")
      .select("slot_key,image_url,alt_text,credit")
      .eq("school_slug", school);
    if (error) setError(error.message);
    const map: SlotPhotoMap = {};
    for (const r of data ?? []) {
      map[r.slot_key] = { image_url: r.image_url, alt_text: r.alt_text, credit: r.credit };
    }
    setPhotos(map);
    setLoading(false);
  }, [client, school]);

  useEffect(() => {
    if (client && session) void refresh();
  }, [client, session, refresh]);

  const groups = useMemo(() => slotsBySection(school), [school]);

  // What still needs attention, so staff can see the job rather than count cards.
  const tally = useMemo(() => {
    const all = groups.flatMap((g) => g.slots);
    const missing = all.filter((s) => !photos[s.key] && !s.fallback).length;
    const uploaded = all.filter((s) => photos[s.key]).length;
    return { total: all.length, missing, uploaded };
  }, [groups, photos]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-[var(--color-deep-blue)]">
          School photos
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-soft)]">
          Every photograph on a school page, in the place it appears. Replace one and it is live on
          the site straight away. Photos are shrunk automatically so the pages stay fast on a phone.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {SCHOOLS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setSchool(s.value)}
            aria-pressed={school === s.value}
            className={
              "inline-flex min-h-11 items-center rounded-[var(--radius-btn)] px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] " +
              (school === s.value
                ? "bg-[var(--color-deep-blue)] text-white"
                : "border border-[var(--color-hairline)] text-[var(--color-deep-blue)] hover:bg-[var(--color-surface-muted)]")
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {!loading ? (
        <p className="text-sm text-[var(--color-ink-soft)]">
          {tally.total} positions · {tally.uploaded} replaced by you
          {tally.missing > 0 ? (
            <>
              {" · "}
              <span className="font-semibold text-[var(--color-danger)]">
                {tally.missing} still need a photograph
              </span>
            </>
          ) : null}
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-[var(--radius-btn)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-3 py-2 text-sm text-[var(--color-danger)]"
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--color-ink-soft)]">Loading photos…</p>
      ) : (
        groups.map((g) => (
          <section key={g.section} className="space-y-3">
            <h2 className="border-b border-[var(--color-hairline)] pb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-deep-blue)]">
              {g.section}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.slots.map((slot) => (
                <PhotoSlotCard
                  key={slot.key}
                  slot={slot}
                  photos={photos}
                  client={client!}
                  onSaved={refresh}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
