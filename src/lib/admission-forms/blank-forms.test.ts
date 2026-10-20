import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { blankFormBytes } from "../../../scripts/generate-blank-forms";
import { FORMS } from "./forms";

describe("blank form PDFs", () => {
  for (const form of FORMS) {
    it(`public${form.blankPdfPath} matches the generator and stays small`, async () => {
      const onDisk = readFileSync("public" + form.blankPdfPath);
      const fresh = await blankFormBytes(form);
      expect(
        Buffer.from(fresh).equals(onDisk),
        "public/forms is stale — run npm run forms:blank",
      ).toBe(true);
      expect(onDisk.length).toBeLessThan(150 * 1024);
    });
  }
});
