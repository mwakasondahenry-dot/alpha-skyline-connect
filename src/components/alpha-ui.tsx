/**
 * Alpha UI — the pinned visual world.
 *
 * From the approved design approach: deep navy fields cut by one gold arc,
 * a white page carrying rounded cards with hairline borders, icon discs
 * alternating gold and navy, and short gold rules under section heads.
 *
 * Two rules this file exists to enforce:
 *
 * 1. Tokens only. Every value resolves to something already in styles.css.
 * 2. Motion lives on buttons and nowhere else, per
 *    motion-audits/tanstack-start-ts-2026-09-02.html: press at
 *    scale(0.97) over 120ms, hover lift 2px over 150ms, transform and
 *    opacity only so it stays on the compositor, and a full collapse
 *    under prefers-reduced-motion. The audit's finding was that this site
 *    spent its whole motion budget on hover states a phone cannot trigger
 *    while giving touch no feedback at all; press is the fix.
 */
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { T, SHELL, heroStep } from "@/components/type-roles";

export { SHELL };

/* ------------------------------------------------------------------ *
 * Buttons — the only animated elements on the page
 * ------------------------------------------------------------------ */

const BTN_BASE =
  "inline-flex min-h-[var(--btn-primary-min-h)] items-center justify-center gap-2 " +
  "rounded-[var(--radius-pill)] font-display " +
  "transition-[transform,background-color,box-shadow] duration-[var(--hover-ms)] ease-[var(--ease-out)] " +
  "hover:-translate-y-[2px] active:translate-y-0 active:scale-[var(--press-scale)] " +
  "active:duration-[var(--press-ms)] " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100";

const BTN_TEXT: React.CSSProperties = {
  fontSize: "var(--text-body)",
  fontWeight: "var(--btn-primary-weight)",
  paddingInline: "var(--btn-primary-pad-x)",
};

export function GoldButton({
  to,
  href,
  children,
}: {
  to?: string;
  href?: string;
  children: ReactNode;
}) {
  const cls = `${BTN_BASE} bg-[var(--color-gold)] text-[var(--color-accent-foreground)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]`;
  if (href) return <a href={href} className={cls} style={BTN_TEXT}>{children}</a>;
  return (
    <Link to={to ?? "/"} className={cls} style={BTN_TEXT}>
      {children}
    </Link>
  );
}

