import { describe, expect, it } from "vitest";
import { FORMS, getForm, type FormDef } from "./forms";

const FORM_1 = ["alpha-high-form-1", "alpha-girls-form-1"];

function allKeys(form: FormDef): string[] {
  const questionFields = [...form.partA.questions, ...form.partB.questions].flatMap(
    (q) => q.fields,
  );
  return [...form.entryFields, ...questionFields].map((f) => f.key);
}

describe("FORMS", () => {
  it("defines exactly the four forms", () => {
    expect(FORMS.map((f) => f.id).sort()).toEqual([
      "alpha-girls-form-1",
      "alpha-girls-transfer",
      "alpha-high-form-1",
      "alpha-high-transfer",
    ]);
  });

  it("returns undefined for an unknown id", () => {
    expect(getForm("nope")).toBeUndefined();
  });

  it("ends every header with the corrected website line", () => {
    for (const form of FORMS) {
      expect(form.headerLines.at(-1)).toContain("alphaschools.co.tz");
    }
    expect(JSON.stringify(FORMS)).not.toContain("ac.tz");
  });

  it("has Part E only on the two Form I forms", () => {
    for (const form of FORMS) {
      expect(form.hasPartE).toBe(FORM_1.includes(form.id));
    }
  });

  it("sets the entry class for Form I and three entry fields for transfers", () => {
    for (const form of FORMS) {
      if (form.kind === "form-1") {
        expect(form.entryClass).toBe("FORM I 2027");
      } else {
        expect(form.entryClass).toBeNull();
        expect(form.entryFields.map((f) => f.key)).toEqual([
          "entryForm",
          "combination",
          "entryYear",
        ]);
      }
    }
  });

  it("asks every field on exactly one wizard step", () => {
    for (const form of FORMS) {
      const stepKeys = Object.values(form.steps).flat();
      expect(new Set(stepKeys).size).toBe(stepKeys.length);
      expect(new Set(stepKeys)).toEqual(new Set(allKeys(form)));
    }
  });

  it("keeps the declaration wording per form", () => {
    expect(getForm("alpha-high-transfer")!.partD).toContain("student's stay");
    expect(getForm("alpha-girls-transfer")!.partD).toContain("pupil's stay");
  });

  it("numbers Part A questions per source form", () => {
    expect(getForm("alpha-girls-form-1")!.partA.questions.length).toBe(8);
    for (const id of ["alpha-high-form-1", "alpha-high-transfer", "alpha-girls-transfer"]) {
      expect(getForm(id)!.partA.questions.length).toBe(9);
    }
  });

  it("follows each source PDF's wording for the transfer results slip line", () => {
    expect(getForm("alpha-girls-transfer")!.partC).toContain("iii) Result slip (For A-Level)");
    expect(getForm("alpha-high-transfer")!.partC).toContain("iii) Results slip (For A-Level)");
  });

  it("follows each source PDF's wording for the PREM label", () => {
    const label = (id: string) =>
      getForm(id)!
        .partB.questions.flatMap((q) => q.fields)
        .find((field) => field.key === "prem")!.label;
    expect(label("alpha-girls-transfer")).toBe("PREM NUMBER");
    expect(label("alpha-high-transfer")).toBe("PREM Number");
  });

  it("lists the girls Form I exam subjects with the corrected wording", () => {
    expect(getForm("alpha-girls-form-1")!.partC).toContain(
      "2. Entrance examination subjects will be ENGLISH, MATHEMATICS, and GENERAL KNOWLEDGE & SCIENCE.",
    );
  });

  it("points each form at its crest and blank PDF", () => {
    expect(getForm("alpha-high-transfer")!.crest).toBe("alpha-high.jpg");
    expect(getForm("alpha-girls-form-1")!.crest).toBe("alpha-schools.jpg");
    expect(getForm("alpha-girls-form-1")!.blankPdfPath).toBe("/forms/alpha-girls-form-1.pdf");
  });
});
