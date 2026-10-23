/**
 * The story's actions, in a bar that stays at the bottom of the screen where
 * a thumb reaches it: just above the phone tab bar, at the foot of the panel
 * on a desktop. The buttons come from barActions() (stories-view.ts).
 */
import type { ReactNode } from "react";
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
import { AdminButton, StickyBar } from "@/components/admin/kit";
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
