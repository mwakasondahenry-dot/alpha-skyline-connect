import { describe, it, expect } from "vitest";
import {
  formatNewsDate,
  isHttpUrl,
  isUuid,
  newsExcerpt,
  newsParagraphs,
  newsSchoolLabel,
} from "./news";

describe("formatNewsDate", () => {
  it("writes the day, the month in full and the year", () => {
    expect(formatNewsDate("2026-10-01T09:00:00Z")).toBe("1 October 2026");
  });

  it("uses Dar es Salaam's date, not UTC's", () => {
    // 22:30 UTC on 30 September is 01:30 on 1 October in EAT (UTC+3).
    expect(formatNewsDate("2026-09-30T22:30:00Z")).toBe("1 October 2026");
  });

  it("returns null for a missing or unreadable date", () => {
    expect(formatNewsDate(null)).toBeNull();
    expect(formatNewsDate("")).toBeNull();
    expect(formatNewsDate("not a date")).toBeNull();
  });
});

describe("newsSchoolLabel", () => {
  it("names the group for group-wide news", () => {
    expect(newsSchoolLabel("group-wide")).toBe("Alpha Schools");
  });

  it("names each school, never its slug", () => {
    expect(newsSchoolLabel("alpha-high")).toBe("Alpha High");
    expect(newsSchoolLabel("alpha-girls")).toBe("Alpha Girls");
    expect(newsSchoolLabel("nursery-primary")).toBe("Alpha Nursery & Primary");
    expect(newsSchoolLabel("something-new")).toBe("Alpha Schools");
    expect(newsSchoolLabel(null)).toBe("Alpha Schools");
  });
});

describe("newsExcerpt", () => {
  it("returns a short body whole, with its line breaks flattened", () => {
    expect(newsExcerpt("Line one.\n\nLine two.")).toBe("Line one. Line two.");
  });

  it("cuts a long body at a word boundary and adds an ellipsis", () => {
    const body = "word ".repeat(100);
    const out = newsExcerpt(body, 50);
    expect(out.length).toBeLessThanOrEqual(50);
    expect(out.endsWith("word…")).toBe(true);
  });

  it("drops trailing punctuation before the ellipsis", () => {
    const out = newsExcerpt("Admissions are open, apply now, before the deadline arrives", 33);
    expect(out).toBe("Admissions are open, apply now…");
  });

  it("is empty for an empty body", () => {
    expect(newsExcerpt(null)).toBe("");
    expect(newsExcerpt("   ")).toBe("");
  });
});

describe("newsParagraphs", () => {
  it("splits on blank lines and keeps single line breaks", () => {
    expect(newsParagraphs("A\nB\n\n\nC\r\n\r\nD")).toEqual(["A\nB", "C", "D"]);
  });

  it("is empty for an empty body", () => {
    expect(newsParagraphs(null)).toEqual([]);
  });
});

describe("isUuid", () => {
  it("accepts a UUID in either case", () => {
    expect(isUuid("3f2b8c1e-9a4d-4e2f-8b6a-1c2d3e4f5a6b")).toBe(true);
    expect(isUuid("3F2B8C1E-9A4D-4E2F-8B6A-1C2D3E4F5A6B")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isUuid("")).toBe(false);
    expect(isUuid("123")).toBe(false);
    expect(isUuid("3f2b8c1e-9a4d-4e2f-8b6a-1c2d3e4f5a6b'; drop table news;--")).toBe(false);
    expect(isUuid(undefined)).toBe(false);
  });
});

describe("isHttpUrl", () => {
  it("accepts http and https addresses", () => {
    expect(isHttpUrl("https://x.supabase.co/a.png")).toBe(true);
    expect(isHttpUrl("HTTP://example.com/a.png")).toBe(true);
  });

  it("rejects other schemes and empty values", () => {
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("data:image/png;base64,AAAA")).toBe(false);
    expect(isHttpUrl("//example.com/a.png")).toBe(false);
    expect(isHttpUrl("")).toBe(false);
    expect(isHttpUrl(null)).toBe(false);
  });
});
