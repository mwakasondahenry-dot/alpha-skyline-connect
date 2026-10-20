// Draws the admission form layout into a PDF with pdf-lib. Load this module
// only with `await import(...)` from the Download click handler, so pdf-lib
// never ships with the Admission page.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Answers } from "./answers";
import type { FormDef } from "./forms";
import { PAGE_HEIGHT, PAGE_WIDTH, layoutForm } from "./layout";
import type { Color } from "./layout";

const COLORS: Record<Color, ReturnType<typeof rgb>> = {
  ink: rgb(0, 0, 0),
  blue: rgb(0, 0x2e / 255, 0x6a / 255), // #002e6a deep-blue
  grey: rgb(0.33, 0.33, 0.33),
};
const BORDER = rgb(0.45, 0.45, 0.45);
// Fixed dates keep the bytes identical for the same answers.
const FIXED_DATE = new Date("2026-01-01T00:00:00Z");

export async function renderFormPdf(
  form: FormDef,
  answers: Answers,
  crest: { bytes: Uint8Array; type: "jpg" | "png" },
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${form.schoolName} — ${form.title}`);
  doc.setProducer("Alpha Schools");
  doc.setCreator("Alpha Schools");
  doc.setCreationDate(FIXED_DATE);
  doc.setModificationDate(FIXED_DATE);

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const image =
    crest.type === "jpg" ? await doc.embedJpg(crest.bytes) : await doc.embedPng(crest.bytes);

  const widthOf = (s: string, size: number, isBold?: boolean) =>
    (isBold ? bold : regular).widthOfTextAtSize(s, size);

  for (const ops of layoutForm(form, answers, widthOf)) {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    for (const op of ops) {
      if (op.t === "text") {
        page.drawText(op.text, {
          x: op.x,
          y: op.y,
          size: op.size,
          font: op.bold ? bold : regular,
          color: COLORS[op.color ?? "ink"],
        });
      } else if (op.t === "box") {
        page.drawRectangle({
          x: op.x,
          y: op.y,
          width: op.w,
          height: op.h,
          borderColor: BORDER,
          borderWidth: 0.6,
          borderDashArray: op.dashed ? [3, 2] : undefined,
        });
      } else if (op.t === "line") {
        page.drawLine({
          start: { x: op.x1, y: op.y1 },
          end: { x: op.x2, y: op.y2 },
          color: COLORS[op.color ?? "ink"],
          thickness: op.thickness ?? 0.6,
        });
      } else {
        const { width, height } = image.scaleToFit(op.w, op.h);
        page.drawImage(image, {
          x: op.x + (op.w - width) / 2,
          y: op.y + (op.h - height) / 2,
          width,
          height,
        });
      }
    }
  }

  return doc.save();
}
