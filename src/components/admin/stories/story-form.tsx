/**
 * The story's edit fields, inline. Controlled: the detail owns the values so
 * the preview can follow every keystroke and the draft can be kept.
 *
 * Who is speaking is an explicit choice, so clearing a year can never quietly
 * move a story between the alumni and parent sections. Class of shows only
 * for a former student and is then required.
 */
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { schoolLabel } from "@/lib/admin/format";
import { storySchoolLabel } from "@/lib/story/story-meta";
import {
  SCHOOL_OPTIONS,
  STAFF_CONSENT_TEXT,
  type Speaker,
  type StoryFormErrors,
  type StoryFormValues,
} from "@/lib/admin/stories-view";

const INPUT =
  "block min-h-11 w-full rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 py-2 text-base text-[var(--color-ink)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/30 aria-[invalid=true]:border-[var(--color-danger)] sm:text-sm";

const SPEAKERS: { value: Speaker; label: string }[] = [
  { value: "parent", label: "Parent" },
  { value: "alumni", label: "Former student" },
];

export function StoryForm({
  values,
  errors,
  onChange,
  isNew,
}: {
  values: StoryFormValues;
  errors: StoryFormErrors;
  onChange: (patch: Partial<StoryFormValues>) => void;
  isNew: boolean;
}) {
  const id = useId();
  const f = (name: string) => `${id}-${name}`;
  const alumni = values.speaker === "alumni";

  return (
    <div className="space-y-5">
      <fieldset aria-describedby={errors.speaker ? f("speaker-error") : undefined}>
        <legend className="mb-2 text-sm font-semibold text-[var(--color-deep-blue)]">
          Who is speaking
        </legend>
        <div className="flex flex-wrap gap-2">
          {SPEAKERS.map((s) => {
            const checked = values.speaker === s.value;
            return (
              <label
                key={s.value}
                className={cn(
                  "admin-press inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-btn)] border px-4 text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-gold)]",
                  checked
                    ? "border-[var(--color-deep-blue)] bg-[var(--color-deep-blue)] text-[var(--color-surface)]"
                    : "border-[var(--color-hairline)] bg-[var(--color-surface)] text-[var(--color-deep-blue)] hover:bg-[var(--color-surface-muted)]",
                )}
              >
                <input
                  type="radio"
                  name={f("speaker")}
                  value={s.value}
                  checked={checked}
                  onChange={() => onChange({ speaker: s.value })}
                  data-field={s === SPEAKERS[0] ? "speaker" : undefined}
                  className="sr-only"
                />
                {s.label}
              </label>
            );
          })}
        </div>
        <FieldError id={f("speaker-error")} message={errors.speaker} />
      </fieldset>

      <Field label="Name" htmlFor={f("name")} error={errors.author_name} errorId={f("name-error")}>
        <input
          id={f("name")}
          data-field="author_name"
          type="text"
          autoComplete="off"
          value={values.author_name}
          onChange={(e) => onChange({ author_name: e.target.value })}
          aria-invalid={!!errors.author_name || undefined}
          aria-describedby={errors.author_name ? f("name-error") : undefined}
          className={INPUT}
        />
      </Field>

      <Field
        label="Their words"
        htmlFor={f("quote")}
        error={errors.quote}
        errorId={f("quote-error")}
      >
        <textarea
          id={f("quote")}
          data-field="quote"
          rows={5}
          value={values.quote}
          onChange={(e) => onChange({ quote: e.target.value })}
          aria-invalid={!!errors.quote || undefined}
          aria-describedby={errors.quote ? f("quote-error") : undefined}
          className={cn(INPUT, "leading-relaxed")}
        />
      </Field>

      <Field
        label="Role or job"
        htmlFor={f("role")}
        hint={
          alumni
            ? "What they do now, for example Pilot."
            : `Leave empty to show “Parent, ${storySchoolLabel(values.school_slug)}”.`
        }
        hintId={f("role-hint")}
      >
        <input
          id={f("role")}
          type="text"
          autoComplete="off"
          value={values.relationship}
          onChange={(e) => onChange({ relationship: e.target.value })}
          aria-describedby={f("role-hint")}
          className={INPUT}
        />
      </Field>

      {alumni ? (
        <>
          <Field label="Company" htmlFor={f("company")} hint="Optional." hintId={f("company-hint")}>
            <input
              id={f("company")}
              type="text"
              autoComplete="off"
              value={values.company}
              onChange={(e) => onChange({ company: e.target.value })}
              aria-describedby={f("company-hint")}
              className={INPUT}
            />
          </Field>
          <Field
            label="Class of"
            htmlFor={f("year")}
            error={errors.grad_year}
            errorId={f("year-error")}
          >
            <input
              id={f("year")}
              data-field="grad_year"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              placeholder="e.g. 2018"
              value={values.grad_year}
              onChange={(e) => onChange({ grad_year: e.target.value })}
              aria-invalid={!!errors.grad_year || undefined}
              aria-describedby={errors.grad_year ? f("year-error") : undefined}
              className={cn(INPUT, "max-w-[10rem] tabular-nums")}
            />
          </Field>
        </>
      ) : null}

      <Field
        label="School"
        htmlFor={f("school")}
        error={errors.school_slug}
        errorId={f("school-error")}
      >
        <select
          id={f("school")}
          data-field="school_slug"
          value={values.school_slug}
          onChange={(e) => onChange({ school_slug: e.target.value })}
          aria-invalid={!!errors.school_slug || undefined}
          aria-describedby={errors.school_slug ? f("school-error") : undefined}
          className={INPUT}
        >
          {SCHOOL_OPTIONS.map((slug) => (
            <option key={slug} value={slug}>
              {schoolLabel(slug)}
            </option>
          ))}
        </select>
      </Field>

      {isNew ? (
        <div>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-3 text-sm leading-snug text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={values.consent}
              onChange={(e) => onChange({ consent: e.target.checked })}
              data-field="consent"
              aria-invalid={!!errors.consent || undefined}
              aria-describedby={errors.consent ? f("consent-error") : undefined}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-deep-blue)]"
            />
            <span>{STAFF_CONSENT_TEXT}</span>
          </label>
          <FieldError id={f("consent-error")} message={errors.consent} />
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  hintId,
  error,
  errorId,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  hintId?: string;
  error?: string;
  errorId?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-[var(--color-deep-blue)]"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="text-xs leading-snug text-[var(--color-ink-soft)]">
          {hint}
        </p>
      ) : null}
      {errorId ? <FieldError id={errorId} message={error} /> : null}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm leading-snug text-[var(--color-danger)]">
      {message}
    </p>
  );
}
