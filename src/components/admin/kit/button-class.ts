/**
 * AdminButton's classes, split out so a link or a file-input label can look
 * like an admin button without being one.
 */
import { cn } from "@/lib/utils";

export type AdminButtonVariant = "primary" | "secondary" | "danger" | "quiet";

const VARIANTS: Record<AdminButtonVariant, string> = {
  // Gold Is a Fill: ink on gold, never white.
  primary:
    "bg-[var(--color-gold)] text-[var(--color-accent-foreground)] shadow-[var(--shadow-card)] hover:bg-[var(--color-gold-dark)]",
  secondary:
    "border border-[var(--color-hairline)] bg-[var(--color-surface)] text-[var(--color-deep-blue)] hover:bg-[var(--color-surface-muted)]",
  danger:
    "bg-[var(--color-danger)] text-[var(--color-surface)] hover:bg-[color-mix(in_srgb,var(--color-danger)_85%,var(--color-ink))]",
  quiet: "text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]",
};

/** Shared base, exported for the rare element that must look like a button but is not one (a file-input label). */
export const adminButtonBase =
  "admin-press inline-flex min-h-11 min-w-11 cursor-pointer select-none items-center justify-center gap-2 rounded-[var(--radius-btn)] px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-progress";

export function adminButtonClass(variant: AdminButtonVariant = "secondary", className?: string) {
  return cn(adminButtonBase, VARIANTS[variant], className);
}
