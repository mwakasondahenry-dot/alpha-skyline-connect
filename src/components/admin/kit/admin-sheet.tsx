/**
 * The admin edit surface. Radix Dialog: focus trap, Esc, focus return,
 * titled. A sheet from the bottom on a phone (< 768px), a centred panel from
 * 768px. The body scrolls; the title bar and close button stay put.
 *
 * Motion (styles.css, scoped to [data-admin]): overlay fades, panel rises 8px
 * over 200ms, exit is a 150ms fade. Nothing moves under reduced motion.
 */
import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type AdminSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** One line under the title; also read out when the sheet opens. */
  description?: ReactNode;
  children: ReactNode;
  /** Wider panel on desktop for forms with side-by-side fields. */
  wide?: boolean;
  className?: string;
};

export function AdminSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
  className,
}: AdminSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay data-admin="" className="admin-overlay" />
        <DialogPrimitive.Content
          data-admin=""
          // Without a description Radix would point aria-describedby at nothing.
          {...(description ? {} : { "aria-describedby": undefined })}
          className={cn(
            "admin-panel fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[var(--radius-card)] border border-b-0 border-[var(--color-hairline)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom,0px)] shadow-[var(--shadow-banner)]",
            "md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[85dvh] md:w-[calc(100%-3rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[var(--radius-card)] md:border-b md:pb-0",
            wide ? "md:max-w-2xl" : "md:max-w-lg",
            className,
          )}
        >
          <div className="flex items-start gap-3 border-b border-[var(--color-hairline)] py-2 pl-5 pr-2">
            <div className="min-w-0 flex-1 py-2.5">
              <DialogTitle className="font-display text-lg font-bold leading-snug text-[var(--color-deep-blue)]">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="mt-1 text-sm leading-snug text-[var(--color-ink-soft)]">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
            <DialogClose className="admin-press inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-btn)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]">
              <X aria-hidden className="h-5 w-5" strokeWidth={2} />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
