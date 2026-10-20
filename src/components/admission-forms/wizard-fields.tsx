/**
 * The step bodies of the admission form wizard: the field grid for steps
 * 1–3 and the check list for step 4. Tokens only; see src/styles.css.
 */
import { useState } from "react";
import { T } from "@/components/type-roles";
import { FieldLabel, INPUT, TextField } from "@/components/alumni/story-wizard/field-ui";
import type { Field, FormDef, WizardStep } from "@/lib/admission-forms/forms";
import { softProblem, type Answers } from "@/lib/admission-forms/answers";
import { displayValue, fieldHint, fieldsFor, reviewGroups } from "./steps";

const SPAN: Record<Field["width"], string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
};

const NOTE = "mt-1 text-sm text-[var(--color-ink-soft)]";

function GenderChoice({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend>
        <FieldLabel>{field.label}</FieldLabel>
      </legend>
      {/* Two short options side by side fit a one-column cell without boxes. */}
      <div className="mt-2 flex gap-5">
        {["Male", "Female"].map((option) => (
          <label
            key={option}
            className="flex min-h-[var(--btn-primary-min-h)] cursor-pointer items-center gap-2"
            style={T.body}
          >
            <input
              type="radio"
              name={field.key}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="h-5 w-5 shrink-0 accent-[var(--color-bright-blue)]"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.kind === "gender") {
    return <GenderChoice field={field} value={value} onChange={onChange} />;
  }
  if (field.kind === "date") {
    return (
      <label className="block">
        <FieldLabel>{field.label}</FieldLabel>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT}
          style={T.body}
        />
      </label>
    );
  }
  return (
    <TextField
      label={field.label}
      value={value}
      onChange={onChange}
      required={field.key === "firstName" || field.key === "familyName"}
      autoComplete={field.kind === "email" ? "email" : field.kind === "phone" ? "tel" : "off"}
    />
  );
}

/** Steps 1–3: the step's fields in a 3-column grid, as on the paper form. */
export function FieldsStep({
  form,
  step,
  answers,
  setAnswer,
}: {
  form: FormDef;
  step: WizardStep;
  answers: Answers;
  setAnswer: (key: string, v: string) => void;
}) {
  /* A gentle check shows only once the parent has left the field. */
  const [left, setLeft] = useState<Set<string>>(() => new Set());

  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-5">
      {fieldsFor(form, step).map((field) => {
        const value = answers[field.key] ?? "";
        const hint = fieldHint(field);
        const problem = left.has(field.key) ? softProblem(field, value, new Date()) : null;
        return (
          <div
            key={field.key}
            className={`${SPAN[field.width]} flex flex-col justify-end`}
            onBlur={() => setLeft((s) => (s.has(field.key) ? s : new Set(s).add(field.key)))}
          >
            <FieldInput field={field} value={value} onChange={(v) => setAnswer(field.key, v)} />
            {hint && <p className={NOTE}>{hint}</p>}
            <p className="mt-1 text-sm text-[var(--color-danger)]" aria-live="polite">
              {problem ?? ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Step 4: every answer, grouped by Part, with a way back to change it. */
export function CheckStep({
  form,
  answers,
  goTo,
}: {
  form: FormDef;
  answers: Answers;
  goTo: (step: number) => void;
}) {
  return (
    <div className="space-y-6">
      {reviewGroups(form).map((group) => (
        <section key={group.title}>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--color-deep-blue)]/15 pb-2">
            <h3 className="font-display text-[var(--color-deep-blue)]" style={T.body}>
              {group.title}
            </h3>
            <button
              type="button"
              onClick={() => goTo(group.step)}
              className="text-[var(--color-bright-blue)] underline underline-offset-2 hover:text-[var(--color-deep-blue)]"
              style={T.label}
            >
              Edit<span className="sr-only"> {group.title}</span>
            </button>
          </div>
          <dl className="mt-2 grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-4 gap-y-1">
            {group.fields.map((field) => {
              const shown = displayValue(field, answers[field.key]);
              return (
                <div key={field.key} className="contents">
                  <dt className="text-[var(--color-ink-soft)]" style={T.label}>
                    {field.label}
                  </dt>
                  <dd
                    className={shown ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"}
                    style={T.body}
                  >
                    {shown || "Left blank"}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}

      <section>
        <h3
          className="border-b border-[var(--color-deep-blue)]/15 pb-2 font-display text-[var(--color-deep-blue)]"
          style={T.body}
        >
          Part C: Important information
        </h3>
        <div className="mt-2 space-y-1 text-[var(--color-ink)]" style={T.body}>
          {form.partC.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
