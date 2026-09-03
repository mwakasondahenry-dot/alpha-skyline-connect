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
  eyebrow,
  children,
  accent = "var(--color-brand-blue)",
  action,
}: {
  eyebrow?: string;
  children: ReactNode;
  accent?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p style={{ ...T.label, color: accent }}>{eyebrow}</p>
        )}
        <h2
          className="mt-2 max-w-3xl font-display tracking-tight text-[var(--color-deep-blue)]"
          style={T.section}
        >
          {children}
        </h2>
        <span
          aria-hidden
          className="mt-3 block"
          style={{
            width: "var(--rule-w)",
            height: "var(--rule-h)",
            background: "var(--color-gold)",
            borderRadius: "var(--radius-pill)",
          }}
        />
      </div>
      {action}
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
  eyebrow,
  lineOne,
  lineTwo,
  blurb,
  actions,
  chips,
  image,
  imageAlt,
}: {
  eyebrow: string;
  lineOne: string;
  lineTwo: string;
  blurb: string;
  actions: ReactNode;
  chips: ReadonlyArray<{ label: string; sub: string; icon?: ReactNode }>;
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="bg-[var(--color-surface)]">
      <div className={SHELL}>
        <div className="relative overflow-hidden rounded-[var(--panel-radius)]">
          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            {/* Navy panel */}
            <div className="relative z-10 bg-[var(--color-deep-blue)] p-[var(--space-card-pad)] lg:p-10">
              <p style={{ ...T.label, color: "var(--color-surface)" }}>{eyebrow}</p>
              <h1 className="mt-4 font-display tracking-tight" style={T.hero}>
                <span className="block text-[var(--hero-line-1-color)]">{lineOne}</span>
                <span className="block text-[var(--hero-line-2-color)]">{lineTwo}</span>
              </h1>
              <p className="mt-4 max-w-md text-[var(--color-surface)]/85" style={T.body}>
                {blurb}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">{actions}</div>
            </div>

            {/* Photograph, masked by the arc on desktop */}
            <div className="relative min-h-[15rem] lg:min-h-[26rem]">
              <img
                src={image}
                alt={imageAlt}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
              {/* the single gold arc */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-px hidden w-[var(--panel-arc)] lg:block"
                style={{
                  background: "var(--color-deep-blue)",
                  borderTopRightRadius: "100%",
                  borderBottomRightRadius: "100%",
                  boxShadow: "var(--panel-arc-w) 0 0 0 var(--color-gold)",
                }}
              />
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
