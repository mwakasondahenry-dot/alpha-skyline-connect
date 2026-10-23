/**
 * Where a testimonial's small photo lives.
 *
 * Story photos arrive straight from phones, at full camera size (one is
 * 4.7 MB). The slots that show them are at most 120px tall, so each published
 * story photo gets a small copy beside it: `testimonials/story-<id>.jpg`
 * keeps its original, and `testimonials/small/story-<id>.webp` is the copy
 * the site loads. Supabase's own resizing is a paid add-on, so the copy is
 * made when a story is approved (src/components/admin/alumni-pending.tsx)
 * and, for photos approved before that, by scripts/make-testimonial-thumbs.mjs.
 *
 * Photos uploaded any other way (for example through the admin testimonials
 * form, which does not compress yet) have no small copy, and load as they are.
 */

const STORY_PHOTO = /\/testimonials\/(story-[^/.]+)\.[a-z0-9]+$/i;

/** Longest edge of the small copy: 2x the largest slot it fills. */
export const SMALL_EDGE = 320;

/** Storage path of the small copy for a story id, inside the public bucket. */
export function smallPhotoPath(storyFile: string): string {
  return `testimonials/small/${storyFile}.webp`;
}

/** URL of the small copy, or null when this photo has none by design. */
export function smallPhotoUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  const m = photoUrl.match(STORY_PHOTO);
  if (!m) return null;
  return photoUrl.replace(STORY_PHOTO, `/${smallPhotoPath(m[1])}`);
}
