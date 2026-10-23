import { describe, expect, it } from "vitest";
import type { Enquiry } from "./inbox-data";
import {
  INBOX_TABS,
  canMoveEnquiry,
  enquiriesForTab,
  enquiryActions,
  enquiryCard,
  enquiryMove,
  enquiryOutcome,
  enquiryUndo,
  firstLine,
  inboxTabCounts,
  isInboxTab,
  isUnread,
  tabOfStatus,
} from "./inbox-view";

function enquiry(over: Partial<Enquiry> = {}): Enquiry {
  return {
    id: "e1",
    name: "Neema Mushi",
    email: "neema@example.com",
    phone: "0712 345 678",
    school_slug: "alpha-high",
    subject: "Form One places",
    message: "Hello,\nDo you still have places for Form One?",
    status: "new",
    created_at: "2026-10-23T14:02:00Z",
    ...over,
  };
}

const NOW = new Date("2026-10-23T18:00:00Z");

describe("tabs", () => {
  it("has New and Done", () => {
    expect(INBOX_TABS).toEqual(["new", "done"]);
    expect(isInboxTab("done")).toBe(true);
    expect(isInboxTab("archived")).toBe(false);
    expect(isInboxTab(undefined)).toBe(false);
  });

  it("puts new and read under New, archived under Done", () => {
    expect(tabOfStatus("new")).toBe("new");
    expect(tabOfStatus("read")).toBe("new");
    expect(tabOfStatus("archived")).toBe("done");
  });

  it("lists a tab's messages newest first", () => {
    const list = [
      enquiry({ id: "old", status: "read", created_at: "2026-10-20T08:00:00Z" }),
      enquiry({ id: "done", status: "archived", created_at: "2026-10-22T08:00:00Z" }),
      enquiry({ id: "newest", status: "new", created_at: "2026-10-23T08:00:00Z" }),
      enquiry({ id: "mid", status: "new", created_at: "2026-10-21T08:00:00Z" }),
    ];
    expect(enquiriesForTab(list, "new").map((e) => e.id)).toEqual(["newest", "mid", "old"]);
    expect(enquiriesForTab(list, "done").map((e) => e.id)).toEqual(["done"]);
  });

  it("counts each tab, and the unread ones", () => {
    const list = [
      enquiry({ id: "a", status: "new" }),
      enquiry({ id: "b", status: "read" }),
      enquiry({ id: "c", status: "archived" }),
      enquiry({ id: "d", status: "new" }),
    ];
    expect(inboxTabCounts(list)).toEqual({ new: 3, done: 1, unread: 2 });
    expect(inboxTabCounts([])).toEqual({ new: 0, done: 0, unread: 0 });
  });

  it("only status new is unread", () => {
    expect(isUnread(enquiry({ status: "new" }))).toBe(true);
    expect(isUnread(enquiry({ status: "read" }))).toBe(false);
  });
});

describe("card text", () => {
  it("shows subject, first line, school and received time", () => {
    expect(enquiryCard(enquiry(), NOW)).toEqual({
      subject: "Form One places",
      preview: "Hello,",
      school: "Alpha High",
      received: "Today 17:02",
    });
  });

  it("says No subject when there is none, and an older date plainly", () => {
    const card = enquiryCard(
      enquiry({ subject: "  ", school_slug: null, created_at: "2026-10-18T14:02:00Z" }),
      NOW,
    );
    expect(card.subject).toBe("No subject");
    expect(card.school).toBe("Alpha Schools");
    expect(card.received).toBe("18 Oct");
  });

  it("first line skips blank lines and trims", () => {
    expect(firstLine("\n\n   Habari za asubuhi  \nmore")).toBe("Habari za asubuhi");
    expect(firstLine("")).toBe("");
    expect(firstLine("one\r\ntwo")).toBe("one");
  });
});

describe("status moves", () => {
  it("allows only the moves the inbox offers", () => {
    expect(canMoveEnquiry("new", "read")).toBe(true);
    expect(canMoveEnquiry("new", "archived")).toBe(true);
    expect(canMoveEnquiry("read", "archived")).toBe(true);
    expect(canMoveEnquiry("archived", "read")).toBe(true);
    expect(canMoveEnquiry("archived", "new")).toBe(false);
    expect(canMoveEnquiry("read", "new")).toBe(false);
    expect(canMoveEnquiry("read", "read")).toBe(false);
  });

  it("offers Mark as done under New; Move back and Delete under Done", () => {
    expect(enquiryActions("new")).toEqual(["done"]);
    expect(enquiryActions("read")).toEqual(["done"]);
    expect(enquiryActions("archived")).toEqual(["reopen", "delete"]);
  });

  it("moves from the state the message is in", () => {
    expect(enquiryMove("new", "done")).toEqual({ from: "new", to: "archived" });
    expect(enquiryMove("read", "done")).toEqual({ from: "read", to: "archived" });
    expect(enquiryMove("archived", "reopen")).toEqual({ from: "archived", to: "read" });
  });

  it("undo puts a done message back as read, and a reopened one back under Done", () => {
    expect(enquiryUndo("done")).toEqual({ from: "archived", to: "read" });
    expect(enquiryUndo("reopen")).toEqual({ from: "read", to: "archived" });
    for (const kind of ["done", "reopen"] as const) {
      const u = enquiryUndo(kind);
      expect(canMoveEnquiry(u.from, u.to)).toBe(true);
    }
  });
});

describe("outcome text", () => {
  it("is one plain sentence naming the person", () => {
    expect(enquiryOutcome("done", "Neema Mushi")).toBe(
      "Marked Neema's message as done. It is kept under Done.",
    );
    expect(enquiryOutcome("reopen", "Neema Mushi")).toBe("Moved Neema's message back to New.");
    expect(enquiryOutcome("delete", "Neema Mushi")).toBe("Deleted Neema's message.");
  });
});
