import { describe, expect, it } from "vitest";
import { FORMS, getForm, type FormDef } from "@/lib/admission-forms/forms";
import { displayValue, fieldHint, fieldsFor, reviewGroups, WIZARD_STEPS } from "./steps";

const form = (id: string) => getForm(id) as FormDef;

describe("WIZARD_STEPS", () => {
  it("names the four steps with their short labels", () => {
    expect(WIZARD_STEPS.map((s) => [s.title, s.short])).toEqual([
      ["The pupil", "Pupil"],
      ["Parents or guardians", "Parents"],
      ["Previous school", "School"],
      ["Check and download", "Download"],
    ]);
  });
});

describe("fieldsFor", () => {
  it.each(FORMS.map((f) => [f.id, f] as const))(
    "returns a field for every step key (%s)",
    (_, f) => {
      for (const step of ["pupil", "parents", "school"] as const) {
        expect(fieldsFor(f, step).map((field) => field.key)).toEqual(f.steps[step]);
      }
    },
  );

  it("asks the names once, on the pupil step, with Part A's labels", () => {
    const f = form("alpha-high-form-1");
    const pupil = fieldsFor(f, "pupil");
    expect(pupil[0]).toMatchObject({ key: "firstName", label: "Pupil's Name: First Name" });
    expect(fieldsFor(f, "school").map((field) => field.key)).not.toContain("firstName");
  });

  it("starts a transfer form's pupil step with the entry class", () => {
    const keys = fieldsFor(form("alpha-girls-transfer"), "pupil").map((field) => field.key);
    expect(keys.slice(0, 3)).toEqual(["entryForm", "combination", "entryYear"]);
  });
});

describe("fieldHint", () => {
  it("tells parents not to type PS again in the index number", () => {
    const index = fieldsFor(form("alpha-high-form-1"), "school").find(
      (field) => field.key === "indexNumber",
    );
    expect(index && fieldHint(index)).toBe("Type only the numbers after PS, e.g. 0101001-001.");
  });

  it("has no hint for ordinary fields", () => {
    expect(fieldHint({ key: "religion", label: "Religion", kind: "text", width: 1 })).toBeNull();
  });
});

describe("reviewGroups", () => {
  it("groups a Form I by Part, each pointing at the step that asks it", () => {
    const groups = reviewGroups(form("alpha-high-form-1"));
    expect(groups.map((g) => [g.title, g.step])).toEqual([
      ["Part A: Particulars of the pupil", 0],
      ["Part A: Parents or guardians", 1],
      ["Part B: Particulars of primary school", 2],
    ]);
  });

  it("puts a transfer form's entry class first", () => {
    const groups = reviewGroups(form("alpha-girls-transfer"));
    expect(groups[0].title).toBe("Entry class");
    expect(groups[0].fields.map((field) => field.key)).toEqual([
      "entryForm",
      "combination",
      "entryYear",
    ]);
    expect(groups[1].title).toBe("Part A: Particulars of the student");
    expect(groups[1].fields.map((field) => field.key)).not.toContain("entryForm");
  });

  it.each(FORMS.map((f) => [f.id, f] as const))(
    "shows every asked field exactly once (%s)",
    (_, f) => {
      const shown = reviewGroups(f).flatMap((g) => g.fields.map((field) => field.key));
      const asked = [...f.steps.pupil, ...f.steps.parents, ...f.steps.school];
      expect(shown.sort()).toEqual(asked.sort());
    },
  );
});

describe("displayValue", () => {
  const date = { key: "dob", label: "Date of Birth", kind: "date", width: 2 } as const;
  const text = { key: "religion", label: "Religion", kind: "text", width: 1 } as const;

  it("shows dates as DD/MM/YYYY, as printed", () => {
    expect(displayValue(date, "2013-04-09")).toBe("09/04/2013");
  });

  it("trims text and treats missing answers as empty", () => {
    expect(displayValue(text, "  Christian ")).toBe("Christian");
    expect(displayValue(text, undefined)).toBe("");
  });
});
