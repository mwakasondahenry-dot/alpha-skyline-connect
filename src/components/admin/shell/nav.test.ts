import { describe, it, expect } from "vitest";
import { ADMIN_NAV, isCurrent, isWithin, navCount } from "./nav";

describe("ADMIN_NAV", () => {
  it("lists the areas by job, Alumni between Inbox and News & events", () => {
    expect(ADMIN_NAV.map((n) => n.label)).toEqual([
      "Today",
      "Stories",
      "Inbox",
      "Alumni",
      "News & events",
      "Photos",
      "People",
    ]);
  });

  it("puts Today, Stories and Inbox on the phone bar and the rest in More", () => {
    expect(ADMIN_NAV.filter((n) => n.phone === "bar").map((n) => n.to)).toEqual([
      "/admin",
      "/admin/stories",
      "/admin/inbox",
    ]);
    expect(ADMIN_NAV.filter((n) => n.phone === "more").map((n) => n.to)).toEqual([
      "/admin/alumni",
      "/admin/news",
      "/admin/photos",
      "/admin/staff",
    ]);
  });

  it("makes the Facilities and Activities galleries reachable under Photos", () => {
    const photos = ADMIN_NAV.find((n) => n.to === "/admin/photos")!;
    expect(photos.children?.map((c) => [c.label, c.to])).toEqual([
      ["Hero slides", "/admin/hero-slides"],
      ["Facilities", "/admin/facilities"],
      ["Facilities gallery", "/admin/facility-photos"],
      ["Activities gallery", "/admin/gallery"],
    ]);
    const news = ADMIN_NAV.find((n) => n.to === "/admin/news")!;
    expect(news.children?.map((c) => c.to)).toEqual(["/admin/events"]);
  });
});

describe("isCurrent", () => {
  it("marks Today only on /admin itself", () => {
    expect(isCurrent("/admin", "/admin")).toBe(true);
    expect(isCurrent("/admin", "/admin/")).toBe(true);
    expect(isCurrent("/admin", "/admin/stories")).toBe(false);
  });
  it("marks an area on its own page and the pages under it", () => {
    expect(isCurrent("/admin/stories", "/admin/stories")).toBe(true);
    expect(isCurrent("/admin/stories", "/admin/stories/invite")).toBe(true);
    expect(isCurrent("/admin/news", "/admin/newsletter")).toBe(false);
  });
});

describe("isWithin", () => {
  it("is true for an area or any of its sub-links", () => {
    const photos = ADMIN_NAV.find((n) => n.to === "/admin/photos")!;
    expect(isWithin(photos, "/admin/gallery")).toBe(true);
    expect(isWithin(photos, "/admin/photos")).toBe(true);
    expect(isWithin(photos, "/admin/staff")).toBe(false);
  });
});

describe("navCount", () => {
  const c = { storiesWaiting: 2, inboxNew: 3, photosEmpty: 13 };

  it("gives Today stories waiting plus new enquiries, leaving empty photos out", () => {
    const today = ADMIN_NAV.find((n) => n.to === "/admin")!;
    expect(navCount(today.count, c)).toBe(5);
    expect(navCount(today.count, { storiesWaiting: 0, inboxNew: 0, photosEmpty: 13 })).toBe(0);
  });

  it("gives Stories and Inbox their own counts", () => {
    const stories = ADMIN_NAV.find((n) => n.to === "/admin/stories")!;
    const inbox = ADMIN_NAV.find((n) => n.to === "/admin/inbox")!;
    expect(navCount(stories.count, c)).toBe(2);
    expect(navCount(inbox.count, c)).toBe(3);
  });

  it("gives no number to an item without a badge", () => {
    expect(navCount(undefined, c)).toBe(0);
  });
});
