/**
 * Phone navigation (under 768px): a fixed bar with Today, Stories, Inbox and
 * More. The current tab is navy, bold and carries a gold line on top, so it
 * is not marked by colour alone. Its height is BOTTOM_BAR_HEIGHT plus the
 * safe-area inset; the shell pads its content by the same amount.
 */
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { CountBadge } from "@/components/admin/kit";
import type { AdminCounts } from "@/lib/admin/counts";
import {
  ADMIN_NAV,
  COUNT_LABEL,
  activeOptions,
  isCurrent,
  isWithin,
  linkTo,
  navCount,
} from "./nav";

/** Bar height above the safe-area inset. Keep in step with the shell's padding. */
export const BOTTOM_BAR_HEIGHT = "4rem";

const TAB =
  "admin-hover relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1 px-1 text-xs focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-gold)]";
const ON =
  " font-bold text-[var(--color-deep-blue)] before:absolute before:inset-x-4 before:top-0 before:h-[3px] before:rounded-b-full before:bg-[var(--color-gold)]";
const OFF = " font-semibold text-[var(--color-ink-soft)] active:bg-[var(--color-surface-muted)]";

export function BottomBar({
  pathname,
  counts,
  moreOpen,
  onMore,
}: {
  pathname: string;
  counts: AdminCounts;
  moreOpen: boolean;
  onMore: () => void;
}) {
  const inMore = ADMIN_NAV.some((i) => i.phone === "more" && isWithin(i, pathname));
  return (
    <nav
      aria-label="Admin"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-hairline)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom,0px)] shadow-[var(--shadow-banner)] md:hidden"
    >
      <ul className="flex" style={{ height: BOTTOM_BAR_HEIGHT }}>
        {ADMIN_NAV.filter((i) => i.phone === "bar").map((item) => {
          const current = isCurrent(item.to, pathname);
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex flex-1">
              <Link
                to={linkTo(item.to)}
                activeOptions={activeOptions(item.to)}
                aria-current={current ? "page" : undefined}
                className={TAB + (current ? ON : OFF)}
              >
                <span className="relative">
                  <Icon aria-hidden className="h-6 w-6" strokeWidth={current ? 2.25 : 1.75} />
                  {item.count ? (
                    <CountBadge
                      n={navCount(item.count, counts)}
                      label={COUNT_LABEL[item.count]}
                      className="absolute -top-2 left-4 h-5 min-w-5 px-1.5 ring-2 ring-[var(--color-surface)]"
                    />
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button
            type="button"
            onClick={onMore}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className={TAB + (inMore ? ON : OFF)}
          >
            <Menu aria-hidden className="h-6 w-6" strokeWidth={inMore ? 2.25 : 1.75} />
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}
