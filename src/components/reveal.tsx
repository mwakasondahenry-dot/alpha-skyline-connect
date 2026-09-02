import React, { type CSSProperties, type ReactNode, type ElementType } from "react";

export type RevealDirection = "up" | "left" | "right" | "none";

/**
 * Reveal renders its children immediately.
 *
 * It used to hold every wrapped block at opacity: 0 until an
 * IntersectionObserver fired, then fade it in over 600ms. With 88 call
 * sites that meant 88 observers, 88 composited layers, and — the actual
 * problem — copy that had already been downloaded being withheld from the
 * reader for another 600ms after it scrolled into view. The motion audit
 * flagged it as critical against this project's stated audience: parents on
 * mid-range Android phones over mobile data, per design/README.md's
 * "Performance over polish. Minimal animation."
 *
 * It also shipped that opacity: 0 in the server-rendered HTML, so the first
 * paint of a page was its layout with the content invisible until React
 * hydrated.
 *
 * The props are kept so the existing call sites still compile; `direction`
 * and `delay` are now inert. Call sites are removed page by page as each one
 * is retrofitted onto the design system. If a single deliberate entrance is
 * ever wanted on a hero, write it there explicitly rather than reinstating a
 * site-wide default — one authored moment, not one identical entrance on
 * every section.
 */
interface RevealProps {
  children: ReactNode;
  /** Inert. Kept so existing call sites compile. */
  direction?: RevealDirection;
  /** Inert. Kept so existing call sites compile. */
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

export function Reveal({
  children,
  as: Tag = "div",
  className,
  style,
}: RevealProps) {
  const Component = Tag as React.ElementType;
  return (
    <Component className={className} style={style}>
      {children}
    </Component>
  );
}
