/**
 * The stories data layer: every read and write the admin Stories screens make
 * on testimonials rows and their photo files.
 *
 * Every write is guarded on the state the screen last saw
 * (`.eq("status", expected)`) and asks for the affected rows back, so a stale
 * screen or a second member of staff cannot act on a story that has moved.
 * No rows back means "someone else got there first": `{ ok: false, conflict:
 * true }`, which the screen reports and answers by refreshing that story.
 *
 * Photos live in two buckets. A submitted photo sits in the PRIVATE
 * alumni-pending bucket, with no public URL, until a person has looked at it.
 * publishStory is the only path that takes a story from Waiting to Live, and
 * the only one that moves a pending photo into the public media bucket.
 *
 * Functions return results rather than throwing (except listStories, which
 * feeds a query that expects a throw), so the screen can show the error on the
 * card that failed. Turn an error into words with friendlyError().
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StoryStatus } from "@/lib/admin/story-status";
import { compressImage, makeSmallCopy } from "@/lib/image-compress";
import { PENDING_BUCKET } from "@/lib/story/fields";
import { SMALL_EDGE, smallPhotoPath } from "@/lib/testimonial-photo";

export type AdminStory = {
  id: string;
  status: StoryStatus;
  author_name: string;
  relationship: string | null;
  company: string | null;
  quote: string;
  grad_year: number | null;
  school_slug: string | null;
  photo_url: string | null;
  pending_photo_path: string | null;
  consent_at: string | null;
  consent_text: string | null;
  answers: Record<string, unknown> | null;
  invite_id: string | null;
  featured: boolean;
  featured_order: number | null;
  decline_reason: string | null;
  created_at: string;
  decided_at: string | null;
  city_country: string | null;
};

export type StoryEdit = Pick<
  AdminStory,
  "author_name" | "relationship" | "company" | "quote" | "grad_year" | "school_slug"
>;

export type MoveResult =
  { ok: true } | { ok: false; conflict: true } | { ok: false; error: unknown };

const TABLE = "testimonials";
const PUBLIC_BUCKET = "media";
/** Signed preview links last an hour; the screen renews them before then. */
const SIGNED_URL_TTL_SECONDS = 3600;

export const STORY_COLUMNS = [
  "id",
  "status",
  "author_name",
  "relationship",
  "company",
  "quote",
  "grad_year",
  "school_slug",
  "photo_url",
  "pending_photo_path",
  "consent_at",
  "consent_text",
  "answers",
  "invite_id",
  "featured",
  "featured_order",
  "decline_reason",
  "created_at",
  "decided_at",
  "city_country",
].join(",");

const OK: MoveResult = { ok: true };
const CONFLICT: MoveResult = { ok: false, conflict: true };
const fail = (error: unknown): MoveResult => ({ ok: false, error });

/** Public path of a story's own photo, e.g. testimonials/story-<id>.jpg. */
function storyPhotoPath(id: string, ext: string) {
  return `testimonials/story-${id}.${ext}`;
}

/** The story's own public file, if photo_url points at one (never a shared file). */
function ownPublicPath(story: Pick<AdminStory, "id" | "photo_url">): string | null {
  if (!story.photo_url) return null;
  const m = story.photo_url.match(/\/(testimonials\/story-([^/]+)\.[a-z0-9]+)$/i);
  return m && m[2] === story.id ? m[1] : null;
}

/** A storage call whose failure is harmless (a stray file) and must not fail the action. */
async function quietly(label: string, run: () => Promise<{ error: unknown }>) {
  try {
    const { error } = await run();
    if (error) console.warn(label, error);
  } catch (err) {
    console.warn(label, err);
  }
}

/**
 * The small copy the site loads instead of the original
 * (src/lib/testimonial-photo.ts). The site shows story photos at most 120px
 * tall. If the copy cannot be made, the page falls back to the original, so a
 * failure here is reported to the console and never blocks the action.
 */
async function uploadSmallCopy(sb: SupabaseClient, id: string, file: Blob) {
  try {
    const small = await makeSmallCopy(file, SMALL_EDGE);
    const { error } = await sb.storage
      .from(PUBLIC_BUCKET)
      .upload(smallPhotoPath(`story-${id}`), small, { contentType: "image/webp", upsert: true });
    if (error) throw error;
  } catch (err) {
    console.warn("Small copy of the story photo was not saved", err);
  }
}

