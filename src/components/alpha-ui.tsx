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
import type { ReactNode } from "react";
import { T, SHELL } from "@/components/type-roles";

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
 * Shaped hero — navy panel cut by one gold arc, photograph beside it
 * ------------------------------------------------------------------ */

export function ShapedHero({
  lineOne,
  lineTwo,
  blurb,
  actions,
  chips,
  photos,
  stickers = [],
}: {
  lineOne: string;
  lineTwo: string;
  blurb: string;
  actions: ReactNode;
  chips: ReadonlyArray<{ label: string; sub: string; icon?: ReactNode }>;
  photos: ReadonlyArray<{ src: string; alt: string; tilt?: number; span?: boolean }>;
  stickers?: ReadonlyArray<{ text: string; tone?: "gold" | "navy" | "sky" | "violet"; tilt?: number }>;
}) {
  return (
    <section className="bg-[var(--color-surface)]">
      <div className={SHELL}>
        <div className="relative overflow-hidden rounded-[var(--panel-radius)]">
          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            {/* Navy panel */}
            <div className="relative z-10 bg-[var(--color-deep-blue)] p-[var(--space-card-pad)] lg:p-10">
              <h1 className="font-display tracking-tight" style={T.hero}>
                <span className="block text-[var(--hero-line-1-color)]">{lineOne}</span>
                <span className="relative inline-block text-[var(--hero-line-2-color)]">
                  {lineTwo}
                  <Doodle kind="underline" className="mt-1" delay={520} />
                </span>
              </h1>
              <p className="mt-5 max-w-md text-[var(--color-surface)]/85" style={T.body}>
                {blurb}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">{actions}</div>

              {stickers.length > 0 && (
                <div className="mt-7 flex flex-wrap items-center gap-2">
                  {stickers.map((st, i) => (
                    <Sticker key={st.text} tone={st.tone} tilt={st.tilt} delay={220 + i * 90}>
                      {st.text}
                    </Sticker>
                  ))}
                </div>
              )}
            </div>

            {/* Pinboard of photographs, not one hero plate */}
            <div className="relative bg-[var(--color-surface-muted)] p-4 lg:p-6">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-px z-10 hidden w-[var(--panel-arc)] lg:block"
                style={{
                  background: "var(--color-deep-blue)",
                  borderTopRightRadius: "100%",
                  borderBottomRightRadius: "100%",
                  boxShadow: "var(--panel-arc-w) 0 0 0 var(--color-gold)",
                }}
              />
              <PhotoMosaic photos={photos} eager />
            </div>
          </div>

          {/* Credential chips, pinned to the panel foot */}
          <ul className="relative z-10 grid gap-px bg-[var(--color-hairline)] sm:grid-cols-3">
            {chips.map((c) => (
              <li
                key={c.label}
                className="flex items-center gap-3 bg-[var(--color-surface)] p-[var(--space-card-pad-sm)]"
              >
                {c.icon && <IconDisc tone="sky">{c.icon}</IconDisc>}
                <div className="min-w-0">
                  <div className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
                    {c.label}
                  </div>
                  <div className="text-[var(--color-ink-soft)]" style={T.label}>
                    {c.sub}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
