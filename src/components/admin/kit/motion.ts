/**
 * Admin motion helpers: the delayed-spinner hook, the reduced-motion check
 * and the row exit. CSS owns everything else (styles.css, "Admin").
 */
import { useEffect, useState } from "react";
import { createDelayedFlag } from "./timers";

/** True `delayMs` after `active` turns true; false as soon as it turns false. */
export function useDelayedFlag(active: boolean, delayMs?: number) {
  const [on, setOn] = useState(false);
  const [flag] = useState(() => createDelayedFlag(setOn, delayMs));
  useEffect(() => {
    flag.set(active);
  }, [flag, active]);
  useEffect(() => () => flag.dispose(), [flag]);
  return on;
}

/** True when the visitor asked for reduced motion. Safe during SSR. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function easeOut(): string {
  const v =
    typeof document !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim()
      : "";
  return v || "ease-out";
}

/**
 * Fades a row out (150ms) then closes the gap it leaves (height, padding,
 * margin and borders to 0 over 200ms). Resolves when the row has no height.
 * Under reduced motion, or without WAAPI, it hides at once.
 *
 * React owns the node, so this never detaches it: drop the row from state
 * once the promise resolves. To bring a collapsed row back instead (Undo
 * before a refetch), cancel its animations: `el.getAnimations().forEach(a => a.cancel())`.
 * A flex/grid `gap` around the row closes when React removes it, not here.
 */
export async function collapseAndRemove(el: HTMLElement): Promise<void> {
  if (typeof el.animate !== "function") return;
  const reduce = prefersReducedMotion();
  const easing = easeOut();
  const cs = getComputedStyle(el);
  const height = `${el.getBoundingClientRect().height}px`;

  try {
    await el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: reduce ? 0 : 150,
      easing,
      fill: "forwards",
    }).finished;

    el.style.overflow = "hidden";
    await el.animate(
      [
        {
          height,
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom,
          marginTop: cs.marginTop,
          marginBottom: cs.marginBottom,
          borderTopWidth: cs.borderTopWidth,
          borderBottomWidth: cs.borderBottomWidth,
        },
        {
          height: "0px",
          paddingTop: "0px",
          paddingBottom: "0px",
          marginTop: "0px",
          marginBottom: "0px",
          borderTopWidth: "0px",
          borderBottomWidth: "0px",
        },
      ],
      { duration: reduce ? 0 : 200, easing, fill: "forwards" },
    ).finished;
  } catch {
    // Cancelled (the row was restored or unmounted): nothing left to wait for.
  }
}
