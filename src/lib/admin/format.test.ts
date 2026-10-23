import { describe, expect, it } from "vitest";
import { contactLinks, formatAdminDate, formatAdminDateTime, schoolLabel } from "./format";

const now = new Date("2026-10-23T09:00:00Z"); // 12:00 in Dar es Salaam

describe("formatAdminDate", () => {
  it("shows today with the time", () => {
    expect(formatAdminDate("2026-10-23T14:02:00Z", now)).toBe("Today 17:02");
  });
  it("shows yesterday with the time", () => {
    expect(formatAdminDate("2026-10-22T06:15:00Z", now)).toBe("Yesterday 09:15");
  });
  it("shows day and month in the same year", () => {
    expect(formatAdminDate("2026-10-18T14:02:22Z", now)).toBe("18 Oct");
  });
  it("adds the year for other years", () => {
    expect(formatAdminDate("2025-03-01T10:00:00Z", now)).toBe("1 Mar 2025");
  });
  it("returns empty for invalid input", () => {
    expect(formatAdminDate("nope", now)).toBe("");
  });
  it("uses the Dar es Salaam day, not UTC", () => {
    // 22:00Z on the 22nd is 01:00 on the 23rd in Dar
    expect(formatAdminDate("2026-10-22T22:00:00Z", now)).toBe("Today 01:00");
  });
});

describe("formatAdminDateTime", () => {
  it("gives the full date and the Dar es Salaam time", () => {
    expect(formatAdminDateTime("2026-10-18T14:02:22Z")).toBe("18 Oct 2026, 17:02");
    expect(formatAdminDateTime("2026-10-22T22:00:00Z")).toBe("23 Oct 2026, 01:00");
  });
  it("returns empty for invalid input", () => {
    expect(formatAdminDateTime("nope")).toBe("");
  });
});

describe("schoolLabel", () => {
  it("maps known slugs", () => {
    expect(schoolLabel("group-wide")).toBe("Alpha Schools");
    expect(schoolLabel(null)).toBe("Alpha Schools");
    expect(schoolLabel(undefined)).toBe("Alpha Schools");
    expect(schoolLabel("nursery-primary")).toBe("Nursery & Primary");
    expect(schoolLabel("alpha-high")).toBe("Alpha High");
    expect(schoolLabel("alpha-girls")).toBe("Alpha Girls");
  });
  it("flags unknown slugs", () => {
    expect(schoolLabel("mystery")).toBe("Not recorded");
  });
});

describe("contactLinks", () => {
  it("builds all three links", () => {
    expect(
      contactLinks({
        phone: "0712 345 678",
        email: "a@b.co",
        name: "Frank Joseph",
        subject: "Fees",
      }),
    ).toEqual({
      whatsapp: "https://wa.me/255712345678?text=Hello%20Frank%2C",
      tel: "tel:+255712345678",
      mailto: "mailto:a@b.co?subject=Re%3A%20Fees",
    });
  });
  it("accepts a foreign number with a plus", () => {
    expect(contactLinks({ phone: "+44 7700 900123" }).tel).toBe("tel:+447700900123");
  });
  it("gives no phone links for an unusable number", () => {
    const l = contactLinks({ phone: "abc" });
    expect(l.whatsapp).toBeNull();
    expect(l.tel).toBeNull();
  });
  it("gives nothing for nothing", () => {
    expect(contactLinks({})).toEqual({ whatsapp: null, tel: null, mailto: null });
  });
  it("omits the subject when not given", () => {
    expect(contactLinks({ email: "a@b.co" }).mailto).toBe("mailto:a@b.co");
  });
  it("gives no email link for an address that could carry extra mail fields", () => {
    for (const email of [
      "a@b.co?cc=evil@x.co",
      "a@b.co&bcc=evil@x.co",
      "a@b.co#x",
      "a b@c.co",
      ["a@b.co", "bcc:x@y.co"].join(String.fromCharCode(10)),
      "not an email",
      "a@b",
      "@b.co",
      "a@@b.co",
    ]) {
      expect(contactLinks({ email, subject: "Fees" }).mailto, email).toBeNull();
    }
  });
  it("encodes the local part of a usable address", () => {
    expect(contactLinks({ email: "o'neil+fees@school.co.tz" }).mailto).toBe(
      "mailto:o'neil%2Bfees@school.co.tz",
    );
    expect(contactLinks({ email: "  a@b.co  " }).mailto).toBe("mailto:a@b.co");
  });
});
