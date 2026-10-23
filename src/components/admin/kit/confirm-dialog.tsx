/**
 * The admin confirm, replacing window.confirm(). Radix AlertDialog, so focus
 * is trapped, Esc cancels and focus returns to the button that opened it.
 *
 * If `onConfirm` returns a promise the dialog stays open with the confirm
 * button busy, closes when it resolves, and shows a plain-language error in
 * place if it rejects. Cancel is the default focus, so Enter never deletes.
 */
import { useState, type ReactNode } from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { friendlyError } from "@/lib/admin/errors";
import { AlertCircle } from "lucide-react";
import { AdminButton } from "./button";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Names the thing: "Delete Keith's story?" */
  title: string;
  /** What happens, in plain words: "This cannot be undone." */
  body: ReactNode;
  /** The verb on the button: "Delete story", not "OK". */
  confirmLabel: string;
  /** Shown while `onConfirm` runs, e.g. "Deleting…". */
  busyLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for destructive actions. Otherwise gold. */
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  busyLabel,
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function change(next: boolean) {
    if (busy) return; // nothing closes it mid-request
    if (!next) setError(null);
    onOpenChange(next);
  }

  async function confirm() {
    setError(null);
    setBusy(true);
    try {
      await onConfirm();
      setBusy(false);
      onOpenChange(false);
    } catch (err) {
      setBusy(false);
      setError(friendlyError(err));
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={change}>
      <AlertDialogPortal>
        <AlertDialogOverlay data-admin="" className="admin-overlay" />
        <AlertDialogPrimitive.Content
          data-admin=""
          className="admin-panel fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-banner)]"
          onEscapeKeyDown={(e) => {
            if (busy) e.preventDefault();
          }}
        >
          <div className="space-y-2">
            <AlertDialogTitle className="font-display text-lg font-bold text-[var(--color-deep-blue)]">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
              {body}
            </AlertDialogDescription>
          </div>

          {error ? (
            <p
              role="alert"
              className="flex gap-1.5 rounded-[var(--radius-btn)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-3 py-2 text-sm leading-snug text-[var(--color-danger)]"
            >
              <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogCancel asChild>
              <AdminButton variant="secondary" disabled={busy}>
                {cancelLabel}
              </AdminButton>
            </AlertDialogCancel>
            <AdminButton
              variant={danger ? "danger" : "primary"}
              busy={busy}
              busyLabel={busyLabel}
              onClick={() => void confirm()}
            >
              {confirmLabel}
            </AdminButton>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
