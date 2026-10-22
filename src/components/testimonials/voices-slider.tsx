/**
 * The home page's testimonials: one voice at a time, full width, sliding
 * to the next every few seconds.
 *
 * Every published quote is in the server-rendered HTML; the slide is a
 * single transform on the track, so the only cost is one composited layer.
 * It pauses while the pointer or keyboard focus is on it, while the tab is
 * hidden, and entirely under prefers-reduced-motion (the arrows and dots
 * still work, the change is instant). A swipe moves it on a phone.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { T } from "@/components/type-roles";
import type { TestimonialItem } from "@/lib/alpha-content.functions";

const INTERVAL_MS = 6500;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** "Tax Consultant at EY Tanzania · Class of 2020", or "Parent, Alpha Girls". */
export function voiceLine(t: TestimonialItem): string {
  const work = [t.relationship, t.company].filter(Boolean).join(" at ");
  const year = t.grad_year != null ? `Class of ${t.grad_year}` : null;
  return [work || null, year].filter(Boolean).join(" · ");
}

export function VoicesSlider({ items }: { items: TestimonialItem[] }) {
  const count = items.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const touchX = useRef<number | null>(null);

  const go = (next: number) => setIdx(((next % count) + count) % count);

  useEffect(() => {
    if (reduced || paused || count <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(t);
  }, [reduced, paused, count]);

  useEffect(() => {
    const onVis = () => setPaused((p) => p || document.visibilityState !== "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (count === 0) return null;

  const control =
    "grid h-11 w-11 place-items-center rounded-full border border-[var(--color-deep-blue)]/20 " +
    "text-[var(--color-deep-blue)] transition-colors duration-150 hover:bg-[var(--color-surface-muted)] " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-deep-blue)] " +
    "motion-reduce:transition-none";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="What parents and former students say"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(document.visibilityState !== "visible")}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(document.visibilityState !== "visible")}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX ?? null;
        touchX.current = null;
        if (start == null || end == null || count <= 1) return;
        const dx = end - start;
        if (Math.abs(dx) < 40) return;
        go(dx < 0 ? idx + 1 : idx - 1);
      }}
    >
      {/* The active slide sits in the flow, so the block is exactly as tall as
          the quote on show; the others wait on top of it, out of the flow and
          invisible, and the change is a short fade with a sideways drift. A
          sliding track would be as tall as the longest quote and leave a
          short one floating above empty space on a phone. */}
      <div className="relative overflow-hidden">
        <ul aria-live={reduced || paused ? "polite" : "off"}>
          {items.map((t, i) => (
            <li
              key={t.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== idx}
              className={`w-full transition-[opacity,transform] duration-500 ease-[var(--ease-out)] motion-reduce:transition-none ${
                i === idx ? "relative" : "pointer-events-none absolute inset-x-0 top-0"
              }`}
              style={{
                opacity: i === idx ? 1 : 0,
                transform: i === idx ? "translate3d(0, 0, 0)" : "translate3d(2rem, 0, 0)",
              }}
            >
              <figure className="grid gap-6 lg:grid-cols-[auto_1fr] lg:gap-10">
                <Quote
                  aria-hidden
                  className="h-10 w-10 shrink-0 text-[var(--color-gold)] lg:h-14 lg:w-14"
                />
                <div>
                  <blockquote
                    className="max-w-4xl font-display tracking-tight text-balance text-[var(--color-deep-blue)]"
                    style={{ ...T.section, fontWeight: 700 }}
                  >
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-4">
                    {t.photo_url ? (
                      <img
                        width={56}
                        height={56}
                        src={t.photo_url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-14 w-14 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="grid h-14 w-14 shrink-0 place-items-center rounded-full font-display text-[var(--color-deep-blue)]"
                        style={{ ...T.cardTitle, background: "var(--color-gold)" }}
                      >
                        {t.author_name.trim().charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span
                        className="block font-display text-[var(--color-deep-blue)]"
                        style={{ ...T.body, fontWeight: 800 }}
                      >
                        {t.author_name}
                      </span>
                      {voiceLine(t) && (
                        <span className="block text-[var(--color-ink-soft)]" style={T.body}>
                          {voiceLine(t)}
                        </span>
                      )}
                    </span>
                  </figcaption>
                </div>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      {count > 1 && (
        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(idx - 1)}
            aria-label="Previous quote"
            className={control}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <ol className="flex items-center gap-2" aria-label="Quotes">
            {items.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Quote ${i + 1} of ${count}`}
                  aria-current={i === idx ? "true" : undefined}
                  className="grid h-6 w-6 place-items-center"
                >
                  <span
                    aria-hidden
                    className={`block rounded-full transition-all duration-300 motion-reduce:transition-none ${
                      i === idx
                        ? "h-2.5 w-7 bg-[var(--color-gold)]"
                        : "h-2.5 w-2.5 bg-[var(--color-deep-blue)]/25"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => go(idx + 1)}
            aria-label="Next quote"
            className={control}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
