/**
 * Renders a blank copy of an admission form. No side effects: the files are
 * written by scripts/run-generate-blank-forms.ts (`npm run forms:blank`).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { FormDef } from "../src/lib/admission-forms/forms";
import { renderFormPdf } from "../src/lib/admission-forms/pdf";

export async function blankFormBytes(form: FormDef): Promise<Uint8Array> {
  const bytes = readFileSync(resolve("public/forms/crests", form.crest));
  const type = form.crest.endsWith(".png") ? "png" : "jpg";
  return renderFormPdf(form, {}, { bytes, type });
}
