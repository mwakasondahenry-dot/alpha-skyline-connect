/**
 * The testimonials page carousel: quote cards moved by swipe, arrow buttons
 * or arrow keys. Nothing advances on its own. Three cards on a wide screen,
 * two on a tablet, one on a phone.
 *
 * It carries no content: the page passes the quotes and decides what a card
 * says beneath the name, so parent quotes and alumni stories share one
 * behaviour without sharing their copy.
 */
import { useCallback, useEffect, useState, type CSSProperties, type KeyboardEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { T } from "@/components/type-roles";
import type { TestimonialItem } from "@/lib/alpha-content.functions";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function QuoteCarousel({
  items,
  label,
  meta,
}: {
  items: TestimonialItem[];
  /** Names the carousel for screen readers, e.g. "Parent testimonials". */
  label: string;
  /** The lines under the name: school, class, where they are now. */
  meta: (item: TestimonialItem) => string[];
}) {
  const reduced = usePrefersReducedMotion();
  const [viewportRef, api] = useEmblaCarousel({
    align: "start",
    containScroll: false,
    duration: 24,
  });
  const [index, setIndex] = useState(0);
  const [snaps, setSnaps] = useState(1);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setIndex(api.selectedScrollSnap());
      setSnaps(api.scrollSnapList().length);
    };
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const go = useCallback(
    (next: number) => {
      if (!api) return;
      /* Jump rather than slide when the reader prefers less motion. */
      api.scrollTo(Math.min(Math.max(next, 0), snaps - 1), reduced);
    },
    [api, snaps, reduced],
  );

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    }
  }

  const arrow =
    "grid h-11 w-11 place-items-center rounded-full border border-[var(--color-brand-blue)]/25 " +
    "bg-white text-[var(--color-brand-blue)] transition-colors duration-150 " +
    "hover:bg-[var(--color-brand-blue)] hover:text-white focus-visible:outline-2 " +
    "focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-blue)] " +
    "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white " +
    "disabled:hover:text-[var(--color-brand-blue)] motion-reduce:transition-none";

  const scrollable = snaps > 1;

  return (
    <div>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={scrollable ? 0 : undefined}
        onKeyDown={scrollable ? onKeyDown : undefined}
        className="rounded-[var(--radius-card)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand-blue)]"
      >
        <div ref={viewportRef} className="overflow-hidden">
          <div className="-ml-6 flex">
            {items.map((item, i) => (
              <figure
                key={item.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`Quote ${i + 1} of ${items.length}`}
                className="flex min-w-0 shrink-0 grow-0 basis-full gap-4 pl-6 sm:basis-1/2 lg:basis-1/3"
              >
                <div className="flex w-full gap-4 rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--card-shadow)] ring-1 ring-[var(--color-deep-blue)]/5">
                  <Portrait item={item} />
                  <div className="min-w-0 flex-1">
                    <span
                      aria-hidden
                      className="block font-display leading-none text-[var(--color-brand-blue)]/35"
                      style={{ fontSize: "2.25rem" }}
                    >
                      &ldquo;
                    </span>
                    <blockquote
                      className="-mt-2 whitespace-pre-line break-words text-[var(--color-ink)]"
                      style={T.body}
                    >
                      {item.quote}
                    </blockquote>
                    <figcaption className="mt-4">
                      <span
                        className="block font-semibold text-[var(--color-deep-blue)]"
                        style={T.body}
                      >
                        {item.author_name}
                      </span>
                      {meta(item).map((line, i) => (
                        <span
                          key={line}
                          className={
                            i === 0
                              ? "block text-[var(--color-brand-blue)]"
                              : "block text-[var(--color-ink-soft)]"
                          }
                          style={{
                            ...T.body,
                            fontSize: "var(--text-label)",
                            textTransform: "none",
                          }}
                        >
                          {line}
                        </span>
                      ))}
                    </figcaption>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>
        <p aria-live="polite" className="sr-only">
          {scrollable ? `Showing quote ${index + 1} of ${snaps}` : ""}
        </p>
      </div>

      {scrollable && (
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label={`Previous ${label.toLowerCase()}`}
            className={arrow}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === snaps - 1}
            aria-label={`Next ${label.toLowerCase()}`}
            className={arrow}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

/** The person's photo, or their initial on a tinted square. */
function Portrait({ item }: { item: TestimonialItem }) {
  const style: CSSProperties = { aspectRatio: "3 / 4" };
  if (item.photo_url) {
    return (
      <img
        src={item.photo_url}
        alt=""
        loading="lazy"
        decoding="async"
        style={style}
        className="w-24 shrink-0 rounded-[var(--radius-btn)] object-cover sm:w-28"
      />
    );
  }
  return (
    <span
      aria-hidden
      style={style}
      className="grid w-24 shrink-0 place-items-center rounded-[var(--radius-btn)] bg-[var(--color-brand-blue)]/10 font-display text-2xl font-bold text-[var(--color-brand-blue)] sm:w-28"
    >
      {item.author_name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