/** Optional text: empty becomes null. A year that is not a real year becomes null, never 0. */
function cleanEdit(edit: StoryEdit): StoryEdit {
  const text = (v: string | null) => {
    const t = (v ?? "").trim();
    return t ? t : null;
  };
  const year = edit.grad_year;
  return {
    author_name: edit.author_name.trim(),
    relationship: text(edit.relationship),
    company: text(edit.company),
    quote: edit.quote.trim(),
    grad_year: typeof year === "number" && Number.isFinite(year) && year > 0 ? year : null,
    school_slug: text(edit.school_slug),
  };
}

type Filter = (q: GuardQuery) => GuardQuery;
type GuardQuery = {
  eq(col: string, v: unknown): GuardQuery;
  is(col: string, v: null): GuardQuery;
  select(cols: string): PromiseLike<{ data: unknown; error: unknown }>;
};

/** update … where id = id and status = from [and filters], returning ids. */
async function guardedUpdate(
  sb: SupabaseClient,
  id: string,
  from: StoryStatus,
  patch: Record<string, unknown>,
  filter: Filter = (q) => q,
): Promise<MoveResult> {
  try {
    const base = sb.from(TABLE).update(patch).eq("id", id).eq("status", from) as unknown;
    const { data, error } = await filter(base as GuardQuery).select("id");
    if (error) return fail(error);
    return Array.isArray(data) && data.length > 0 ? OK : CONFLICT;
  } catch (err) {
    return fail(err);
  }
}

/**
 * Moving to Live must never leave a submitted photo behind in the private
 * bucket, so any move to Live also requires the row to have no pending photo
 * (publishStory, which copies it first, sets its own condition).
 */
function moveRow(
  sb: SupabaseClient,
  id: string,
  from: StoryStatus,
  to: StoryStatus,
  extra: Record<string, unknown>,
  filter?: Filter,
) {
  const liveFilter: Filter | undefined =
    to === "live" && !filter ? (q) => q.is("pending_photo_path", null) : filter;
  return guardedUpdate(
    sb,
    id,
    from,
    { ...extra, status: to, decided_at: new Date().toISOString() },
    liveFilter,
  );
}

