/**
 * "What parents say" for a school page: one parent quote at a time, newest
 * first, moved by swipe, arrow buttons or arrow keys. Nothing advances on its
 * own. The section disappears when the school has no published parent
 * quotes (PRODUCT.md: testimonial sections hide entirely when empty).
 */
import { useCallback, useEffect, useState, type CSSProperties, type KeyboardEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SHELL, T } from "@/components/type-roles";
import type { SchoolSlug } from "@/integrations/alpha-supabase/types";
import { parentQuotes, type TestimonialItem } from "@/lib/alpha-content.functions";
import { testimonialsQuery } from "@/lib/testimonials-query";
import { ALUMNI_SCHOOLS } from "@/lib/invites/contacts";

/** Large enough to read as the section's voice, small enough for a 400-character quote on a phone. */
const QUOTE: CSSProperties = {
  fontSize: "clamp(1.25rem, 1.05rem + 0.9vw, 1.75rem)",
  lineHeight: 1.4,
  fontWeight: 500,
};

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

export function ParentVoices({ school, accent }: { school: SchoolSlug; accent: string }) {
  const { data } = useSuspenseQuery(testimonialsQuery);
  const quotes = parentQuotes(data, school);
  if (quotes.length === 0) return null;
  return <ParentVoicesBody quotes={quotes} school={school} accent={accent} />;
}

function ParentVoicesBody({
  quotes,
  school,
  accent,
}: {
  quotes: TestimonialItem[];
  school: SchoolSlug;
  accent: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [viewportRef, api] = useEmblaCarousel({
    align: "start",
    containScroll: false,
    duration: 24,
  });
  const [index, setIndex] = useState(0);
  const count = quotes.length;
  const headingId = `parents-say-${school}`;
  const schoolName = ALUMNI_SCHOOLS.find((s) => s.value === school)?.label ?? "Alpha";

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
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
      api.scrollTo(Math.min(Math.max(next, 0), count - 1), reduced);
    },
    [api, count, reduced],
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

  const controls = (className: string) =>
    count > 1 ? (
      <Controls
        className={className}
        index={index}
        count={count}
        onPrev={() => go(index - 1)}
        onNext={() => go(index + 1)}
      />
    ) : null;

  return (
    <section
      aria-labelledby={headingId}
      className="bg-[var(--color-tint-parent)] py-[var(--space-section-y)]"
      style={{ "--pv-accent": accent } as CSSProperties}
    >
      <div
        className={`${SHELL} grid gap-8 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-20`}
      >
        <div>
          <h2
            id={headingId}
            className="font-display tracking-tight text-balance"
            style={{ ...T.section, color: accent }}
          >
            What parents say
          </h2>
          <p className="mt-3 max-w-[32ch] text-[var(--color-ink-soft)]" style={T.body}>
            In their own words, from families at {schoolName}.
          </p>
          {controls("mt-8 hidden md:flex")}
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-labelledby={headingId}
          tabIndex={count > 1 ? 0 : undefined}
          onKeyDown={count > 1 ? onKeyDown : undefined}
          className="min-w-0 rounded-[var(--radius-card)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--pv-accent)]"
        >
          <div ref={viewportRef} className="overflow-hidden">
            <div className="-ml-8 flex">
              {quotes.map((q, i) => (
                <figure
                  key={q.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Quote ${i + 1} of ${count}`}
                  aria-hidden={i !== index}
                  className="min-w-0 shrink-0 grow-0 basis-full pl-8"
                >
                  <blockquote
                    className="max-w-[34em] font-display text-pretty text-[var(--color-deep-blue)]"
                    style={QUOTE}
                  >
                    &ldquo;{q.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-4">
                    <Avatar item={q} />
                    <span className="min-w-0">
                      <span
                        className="block font-semibold text-[var(--color-deep-blue)]"
                        style={T.body}
                      >
                        {q.author_name}
                      </span>
                      <span className="block text-[var(--color-ink-soft)]" style={T.body}>
                        {q.relationship ?? "Parent"}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <p aria-live="polite" className="sr-only">
            {count > 1 ? `Quote ${index + 1} of ${count}` : ""}
          </p>
          {controls("mt-8 flex md:hidden")}
        </div>
      </div>
    </section>
  );
}

function Avatar({ item }: { item: TestimonialItem }) {
  if (item.photo_url) {
    return (
      <img
        src={item.photo_url}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--pv-accent)] font-display text-white"
      style={T.cardTitle}
    >
      {item.author_name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function Controls({
  className,
  index,
  count,
  onPrev,
  onNext,
}: {
  className: string;
  index: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const btn =
    "grid h-11 w-11 place-items-center rounded-full border border-[var(--pv-accent)]/25 bg-white " +
    "text-[var(--pv-accent)] transition-colors duration-150 hover:bg-[var(--pv-accent)] hover:text-white " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pv-accent)] " +
    "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-[var(--pv-accent)] " +
    "motion-reduce:transition-none";
  return (
    <div className={`items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={onPrev}
        disabled={index === 0}
        aria-label="Previous quote"
        className={btn}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <span
        className="min-w-[4.5rem] text-center tabular-nums text-[var(--color-ink-soft)]"
        style={T.body}
      >
        {index + 1} of {count}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={index === count - 1}
        aria-label="Next quote"
        className={btn}
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
