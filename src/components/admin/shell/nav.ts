/**
 * The admin's areas, by job rather than by table. One list feeds the desktop
 * sidebar, the phone bottom bar and the More sheet, so they cannot drift.
 */
import type { LinkProps } from "@tanstack/react-router";
import {
  GraduationCap,
  Images,
  Inbox,
  MessageSquareQuote,
  Newspaper,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavCount = "storiesWaiting" | "inboxNew" | "todayTotal";

export type AdminNavLink = { to: string; label: string };

export type AdminNavItem = AdminNavLink & {
  icon: LucideIcon;
  /** Badge source. "todayTotal" (Today) is stories waiting plus new enquiries. */
  count?: AdminNavCount;
  /** On a phone: in the bottom bar, or in the More sheet. */
  phone: "bar" | "more";
  /** Sub-links shown under the item (sidebar, More sheet). */
  children?: AdminNavLink[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin", label: "Today", icon: Sun, count: "todayTotal", phone: "bar" },
  {
    to: "/admin/stories",
    label: "Stories",
    icon: MessageSquareQuote,
    count: "storiesWaiting",
    phone: "bar",
  },
  { to: "/admin/inbox", label: "Inbox", icon: Inbox, count: "inboxNew", phone: "bar" },
  { to: "/admin/alumni", label: "Alumni", icon: GraduationCap, phone: "more" },
  {
    to: "/admin/news",
    label: "News & events",
    icon: Newspaper,
    phone: "more",
    children: [{ to: "/admin/events", label: "Events" }],
  },
  {
    to: "/admin/photos",
    label: "Photos",
    icon: Images,
    phone: "more",
    children: [
      { to: "/admin/hero-slides", label: "Hero slides" },
      { to: "/admin/facilities", label: "Facilities" },
      { to: "/admin/facility-photos", label: "Facilities gallery" },
      { to: "/admin/gallery", label: "Activities gallery" },
    ],
  },
  { to: "/admin/staff", label: "People", icon: Users, phone: "more" },
];

/**
 * The one untyped hop: Alumni is a route added by a later task, so the nav's
 * paths are plain strings, cast here for <Link>. Once /admin/alumni exists
 * this can become a typed `to`.
 */
export function linkTo(path: string): LinkProps["to"] {
  return path as LinkProps["to"];
}

function trim(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/** Is `pathname` this link's page? Today only on /admin itself; others include pages under them. */
export function isCurrent(to: string, pathname: string): boolean {
  const p = trim(pathname);
  if (to === "/admin") return p === "/admin";
  return p === to || p.startsWith(to + "/");
}

/** Is `pathname` the item's page or one of its sub-links' pages? */
export function isWithin(item: AdminNavItem, pathname: string): boolean {
  return (
    isCurrent(item.to, pathname) || (item.children ?? []).some((c) => isCurrent(c.to, pathname))
  );
}

/** The number behind an item's badge, if it has one. */
export function navCount(
  kind: AdminNavCount | undefined,
  c: { storiesWaiting: number; inboxNew: number; photosEmpty: number },
): number {
  if (kind === "storiesWaiting") return c.storiesWaiting;
  if (kind === "inboxNew") return c.inboxNew;
  // Only things a person must answer: empty photo positions are a card on
  // Today, not a badge, or the badge would never go out.
  if (kind === "todayTotal") return c.storiesWaiting + c.inboxNew;
  return 0;
}

/** What a badge's number is read out as. */
export const COUNT_LABEL: Record<AdminNavCount, string> = {
  storiesWaiting: "stories waiting",
  inboxNew: "new enquiries",
  todayTotal: "stories and enquiries waiting",
};

/**
 * <Link> sets aria-current="page" itself when it matches; these options make
 * its match the same as isCurrent() (Today exact, others include sub-pages).
 */
export function activeOptions(to: string) {
  return { exact: to === "/admin", includeSearch: false };
}
