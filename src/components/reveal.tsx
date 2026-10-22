import type { CSSProperties, ReactNode, ElementType } from "react";

export type RevealDirection = "up" | "left" | "right" | "none";

/**
 * Formerly a scroll reveal: a block sat hidden until an IntersectionObserver
 * saw it, then faded and rose into place. Removed on 2026-10-22. On the
 * owner's iPad, Safari delivered the observer callbacks late and whole
 * screens stayed blank while scrolling; on slow phones the staggered fades
 * read as the page loading piece by piece, and the owner asked for the site
 * to be fast above all.
 *
 * The component stays, as a plain wrapper, so the hundred-odd call sites
 * keep working unchanged: `direction` and `delay` are accepted and ignored.
 */
interface RevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

export function Reveal({ children, as: Tag = "div", className, style }: RevealProps) {
  const Component = Tag as ElementType;
  return (
    <Component className={className} style={style}>
      {children}
    </Component>
  );
}
