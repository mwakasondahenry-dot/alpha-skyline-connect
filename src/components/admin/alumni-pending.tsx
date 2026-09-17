/**
 * Moderation queue for alumni and parent submissions, shown above the
 * testimonials CRUD.
 *
 * A pending submission is a testimonials row with published = false and a
 * consent record (consent_at is not null) — staff-typed rows in the CRUD
 * below have none, which is what keeps them out of this queue.
 *
 * Stories from personal invite links are tagged Invited; everything else came through the general link (or the old one-page form).
 *
 * The photo lives in the PRIVATE alumni-pending bucket and has no public URL,
 * which is the point: nothing a stranger uploads is reachable from the
 * internet before a person has looked at it. The preview here is a short-lived
 * signed URL, minted for a member of staff and expiring on its own.
 *
 * Approving copies the file into the public media bucket and only then
 * publishes. Rejecting deletes the file and the row.
 */
import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Check, X, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { STORY_PROMPTS } from "@/lib/story/fields";
import { PARENT_PROMPTS } from "@/lib/story/parent-fields";

const ALL_PROMPTS = [...STORY_PROMPTS, ...PARENT_PROMPTS];

const PENDING_BUCKET = "alumni-pending";
const PUBLIC_BUCKET = "media";
/** Preview links are for the person looking at the queue right now. */
const SIGNED_URL_TTL_SECONDS = 600;

