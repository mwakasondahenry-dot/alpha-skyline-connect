// The wizard's steps and what each one asks, worked out from the form
// definition. Pure, so it can be tested without a browser.

import type { Field, FormDef, WizardStep } from "@/lib/admission-forms/forms";

export type StepDef = { step: WizardStep | "download"; title: string; short: string };

export const WIZARD_STEPS: StepDef[] = [
  { step: "pupil", title: "The pupil", short: "Pupil" },
  { step: "parents", title: "Parents or guardians", short: "Parents" },
  { step: "school", title: "Previous school", short: "School" },
  { step: "download", title: "Check and download", short: "Download" },
];

/** Every field on the form by key. Part B repeats the names; Part A's come first and win. */
function fieldsByKey(form: FormDef): Map<string, Field> {
  const all = [
    ...form.entryFields,
    ...form.partA.questions.flatMap((q) => q.fields),
    ...form.partB.questions.flatMap((q) => q.fields),
  ];
  const map = new Map<string, Field>();
  for (const field of all) if (!map.has(field.key)) map.set(field.key, field);
  return map;
}

/** The fields asked on one step, in form order. */
export function fieldsFor(form: FormDef, step: WizardStep): Field[] {
  const map = fieldsByKey(form);
  return form.steps[step].flatMap((key) => {
    const field = map.get(key);
    return field ? [field] : [];
  });
}

/** A help line under a field, where the PDF prints part of the answer itself. */
export function fieldHint(field: Field): string | null {
  if (field.key === "indexNumber") {
    return "Type only the numbers after PS, e.g. 0101001-001.";
  }
  return null;
}

function sentenceCase(title: string): string {
  // "PART A: PARTICULARS OF THE PUPIL" → "Part A: Particulars of the pupil"
  const [part, rest = ""] = title.split(": ");
  const lower = rest.toLowerCase();
  return `${part.charAt(0)}${part.slice(1, 4).toLowerCase()}${part.slice(4)}: ${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

export type ReviewGroup = { title: string; step: number; fields: Field[] };

/** The answers on the check step, grouped by the Part they print under. */
export function reviewGroups(form: FormDef): ReviewGroup[] {
  const partA = sentenceCase(form.partA.title);
  const entryKeys = new Set(form.entryFields.map((field) => field.key));
  const pupil = fieldsFor(form, "pupil");
  const groups: ReviewGroup[] = [];
  if (form.entryFields.length > 0) {
    groups.push({
      title: "Entry class",
      step: 0,
      fields: pupil.filter((field) => entryKeys.has(field.key)),
    });
  }
  groups.push(
    {
      title: partA,
      step: 0,
      fields: pupil.filter((field) => !entryKeys.has(field.key)),
    },
    { title: "Part A: Parents or guardians", step: 1, fields: fieldsFor(form, "parents") },
    { title: sentenceCase(form.partB.title), step: 2, fields: fieldsFor(form, "school") },
  );
  return groups;
}

/** An answer as the parent will see it printed: dates as DD/MM/YYYY. */
export function displayValue(field: Field, value: string | undefined): string {
  const v = (value ?? "").trim();
  if (field.kind === "date") {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  }
  return v;
}
