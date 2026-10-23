/**
 * The story's actions, in a bar that stays at the bottom of the screen where
 * a thumb reaches it: just above the phone tab bar, at the foot of the panel
 * on a desktop. The buttons come from barActions() (stories-view.ts).
 */
import { useEffect, useRef, type ReactNode } from "react";
import {
  ArchiveRestore,
  Check,
  Eye,
  EyeOff,
  Send,
  Star,
  Trash2,
  Undo2,
  X,
  type LucideIcon,
} from "lucide-react";
import { AdminButton } from "@/components/admin/kit";
import type { BarAction, BarActionKind } from "@/lib/admin/stories-view";
import { cn } from "@/lib/utils";

const ICON: Record<BarActionKind, LucideIcon> = {
  publish: Send,
  decline: X,
  restore: Undo2,
  hide: EyeOff,
  show: Eye,
  delete: Trash2,
  feature: Star,
  "invite-again": ArchiveRestore,
};

const BUSY_LABEL: Record<BarActionKind, string> = {
  publish: "Publishing…",
  decline: "Declining…",
  restore: "Restoring…",
  hide: "Hiding…",
  show: "Showing…",
  delete: "Deleting…",
  feature: "Saving…",
  "invite-again": "Making a link…",
};

const DONE_LABEL: Partial<Record<BarActionKind, string>> = {
  publish: "Published",
  decline: "Declined",
  restore: "Restored",
  hide: "Hidden",
  show: "On the site",
};

export function ActionBar({
  actions,
  busyKind,
  doneKind,
  disabled,
  onAction,
  note,
  leading,
}: {
  actions: BarAction[];
  /** The action running now (or "save"); its button shows the busy label, the rest wait. */
  busyKind: string | null;
  /** The action that just worked; its button shows a check for a moment. */
  doneKind: BarActionKind | null;
  /** Kinds that cannot run (Publish without consent). */
  disabled?: Partial<Record<BarActionKind, boolean>>;
  onAction: (kind: BarActionKind) => void;
  /** One line above the buttons, e.g. why Publish is unavailable. */
  note?: ReactNode;
  /** A button before the actions, e.g. Save changes while the form is edited. */
  leading?: ReactNode;
}) {
  return (
    <StickyBar note={note}>
      {leading}
      {actions.map((a) => {
        const done = doneKind === a.kind;
        const Icon = done ? Check : ICON[a.kind];
        return (
          <AdminButton
            key={a.kind}
            variant={a.variant}
            icon={Icon}
            busy={busyKind === a.kind}
            busyLabel={BUSY_LABEL[a.kind]}
            disabled={disabled?.[a.kind] || (busyKind !== null && busyKind !== a.kind)}
            aria-pressed={a.kind === "feature" ? !!a.pressed : undefined}
            onClick={() => onAction(a.kind)}
            className={cn(
              "flex-1 sm:flex-none",
              a.kind === "feature" &&
                a.pressed &&
                "border-[var(--color-deep-blue)] [&>svg]:fill-[var(--color-gold)]",
            )}
          >
            {done && DONE_LABEL[a.kind] ? DONE_LABEL[a.kind] : a.label}
          </AdminButton>
        );
      })}
    </StickyBar>
  );
}

/**
 * The sticky bottom bar itself, for screens with their own buttons (a new
 * story). While it is on screen the shell's outcome line (fixed above the
 * phone tab bar) is lifted above it too, so an outcome never covers the
 * buttons. From 768px the outcome line is top right and ignores this.
 */
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
