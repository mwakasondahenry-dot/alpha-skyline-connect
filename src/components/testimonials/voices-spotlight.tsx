/**
 * The home page's testimonials: one voice at a time, large, with every voice
 * present as a row of faces beneath it.
 *
 * No cards and no frames: the quote is set as display type on the page
 * ground, and the faces say "there are many of us" without asking anyone to
 * read thirty quotes. The speaker's face carries a gold ring; tapping any face
 * brings their words up.
 *
 * The thin gold line under the quote is the timer. It is a CSS animation, and
 * the quote moves on when it ends, so pausing the animation pauses the
 * rotation at exactly the point it reached. It pauses while the pointer or
 * focus is inside, while the section is off screen or the tab hidden, and
 * when the visitor presses pause. Under prefers-reduced-motion nothing
 * advances by itself and changes are instant; the faces still work.
 *
 * Every quote is in the server-rendered HTML, stacked in one grid cell, so
 * the block keeps the height of the longest and nothing below it jumps.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Pause, Play } from "lucide-react";
import { T } from "@/components/type-roles";
import { WholePhoto } from "@/components/testimonials/whole-photo";
import type { TestimonialItem } from "@/lib/alpha-content.functions";

const HOLD_MS = 7000;
/** Longest quote shown whole on the home page; longer ones end at a sentence. */
const MAX_CHARS = 180;

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

/**
 * The quote as the home page shows it. A long one stops at the last full
 * sentence that fits, or at a word with an ellipsis, and says so: the reader
 * is offered the whole story, so nobody's words are silently shortened.
 */
export function excerpt(quote: string, max = MAX_CHARS): { text: string; cut: boolean } {
  const q = quote.trim();
  if (q.length <= max) return { text: q, cut: false };
  const head = q.slice(0, max);
  const end = Math.max(head.lastIndexOf(". "), head.lastIndexOf("! "), head.lastIndexOf("? "));
  if (end > max * 0.4) return { text: `${head.slice(0, end + 1)} …`, cut: true };
  return { text: `${head.slice(0, head.lastIndexOf(" ")).replace(/[,;:]$/, "")}…`, cut: true };
}

export function VoicesSpotlight({ items }: { items: TestimonialItem[] }) {
  const count = items.length;
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const facesRef = useRef<HTMLUListElement>(null);

  const go = (next: number) => {
    const n = ((next % count) + count) % count;
    if (n === idx) return;
    setPrev(idx);
    setIdx(n);
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), {
      threshold: 0.4,
    });
    io.observe(el);
    const onVis = () => setTabHidden(document.visibilityState !== "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  /* Keep the speaker's face in view when the row scrolls sideways (phones).
     Scrolls the row only, never the page. */
  useEffect(() => {
    const row = facesRef.current;
    const face = row?.children[idx] as HTMLElement | undefined;
    if (!row || !face || row.scrollWidth <= row.clientWidth) return;
    const left = face.offsetLeft - row.clientWidth / 2 + face.offsetWidth / 2;
    row.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  }, [idx, reduced]);

  if (count === 0) return null;

  const auto = count > 1 && !reduced;
  const running = auto && !stopped && !hovered && !focused && onScreen && !tabHidden;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="What former students and parents say"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div className="lg:pl-20">
        <ul className="grid" aria-live={running ? "off" : "polite"}>
          {items.map((t, i) => {
            const { text, cut } = excerpt(t.quote);
            const state = i === idx ? "on" : i === prev ? "out" : "off";
            const line = voiceLine(t);
            return (
              <li
                key={t.id}
                className="voice self-end [grid-area:1/1]"
                data-state={state}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={i !== idx}
              >
                <figure>
                  {/* The mark travels with its quote. Short quotes sit low in
                      the block, next to the faces, rather than leaving a gap
                      under themselves. */}
                  <span
                    aria-hidden
                    className="pointer-events-none mb-1 block select-none font-display leading-[0.7] text-[var(--color-gold)] lg:-ml-20 lg:mb-0 lg:h-0 lg:w-20 lg:translate-y-2"
                    style={{ fontSize: "clamp(3.5rem, 2.5rem + 3vw, 6rem)", fontWeight: 900 }}
                  >
                    &ldquo;
                  </span>
                  <blockquote
                    className="max-w-[46rem] font-display tracking-[-0.015em] text-pretty text-[var(--color-deep-blue)]"
                    style={{
                      fontSize: "clamp(1.375rem, 1rem + 1.5vw, 2.25rem)",
                      lineHeight: 1.25,
                      fontWeight: 800,
                    }}
                  >
                    {text}
                  </blockquote>
                  <figcaption className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span
                      className="font-display text-[var(--color-ink)]"
                      style={{ ...T.body, fontWeight: 800 }}
                    >
                      {t.author_name}
                    </span>
                    {line && (
                      <span className="text-[var(--color-ink-soft)]" style={T.body}>
                        {line}
                      </span>
                    )}
                    {cut && (
                      <Link
                        to="/testimonials"
                        hash={`story-${t.id}`}
                        tabIndex={i === idx ? 0 : -1}
                        className="inline-flex items-center gap-1 font-display text-[var(--color-deep-blue)] underline decoration-[var(--color-gold)] decoration-2 underline-offset-[6px] hover:decoration-[var(--color-deep-blue)]"
                        style={{ ...T.body, fontWeight: 800 }}
                      >
                        Read in full <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    )}
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>

      {count > 1 && (
        <div className="mt-10 lg:pl-20">
          <div className="flex items-center gap-3">
            {auto && (
              <button
                type="button"
                onClick={() => setStopped((s) => !s)}
                aria-label={stopped ? "Play the quotes" : "Pause the quotes"}
                className="-ml-3 grid h-11 w-11 shrink-0 place-items-center rounded-full text-[var(--color-deep-blue)] transition-colors duration-150 hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-blue)] motion-reduce:transition-none"
              >
                {stopped ? (
                  <Play className="h-4 w-4 fill-current" aria-hidden />
                ) : (
                  <Pause className="h-4 w-4 fill-current" aria-hidden />
                )}
              </button>
            )}
            <span
              aria-hidden
              className="relative block h-0.5 flex-1 overflow-hidden rounded-full bg-[var(--color-hairline)]"
            >
              {auto && (
                <span
                  key={idx}
                  className="voice-timer absolute inset-0 origin-left bg-[var(--color-gold)]"
                  style={{
                    animationDuration: `${HOLD_MS}ms`,
                    animationPlayState: running ? "running" : "paused",
                  }}
                  onAnimationEnd={() => go(idx + 1)}
                />
              )}
            </span>
            <span
              className="shrink-0 tabular-nums text-[var(--color-ink-soft)]"
              style={{ ...T.body, fontSize: "var(--text-label)" }}
            >
              {idx + 1} / {count}
            </span>
          </div>

          <ul
            ref={facesRef}
            aria-label="Choose a voice"
            className="voice-faces -mx-[var(--container-gutter)] mt-5 flex gap-1.5 overflow-x-auto px-[var(--container-gutter)] py-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
          >
            {items.map((t, i) => (
              <li key={t.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={t.author_name}
                  aria-pressed={i === idx}
                  className="voice-face grid h-11 w-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-blue)]"
                  data-on={i === idx || undefined}
                >
                  <WholePhoto
                    src={t.photo_url}
                    name={t.author_name}
                    className="h-10 w-10 rounded-full"
                    initialClassName="text-base"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
