import { describe, expect, it } from "vitest";
import {
  DRAFT_TTL_MS,
  downloadProblem,
  draftKey,
  pdfFileName,
  readDraft,
  sanitizeForPdf,
  softProblem,
} from "./answers";
import { getForm, type Field, type FormDef } from "./forms";

const NOW = 1_800_000_000_000;
const draft = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    formId: "alpha-high-form-1",
    savedAt: NOW - 1000,
    answers: { firstName: "Neema" },
    ...over,
  });

const field = (kind: Field["kind"]): Field => ({ key: "k", label: "L", kind, width: 1 });
const high1 = getForm("alpha-high-form-1") as FormDef;
const highTransfer = getForm("alpha-high-transfer") as FormDef;

describe("draftKey", () => {
  it("prefixes the form id", () => {
    expect(draftKey("alpha-high-form-1")).toBe("alpha-admission-draft:alpha-high-form-1");
  });
});

describe("readDraft", () => {
  it("returns {} for missing, corrupt, expired or other-form drafts", () => {
    expect(readDraft(null, "alpha-high-form-1", NOW)).toEqual({});
    expect(readDraft("{bad", "alpha-high-form-1", NOW)).toEqual({});
    expect(readDraft(draft({ savedAt: NOW - DRAFT_TTL_MS - 1 }), "alpha-high-form-1", NOW)).toEqual(
      {},
    );
    expect(readDraft(draft({ formId: "alpha-girls-form-1" }), "alpha-high-form-1", NOW)).toEqual(
      {},
    );
  });
  it("returns the answers of a fresh draft and drops non-string values", () => {
    expect(readDraft(draft(), "alpha-high-form-1", NOW)).toEqual({ firstName: "Neema" });
    expect(
      readDraft(draft({ answers: { a: "x", b: 3, c: null } }), "alpha-high-form-1", NOW),
    ).toEqual({ a: "x" });
  });
});

describe("downloadProblem", () => {
  it("needs first and family name", () => {
    const msg = "Enter the pupil's first name and family name to download.";
    expect(downloadProblem({})).toBe(msg);
    expect(downloadProblem({ firstName: "Neema", familyName: "   " })).toBe(msg);
    expect(downloadProblem({ firstName: "Neema", familyName: "Mushi" })).toBeNull();
  });
});

describe("softProblem", () => {
  const now = new Date("2026-10-20");
  it("checks phones", () => {
    expect(softProblem(field("phone"), "0754 123 456", now)).toBeNull();
    expect(softProblem(field("phone"), "+255 754 123 456", now)).toBeNull();
    expect(softProblem(field("phone"), "12345", now)).toBe(
      "Check this phone number — it looks too short.",
    );
    expect(softProblem(field("phone"), "", now)).toBeNull();
  });
  it("checks dates", () => {
    expect(softProblem(field("date"), "2014-03-14", now)).toBeNull();
    expect(softProblem(field("date"), "2030-01-01", now)).toBe("This date is in the future.");
    expect(softProblem(field("date"), "1990-01-01", now)).toBe("Check the year.");
  });
  it("checks emails", () => {
    expect(softProblem(field("email"), "a@b", now)).toBe("Check this email address.");
    expect(softProblem(field("email"), "neema@example.com", now)).toBeNull();
  });
});

describe("sanitizeForPdf", () => {
  it("keeps WinAnsi, drops emoji and CJK", () => {
    expect(sanitizeForPdf("Zoë’s 😀 名")).toBe("Zoë’s  ");
  });
  it("falls back to the NFKD base letter", () => {
    expect(sanitizeForPdf("Ő")).toBe("O");
  });
});

describe("pdfFileName", () => {
  it("builds the file name", () => {
    expect(pdfFileName(high1, { firstName: "Neema", familyName: "Mushi" })).toBe(
      "Alpha-High-Form-I-2027-Neema-Mushi.pdf",
    );
    expect(pdfFileName(highTransfer, { firstName: "Neema", familyName: "Mushi" })).toBe(
      "Alpha-High-Transfer-Neema-Mushi.pdf",
    );
    expect(pdfFileName(high1, {})).toBe("Alpha-High-Form-I-2027.pdf");
    expect(pdfFileName(high1, { firstName: "Mary Anne", familyName: "a/b" })).toBe(
      "Alpha-High-Form-I-2027-Mary-Anne-a-b.pdf",
    );
  });
});
