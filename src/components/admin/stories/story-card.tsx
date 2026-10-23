/**
 * One story in a Stories list: the whole photo, the name, who they are, the
 * school, the first two lines of the quote and the date. The whole card opens
 * the story. A failed action on this story shows its error here, in words.
 */
import { useCallback } from "react";
import { AlertCircle, Star } from "lucide-react";
import { ListCard } from "@/components/admin/kit";
import { WholePhoto } from "@/components/testimonials/whole-photo";
import { schoolLabel } from "@/lib/admin/format";
import type { AdminStory } from "@/lib/admin/stories-data";
import { cardLines } from "@/lib/admin/stories-view";
import { useStoriesUi } from "./use-stories";

export function StoryCard({
  story,
  photo,
  selected,
  onOpen,
}: {
  story: AdminStory;
  /** The photo to show (signed private URL or public URL), null for none or not yet signed. */
  photo: string | null;
  selected: boolean;
  onOpen: () => void;
}) {
  const ui = useStoriesUi();
  const { role, date } = cardLines(story);
  const error = ui.errors[story.id];
  const busy = ui.busy.has(story.id);
  const register = ui.registerCard;
  const id = story.id;
  const ref = useCallback((el: HTMLElement | null) => register(id, el), [register, id]);

  return (
    <ListCard
      ref={ref}
      onClick={onOpen}
      selected={selected}
      highlight={ui.flash[story.id] ?? null}
      aria-busy={busy || undefined}
      className="p-3 sm:p-4"
    >
      <span className="flex gap-3">
        <WholePhoto
          key={photo ?? ""}
          src={photo}
          name={story.author_name}
          className="h-20 w-16 rounded-[var(--radius-btn)]"
          initialClassName="text-2xl"
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-start gap-1.5">
            <span className="min-w-0 flex-1 break-words font-semibold leading-snug text-[var(--color-deep-blue)]">
              {story.author_name}
            </span>
            {story.featured && story.status === "live" ? (
              <span className="shrink-0">
                <Star
                  aria-hidden
                  className="h-5 w-5 fill-[var(--color-gold)] text-[var(--color-deep-blue)]"
                  strokeWidth={1.5}
                />
                <span className="sr-only">Featured on home</span>
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-sm leading-snug text-[var(--color-ink-soft)]">
            {role} · {schoolLabel(story.school_slug)}
          </span>
          <span className="mt-1.5 line-clamp-2 block text-sm leading-snug text-[var(--color-ink)]">
            {story.quote}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-ink-soft)]">
            <span className="tabular-nums">{date}</span>
            {!story.consent_at ? (
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-deep-blue)]">
                <AlertCircle aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
                No consent on record
              </span>
            ) : null}
            {busy ? <span>Working…</span> : null}
          </span>
          {error ? (
            <span className="mt-2 flex gap-1.5 text-sm leading-snug text-[var(--color-danger)]">
              <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </span>
          ) : null}
        </span>
      </span>
    </ListCard>
  );
}
