/**
 * A navy pill with a number, for "3 waiting" beside a tab or nav item.
 * Screen readers hear "<n> <label>"; sighted users see the number. Renders
 * nothing at zero, so an empty queue is quiet rather than "0".
 */
import { cn } from "@/lib/utils";

export function CountBadge({
  n,
  label,
  className,
}: {
  n: number;
  /** What is being counted, read after the number: "waiting", "new messages". */
  label: string;
  className?: string;
}) {
  if (!(n > 0)) return null;
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-deep-blue)] px-2 text-xs font-bold tabular-nums leading-none text-[var(--color-surface)]",
        className,
      )}
    >
      <span aria-hidden>{n > 99 ? "99+" : n}</span>
      <span className="sr-only">
        {n} {label}
      </span>
    </span>
  );
}
