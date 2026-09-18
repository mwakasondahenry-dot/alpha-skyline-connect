import { describe, it, expect } from "vitest";
import { buildBatch, schoolFromText, validateContact, MAX_CONTACTS, type RawContact } from "./contacts";

const YEAR = 2026;

describe("schoolFromText", () => {
  it.each([
    ["", null],
    ["  ", null],
    ["Alpha High", "alpha-high"],
    ["high", "alpha-high"],
    ["alpha-high", "alpha-high"],
    ["Alpha Girls", "alpha-girls"],
    ["GIRLS", "alpha-girls"],
    ["Nursery & Primary", "nursery-primary"],
    ["primary", "nursery-primary"],
    ["nursery-primary", "nursery-primary"],
    ["Harvard", "invalid"],
  ])("%j → %j", (text, expected) => {
    expect(schoolFromText(text)).toBe(expected);
  });
});

describe("validateContact", () => {
  it("builds a draft from minimal fields", () => {
    expect(validateContact({ name: "  Asha  Mushi ", phone: "0712 345 678" }, YEAR)).toEqual({
      ok: true,
      draft: {
        fullName: "Asha Mushi",
        phone: "+255712345678",
        email: null,
        schoolSlug: null,
        gradYear: null,
      },
    });
  });

  it("keeps optional fields", () => {
    const r = validateContact(
      { name: "Neema", phone: "0713000111", email: " Neema@Gmail.com ", school: "girls", year: "2019" },
      YEAR,
    );
    expect(r).toEqual({
      ok: true,
      draft: {
        fullName: "Neema",
        phone: "+255713000111",
        email: "neema@gmail.com",
        schoolSlug: "alpha-girls",
        gradYear: 2019,
      },
    });
  });

  it.each([
    [{ name: "", phone: "0712345678" }, "Name is missing."],
    [{ name: "x".repeat(121), phone: "0712345678" }, "Name is too long."],
    [{ name: "Asha", phone: "" }, "Phone number is missing."],
    [{ name: "Asha", phone: "0712345678", email: "not-an-email" }, "Email address doesn't look right."],
    [{ name: "Asha", phone: "0712345678", school: "Harvard" }, "School should be Alpha High, Alpha Girls or Nursery & Primary."],
    [{ name: "Asha", phone: "0712345678", year: "1950" }, `Year should be between 1960 and ${YEAR + 1}.`],
    [{ name: "Asha", phone: "0712345678", year: "20x9" }, `Year should be between 1960 and ${YEAR + 1}.`],
  ])("rejects %j", (fields, reason) => {
    expect(validateContact(fields, YEAR)).toEqual({ ok: false, reason });
  });
});

function row(line: number, name: string, phone: string): RawContact {
  return { line, raw: `${name}, ${phone}`, name, phone };
}

describe("buildBatch", () => {
  it("splits valid, invalid and duplicate rows", () => {
    const batch = buildBatch(
      [
        row(2, "Asha", "0712345678"),
        row(3, "Bad", "123"),
        row(4, "Asha again", "+255 712 345 678"),
        row(5, "John", "0754123456"),
      ],
      YEAR,
    );
    expect(batch.valid.map((v) => [v.line, v.phone])).toEqual([
      [2, "+255712345678"],
      [5, "+255754123456"],
    ]);
    expect(batch.invalid).toEqual([
      { line: 3, raw: "Bad, 123", reason: "Phone number should look like 0712 345 678." },
    ]);
    expect(batch.duplicates).toEqual([
      { line: 4, raw: "Asha again, +255 712 345 678", reason: "Same phone number as line 2." },
    ]);
  });

  it("refuses more than the cap", () => {
    const rows = Array.from({ length: MAX_CONTACTS + 1 }, (_, i) => row(i + 1, "A", "0712345678"));
    expect(() => buildBatch(rows, YEAR)).toThrow(`Up to ${MAX_CONTACTS} people at a time`);
  });

  it("ignores a year column when ignoreYear is set", () => {
    const rows: RawContact[] = [
      { line: 2, raw: "Asha, 0712345678, Form 3", name: "Asha", phone: "0712345678", year: "Form 3" },
      { line: 3, raw: "John, 0754123456, 5", name: "John", phone: "0754123456", year: "5" },
    ];
    const batch = buildBatch(rows, YEAR, { ignoreYear: true });
    expect(batch.invalid).toEqual([]);
    expect(batch.valid.map((v) => v.gradYear)).toEqual([null, null]);
  });
});