export async function listStories(sb: SupabaseClient): Promise<AdminStory[]> {
  const { data, error } = await sb
    .from(TABLE)
    .select(STORY_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AdminStory[];
}

/** Path → signed URL for private photos, in one call. Unsigned paths are left out. */
export async function signPendingPhotos(
  sb: SupabaseClient,
  paths: string[],
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const { data, error } = await sb.storage
    .from(PENDING_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return {};
  const out: Record<string, string> = {};
  for (const item of data) {
    if (item.path && item.signedUrl && !item.error) out[item.path] = item.signedUrl;
  }
  return out;
}

/**
 * Move a story from one state to another, guarded on `from`. Waiting → Live is
 * refused here: publishing goes through publishStory, which copies the photo.
 */
export async function guardedMove(
  sb: SupabaseClient,
  id: string,
  from: StoryStatus,
  to: StoryStatus,
  extra: Record<string, unknown> = {},
): Promise<MoveResult> {
  if (from === "waiting" && to === "live") {
    return fail(new Error("Publishing goes through publishStory."));
  }
  return moveRow(sb, id, from, to, extra);
}

/** Waiting → Live. The single publish path. */
export async function publishStory(sb: SupabaseClient, story: AdminStory): Promise<MoveResult> {
  if (!story.consent_at) {
    return fail(new Error("This story has no consent on record, so it cannot be published."));
  }
  if (story.status !== "waiting") return CONFLICT;

  const pending = story.pending_photo_path;
  if (!pending) {
    /* Nothing to copy. photo_url is left alone: a story with no pending photo
       may already have a published photo, and writing null would wipe it. */
    return moveRow(sb, story.id, "waiting", "live", {});
  }

  try {
    /* Copy, rather than move: nothing is removed from the pending bucket until
       the row is safely published, so a failure part-way through leaves the
       submission reviewable instead of destroying its photo. */
    const { data: file, error: dlError } = await sb.storage.from(PENDING_BUCKET).download(pending);
    if (dlError || !file) return fail(dlError ?? new Error("Object not found"));

    const ext = pending.split(".").pop() || "jpg";
    const destination = storyPhotoPath(story.id, ext);
    const { error: upError } = await sb.storage
      .from(PUBLIC_BUCKET)
      .upload(destination, file, { contentType: file.type, upsert: true });
    if (upError) return fail(upError);

    const publicUrl = sb.storage.from(PUBLIC_BUCKET).getPublicUrl(destination).data.publicUrl;

    await uploadSmallCopy(sb, story.id, file);

    /* Guarded on the pending path too: if someone replaced the photo since
       this screen loaded, publishing the old copy would be wrong. */
    const result = await moveRow(
      sb,
      story.id,
      "waiting",
      "live",
      { photo_url: publicUrl, pending_photo_path: null },
      (q) => q.eq("pending_photo_path", pending),
    );
    /* On a conflict or error the pending file stays: the row still points at
       it (or another publish already removed it). The public copy is not
       removed either, since a concurrent publish may be using the same path. */
    if (!result.ok) return result;

    /* Published — now the pending copy is redundant. A failure here leaves a
       stray private file, which is harmless and preferable to deleting before
       the publish is confirmed. */
    await quietly("Pending photo was not removed", () =>
      sb.storage.from(PENDING_BUCKET).remove([pending]),
    );
    return OK;
  } catch (err) {
    return fail(err);
  }
}

/** Save the editable fields. Never changes status. */
export async function saveStoryEdit(
  sb: SupabaseClient,
  id: string,
  edit: StoryEdit,
  expectedStatus: StoryStatus,
): Promise<MoveResult> {
  return guardedUpdate(sb, id, expectedStatus, { ...cleanEdit(edit) });
}

/**
 * Add or replace a story's photo. A Waiting story's photo is still private, so
 * the new one replaces the pending photo; every other story's goes straight to
 * the public bucket like an approved photo, with its small copy.
 */
export async function replaceStoryPhoto(
  sb: SupabaseClient,
  story: AdminStory,
  file: File,
): Promise<MoveResult> {
  try {
    const { blob, ext } = await compressImage(file);
    const contentType = ext === "png" ? "image/png" : "image/webp";

    if (story.status === "waiting") {
      const old = story.pending_photo_path;
      /* Overwrite in place when the extension matches; otherwise a new name,
         so publishing (which takes the extension from the path) stays right. */
      const target = old && old.split(".").pop() === ext ? old : `staff/story-${story.id}.${ext}`;
      const { error: upError } = await sb.storage
        .from(PENDING_BUCKET)
        .upload(target, blob, { contentType, upsert: true });
      if (upError) return fail(upError);

      const result = await guardedUpdate(sb, story.id, "waiting", { pending_photo_path: target });
      if (!result.ok) return result;
      if (old && old !== target) {
        await quietly("Old pending photo was not removed", () =>
          sb.storage.from(PENDING_BUCKET).remove([old]),
        );
      }
      return OK;
    }

    const destination = storyPhotoPath(story.id, ext);
    const { error: upError } = await sb.storage
      .from(PUBLIC_BUCKET)
      .upload(destination, blob, { contentType, upsert: true });
    if (upError) return fail(upError);
    await uploadSmallCopy(sb, story.id, blob);

    const publicUrl = sb.storage.from(PUBLIC_BUCKET).getPublicUrl(destination).data.publicUrl;
    const result = await guardedUpdate(sb, story.id, story.status, { photo_url: publicUrl });
    if (!result.ok) return result;

    const oldOwn = ownPublicPath(story);
    if (oldOwn && oldOwn !== destination) {
      await quietly("Old story photo was not removed", () =>
        sb.storage.from(PUBLIC_BUCKET).remove([oldOwn]),
      );
    }
    return OK;
  } catch (err) {
    return fail(err);
  }
}

/**
 * Remove the photo the story would show: the pending photo if there is one,
 * otherwise the published one. The row is cleared first; files go after.
 */
export async function removeStoryPhoto(sb: SupabaseClient, story: AdminStory): Promise<MoveResult> {
  const pending = story.pending_photo_path;
  if (pending) {
    const result = await guardedUpdate(sb, story.id, story.status, { pending_photo_path: null });
    if (!result.ok) return result;
    await quietly("Pending photo was not removed", () =>
      sb.storage.from(PENDING_BUCKET).remove([pending]),
    );
    return OK;
  }
  if (!story.photo_url) return OK;

  const result = await guardedUpdate(sb, story.id, story.status, { photo_url: null });
  if (!result.ok) return result;
  /* Only the story's own files. A photo_url pointing anywhere else may be a
     shared image used elsewhere on the site, so it is left in place. */
  const own = ownPublicPath(story);
  if (own) {
    await quietly("Story photo was not removed", () =>
      sb.storage.from(PUBLIC_BUCKET).remove([own, smallPhotoPath(`story-${story.id}`)]),
    );
  }
  return OK;
}

/**
 * A story typed in by staff. Saved Hidden (and unpublished: the published
 * column defaults to true) until someone presses Show on site.
 */
export async function createStory(
  sb: SupabaseClient,
  edit: StoryEdit,
  consent: { text: string },
): Promise<{ ok: true; id: string } | { ok: false; error: unknown }> {
  const consentText = consent.text.trim();
  if (!consentText) {
    return { ok: false, error: new Error("A story needs the person's agreement to be saved.") };
  }
  try {
    const { data, error } = await sb
      .from(TABLE)
      .insert({
        ...cleanEdit(edit),
        status: "hidden",
        published: false,
        consent_at: new Date().toISOString(),
        consent_text: consentText,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error };
    const id = (data as { id?: string } | null)?.id;
    if (!id) return { ok: false, error: new Error("The new story was not saved.") };
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: err };
  }
}

/** Delete permanently. Only Hidden or Declined stories; files go after the row. */
export async function deleteStory(sb: SupabaseClient, story: AdminStory): Promise<MoveResult> {
  if (story.status !== "hidden" && story.status !== "declined") {
    return fail(new Error("Only hidden or declined stories can be deleted."));
  }
  try {
    const { data, error } = await sb
      .from(TABLE)
      .delete()
      .eq("id", story.id)
      .in("status", ["hidden", "declined"])
      .select("id");
    if (error) return fail(error);
    if (!Array.isArray(data) || data.length === 0) return CONFLICT;
  } catch (err) {
    return fail(err);
  }

  /* The row is gone; removing its files is cleanup, and a failure only leaves
     a stray file. */
  const pending = story.pending_photo_path;
  const own = ownPublicPath(story);
  await Promise.all([
    pending
      ? quietly("Pending photo was not removed", () =>
          sb.storage.from(PENDING_BUCKET).remove([pending]),
        )
      : null,
    quietly("Story photo was not removed", () =>
      sb.storage
        .from(PUBLIC_BUCKET)
        .remove([...(own ? [own] : []), smallPhotoPath(`story-${story.id}`)]),
    ),
  ]);
  return OK;
}

/** Feature (Live stories only) or unfeature a story on the home page. */
export async function setFeatured(
  sb: SupabaseClient,
  id: string,
  featured: boolean,
  order: number | null,
): Promise<MoveResult> {
  try {
    let q = sb
      .from(TABLE)
      .update({ featured, featured_order: featured ? order : null })
      .eq("id", id);
    if (featured) q = q.eq("status", "live");
    const { data, error } = await q.select("id");
    if (error) return fail(error);
    return Array.isArray(data) && data.length > 0 ? OK : CONFLICT;
  } catch (err) {
    return fail(err);
  }
}

async function setOrder(sb: SupabaseClient, id: string, current: number, next: number) {
  try {
    const { data, error } = await sb
      .from(TABLE)
      .update({ featured_order: next })
      .eq("id", id)
      .eq("featured", true)
      .eq("featured_order", current)
      .select("id");
    if (error) return fail(error);
    return Array.isArray(data) && data.length > 0 ? OK : CONFLICT;
  } catch (err) {
    return fail(err);
  }
}

/** Swap two featured stories' places, each guarded on the order the screen saw. */
export async function swapFeaturedOrder(
  sb: SupabaseClient,
  a: { id: string; order: number },
  b: { id: string; order: number },
): Promise<MoveResult> {
  const first = await setOrder(sb, a.id, a.order, b.order);
  if (!first.ok) return first;
  const second = await setOrder(sb, b.id, b.order, a.order);
  if (!second.ok) {
    /* Put the first one back so the two never share a place. */
    await setOrder(sb, a.id, b.order, a.order);
    return second;
  }
  return OK;
}
