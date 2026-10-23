/**
 * The home page's opening: headline, actions, one wide picture with fact
 * stickers on it, and a gold ribbon of what Alpha is, scrolling past.
 *
 * The owner found the old slideshow hero boring and asked for motion and a
 * younger feel (2026-10-23). The motion is one sequence on first paint, in
 * CSS only (see "YOUTH HERO" in styles.css): the picture opens out like a
 * window, the headline lines rise in, the stickers pop on, the gold
 * underline draws. Nothing waits on scrolling, so nothing can sit blank on a
 * slow phone (the reason the old scroll reveals were removed on 2026-10-22).
 * Under reduced motion the finished composition shows at once.
 *
 * The picture is an AI illustration, not a photograph of real pupils, and
 * the owner chose to show it labelled as one. The label stays on it for as
 * long as the picture is used; replace both with a real photograph when the
 * school has one.
 *
 * Every word on the stickers and the ribbon is already on the site:
 * aviation from Form One (/aviation), coding from primary, NECTA, the three
 * school names, the two campuses and the 2007 founding.
 */
import { useState, type ReactNode } from "react";
import { Laptop, Pause, Plane, Play, BookOpen } from "lucide-react";
import { Photo } from "@/components/photo";
import { Marked, Sticker } from "@/components/alpha-ui";
import illustration from "@/assets/hero-illustration-students.webp";

const SHELL = "mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]";

const RIBBON = [
  "Nursery & Primary",
  "Alpha High",
  "Alpha Girls",
  "Aviation from Form One",
  "Coding from primary",
  "NECTA: CSEE and ACSEE",
  "Kunduchi",
  "Mikocheni",
  "Since 2007",
] as const;

export function YouthHero({ actions }: { actions: ReactNode }) {
  return (
    <section className="yh relative isolate overflow-hidden bg-[var(--color-deep-blue)] text-[var(--color-surface)]">
      {/* One wash of bright blue behind the picture, so the navy field has
          depth without a second photograph. */}
      <span aria-hidden className="yh-glow pointer-events-none absolute -z-10" />

      <div
        className={`${SHELL} pt-[calc(var(--header-h)+2.25rem)] lg:pt-[calc(var(--header-h)+3rem)]`}
      >
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:gap-12">
          <h1 className="yh-title font-display">
            <span className="sr-only">Alpha Schools, Dar es Salaam: </span>
            <span className="yh-line block" style={{ ["--d" as string]: "60ms" }}>
              Your potential,
            </span>
            <span
              className="yh-line block text-[var(--color-gold)]"
              style={{ ["--d" as string]: "170ms" }}
            >
              <Marked kind="underline" color="var(--color-surface)" delay={760}>
                unlocked.
              </Marked>
            </span>
          </h1>

          <div className="yh-copy lg:pb-3">
            <p
              className="max-w-md font-display text-[var(--color-surface)]"
              style={{ fontSize: "var(--text-card-title)", lineHeight: 1.35, fontWeight: 700 }}
            >
              Three schools. One family. Limitless futures.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>
          </div>
        </div>

        <figure className="relative mt-10 lg:mt-14">
          <div className="yh-window relative overflow-hidden rounded-[1.5rem] bg-[var(--color-deep-blue-dark)] lg:rounded-[2.25rem]">
            <Photo
              width={1672}
              height={941}
              src={illustration}
              sizes="(min-width: 1280px) 1184px, 100vw"
              alt="Illustration of a graduate and three Alpha students in uniform, above Dar es Salaam"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="yh-photo block aspect-[4/3] w-full object-cover sm:aspect-[16/9] lg:aspect-[2/1]"
              style={{ objectPosition: "50% 22%" }}
            />
            <figcaption className="absolute bottom-3 right-3 rounded-full bg-[var(--color-scrim-navy)]/75 px-2.5 py-1 text-xs font-semibold text-[var(--color-surface)]/90 lg:bottom-5 lg:right-5">
              Illustration
            </figcaption>
          </div>

          {/* Stickers. Decorative restatements of facts the page states
              in full further down, so they stay out of the reading order. */}
          <div aria-hidden>
            <span className="absolute -top-4 left-3 sm:left-6 lg:-top-6 lg:left-10">
              <Sticker tone="gold" tilt={-6} delay={900} className="yh-sticker">
                <span className="inline-flex items-center gap-2">
                  <Plane className="h-[1.1em] w-[1.1em]" /> Aviation from Form One
                </span>
              </Sticker>
            </span>
            <span className="absolute right-3 top-[42%] hidden sm:block lg:-right-4">
              <Sticker tone="sky" tilt={5} delay={1030} className="yh-sticker">
                <span className="inline-flex items-center gap-2">
                  <Laptop className="h-[1.1em] w-[1.1em]" /> Coding from primary
                </span>
              </Sticker>
            </span>
            <span className="absolute -bottom-4 left-6 hidden sm:block lg:left-[30%]">
              <Sticker tone="navy" tilt={-3} delay={1160} className="yh-sticker">
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-[1.1em] w-[1.1em]" /> NECTA: CSEE and ACSEE
                </span>
              </Sticker>
            </span>
          </div>
        </figure>
      </div>

      <Ribbon />
    </section>
  );
}

/**
 * The gold ribbon. It moves for as long as the page is open, so it carries
 * a pause button (WCAG 2.2.2) and also stops while a pointer rests on it.
 * Two copies of the list run end to end so the loop has no seam; screen
 * readers get the first copy only.
 */
function Ribbon() {
  const [paused, setPaused] = useState(false);
  const items = (copy: number) =>
    RIBBON.map((r) => (
      <li key={`${copy}-${r}`} className="flex shrink-0 items-center gap-6 pr-6">
        <span>{r}</span>
        <Star />
      </li>
    ));
  return (
    <div className="yh-ribbon relative mt-12 lg:mt-16" data-paused={paused || undefined}>
      <div className="flex items-center bg-[var(--color-gold)] text-[var(--color-accent-foreground)]">
        <div className="min-w-0 flex-1 overflow-hidden py-3.5 lg:py-4">
          <div className="yh-track flex w-max font-display" style={{ fontWeight: 900 }}>
            <ul aria-label="Alpha Schools in short" className="flex">
              {items(0)}
            </ul>
            <ul aria-hidden className="flex">
              {items(1)}
            </ul>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play the moving ribbon" : "Pause the moving ribbon"}
          className="yh-ribbon-btn mr-[var(--container-gutter)] ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-deep-blue)] text-[var(--color-surface)] transition-transform duration-150 hover:scale-105 active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-deep-blue)] motion-reduce:hidden"
        >
          {paused ? (
            <Play className="h-4 w-4" aria-hidden />
          ) : (
            <Pause className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

function Star() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
      <path d="M12 1.5l2.6 7.1 7.4.4-5.8 4.7 2 7.3L12 16.9 5.8 21l2-7.3L2 9l7.4-.4z" />
    </svg>
  );
}