/** Outlined. Used on the navy panel, where a gold fill would fight the arc. */
export function GhostButton({
  to,
  href,
  onNavy = false,
  children,
}: {
  to?: string;
  href?: string;
  onNavy?: boolean;
  children: ReactNode;
}) {
  const tone = onNavy
    ? "border border-[var(--color-surface)]/40 text-[var(--color-surface)] hover:bg-[var(--color-surface)]/10"
    : "border border-[var(--color-hairline)] text-[var(--color-deep-blue)] hover:bg-[var(--color-surface-muted)]";
  const cls = `${BTN_BASE} ${tone}`;
  if (href) return <a href={href} className={cls} style={BTN_TEXT}>{children}</a>;
  return (
    <Link to={to ?? "/"} className={cls} style={BTN_TEXT}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * Section head — eyebrow, heading, short gold rule
 * ------------------------------------------------------------------ */

export function SectionHead({
  children,
  mark = "underline",
  action,
}: {
  children: ReactNode;
  mark?: DoodleKind;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="relative">
        <h2
          className="max-w-3xl font-display tracking-tight text-[var(--color-deep-blue)]"
          style={T.section}
        >
          {children}
        </h2>
        <Doodle kind={mark} className="mt-1" />
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Doodles — hand-drawn marks, inline SVG, no image weight.
 * They draw on once per section on first paint and never loop.
 * ------------------------------------------------------------------ */

export type DoodleKind = "underline" | "circle" | "arrow" | "star" | "orbit";

const DOODLE: Record<DoodleKind, { d: string; box: string; dash: number; w?: number }> = {
  // a quick double-stroke underline, the way you'd underline a word twice
  underline: { d: "M3 11c22-7 52-8 74-3M8 16c26-6 56-6 78-2", box: "0 0 92 20", dash: 180 },
  // a lasso circled around a word
  circle: { d: "M96 12C74 2 30 1 12 12 2 19 6 31 24 35c26 6 66 3 74-8 5-6-1-12-14-16", box: "0 0 110 40", dash: 260 },
  // a scribbled arrow
  arrow: { d: "M2 14c18-9 44-11 62-3M52 2l14 9-13 10", box: "0 0 70 26", dash: 140 },
  // a four-point sparkle
  star: { d: "M14 2v24M2 14h24M6 6l16 16M22 6L6 22", box: "0 0 28 28", dash: 120, w: 2.5 },
  // an orbit ring, for the aviation moments
  orbit: { d: "M2 20c0-9 20-16 44-16s44 7 44 16-20 16-44 16S2 29 2 20", box: "0 0 92 40", dash: 230 },
};

export function Doodle({
  kind = "underline",
  className = "",
  color = "var(--color-gold)",
  delay = 120,
}: {
  kind?: DoodleKind;
  className?: string;
  color?: string;
  delay?: number;
}) {
  const it = DOODLE[kind];
  return (
    <svg
      aria-hidden
      viewBox={it.box}
      className={`block h-auto ${className}`}
      style={{ width: kind === "star" ? "1.5rem" : "5.75rem", overflow: "visible" }}
      fill="none"
      stroke={color}
      strokeWidth={it.w ?? 3}
      strokeLinecap="round"
    >
      <path
        d={it.d}
        className="alpha-draw"
        style={{ ["--dash" as string]: String(it.dash), ["--draw-delay" as string]: `${delay}ms` }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Sticker — a small tilted badge that pops in once.
 * ------------------------------------------------------------------ */

export function Sticker({
  tone = "gold",
  tilt = -4,
  delay = 0,
  className = "",
  children,
}: {
  tone?: "gold" | "navy" | "sky" | "violet";
  tilt?: number;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const bg = {
    gold: "var(--color-gold)",
    navy: "var(--color-deep-blue)",
    sky: "var(--color-bright-blue)",
    violet: "var(--color-blue-violet)",
  }[tone];
  const fg = tone === "gold" ? "var(--color-accent-foreground)" : "var(--color-surface)";
  // a navy sticker on the navy panel would vanish, so the dark tone carries a
  // hairline that reads on either ground
  const ring = tone === "navy" ? "1px solid var(--color-surface)" : "none";
  return (
    <span
      className={`alpha-pop inline-block rounded-[var(--radius-pill)] px-3 py-1.5 shadow-[var(--shadow-card)] ${className}`}
      style={{
        ["--tilt" as string]: `${tilt}deg`,
        ["--pop-delay" as string]: `${delay}ms`,
        background: bg,
        color: fg,
        border: ring,
        ...T.label,
      }}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Photo mosaic — overlapping tilted cards. More pictures, arranged as a
 * pinboard rather than a single hero plate.
 * ------------------------------------------------------------------ */

export function PhotoMosaic({
  photos,
  eager = false,
}: {
  photos: ReadonlyArray<{ src: string; alt: string; tilt?: number; span?: boolean }>;
  /** The hero pinboard is the LCP element — it must not be lazy. */
  eager?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((ph, i) => (
        <figure
          key={ph.src + i}
          className={`alpha-photo overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] ${ph.span ? "col-span-2" : ""}`}
          style={{
            ["--tilt" as string]: `${ph.tilt ?? 0}deg`,
            transform: `rotate(${ph.tilt ?? 0}deg)`,
            border: "4px solid var(--color-surface)",
          }}
        >
          <img
            src={ph.src}
            alt={ph.alt}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager && i === 0 ? "high" : undefined}
            decoding="async"
            className="block w-full object-cover"
            style={{ aspectRatio: ph.span ? "16 / 9" : "4 / 5" }}
          />
        </figure>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Icon disc + feature card
 * ------------------------------------------------------------------ */

export function IconDisc({
  tone = "gold",
  children,
}: {
  tone?: "gold" | "navy" | "sky";
  children: ReactNode;
}) {
  const bg =
    tone === "gold"
      ? "var(--color-gold)"
      : tone === "sky"
        ? "var(--color-surface-soft)"
        : "var(--color-deep-blue)";
  const fg =
    tone === "gold"
      ? "var(--color-accent-foreground)"
      : tone === "sky"
        ? "var(--color-deep-blue)"
        : "var(--color-surface)";
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-[var(--radius-pill)]"
      style={{ width: "var(--disc-size)", height: "var(--disc-size)", background: bg, color: fg }}
    >
      {children}
    </span>
  );
}

export function FeatureCard({
  icon,
  tone = "gold",
  title,
  children,
}: {
  icon: ReactNode;
  tone?: "gold" | "navy" | "sky";
  title: string;
  children?: ReactNode;
}) {
  return (
    <article
      className="rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] text-center shadow-[var(--card-shadow)]"
      style={{ border: "var(--card-border)" }}
    >
      <div className="flex justify-center">
        <IconDisc tone={tone}>{icon}</IconDisc>
      </div>
      <h3 className="mt-4 font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
        {title}
      </h3>
      {children && (
        <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
          {children}
        </p>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Stat bar — navy panel, gold figures
 * ------------------------------------------------------------------ */

export function StatBar({
  items,
}: {
  items: ReadonlyArray<{ figure: string; label: string; icon?: ReactNode }>;
}) {
  return (
    <div
      className="overflow-hidden rounded-[var(--panel-radius)] bg-[var(--color-deep-blue)]"
      style={{ borderBottom: "var(--panel-arc-w) solid var(--color-gold)" }}
    >
      <ul className="grid grid-cols-2 md:grid-cols-4">
        {items.map((s, i) => (
          <li
            key={s.label}
            className="flex items-center gap-3 p-[var(--space-card-pad-sm)]"
            style={{
              borderLeft: i % 2 === 0 ? undefined : "1px solid rgba(255,255,255,0.15)",
              borderTop: i > 1 ? "1px solid rgba(255,255,255,0.15)" : undefined,
            }}
          >
            {s.icon && <span aria-hidden className="text-[var(--color-gold)]">{s.icon}</span>}
            <div className="min-w-0">
              <div className="font-display text-[var(--color-gold)]" style={T.stat}>
                {s.figure}
              </div>
              <div className="text-[var(--color-surface)]/85" style={T.statLabel}>
                {s.label}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Cinematic hero — the opening screen.
 *
 * Supersedes ShapedHero, which put the first viewport inside a rounded
 * card and left the next section visible beneath it. This fills the
 * screen instead: edge-to-edge photography, a guaranteed scrim, and the
 * copy staged over it.
 *
 * The entrance is CSS, defined in styles.css and driven by the
 * --hero-t-* tokens: image settles, scrim fades up, then eyebrow,
 * headline line 1, headline line 2 in gold, paragraph, buttons, tail.
 * It finishes at ~1160ms and runs off the server-rendered HTML on first
 * paint, so there is no splash, no loader, and nothing waiting on
 * hydration.
 *
 * Motion stays inside the audit's budget: transform and opacity only,
 * one-shot, nothing looping, full collapse under reduced motion.
 * ------------------------------------------------------------------ */

export function CinematicHero({
  eyebrow,
  lineOne,
  lineTwo,
  blurb,
  actions,
  media,
  overlays,
  rail,
  foot,
  cueHref,
  cueLabel = "Scroll to the next section",
}: {
  eyebrow?: string;
  lineOne: string;
  lineTwo: string;
  blurb: string;
  actions?: ReactNode;
  /** The background layer — a HeroSlideshow or a single <img>. */
  media: ReactNode;
  /** Decoration that sits above the scrim but behind the copy. */
  overlays?: ReactNode;
  /** Desktop-only right column. The homepage puts its stat rail here. */
  rail?: ReactNode;
  /** Pinned to the hero's foot, inside the viewport. */
  foot?: ReactNode;
  /** Renders a scroll affordance pointing at this anchor. */
  cueHref?: string;
  cueLabel?: string;
}) {
  return (
    <section className="hero-viewport relative isolate flex flex-col overflow-hidden">
      {/* Photography. The settle animation lives on this wrapper rather than
          on each slide, so it is one composited layer and it does not replay
          when the slideshow cross-fades. */}
      <div aria-hidden className="hero-media absolute inset-0 -z-20">
        {media}
      </div>

      {/* Guaranteed scrim. design/README.md: the headline must stay legible
          over ANY slide, so this never depends on how dark the photograph
          happens to be. Vertical on mobile, horizontal on desktop. */}
      <div
        aria-hidden
        className="hero-scrim absolute inset-0 -z-10 lg:hidden"
        style={{ backgroundImage: "var(--hero-scrim-mobile)" }}
      />
      <div
        aria-hidden
        className="hero-scrim absolute inset-0 -z-10 hidden lg:block"
        style={{ backgroundImage: "var(--hero-scrim)" }}
      />

      {overlays}

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 items-center">
          <div
            className={`${SHELL} pb-[var(--space-block-y)] pt-[calc(var(--header-h)+var(--space-block-y))]`}
          >
            <div className="max-w-xl lg:max-w-2xl">
              {eyebrow && (
                <p
                  className="hero-rise flex items-center gap-3 text-[var(--color-gold)]"
                  style={{ ...T.label, ...heroStep("var(--hero-t-eyebrow)") }}
                >
                  <span
                    aria-hidden
                    className="inline-block h-[3px] w-8 shrink-0 rounded-full bg-[var(--color-gold)]"
                  />
                  {eyebrow}
                </p>
              )}

              <h1 className="mt-4 font-display tracking-tight text-balance" style={T.hero}>
                <span
                  className="hero-rise block text-[var(--hero-line-1-color)]"
                  style={heroStep("var(--hero-t-line-1)", "420ms")}
                >
                  {lineOne}
                </span>
                <span
                  className="hero-rise block text-[var(--hero-line-2-color)]"
                  style={heroStep("var(--hero-t-line-2)", "420ms")}
                >
                  {lineTwo}
                </span>
              </h1>

              <p
                className="hero-rise mt-5 max-w-lg text-[var(--color-surface)]/95"
                style={{ ...T.body, ...heroStep("var(--hero-t-blurb)") }}
              >
                {blurb}
              </p>

              {actions && (
                <div
                  className="hero-rise mt-7 flex flex-wrap gap-3"
                  style={heroStep("var(--hero-t-cta)")}
                >
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>

        {rail && (
          <div
            className="hero-rise hidden lg:flex lg:w-[15rem] lg:shrink-0 lg:items-center"
            style={heroStep("var(--hero-t-tail)", "320ms")}
          >
            {rail}
          </div>
        )}
      </div>

      {foot && (
        <div
          className="hero-rise relative z-10"
          style={heroStep("var(--hero-t-tail)", "320ms")}
        >
          {foot}
        </div>
      )}

      {cueHref && !foot && <ScrollCue href={cueHref} label={cueLabel} />}
    </section>
  );
}

/**
 * A single static chevron. It does not bob — a looping, attention-seeking
 * decoration is the exact pattern the motion audit was commissioned to
 * remove, and it would be the only looping thing left on the site.
 */
function ScrollCue({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="hero-rise absolute inset-x-0 bottom-6 z-10 mx-auto grid h-11 w-11 place-items-center rounded-[var(--radius-pill)] border border-[var(--color-surface)]/40 bg-[rgba(0,26,60,0.35)] text-[var(--color-surface)] backdrop-blur-sm transition-transform duration-[var(--hover-ms)] ease-[var(--ease-out)] hover:-translate-y-[2px] active:scale-[var(--press-scale)] active:duration-[var(--press-ms)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={heroStep("var(--hero-t-tail)", "320ms")}
    >
      <ChevronDown className="h-5 w-5" aria-hidden />
    </a>
  );
}

/* ------------------------------------------------------------------ *
 * Credential strip — the three claims, pinned to the hero's foot.
 *
 * Carried over from ShapedHero's chip strip, restyled to sit on the
 * photograph rather than on white. At 375px it collapses to a single
 * scrollable row of labels: three stacked two-line chips would push the
 * headline and buttons off an opening screen that has to fit in 100svh.
 * ------------------------------------------------------------------ */
export function HeroCredentials({
  items,
}: {
  items: ReadonlyArray<{ label: string; sub: string; icon?: ReactNode }>;
}) {
  return (
    <div className="border-t border-[var(--color-gold)]/30 bg-[rgba(0,26,60,0.72)] backdrop-blur-sm">
      <ul
        className={`${SHELL} flex gap-5 overflow-x-auto py-3 [scrollbar-width:none] sm:grid sm:gap-6 sm:overflow-visible sm:py-5 [&::-webkit-scrollbar]:hidden`}
        style={{
          ["--cred-cols" as string]: String(items.length),
        }}
      >
        {items.map((c) => (
          <li key={c.label} className="hero-cred flex shrink-0 items-center gap-3 sm:shrink">
            {c.icon && (
              <span
                aria-hidden
                className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-pill)] bg-[var(--color-gold)]/20 text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/30 sm:h-12 sm:w-12"
              >
                {c.icon}
              </span>
            )}
            <div className="min-w-0">
              <div
                className="whitespace-nowrap font-display text-[var(--color-surface)] sm:whitespace-normal"
                style={T.cardTitle}
              >
                {c.label}
              </div>
              <div
                className="hidden text-[var(--color-surface)]/80 sm:block"
                style={T.label}
              >
                {c.sub}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Marked — a hand-drawn stroke behind one word of a heading.
 *
 * This is the type treatment. A heading already carries its accent word
 * in colour; the mark is what makes the word look chosen rather than
 * recoloured, and it is the difference between a school that reads as
 * careful and one that reads as alive.
 *
 * It stretches to whatever it wraps (preserveAspectRatio="none"), so the
 * stroke belongs to the word at 375px and at 1440px rather than being a
 * fixed-width decoration parked near it. The strokes are deliberately
 * uneven — a drawn line that is perfectly symmetrical reads as a border.
 * ------------------------------------------------------------------ */

export type MarkKind = "underline" | "ring" | "sweep";

const MARK: Record<MarkKind, { d: string; box: string; dash: number; w: number }> = {
  // two quick passes, the way you underline a word twice without lifting
  underline: {
    d: "M2 12C40 4 120 3 198 9M6 17C58 11 140 10 196 15",
    box: "0 0 200 22",
    dash: 420,
    w: 4,
  },
  // a lasso around the word
  ring: {
    d: "M186 21C150 5 44 3 12 18 2 23 6 34 30 39c40 8 132 5 158-6 8-4 4-10-14-15",
    box: "0 0 200 46",
    dash: 480,
    w: 3.5,
  },
  // a single confident swipe, for a word sitting on a dark ground
  sweep: {
    d: "M3 13C54 5 132 4 197 10",
    box: "0 0 200 20",
    dash: 210,
    w: 6,
  },
};

export function Marked({
  kind = "underline",
  color = "var(--color-gold)",
  delay = 240,
  children,
}: {
  kind?: MarkKind;
  color?: string;
  delay?: number;
  children: ReactNode;
}) {
  const it = MARK[kind];
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden
        viewBox={it.box}
        preserveAspectRatio="none"
        className={`alpha-mark ${kind === "ring" ? "alpha-mark--ring" : ""}`}
        fill="none"
        stroke={color}
        strokeWidth={it.w}
        strokeLinecap="round"
      >
        <path
          d={it.d}
          className="alpha-draw"
          style={
            {
              "--dash": String(it.dash),
              "--draw-delay": `${delay}ms`,
            } as CSSProperties
          }
        />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Backdrop — sparse marks behind a section.
 *
 * These sit behind live copy, so they are a wash rather than a figure:
 * faint enough that contrast is unaffected, present enough that the
 * page stops feeling like a stack of rectangles. Purely decorative and
 * hidden from assistive tech.
 *
 * Positioned by the caller, because "where necessary" is a judgement
 * about the specific composition and not something a component can
 * guess.
 * ------------------------------------------------------------------ */

export type BackdropKind = "orbit" | "star" | "arrow" | "scribble" | "plane";

const BACKDROP: Record<BackdropKind, { d: string; box: string; w: number }> = {
  orbit: { d: "M2 20c0-9 20-16 44-16s44 7 44 16-20 16-44 16S2 29 2 20", box: "0 0 92 40", w: 3 },
  star: { d: "M14 2v24M2 14h24M6 6l16 16M22 6L6 22", box: "0 0 28 28", w: 2.5 },
  arrow: { d: "M2 14c18-9 44-11 62-3M52 2l14 9-13 10", box: "0 0 70 26", w: 3 },
  scribble: { d: "M2 18c14-14 28 12 42-2s28 10 42-4", box: "0 0 90 32", w: 3 },
  // a paper plane, for the aviation surfaces
  plane: { d: "M2 14 62 2 44 30 36 19 2 14ZM36 19 62 2", box: "0 0 66 34", w: 2.5 },
};

export function Backdrop({
  kind,
  className = "",
  onDark = false,
  width = "5rem",
  rotate = 0,
}: {
  kind: BackdropKind;
  /** Positioning, supplied by the section. */
  className?: string;
  onDark?: boolean;
  width?: string;
  rotate?: number;
}) {
  const it = BACKDROP[kind];
  return (
    <svg
      aria-hidden
      viewBox={it.box}
      className={`alpha-backdrop ${onDark ? "alpha-backdrop--onDark" : ""} ${className}`}
      style={{ width, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      fill="none"
      stroke="currentColor"
      strokeWidth={it.w}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={it.d} />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Aviation motifs.
 *
 * Inline SVG, so the aviation pages gain their own visual language
 * without a single extra byte over mobile data — the constraint that
 * rules out decorative imagery here.
 *
 * Drawn from the programme itself rather than from clip-art: the path a
 * training flight takes, the instrument a student is taught to read,
 * the ticks on an altimeter.
 * ------------------------------------------------------------------ */

/** A climbing dotted track with a plane at its head. */
export function FlightPath({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 90"
      className={`alpha-flightpath ${className}`}
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M4 84C70 84 120 62 168 38 206 19 250 10 300 8"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 12"
      />
      <path
        d="M292 2 316 8 296 20 292 12 292 2Z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="currentColor"
      />
    </svg>
  );
}

/** The instrument, not an ornament: a compass rose with its cardinals. */
export function CompassRose({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <circle cx="60" cy="60" r="52" strokeWidth="2" />
      <circle cx="60" cy="60" r="40" strokeWidth="1" strokeDasharray="1 7" />
      <path d="M60 6v14M60 100v14M6 60h14M100 60h14" strokeWidth="2" />
      <path d="M60 22 70 60 60 98 50 60Z" strokeWidth="2" strokeLinejoin="round" />
      <path d="M22 60 60 50 98 60 60 70Z" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Altimeter ticks — a vertical scale, long marks every fifth. */
export function AltitudeTicks({ className = "" }: { className?: string }) {
  const rows = Array.from({ length: 16 }, (_, i) => i);
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 240"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      {rows.map((i) => (
        <path
          key={i}
          d={`M2 ${8 + i * 15}h${i % 5 === 0 ? 30 : 14}`}
          strokeWidth={i % 5 === 0 ? 2.5 : 1.5}
        />
      ))}
    </svg>
  );
}
