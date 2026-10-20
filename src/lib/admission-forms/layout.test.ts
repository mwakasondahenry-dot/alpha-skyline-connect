import { describe, expect, it } from "vitest";
import { FORMS, getForm } from "./forms";
import type { FormDef } from "./forms";
import { fitText, layoutForm } from "./layout";
import type { Op, Page } from "./layout";

const widthOf = (s: string, size: number) => s.length * size * 0.5;

type TextOp = Extract<Op, { t: "text" }>;
type BoxOp = Extract<Op, { t: "box" }>;

const texts = (page: Page): TextOp[] => page.filter((op): op is TextOp => op.t === "text");
const textValues = (page: Page): string[] => texts(page).map((op) => op.text);

function allKeys(form: FormDef): string[] {
  const fields = [
    ...form.entryFields,
    ...form.partA.questions.flatMap((q) => q.fields),
    ...form.partB.questions.flatMap((q) => q.fields),
  ];
  return [...new Set(fields.map((field) => field.key))];
}

// Distinctive values (ruling R3) so they cannot collide with printed labels.
function fullAnswers(form: FormDef): Record<string, string> {
  return Object.fromEntries(allKeys(form).map((key, i) => [key, `Zq${i}${key}Qz`]));
}

describe("layoutForm", () => {
  it.each(FORMS.map((form) => [form.id, form] as const))("%s always has two pages", (_, form) => {
    expect(layoutForm(form, {}, widthOf)).toHaveLength(2);
  });

  it("prints the pupil's first name in Part A and Part B, and the father's phone once", () => {
    const form = getForm("alpha-high-form-1")!;
    const [page1] = layoutForm(form, { firstName: "Neema", fatherTel: "0754 123 456" }, widthOf);
    const values = textValues(page1);
    expect(values.filter((t) => t === "Neema")).toHaveLength(2);
    expect(values.filter((t) => t === "0754 123 456")).toHaveLength(1);
  });

  it("numbers each question on its first field's label", () => {
    const [page1] = layoutForm(getForm("alpha-high-form-1")!, {}, widthOf);
    const values = textValues(page1);
    expect(values).toContain("1. Pupil's Name: First Name");
    expect(values).toContain("Middle Name");
    expect(values).toContain("8. Name of Father/Guardian");
    expect(values).toContain("PART A: PARTICULARS OF THE PUPIL");
    expect(values).toContain("PART B: PARTICULARS OF PRIMARY SCHOOL");
  });

  it.each(FORMS.map((form) => [form.id, form] as const))(
    "%s has an office strip with no answers in it",
    (_, form) => {
      const [page1] = layoutForm(form, fullAnswers(form), widthOf);
      const values = textValues(page1);
      expect(values).toContain("Serial number");
      expect(values).toContain("Receipt No");

      const strip = page1.find((op): op is BoxOp => op.t === "box" && op.dashed === true);
      expect(strip).toBeDefined();
      const inside = texts(page1).filter(
        (op) =>
          op.x >= strip!.x &&
          op.x <= strip!.x + strip!.w &&
          op.y >= strip!.y &&
          op.y <= strip!.y + strip!.h,
      );
      expect(inside.length).toBeGreaterThan(0);
      for (const op of inside) expect(op.text).not.toMatch(/Zq|Qz/);
    },
  );

  it.each(FORMS.map((form) => [form.id, form] as const))(
    "%s has Part E only on Form I and never prints answers on page 2",
    (_, form) => {
      const answers = fullAnswers(form);
      const [, page2] = layoutForm(form, answers, widthOf);
      const values = textValues(page2);
      expect(values.includes("PART E: ACADEMIC PROGRESS")).toBe(form.kind === "form-1");
      expect(values).toContain("PART C: IMPORTANT INFORMATION");
      expect(values).toContain("PART D: PARENT'S/ GUARDIAN'S DECLARATION");
      for (const value of Object.values(answers)) {
        expect(values.some((t) => t.includes(value))).toBe(false);
      }
    },
  );

  it.each(FORMS.map((form) => [form.id, form] as const))("%s prints the website", (_, form) => {
    const [page1] = layoutForm(form, {}, widthOf);
    expect(textValues(page1).some((t) => t.includes("alphaschools.co.tz"))).toBe(true);
    expect(textValues(page1).some((t) => t.includes("alphaschools.ac.tz"))).toBe(false);
  });

  it.each(FORMS.map((form) => [form.id, form] as const))(
    "%s keeps every op inside the 14mm margins, even with long answers",
    (_, form) => {
      const long = Object.fromEntries(allKeys(form).map((key) => [key, "W".repeat(200)]));
      for (const answers of [{}, long]) {
        for (const page of layoutForm(form, answers, widthOf)) {
          for (const op of page) {
            const xs =
              op.t === "text"
                ? [op.x, op.x + widthOf(op.text, op.size)]
                : op.t === "line"
                  ? [op.x1, op.x2]
                  : [op.x, op.x + op.w];
            const ys =
              op.t === "text" ? [op.y] : op.t === "line" ? [op.y1, op.y2] : [op.y, op.y + op.h];
            for (const x of xs) expect(x, JSON.stringify(op)).toBeGreaterThanOrEqual(28);
            for (const x of xs) expect(x, JSON.stringify(op)).toBeLessThanOrEqual(567);
            for (const y of ys) expect(y, JSON.stringify(op)).toBeGreaterThanOrEqual(28);
            for (const y of ys) expect(y, JSON.stringify(op)).toBeLessThanOrEqual(814);
          }
        }
      }
    },
  );

  it("leaves empty answer boxes at least 22pt tall for handwriting", () => {
    const [page1] = layoutForm(getForm("alpha-girls-transfer")!, {}, widthOf);
    const boxes = page1.filter((op): op is BoxOp => op.t === "box" && !op.dashed && op.h < 90);
    expect(boxes.length).toBeGreaterThan(20);
    for (const box of boxes) expect(box.h).toBeGreaterThanOrEqual(22);
  });

  it("prints dates of birth as DD/MM/YYYY", () => {
    const [page1] = layoutForm(getForm("alpha-high-form-1")!, { dob: "2014-03-14" }, widthOf);
    expect(textValues(page1)).toContain("14/03/2014");
    expect(textValues(page1)).not.toContain("2014-03-14");
  });

  it("cleans answers the PDF font cannot draw", () => {
    const [page1] = layoutForm(getForm("alpha-high-form-1")!, { firstName: "Neema😀" }, widthOf);
    expect(textValues(page1).filter((t) => t === "Neema")).toHaveLength(2);
  });
});

describe("fitText", () => {
  it("shrinks to 7pt and then cuts with an ellipsis", () => {
    const fit = fitText("x".repeat(120), 100, 10, widthOf);
    expect(fit.size).toBe(7);
    expect(fit.text.endsWith("…")).toBe(true);
    expect(widthOf(fit.text, 7)).toBeLessThanOrEqual(100);
  });

  it("leaves text that fits alone", () => {
    expect(fitText("Moshi", 100, 10, widthOf)).toEqual({ text: "Moshi", size: 10 });
  });

  it("shrinks before cutting", () => {
    // 20 chars at 10pt = 100pt > 90; at 9pt = 90pt fits.
    expect(fitText("a".repeat(20), 90, 10, widthOf)).toEqual({ text: "a".repeat(20), size: 9 });
  });
});
