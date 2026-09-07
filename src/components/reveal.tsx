import {
  useEffect,
  type CSSProperties,
  type ReactNode,
  type ElementType,
} from "react";
import { useRouterState } from "@tanstack/react-router";

export type RevealDirection = "up" | "left" | "right" | "none";

/**
 * Scroll reveal: a block sits just below its resting position until the reader
 * reaches it, then settles over 420ms.
 *
 * This behaviour was removed once already, and the reasons it was removed are
 * the constraints it is rebuilt under. From
 * motion-audits/tanstack-start-ts-2026-09-02.html, against an audience of
 * parents on mid-range Android phones over mobile data:
 *
 *   1. It ran one IntersectionObserver per call site — 88 observers and 88
 *      composited layers. There is now exactly ONE, shared at module scope by
 *      every revealed block on every page.
 *
 *   2. It shipped `opacity: 0` in the server-rendered HTML, so the first paint
 *      of a page was its layout with the content invisible until React
 *      hydrated. The hidden state now lives behind `html.rv-on`, which an
 *      inline script in __root.tsx adds and then REMOVES again if RevealWatcher
 *      never mounts to stamp `data-rv-ready`. SSR output, a failed bundle and a
 *      reader with JS off all get fully visible content.
 *
 *   3. It withheld copy the reader was already looking at for another 600ms.
 *      The transition is 420ms, the observer fires a block slightly before its
 *      top edge clears the fold, and delays are capped at 350ms so a staggered
 *      group can never make the last item wait.
 *
 * Two ways to mark a block, both driving the same CSS and the same observer:
 *
 *   <Reveal direction="left">…</Reveal>     — a wrapper element
 *   <div data-reveal data-reveal-delay="80">  — an attribute on markup you
 *                                               already have
 *
 * The attribute form exists because most sections on this site already have a
 * container to hang it on, and adding an attribute is a safer edit than
 * wrapping a hundred-line block in a new element. Both forms are hidden by CSS
 * from first paint, so neither flashes visible before being hidden.
 *
 * One-shot: the observer unobserves on first intersection, so nothing re-hides
 * on scroll-up. Transform and opacity only, and the whole layer collapses to
 * its resting state under prefers-reduced-motion — in CSS, so there is no JS
 * branch to keep in sync.
 */

/**
 * The stagger scale, matching the [data-reveal-delay] rules in styles.css.
 * The top of it stays under the 350ms cap the motion audit set.
 */
const DELAY_STEPS = [0, 80, 160, 240, 320] as const;

/**
 * Snaps a requested delay onto the scale.
 *
 * Existing call sites compute delays as `i * 90` and similar. Rather than
 * rewrite each one, they are rounded to the nearest step and clamped to the
 * top of the scale, which also enforces the cap: a staggered group can never
 * make its last item wait longer than 320ms.
 */
function snapDelay(ms: number): number {
  if (!(ms > 0)) return 0;
  return DELAY_STEPS.reduce((best, step) =>
    Math.abs(step - ms) < Math.abs(best - ms) ? step : best,
  );
}

let observer: IntersectionObserver | null = null;

function sharedObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-rv-in", "");
          observer?.unobserve(entry.target);
        }
      },
      {
        /* Negative bottom inset: a block starts settling once it is a little
           way into the viewport rather than the instant its first pixel
           appears, which reads as deliberate instead of twitchy. Kept small so
           copy is never withheld from someone already reading it. */
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.01,
      },
    );
  }
  return observer;
}

/**
 * Finds every unrevealed block in the document and observes it.
 *
 * Mounted once, in the root route. It re-scans on navigation rather than
 * running a MutationObserver over the whole body: a client-side route change
 * is the only thing that introduces new revealable markup here, and a standing
 * subtree observer would cost the target device something on every DOM change
 * for no benefit.
 *
 * It marks a revealed block with the `data-rv-in` ATTRIBUTE rather than a
 * class, and never writes to `style`. Route content streams inside a Suspense
 * boundary, so this effect can run before React has hydrated that boundary;
 * className and style are props React reconciles, and writing either one early
 * was reported as a hydration mismatch it could not patch. An attribute React
 * never rendered is not compared.
 */
export function RevealWatcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    /* Tells the inline script in __root.tsx that hydration got far enough to
       run reveals, so it should leave `html.rv-on` in place. */
    document.documentElement.setAttribute("data-rv-ready", "");

    const targets = document.querySelectorAll<HTMLElement>(
      "[data-reveal]:not([data-rv-in])",
    );
    const obs = sharedObserver();

    if (!obs) {
      /* No IntersectionObserver: show everything rather than gating content
         behind a feature the browser lacks. */
      targets.forEach((el) => el.setAttribute("data-rv-in", ""));
      return;
    }

    targets.forEach((el) => obs.observe(el));
  }, [pathname]);

  return null;
}

interface RevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  /** Stagger within a group. Snapped onto the scale above. */
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  as: Tag = "div",
  className,
  style,
}: RevealProps) {
  const Component = Tag as ElementType;

  return (
    <Component
      data-reveal={direction}
      data-reveal-delay={snapDelay(delay) || undefined}
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
}
