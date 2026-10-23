/**
 * The admin list row: a full-width card. With `onClick` it is one big
 * button (put no other controls inside it); without, a plain card that may
 * hold its own buttons.
 *
 * `highlight` gives the 1200ms gold tint that fades off a row that just
 * changed. Pass a value that changes with each save (a timestamp or version)
 * to replay it on the same row; `true` plays it once on mount.
 *
 * The row exit is `collapseAndRemove()` in ./motion.
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@/lib/utils";

export type ListCardProps = Omit<HTMLAttributes<HTMLElement>, "onClick"> & {
  children: ReactNode;
  /** Makes the whole card a button. */
  onClick?: () => void;
  /** The row whose detail is open (list beside detail on desktop). */
  selected?: boolean;
  /** Truthy plays the gold tint; a new value replays it. */
  highlight?: boolean | string | number | null;
};

export const ListCard = forwardRef<HTMLElement, ListCardProps>(function ListCard(
  { children, onClick, selected = false, highlight, className, ...rest },
  ref,
) {
  const local = useRef<HTMLElement | null>(null);
  const setRef = useCallback(
    (el: HTMLElement | null) => {
      local.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );

  // Replay the tint when the highlight value changes on a mounted row. The
  // class alone only plays when it is first added.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = local.current;
    if (!highlight || !el) return;
    // A finished CSS animation is gone from getAnimations(), so restart it
    // the plain way: drop the class, force a style flush, add it back. The
    // DOM ends where React left it.
    el.classList.remove("admin-flash");
    void el.offsetWidth;
    el.classList.add("admin-flash");
  }, [highlight]);

  const classes = cn(
    "block w-full rounded-[var(--radius-card)] border bg-[var(--color-surface)] p-4 text-left shadow-[var(--shadow-card)]",
    selected
      ? "border-[var(--color-deep-blue)] shadow-[inset_3px_0_0_var(--color-deep-blue),var(--shadow-card)]"
      : "border-[var(--color-hairline)]",
    onClick &&
      "admin-hover min-h-11 cursor-pointer hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]",
    highlight ? "admin-flash" : null,
    className,
  );

  if (onClick) {
    return (
      <button
        ref={setRef as Ref<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        aria-current={selected || undefined}
        className={classes}
        {...rest}
      >
        {children}
      </button>
    );
  }
  return (
    <div
      ref={setRef as Ref<HTMLDivElement>}
      aria-current={selected || undefined}
      className={classes}
      {...rest}
    >
      {children}
    </div>
  );
});
