/**
 * Desktop navigation (768px and up): a fixed left column with every area,
 * their sub-links always visible, count badges, and Sign out at the foot.
 */
import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { AdminButton, CountBadge } from "@/components/admin/kit";
import type { AdminCounts } from "@/lib/admin/counts";
import { ADMIN_NAV, COUNT_LABEL, activeOptions, isCurrent, isWithin, navCount } from "./nav";

const ITEM =
  "admin-hover flex min-h-11 items-center gap-3 rounded-[var(--radius-btn)] px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]";

export function Sidebar({
  pathname,
  counts,
  email,
  onSignOut,
  signingOut,
}: {
  pathname: string;
  counts: AdminCounts;
  email: string;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[var(--color-hairline)] bg-[var(--color-surface)] md:flex">
      <div className="px-5 pb-4 pt-6">
        <Link
          to="/admin"
          className="inline-flex min-h-11 flex-col justify-center rounded-[var(--radius-btn)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
        >
          <span className="font-display text-lg font-extrabold leading-tight text-[var(--color-deep-blue)]">
            Alpha Schools
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
            Admin
          </span>
        </Link>
      </div>

      <nav aria-label="Admin" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-0.5">
          {ADMIN_NAV.map((item) => {
            const current = isCurrent(item.to, pathname);
            const within = isWithin(item, pathname);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={activeOptions(item.to)}
                  aria-current={current ? "page" : undefined}
                  className={
                    ITEM +
                    (within
                      ? " bg-[var(--color-surface-muted)] font-bold text-[var(--color-deep-blue)] shadow-[inset_3px_0_0_var(--color-gold)]"
                      : " font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]")
                  }
                >
                  <Icon aria-hidden className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.count ? (
                    <CountBadge n={navCount(item.count, counts)} label={COUNT_LABEL[item.count]} />
                  ) : null}
                </Link>
                {item.children ? (
                  <ul className="mb-1 ml-[1.375rem] border-l border-[var(--color-hairline)] pl-3">
                    {item.children.map((c) => {
                      const sub = isCurrent(c.to, pathname);
                      return (
                        <li key={c.to}>
                          <Link
                            to={c.to}
                            activeOptions={activeOptions(c.to)}
                            aria-current={sub ? "page" : undefined}
                            className={
                              ITEM +
                              (sub
                                ? " bg-[var(--color-surface-muted)] font-bold text-[var(--color-deep-blue)]"
                                : " text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-deep-blue)]")
                            }
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

      <div className="border-t border-[var(--color-hairline)] px-3 py-3">
        {email ? (
          <p className="truncate px-3 pb-1 text-xs text-[var(--color-ink-soft)]" title={email}>
            Signed in as {email}
          </p>
        ) : null}
        <AdminButton
          variant="quiet"
          icon={LogOut}
          busy={signingOut}
          busyLabel="Signing out…"
          onClick={onSignOut}
          className="w-full justify-start px-3"
        >
          Sign out
        </AdminButton>
      </div>
    </aside>
  );
}
