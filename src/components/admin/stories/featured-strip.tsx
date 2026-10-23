/**
 * "Featured on home": the live stories that lead the home page's "In their
 * words", in their order, with up and down buttons to reorder them. No drag
 * library: each swap slides the two rows into place with the Web Animations
 * API (FLIP), and nothing moves under reduced motion.
 */
import { useLayoutEffect, useRef } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { AdminButton, prefersReducedMotion } from "@/components/admin/kit";
import type { AdminStory } from "@/lib/admin/stories-data";
import { possessive } from "@/lib/admin/stories-view";
import { StoryCard } from "./story-card";
import { useStoriesUi } from "./use-stories";

export function FeaturedStrip({
  stories,
  photoOf,
  selectedId,
  onOpen,
  onMove,
}: {
  stories: AdminStory[];
  photoOf: (s: AdminStory) => string | null;
  selectedId: string | null;
  onOpen: (s: AdminStory) => void;
  /** Swap the story at `index` with its neighbour above (-1) or below (+1). */
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const ui = useStoriesUi();
  const rows = useRef(new Map<string, HTMLLIElement>());
  const lastTops = useRef(new Map<string, number>());
  const order = stories.map((s) => s.id).join(",");

  // FLIP: after a reorder, start each moved row where it was and let it slide.
  useLayoutEffect(() => {
    const reduce = prefersReducedMotion();
    const next = new Map<string, number>();
    for (const [id, el] of rows.current) {
      const top = el.getBoundingClientRect().top;
      next.set(id, top);
      const before = lastTops.current.get(id);
      if (reduce || before === undefined || typeof el.animate !== "function") continue;
      const dy = before - top;
      if (Math.abs(dy) < 1) continue;
      const easing =
        getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() ||
        "ease-out";
      el.animate([{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }], {
        duration: 200,
        easing,
      });
    }
    lastTops.current = next;
  }, [order]);

  if (stories.length === 0) return null;

  return (
    <section aria-labelledby="featured-heading" className="space-y-2">
      <h2
        id="featured-heading"
        className="font-display text-base font-bold text-[var(--color-deep-blue)]"
      >
        Featured on home
      </h2>
      <p className="text-sm leading-snug text-[var(--color-ink-soft)]">
        The testimonials page lists stories newest first; this order is for the home page.
      </p>
      <ol className="space-y-2">
        {stories.map((s, i) => {
          const busy = ui.busy.has(s.id);
          const p = possessive(s.author_name);
          return (
            <li
              key={s.id}
              ref={(el) => {
                if (el) rows.current.set(s.id, el);
                else rows.current.delete(s.id);
              }}
              className="flex items-stretch gap-2"
            >
              <div className="min-w-0 flex-1">
                <StoryCard
                  story={s}
                  photo={photoOf(s)}
                  selected={selectedId === s.id}
                  onOpen={() => onOpen(s)}
                />
              </div>
              <div className="flex shrink-0 flex-col justify-center gap-1">
                <AdminButton
                  variant="quiet"
                  className="px-0"
                  disabled={i === 0}
                  busy={busy}
                  onClick={() => onMove(i, -1)}
                  aria-label={`Move ${p} story up`}
                  icon={ArrowUp}
                />
                <AdminButton
                  variant="quiet"
                  className="px-0"
                  disabled={i === stories.length - 1}
                  busy={busy}
                  onClick={() => onMove(i, 1)}
                  aria-label={`Move ${p} story down`}
                  icon={ArrowDown}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
