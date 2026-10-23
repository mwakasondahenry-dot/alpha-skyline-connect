/**
 * What a list shows when there is nothing in it: a plain sentence saying so,
 * an optional line on what fills it, and an optional next step. Static by
 * design; the one animated "All caught up" moment belongs to the Stories
 * screen, not here.
 */
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  action,
  icon: Icon,
  headingLevel = 2,
  className,
}: {
  /** "No stories waiting." */
  title: string;
  /** "New stories from the invite links arrive here." */
  body?: ReactNode;
  /** Usually an <AdminButton> or a link styled with adminButtonClass(). */
  action?: ReactNode;
  icon?: LucideIcon;
  /** Match the page outline: 2 under a page title, 3 inside a tab panel. */
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-hairline)] bg-[var(--color-surface)] px-6 py-10 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="grid h-[var(--disc-size-sm)] w-[var(--disc-size-sm)] place-items-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-deep-blue)]">
          <Icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
        </span>
      ) : null}
      <Heading className="font-display text-base font-bold text-[var(--color-deep-blue)]">
        {title}
      </Heading>
      {body ? (
        <p className="max-w-sm text-sm leading-relaxed text-[var(--color-ink-soft)]">{body}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
