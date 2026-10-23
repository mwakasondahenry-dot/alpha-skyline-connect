/**
 * What the Inbox screens show, as pure functions: which messages sit under
 * New and Done and in what order, a card's text, the status moves allowed,
 * the buttons a message offers, and the outcome line's sentence.
 *
 * In the database a message is `new` (nobody has opened it), `read` or
 * `archived`. Staff see two tabs: New (new and read, still to answer) and
 * Done (archived).
 */
import type { Enquiry, EnquiryStatus } from "@/lib/admin/inbox-data";
import { formatAdminDate, schoolLabel } from "@/lib/admin/format";
import { possessive } from "@/lib/admin/stories-view";

export const INBOX_TABS = ["new", "done"] as const;
export type InboxTab = (typeof INBOX_TABS)[number];

export const INBOX_TAB_LABEL: Record<InboxTab, string> = { new: "New", done: "Done" };

export function isInboxTab(v: unknown): v is InboxTab {
  return typeof v === "string" && (INBOX_TABS as readonly string[]).includes(v);
}

export function tabOfStatus(status: EnquiryStatus): InboxTab {
  return status === "archived" ? "done" : "new";
}

/** Nobody has opened it yet: bold, with a dot, and counted on the Inbox badge. */
export function isUnread(e: Enquiry): boolean {
  return e.status === "new";
}

/** One tab's messages, newest first. */
export function enquiriesForTab(list: Enquiry[], tab: InboxTab): Enquiry[] {
  return list
    .filter((e) => tabOfStatus(e.status) === tab)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function inboxTabCounts(list: Enquiry[]): Record<InboxTab, number> & { unread: number } {
  const counts = { new: 0, done: 0, unread: 0 };
  for (const e of list) {
    counts[tabOfStatus(e.status)]++;
    if (isUnread(e)) counts.unread++;
  }
  return counts;
}

/** The first line with any text in it. */
export function firstLine(text: string): string {
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (t) return t;
  }
  return "";
}

export function enquiryCard(
  e: Enquiry,
  now: Date = new Date(),
): { subject: string; preview: string; school: string; received: string } {
  return {
    subject: e.subject?.trim() || "No subject",
    preview: firstLine(e.message),
    school: schoolLabel(e.school_slug),
    received: formatAdminDate(e.created_at, now),
  };
}

type Move = { from: EnquiryStatus; to: EnquiryStatus };

/** Every status change the inbox makes. Nothing goes back to `new`. */
const ALLOWED: readonly string[] = ["new>read", "new>archived", "read>archived", "archived>read"];

export function canMoveEnquiry(from: EnquiryStatus, to: EnquiryStatus): boolean {
  return ALLOWED.includes(`${from}>${to}`);
}

/** "done": Mark as done. "reopen": Move back to New. */
export type EnquiryMove = "done" | "reopen";
export type EnquiryAction = EnquiryMove | "delete";

export function enquiryActions(status: EnquiryStatus): EnquiryAction[] {
  return status === "archived" ? ["reopen", "delete"] : ["done"];
}

export function enquiryMove(status: EnquiryStatus, action: EnquiryMove): Move {
  return action === "done" ? { from: status, to: "archived" } : { from: status, to: "read" };
}

/** The Undo: the reverse move, guarded on the state the action left. */
export function enquiryUndo(action: EnquiryMove): Move {
  return action === "done" ? { from: "archived", to: "read" } : { from: "read", to: "archived" };
}

export function enquiryOutcome(kind: EnquiryAction, name: string): string {
  const p = possessive(name);
  switch (kind) {
    case "done":
      return `Marked ${p} message as done. It is kept under Done.`;
    case "reopen":
      return `Moved ${p} message back to New.`;
    case "delete":
      return `Deleted ${p} message.`;
  }
}
