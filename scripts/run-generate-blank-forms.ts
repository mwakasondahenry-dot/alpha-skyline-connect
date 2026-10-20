/**
 * Writes a blank copy of each admission form to public/forms/<id>.pdf.
 *
 * Phones and tablets download these instead of filling the form online, so
 * they are generated ahead of time and committed. Run `npm run forms:blank`
 * after changing a form definition or the PDF layout; a test fails when the
 * committed files are stale.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { FORMS } from "../src/lib/admission-forms/forms";
import { blankFormBytes } from "./generate-blank-forms";

async function main() {
  for (const form of FORMS) {
    const out = resolve("public" + form.blankPdfPath);
    writeFileSync(out, await blankFormBytes(form));
    console.log("wrote", out);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
