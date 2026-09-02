import { T } from "@/components/type-roles";

/**
 * Shared presentation for the academic blocks on the secondary school pages.
 *
 * These components carry NO content. Every list is passed in as data and lives
 * in the page that renders it, so Alpha High and Alpha Girls can diverge later
 * without a refactor. Sharing the copy is exactly how the two pages became the
 * same page; sharing only the presentation is the fix.
 *
 * Tokens only — no new colours, type sizes or component shapes.
 */


export type Combination = { code: string; subjects: string };
export type CombinationGroup = { group: string; items: ReadonlyArray<Combination> };

/**
 * A-Level combinations, grouped. Renders code and subjects inline — never
 * behind a title attribute, which is unreachable on a touchscreen and
 * invisible to a screen reader. The subjects are the decision-relevant fact
 * for a Form 5 parent, so they are always on the page.
 */
export function CombinationList({
  groups,
  accent = "var(--color-deep-blue)",
}: {
  groups: ReadonlyArray<CombinationGroup>;
  accent?: string;
}) {
  return (
    <div className="grid gap-[var(--space-card-gap)] md:grid-cols-3">
      {groups.map((g) => (
        <section
          key={g.group}
          className="rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] shadow-[var(--card-shadow)]"
        >
          <h3 style={{ ...T.label, color: accent }}>{g.group}</h3>
          <ul className="mt-4 grid gap-3">
            {g.items.map((c) => (
              <li key={c.code}>
                <span
                  className="font-mono font-bold text-[var(--color-ink)]"
                  style={{ fontSize: "var(--text-body)" }}
                >
                  {c.code}
                </span>
                <span className="mt-0.5 block text-[var(--color-ink-soft)]" style={T.body}>
                  {c.subjects}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** The full list of examinable subjects a school offers. */
export function SubjectPillList({ items }: { items: ReadonlyArray<string> }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((s) => (
        <li
          key={s}
          className="rounded-[var(--radius-btn)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-[var(--color-deep-blue)]"
          style={T.body}
        >
          {s}
        </li>
      ))}
    </ul>
  );
}

export type FormOptions = { form: string; note?: string; items: ReadonlyArray<string> };

/**
 * Option subjects per form. A different thing from the subject list above —
 * the subject list is what the school teaches, this is what a pupil in a given
 * form may choose between.
 */
export function FormOptionsList({ forms }: { forms: ReadonlyArray<FormOptions> }) {
  return (
    <div className="grid gap-[var(--space-card-gap)] sm:grid-cols-2">
      {forms.map((f) => (
        <section
          key={f.form}
          className="rounded-[var(--radius-card)] border border-[var(--color-hairline)] p-[var(--space-card-pad)]"
        >
          <h3 className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
            {f.form}
          </h3>
          {f.note && (
            <p className="mt-1 text-[var(--color-ink-soft)]" style={T.label}>
              {f.note}
            </p>
          )}
          <ul className="mt-4 grid gap-2">
            {f.items.map((s) => (
              <li key={s} className="flex gap-2 text-[var(--color-ink)]" style={T.body}>
                <span aria-hidden className="text-[var(--color-gold)]">
                  ·
                </span>
                {s}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
