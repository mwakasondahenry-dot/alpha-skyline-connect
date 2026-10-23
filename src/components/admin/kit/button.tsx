/**
 * The one admin button. Four variants, 44px minimum, press feedback from the
 * `.admin-press` class in styles.css (120ms scale .97, hover is colour only:
 * lift is marketing language and stays on the public site).
 *
 * `busy` swaps the label at once ("Saving…") and ignores presses; a
 * spinner joins it only after 300ms, so quick saves never flash one. Under
 * reduced motion the spinner is a static icon and the label carries the state.
 */
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { adminButtonClass, type AdminButtonVariant } from "./button-class";
import { useDelayedFlag } from "./motion";

export type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant;
  /** Ignores presses (focus stays put) and shows `busyLabel`; spinner after 300ms. */
  busy?: boolean;
  /** Specific text while busy, e.g. "Publishing…". Defaults to the normal label. */
  busyLabel?: string;
  /** Leading icon; replaced by the spinner while busy. */
  icon?: LucideIcon;
};

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(function AdminButton(
  {
    variant = "secondary",
    busy = false,
    busyLabel,
    icon: Icon,
    className,
    children,
    disabled,
    type = "button",
    onClick,
    ...rest
  },
  ref,
) {
  const spinning = useDelayedFlag(busy);
  return (
    <button
      ref={ref}
      type={type}
      // Busy keeps focus on the button (a disabled button drops it to
      // <body>), so it is aria-disabled and swallows clicks instead. Blocking
      // the click also blocks Enter-to-submit on a busy submit button.
      disabled={disabled}
      aria-disabled={busy || undefined}
      aria-busy={busy || undefined}
      onClick={(e) => {
        if (busy) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      className={adminButtonClass(variant, className)}
      {...rest}
    >
      {busy && spinning ? (
        <Loader2
          aria-hidden
          className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none"
          strokeWidth={2}
        />
      ) : Icon ? (
        <Icon aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2} />
      ) : null}
      {busy && busyLabel ? busyLabel : children}
    </button>
  );
});