type PendingRow = {
  id: string;
  author_name: string;
  relationship: string | null;
  company: string | null;
  grad_year: number | null;
  quote: string;
  pending_photo_path: string | null;
  consent_at: string | null;
  consent_text: string | null;
  created_at: string;
  invite_id: string | null;
  answers: Record<string, string> | null;
  city_country: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "Software engineer at Vodacom · Dar es Salaam · Class of 2018" from whichever parts exist. */
function subtitle(row: PendingRow) {
  const work = [row.relationship, row.company].filter(Boolean).join(" at ");
  const year = row.grad_year ? `Class of ${row.grad_year}` : null;
  return [work || null, row.city_country, year].filter(Boolean).join(" · ");
}

export function AlumniPendingQueue({ onChanged }: { onChanged: () => void }) {
  const { client } = useAdminAuth();
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    setError(null);

    const { data, error: loadError } = await client
      .from("testimonials")
      .select(
        "id,author_name,relationship,company,grad_year,quote,pending_photo_path,consent_at,consent_text,created_at,invite_id,answers,city_country",
      )
      .eq("published", false)
      .not("consent_at", "is", null)
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    const pending = (data ?? []) as PendingRow[];
    setRows(pending);

    /* Sign each photo for preview. One failure must not blank the queue, so
       these resolve independently and a missing preview just renders as
       "no photo". */
    const withPhotos = pending.filter((r) => r.pending_photo_path);
    const signed = await Promise.all(
      withPhotos.map(async (r) => {
        const { data: sig } = await client.storage
          .from(PENDING_BUCKET)
          .createSignedUrl(r.pending_photo_path as string, SIGNED_URL_TTL_SECONDS);
        return [r.id, sig?.signedUrl ?? ""] as const;
      }),
    );
    setPreviews(Object.fromEntries(signed.filter(([, url]) => url)));
    setLoading(false);
  }, [client]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function approve(row: PendingRow) {
    if (!client) return;
    setBusyId(row.id);
    setError(null);

    try {
      let publicUrl: string | null = null;

      if (row.pending_photo_path) {
        /* Copy, rather than move: nothing is removed from the pending bucket
           until the row is safely published, so a failure part-way through
           leaves the submission reviewable instead of destroying its photo. */
        const { data: file, error: dlError } = await client.storage
          .from(PENDING_BUCKET)
          .download(row.pending_photo_path);
        if (dlError || !file) {
          throw new Error(`Could not read the pending photo: ${dlError?.message ?? "missing"}`);
        }

        const ext = row.pending_photo_path.split(".").pop() ?? "jpg";
        const destination = `testimonials/alumni-${row.id}.${ext}`;

        const { error: upError } = await client.storage
          .from(PUBLIC_BUCKET)
          .upload(destination, file, { contentType: file.type, upsert: true });
        if (upError) throw new Error(`Could not publish the photo: ${upError.message}`);

        publicUrl = client.storage.from(PUBLIC_BUCKET).getPublicUrl(destination)
          .data.publicUrl;
      }

      const { error: updateError } = await client
        .from("testimonials")
        .update({
          published: true,
          photo_url: publicUrl,
          pending_photo_path: null,
        })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);

      /* Published successfully — now the pending copy is redundant. A failure
         here leaves a stray private file, which is harmless and preferable to
         deleting before the publish is confirmed. */
      if (row.pending_photo_path) {
        await client.storage.from(PENDING_BUCKET).remove([row.pending_photo_path]);
      }

      await refresh();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not approve that submission.");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(row: PendingRow) {
    if (!client) return;
    /* Irreversible, and there is no undo screen, so it is confirmed here. */
    const ok = window.confirm(
      `Reject the submission from ${row.author_name}?\n\n` +
        "This deletes the message and the photo permanently.",
    );
    if (!ok) return;

    setBusyId(row.id);
    setError(null);
    try {
      if (row.pending_photo_path) {
        const { error: rmError } = await client.storage
          .from(PENDING_BUCKET)
          .remove([row.pending_photo_path]);
        if (rmError) throw new Error(`Could not delete the photo: ${rmError.message}`);
      }

      const { error: delError } = await client
        .from("testimonials")
        .delete()
        .eq("id", row.id);
      if (delError) throw new Error(delError.message);

      await refresh();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reject that submission.");
    } finally {
      setBusyId(null);
    }
  }

  /* An empty queue is the normal state. Saying so beats an empty box, but it
     stays quiet — no card, no border. */
  if (!loading && rows.length === 0 && !error) {
    return (
      <p className="text-sm text-[var(--color-ink)]/60">
        No stories waiting for review.
      </p>
    );
  }

  return (
    <section aria-label="Submissions awaiting review" className="space-y-3">
      <header className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-[var(--color-deep-blue)]">
          Awaiting review
        </h2>
        {rows.length > 0 && (
          <span className="rounded-full bg-[var(--color-gold)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-accent-foreground)]">
            {rows.length}
          </span>
        )}
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[var(--color-deep-blue)]/10 bg-white p-6 text-sm text-[var(--color-deep-blue)]">
          Loading…
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const busy = busyId === row.id;
            const preview = previews[row.id];
            return (
              <li
                key={row.id}
                className="rounded-xl border border-[var(--color-gold)]/40 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="shrink-0">
                    {preview ? (
                      <img
                        src={preview}
                        alt={`Photo submitted by ${row.author_name}`}
                        className="h-24 w-24 rounded-lg object-cover ring-1 ring-[var(--color-deep-blue)]/10"
                      />
                    ) : (
                      <span className="grid h-24 w-24 place-items-center rounded-lg bg-[var(--color-deep-blue)]/5 text-center text-[11px] text-[var(--color-ink)]/50">
                        {row.pending_photo_path ? "Preview\nunavailable" : "No photo"}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--color-deep-blue)]">
                      {row.author_name}{" "}
                      <span className="ml-1 rounded-full bg-[var(--color-deep-blue)]/5 px-2 py-0.5 text-xs font-bold text-[var(--color-deep-blue)]">
                        {row.grad_year == null ? "Parent" : "Alumnus"}
                      </span>
                      <span className="ml-1 rounded-full bg-[var(--color-deep-blue)]/5 px-2 py-0.5 text-xs font-bold text-[var(--color-deep-blue)]">
                        {row.invite_id ? "Invited" : "General link"}
                      </span>
                    </p>
                    <p className="text-sm text-[var(--color-ink)]/70">{subtitle(row)}</p>
                    <blockquote className="mt-2 whitespace-pre-line text-sm text-[var(--color-ink)]">
                      {row.quote}
                    </blockquote>
                    {row.answers && ALL_PROMPTS.some((p) => row.answers?.[p.key]) && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-[var(--color-ink)]/60">
                          Story answers (not published)
                        </summary>
                        <dl className="mt-1 space-y-2 text-sm">
                          {ALL_PROMPTS.filter((p) => row.answers?.[p.key]).map((p) => (
                            <div key={p.key}>
                              <dt className="text-xs font-semibold text-[var(--color-deep-blue)]">{p.label}</dt>
                              <dd className="whitespace-pre-line text-[var(--color-ink)]">{row.answers?.[p.key]}</dd>
                            </div>
                          ))}
                        </dl>
                      </details>
                    )}

                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-[var(--color-ink)]/60">
                        Consent · submitted {formatDate(row.created_at)}
                      </summary>
                      <p className="mt-1 text-xs text-[var(--color-ink)]/60">
                        {row.consent_at
                          ? `Agreed ${formatDate(row.consent_at)}: “${row.consent_text}”`
                          : "No consent recorded — do not publish."}
                      </p>
                    </details>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => approve(row)}
                        disabled={busy || !row.consent_at}
                        title={
                          row.consent_at
                            ? undefined
                            : "This submission has no consent record and cannot be published."
                        }
                        className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-md bg-[var(--color-gold)] px-4 text-sm font-semibold text-[var(--color-accent-foreground)] shadow-sm hover:bg-[var(--color-gold-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <Check className="h-4 w-4" aria-hidden />
                        )}
                        Approve &amp; publish
                      </button>
                      <button
                        type="button"
                        onClick={() => reject(row)}
                        disabled={busy}
                        className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-md border border-[var(--color-deep-blue)]/20 bg-white px-4 text-sm font-semibold text-[var(--color-deep-blue)] hover:bg-[var(--color-deep-blue)]/5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="h-4 w-4" aria-hidden />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
