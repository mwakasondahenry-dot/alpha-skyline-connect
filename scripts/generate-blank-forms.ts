/**
 * Writes a blank copy of each admission form to public/forms/<id>.pdf.
 *
 * Phones and tablets download these instead of filling the form online, so
 * they are generated ahead of time and committed. Run `npm run forms:blank`
 * after changing a form definition or the PDF layout; a test fails when the
 * committed files are stale.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FORMS, type FormDef } from "../src/lib/admission-forms/forms";
import { renderFormPdf } from "../src/lib/admission-forms/pdf";

export async function blankFormBytes(form: FormDef): Promise<Uint8Array> {
  const bytes = readFileSync(resolve("public/forms/crests", form.crest));
  const type = form.crest.endsWith(".png") ? "png" : "jpg";
  return renderFormPdf(form, {}, { bytes, type });
}

async function main() {
  for (const form of FORMS) {
    const out = resolve("public" + form.blankPdfPath);
    writeFileSync(out, await blankFormBytes(form));
    console.log("wrote", out);
  }
}

// Write files only when run directly. vite-node hides the script from argv
// (argv[1] is its own launcher), so that launcher counts as "run directly";
// importing this file from the test (argv[1] is vitest) never writes.
const entry = process.argv[1] ? resolve(process.argv[1]) : "";
if (entry === fileURLToPath(import.meta.url) || /vite-node[\\/]vite-node\.mjs$/.test(entry)) {
  void main();
}
