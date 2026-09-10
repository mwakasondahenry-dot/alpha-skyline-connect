/**
 * One replaceable photo position, shown the way the page shows it.
 *
 * Editing happens in the card rather than a modal: swapping a picture needs
 * neither interruption nor protected focus, and staff comparing several
 * positions want the others still on screen.
 */
import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ImageOff, Upload, RotateCcw, AlertCircle } from "lucide-react";
import type { SlotDef, SlotPhotoMap } from "@/lib/photo-slots";
import { compressImage, formatBytes } from "@/lib/image-compress";

type Staged = { url: string; blob: Blob; ext: string; from: number; to: number };

export function PhotoSlotCard({
  slot,
  photos,
  client,
  onSaved,
}: {
  slot: SlotDef;
  photos: SlotPhotoMap;
  client: SupabaseClient;
  onSaved: () => Promise<void> | void;
}) {
  const uploaded = photos[slot.key];
  const current = uploaded?.image_url ?? slot.fallback ?? null;

  const [staged, setStaged] = useState<Staged | null>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = uploaded ? "Uploaded" : slot.fallback ? "Built-in photo" : "Needs a photo";

  async function onPick(file: File) {
    setError(null);
    setPreparing(true);
    try {
      const r = await compressImage(file);
      setStaged({
        url: URL.createObjectURL(r.blob),
        blob: r.blob,
        ext: r.ext,
        from: r.originalBytes,
        to: r.bytes,
      });
      setAlt(uploaded?.alt_text ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That image could not be prepared.");
    } finally {
      setPreparing(false);
    }
  }

  async function onSave() {
    if (!staged || !alt.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const path = `photo-slots/${slot.key}-${Date.now()}.${staged.ext}`;
      const up = await client.storage
        .from("media")
        .upload(path, staged.blob, { upsert: false, contentType: staged.blob.type });
      if (up.error) throw up.error;

      const { data } = client.storage.from("media").getPublicUrl(path);
      const { error: dbError } = await client.from("photo_slots").upsert(
        {
          slot_key: slot.key,
          school_slug: slot.school,
          image_url: data.publicUrl,
          alt_text: alt.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slot_key" },
      );
      if (dbError) throw dbError;

      URL.revokeObjectURL(staged.url);
      setStaged(null);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this photo.");
    } finally {
      setBusy(false);
    }
  }

  async function onRevert() {
    const back = slot.fallback ? "its built-in picture" : "no photo";
    if (!confirm(`Remove the uploaded photo for "${slot.label}"? The page goes back to ${back}.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: dbError } = await client.from("photo_slots").delete().eq("slot_key", slot.key);
      if (dbError) throw dbError;
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove this photo.");
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    if (staged) URL.revokeObjectURL(staged.url);
    setStaged(null);
    setError(null);
  }

  const btn =
    "inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-btn)] px-3 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] disabled:opacity-50";

  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div
        className="relative w-full bg-[var(--color-surface-muted)]"
        style={{ aspectRatio: slot.aspect }}
      >
        {staged ? (
          <img src={staged.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : current ? (
          <img
            src={current}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center gap-2 px-4 text-center">
            <ImageOff
              aria-hidden
              className="h-6 w-6 text-[var(--color-deep-blue)]/35"
              strokeWidth={1.5}
            />
          </div>
        )}
        <span
          className={
            "absolute left-2 top-2 rounded-[var(--radius-chip)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] " +
            (staged
              ? "bg-[var(--color-gold)] text-[var(--color-accent-foreground)]"
              : uploaded
                ? "bg-[var(--color-deep-blue)] text-white"
                : slot.fallback
                  ? "bg-black/60 text-white"
                  : "bg-[var(--color-danger)] text-white")
          }
        >
          {staged ? "Ready to save" : status}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-sm font-bold text-[var(--color-deep-blue)]">
            {slot.label}
          </h3>
          <p className="mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
            Crops to {slot.aspect.replace(" / ", ":")}
          </p>
          {slot.guidance ? (
            <p className="mt-1.5 text-xs leading-snug text-[var(--color-ink-soft)]">
              {slot.guidance}
            </p>
          ) : null}
        </div>

        {staged ? (
          <div className="space-y-2" aria-live="polite">
            <p className="text-xs font-semibold text-[var(--color-deep-blue)]">
              {formatBytes(staged.from)} → {formatBytes(staged.to)}
            </p>
            <label
              htmlFor={`alt-${slot.key}`}
              className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-deep-blue)]"
            >
              Alt text <span className="text-[var(--color-danger)]">*</span>
            </label>
            <textarea
              id={`alt-${slot.key}`}
              rows={2}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-[var(--color-surface)] px-2.5 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/30"
            />
            <p className="text-[11px] leading-snug text-[var(--color-ink-soft)]">
              Describe what the photo shows, for parents using a screen reader. &ldquo;Form 3
              students in the chemistry lab&rdquo;, not &ldquo;photo&rdquo; or
              &ldquo;IMG_2024&rdquo;.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void onSave()}
                disabled={busy || !alt.trim()}
                className={`${btn} bg-[var(--color-gold)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-gold-dark)]`}
              >
                {busy ? "Saving…" : "Save photo"}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={busy}
                className={`${btn} text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex flex-wrap gap-2">
            <label
              className={`${btn} cursor-pointer border border-dashed border-[var(--color-deep-blue)]/30 text-[var(--color-deep-blue)] hover:bg-[var(--color-surface-muted)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-gold)]`}
            >
              <Upload aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
              {preparing ? "Preparing…" : current ? "Replace" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={preparing || busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void onPick(f);
                }}
              />
            </label>
            {uploaded ? (
              <button
                type="button"
                onClick={() => void onRevert()}
                disabled={busy}
                className={`${btn} border border-[var(--color-hairline)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]`}
              >
                <RotateCcw aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
                Revert
              </button>
            ) : null}
          </div>
        )}

        {error ? (
          <p
            role="alert"
            className="flex gap-1.5 rounded-[var(--radius-btn)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-2 py-1.5 text-xs leading-snug text-[var(--color-danger)]"
          >
            <AlertCircle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
