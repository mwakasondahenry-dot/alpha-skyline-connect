/**
 * The phone's More sheet: every area not in the bottom bar, with its
 * sub-links, then Sign out. Choosing a link closes the sheet.
 */
import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { AdminButton, AdminSheet } from "@/components/admin/kit";
import { ADMIN_NAV, activeOptions, isCurrent, linkTo } from "./nav";

const ROW =
  "admin-hover flex min-h-12 items-center gap-3 rounded-[var(--radius-btn)] px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]";
const ON = " bg-[var(--color-surface-muted)] font-bold text-[var(--color-deep-blue)]";
const OFF =
  " text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] active:bg-[var(--color-surface-muted)]";

export function MoreSheet({
  open,
  onOpenChange,
  pathname,
  email,
  onSignOut,
  signingOut,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  email: string;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const close = () => onOpenChange(false);
  return (
    <AdminSheet open={open} onOpenChange={onOpenChange} title="More">
      <nav aria-label="More admin areas">
        <ul className="space-y-1">
          {ADMIN_NAV.filter((i) => i.phone === "more").map((item) => {
            const Icon = item.icon;
            const current = isCurrent(item.to, pathname);
            return (
              <li key={item.to}>
                <Link
                  to={linkTo(item.to)}
                  activeOptions={activeOptions(item.to)}
                  aria-current={current ? "page" : undefined}
                  onClick={close}
                  className={ROW + " font-semibold" + (current ? ON : OFF)}
                >
                  <Icon aria-hidden className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                  {item.label}
                </Link>
                {item.children ? (
                  <ul className="ml-[1.375rem] border-l border-[var(--color-hairline)] pl-3">
                    {item.children.map((c) => {
                      const sub = isCurrent(c.to, pathname);
                      return (
                        <li key={c.to}>
                          <Link
                            to={linkTo(c.to)}
                            activeOptions={activeOptions(c.to)}
                            aria-current={sub ? "page" : undefined}
                            onClick={close}
                            className={ROW + (sub ? ON : OFF)}
                          >
                            {c.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-5 border-t border-[var(--color-hairline)] pt-4">
        {email ? (
          <p className="truncate pb-2 text-sm text-[var(--color-ink-soft)]">Signed in as {email}</p>
        ) : null}
        <AdminButton
          variant="secondary"
          icon={LogOut}
          busy={signingOut}
          busyLabel="Signing out…"
          onClick={onSignOut}
          className="w-full"
        >
          Sign out
        </AdminButton>
      </div>
    </AdminSheet>
  );
}
