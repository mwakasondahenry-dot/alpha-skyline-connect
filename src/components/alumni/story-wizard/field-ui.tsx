/** Shared form pieces for the story wizard. Tokens only; see src/styles.css. */
import type { ReactNode } from "react";
import { T } from "@/components/type-roles";

export const INPUT =
  "mt-2 w-full rounded-xl border border-[var(--color-deep-blue)]/15 " +
  "bg-[var(--color-off-white)] px-4 py-3 text-[var(--color-ink)] " +
  "focus:border-[var(--color-bright-blue)] focus:outline-none";

export const CARD =
  "rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] shadow-[var(--card-shadow)]";

export const BTN_PRIMARY =
  "inline-flex min-h-[var(--btn-primary-min-h)] items-center justify-center rounded-[var(--radius-btn)] " +
  "bg-[var(--color-gold)] px-[var(--btn-primary-pad-x)] font-display text-[var(--color-accent-foreground)] " +
  "transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] disabled:cursor-not-allowed " +
  "disabled:opacity-50 disabled:hover:scale-100 motion-reduce:transition-none";

export const BTN_PRIMARY_STYLE = { ...T.body, fontWeight: "var(--btn-primary-weight)" };

export const BTN_SECONDARY =
  "inline-flex min-h-[var(--btn-primary-min-h)] items-center justify-center gap-2 rounded-[var(--radius-btn)] " +
  "border border-[var(--color-deep-blue)]/15 bg-[var(--color-off-white)] px-4 text-[var(--color-deep-blue)] " +
  "transition-colors duration-150 hover:bg-[var(--color-surface-muted)] motion-reduce:transition-none";

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="text-[var(--color-deep-blue)]" style={T.label}>
      {children}
      {required && <span aria-hidden className="text-[var(--color-danger)]"> *</span>}
    </span>
  );
}

export function TextField({
  label,
  value,
  onChange,
  required,
  maxLength,
  placeholder,
  autoComplete,
  numeric,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  autoComplete?: string;
  /** Numeric keypad without type="number", which scrolls on Android. */
  numeric?: boolean;
}) {
  return (
    <label className="block">
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type="text"
        inputMode={numeric ? "numeric" : undefined}
        pattern={numeric ? "[0-9]*" : undefined}
        value={value}
        onChange={(e) => onChange(numeric ? e.target.value.replace(/\D/g, "").slice(0, 4) : e.target.value)}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={INPUT}
        style={T.body}
      />
    </label>
  );
}

export function CountedTextArea({
  id,
  label,
  value,
  onChange,
  max,
  required,
  rows = 4,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  required?: boolean;
  rows?: number;
}) {
  const remaining = max - value.length;
  return (
    <label className="block">
      <span className="flex flex-wrap items-baseline justify-between gap-2">
        <FieldLabel required={required}>{label}</FieldLabel>
        <span
          aria-hidden
          style={T.label}
          className={remaining < 0 ? "text-[var(--color-danger)]" : "text-[var(--color-ink-soft)]"}
        >
          {remaining}
        </span>
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        required={required}
        aria-describedby={`${id}-count`}
        className={`${INPUT} resize-y`}
        style={T.body}
      />
      <span id={`${id}-count`} className="sr-only" aria-live="polite">
        {remaining <= 40 ? `${remaining} characters remaining` : ""}
      </span>
    </label>
  );
}
