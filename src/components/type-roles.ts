/**
 * Type roles, bound to the design system in src/styles.css.
 *
 * Each entry binds one role — hero, section heading, card title, body, small
 * label, stat figure — to the tokens that define it, so a page never restates
 * a size, weight, leading or tracking of its own. Changing the scale means
 * changing styles.css, not eleven route files.
 *
 * This started as a local `T` object on the homepage and was copied into each
 * page as it was retrofitted. Five copies was the point to extract it.
 *
 * Usage:  <h2 style={T.section}>…</h2>
 *         <p style={{ ...T.label, color: ACCENT }}>…</p>
 */
export const T: Record<string, React.CSSProperties> = {
  hero: {
    fontSize: "var(--text-hero)",
    lineHeight: "var(--leading-hero)",
    fontWeight: "var(--weight-hero)",
  },
  section: {
    fontSize: "var(--text-section)",
    lineHeight: "var(--leading-section)",
    fontWeight: "var(--weight-section)",
  },
  cardTitle: {
    fontSize: "var(--text-card-title)",
    lineHeight: "var(--leading-card-title)",
    fontWeight: "var(--weight-card-title)",
  },
  body: {
    fontSize: "var(--text-body)",
    lineHeight: "var(--leading-body)",
    fontWeight: "var(--weight-body)",
  },
  label: {
    fontSize: "var(--text-label)",
    lineHeight: "var(--leading-label)",
    fontWeight: "var(--weight-label)",
    letterSpacing: "var(--tracking-label)",
    textTransform: "uppercase",
  },
  stat: {
    fontSize: "var(--text-stat)",
    lineHeight: "var(--leading-stat)",
    fontWeight: "var(--weight-stat)",
  },
  statLabel: {
    fontSize: "var(--text-stat-label)",
    lineHeight: "var(--leading-stat-label)",
    fontWeight: "var(--weight-stat-label)",
  },
};

/** The page shell every section uses: centred, max-width, gutter. */
export const SHELL =
  "mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]";

/**
 * Binds one element to a step of the hero entrance sequence defined in
 * styles.css. The --hero-t-* tokens hold the timings; this only wires an
 * element to one of them.
 *
 * It lives here rather than in alpha-ui.tsx because the two light school
 * heroes (Alpha Girls, Nursery & Primary) keep their own compositions but run
 * the same choreography, and alpha-ui.tsx is a components module.
 */
export const heroStep = (
  delay: string,
  duration?: string,
): React.CSSProperties =>
  ({
    "--hero-delay": delay,
    ...(duration ? { "--hero-rise-dur": duration } : null),
  }) as React.CSSProperties;
