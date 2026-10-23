/**
 * A bar that stays at the bottom of the screen where a thumb reaches it: just
 * above the phone tab bar, at the foot of the panel on a desktop. While it is
 * on screen the shell's outcome line (fixed above the phone tab bar) is lifted
 * above it too, so an outcome never covers the buttons. From 768px the
 * outcome line is top right and ignores this.
 */
import { useEffect, useRef, type ReactNode } from "react";

export function StickyBar({ note, children }: { note?: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const shell = el?.closest<HTMLElement>("[data-admin]");
    if (!el || !shell || typeof ResizeObserver !== "function") return;
    const lift = () =>
      shell.style.setProperty(
        "--admin-outcome-bottom",
        `calc(var(--admin-bar-h) + ${Math.ceil(el.offsetHeight)}px + 0.75rem)`,
      );
    lift();
    const ro = new ResizeObserver(lift);
    ro.observe(el);
    return () => {
      ro.disconnect();
      shell.style.removeProperty("--admin-outcome-bottom");
    };
  }, []);

  return (
    <div
      ref={ref}
      className="sticky bottom-[calc(var(--admin-bar-h)+env(safe-area-inset-bottom,0px))] z-10 -mx-4 border-t border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-banner)] sm:-mx-6 sm:px-6 md:bottom-0 lg:-mx-5 lg:px-5"
    >
      {note ? (
        <p className="mb-2 text-sm leading-snug text-[var(--color-ink-soft)]">{note}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
