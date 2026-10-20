import { readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { getForm } from "./forms";
import { renderFormPdf } from "./pdf";

const crest = { bytes: readFileSync("public/forms/crests/alpha-high.jpg"), type: "jpg" as const };
const form = getForm("alpha-high-form-1")!;

describe("renderFormPdf", () => {
  it("writes a two-page A4 PDF titled with the school and form", async () => {
    const bytes = await renderFormPdf(form, { firstName: "Neema" }, crest);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");

    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(2);
    for (const page of doc.getPages()) {
      expect(page.getWidth()).toBeCloseTo(595.28, 2);
      expect(page.getHeight()).toBeCloseTo(841.89, 2);
    }
    expect(doc.getTitle()).toBe("ALPHA HIGH SCHOOL — APPLICATION FORM FOR ADMISSION");
  });

  it("draws the Alpha Schools crest too", async () => {
    const girlsCrest = {
      bytes: readFileSync("public/forms/crests/alpha-schools.jpg"),
      type: "jpg" as const,
    };
    const bytes = await renderFormPdf(getForm("alpha-girls-transfer")!, {}, girlsCrest);
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(2);
  });

  it("does not throw on characters the font cannot draw", async () => {
    await expect(renderFormPdf(form, { firstName: "😀" }, crest)).resolves.toBeInstanceOf(
      Uint8Array,
    );
  });

  it("writes the same bytes for the same answers", async () => {
    const a = await renderFormPdf(form, { firstName: "Neema" }, crest);
    const b = await renderFormPdf(form, { firstName: "Neema" }, crest);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
  });
});
