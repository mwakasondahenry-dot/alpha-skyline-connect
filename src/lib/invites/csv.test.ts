import { describe, it, expect } from "vitest";
import { parseCsvRows, parseInviteCsv, CSV_TEMPLATE, PARENT_CSV_TEMPLATE } from "./csv";

describe("parseCsvRows", () => {
  it("handles quotes, escaped quotes, commas and newlines inside quotes", () => {
    expect(parseCsvRows('a,"b, c","say ""hi""","two\nlines"\n1,2,3,4')).toEqual([
      ["a", "b, c", 'say "hi"', "two\nlines"],
      ["1", "2", "3", "4"],
    ]);
  });

  it("strips a BOM and handles CRLF and a trailing newline", () => {
    expect(parseCsvRows("﻿name,phone\r\nAsha,0712345678\r\n")).toEqual([
      ["name", "phone"],
      ["Asha", "0712345678"],
    ]);
  });
});

describe("parseInviteCsv", () => {
  it("maps header aliases and numbers rows as the spreadsheet does", () => {
    const csv = [
      "Full Name,Phone Number,E-mail,School,Class of",
      '"Mushi, Asha",0712 345 678,asha@example.com,Alpha High,2018',
      "",
      "John Kimaro,0754123456,,,",
      "Bad Row,12,,,",
      "Asha Again,+255712345678,,,",
    ].join("\r\n");

    const batch = parseInviteCsv(csv, 2026);

    expect(batch.valid).toEqual([
      {
        line: 2,
        raw: "Mushi, Asha, 0712 345 678, asha@example.com, Alpha High, 2018",
        fullName: "Mushi, Asha",
        phone: "+255712345678",
        email: "asha@example.com",
        schoolSlug: "alpha-high",
        gradYear: 2018,
      },
      {
        line: 4,
        raw: "John Kimaro, 0754123456",
        fullName: "John Kimaro",
        phone: "+255754123456",
        email: null,
        schoolSlug: null,
        gradYear: null,
      },
    ]);
    expect(batch.invalid.map((r) => r.line)).toEqual([5]);
    expect(batch.duplicates.map((r) => r.line)).toEqual([6]);
  });

  it.each(["whatsapp", "Mobile", "phone"])("accepts %s as the phone header", (header) => {
    expect(parseInviteCsv(`name,${header}\nAsha,0712345678`).valid).toHaveLength(1);
  });

  it("refuses a file without name and phone columns", () => {
    expect(() => parseInviteCsv("first,second\na,b")).toThrow(
      "The file needs a name column and a phone column.",
    );
  });

  it("refuses an empty file", () => {
    expect(() => parseInviteCsv("")).toThrow("The file is empty.");
  });

  it("ships a template whose headers it can read", () => {
    expect(parseInviteCsv(CSV_TEMPLATE).valid).toEqual([]);
  });

  it("ships a parent template whose headers it can read", () => {
    expect(parseInviteCsv(PARENT_CSV_TEMPLATE).valid).toEqual([]);
  });

  it("drops the year column when ignoreYear is set", () => {
    const csv = ["Name,Phone,Year", "Asha Mushi,0712345678,Form 3", "John Kimaro,0754123456,5"].join("\r\n");

    const batch = parseInviteCsv(csv, 2026, { ignoreYear: true });

    expect(batch.invalid).toEqual([]);
    expect(batch.valid.map((v) => v.gradYear)).toEqual([null, null]);
  });

  it("still validates the year column when ignoreYear is not set", () => {
    const csv = ["Name,Phone,Year", "Asha Mushi,0712345678,Form 3", "John Kimaro,0754123456,5"].join("\r\n");

    const batch = parseInviteCsv(csv, 2026);

    expect(batch.valid).toEqual([]);
    expect(batch.invalid).toHaveLength(2);
  });
});
