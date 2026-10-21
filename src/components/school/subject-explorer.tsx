import { useId, useMemo, useState, type CSSProperties } from "react";
import { Search, ChevronDown } from "lucide-react";
import { T } from "@/components/type-roles";
import type { CombinationGroup, FormOptions } from "@/components/school/subject-lists";

/**
 * The academics of a secondary school as one interactive post: pick a level,
 * pick a form or a stream, search a subject, and the lists narrow to what
 * matters to that reader. Nothing is dropped: with no filter set, every
 * subject, every form's options and every combination are on the page, which
 * is also what a reader with the bundle dead gets.
 *
 * Carries no content of its own. The lists are the school's confirmed data,
 * passed in by the page.
 */

type Level = "o" | "a";

const subjectName = (s: FormOptions["items"][number]) => (typeof s === "string" ? s : s.name);

const accentVar = (accent?: string): CSSProperties | undefined =>
  accent ? ({ "--dl-accent": accent } as CSSProperties) : undefined;

const matches = (text: string, q: string) => text.toLowerCase().includes(q.trim().toLowerCase());

export function SubjectExplorer({
  subjects,
  forms,
  combos,
  accent,
  /** Rendered under the full subject list; the page passes its placeholder. */
  subjectsNote,
}: {
  subjects: ReadonlyArray<string>;
  forms: ReadonlyArray<FormOptions>;
  combos: ReadonlyArray<CombinationGroup>;
  accent?: string;
  subjectsNote?: React.ReactNode;
}) {
  const [level, setLevel] = useState<Level>("o");
  const [form, setForm] = useState<string>("all");
  const [stream, setStream] = useState<string>("all");
  const [q, setQ] = useState("");
  const searchId = useId();
  const formId = useId();

  const shownForms = useMemo(
    () => forms.filter((f) => form === "all" || f.form === form),
    [forms, form],
  );
  const shownSubjects = useMemo(() => subjects.filter((s) => matches(s, q)), [subjects, q]);
  const shownCombos = useMemo(
    () =>
      combos
        .filter((g) => stream === "all" || g.group === stream)
        .map((g) => ({ ...g, items: g.items.filter((c) => matches(`${c.code} ${c.subjects}`, q)) }))
        .filter((g) => g.items.length > 0),
    [combos, stream, q],
  );
  const comboCount = shownCombos.reduce((n, g) => n + g.items.length, 0);
  const totalCombos = combos.reduce((n, g) => n + g.items.length, 0);

  const chip = (on: boolean) => ({
    className: "dl-chip",
    "aria-pressed": on,
    style: { ...T.body, fontWeight: 700 } as CSSProperties,
  });

  return (
    <div style={accentVar(accent)}>
      {/* Level */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a level">
        <button type="button" {...chip(level === "o")} onClick={() => setLevel("o")}>
          O-Level <span className="dl-chip__count">Form 1–4</span>
        </button>
        <button type="button" {...chip(level === "a")} onClick={() => setLevel("a")}>
          A-Level <span className="dl-chip__count">Form 5–6</span>
        </button>
      </div>

      {/* Filters for the chosen level, plus search */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {level === "o" ? (
          <label className="relative inline-flex items-center">
            <span className="sr-only" id={formId}>
              Show option subjects for
            </span>
            <select
              aria-labelledby={formId}
              value={form}
              onChange={(e) => setForm(e.target.value)}
              className="appearance-none rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-white py-2 pl-3.5 pr-9 font-display text-[var(--color-deep-blue)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
              style={{ ...T.body, fontWeight: 700 }}
            >
              <option value="all">All forms</option>
              {forms.map((f) => (
                <option key={f.form} value={f.form}>
                  {f.form}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-3 h-4 w-4 text-[var(--color-deep-blue)]"
            />
          </label>
        ) : (
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter combinations by stream"
          >
            <button type="button" {...chip(stream === "all")} onClick={() => setStream("all")}>
              All <span className="dl-chip__count">{totalCombos}</span>
            </button>
            {combos.map((g) => (
              <button
                key={g.group}
                type="button"
                {...chip(stream === g.group)}
                onClick={() => setStream(g.group)}
              >
                {g.group} <span className="dl-chip__count">{g.items.length}</span>
              </button>
            ))}
          </div>
        )}

        <label className="relative ml-auto flex min-w-[12rem] flex-1 items-center sm:max-w-xs">
          <span className="sr-only" id={searchId}>
            Search subjects
          </span>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--color-ink-soft)]"
          />
          <input
            type="search"
            aria-labelledby={searchId}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={level === "o" ? "Search a subject" : "Search a subject or code"}
            className="w-full rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-white py-2 pl-9 pr-3 text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
            style={T.body}
          />
        </label>
      </div>

      {level === "o" ? (
        <div className="mt-6">
          {form === "all" ? (
            /* Default: the whole list once, compact. The per-form options
               appear when a form is chosen, so the post stays a post and not
               a chapter of tables. */
            <div>
              <h4
                className="flex items-baseline gap-2 font-display text-[var(--color-deep-blue)]"
                style={T.cardTitle}
              >
                All subjects taught
                <span
                  className="text-[var(--color-ink-soft)]"
                  style={{ ...T.body, fontWeight: 600 }}
                >
                  {shownSubjects.length} of {subjects.length}
                </span>
              </h4>
              <p className="mt-1 text-[var(--color-ink-soft)]" style={T.body}>
                Every subject examinable at O-Level. Choose a form above to see what a pupil in that
                form picks between.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {shownSubjects.map((s) => (
                  <li
                    key={s}
                    className="rounded-[var(--radius-pill)] bg-[var(--color-off-white)] px-3 py-1 text-[var(--color-ink)] ring-1 ring-[var(--color-hairline)]"
                    style={{ ...T.body, fontWeight: 600 }}
                  >
                    {s}
                  </li>
                ))}
                {shownSubjects.length === 0 && (
                  <li className="text-[var(--color-ink-soft)]" style={T.body}>
                    No subject matches &ldquo;{q}&rdquo;.
                  </li>
                )}
              </ul>
              {subjectsNote}
            </div>
          ) : (
            shownForms.map((f) => {
              const items = f.items.filter((s) => matches(subjectName(s), q));
              return (
                <div key={f.form}>
                  <h4
                    className="flex items-baseline gap-2 font-display text-[var(--color-deep-blue)]"
                    style={T.cardTitle}
                  >
                    {f.form}
                    <span
                      className="text-[var(--color-ink-soft)]"
                      style={{ ...T.body, fontWeight: 600 }}
                    >
                      {items.length} of {f.items.length} option subjects
                    </span>
                  </h4>
                  <p className="mt-1 text-[var(--color-ink-soft)]" style={T.body}>
                    {f.note ? `${f.note}. ` : ""}What a pupil in {f.form} may choose between, on top
                    of the subjects every pupil takes.
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {items.map((s) => (
                      <li
                        key={subjectName(s)}
                        className="rounded-[var(--radius-pill)] bg-[var(--color-off-white)] px-3 py-1 text-[var(--color-ink)] ring-1 ring-[var(--color-hairline)]"
                        style={{ ...T.body, fontWeight: 600 }}
                      >
                        {subjectName(s)}
                      </li>
                    ))}
                    {items.length === 0 && (
                      <li className="text-[var(--color-ink-soft)]" style={T.body}>
                        No option subject matches &ldquo;{q}&rdquo; in {f.form}.
                      </li>
                    )}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="mt-6">
          <h4
            className="flex items-baseline gap-2 font-display text-[var(--color-deep-blue)]"
            style={T.cardTitle}
          >
            A-Level combinations
            <span className="text-[var(--color-ink-soft)]" style={{ ...T.body, fontWeight: 600 }}>
              {comboCount} of {totalCombos}
            </span>
          </h4>
          <p className="mt-1 text-[var(--color-ink-soft)]" style={T.body}>
            Form 5&ndash;6, ACSEE. Open a combination to see its three subjects.
          </p>
          <div className="mt-4 space-y-5">
            {shownCombos.map((g) => (
              <div key={g.group}>
                <p
                  className="font-display text-[var(--color-deep-blue)]"
                  style={{ ...T.body, fontWeight: 800 }}
                >
                  {g.group}
                </p>
                <ul className="mt-2 border-t border-[var(--color-hairline)]">
                  {g.items.map((c) => (
                    <li key={c.code} className="border-b border-[var(--color-hairline)]">
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center gap-3 py-2.5 [&::-webkit-details-marker]:hidden">
                          <span
                            className="rounded-md px-2 py-0.5 font-mono text-white"
                            style={{
                              background: "var(--dl-accent, var(--color-deep-blue))",
                              fontSize: "var(--text-body)",
                              fontWeight: 700,
                            }}
                          >
                            {c.code}
                          </span>
                          <span
                            className="min-w-0 flex-1 truncate text-[var(--color-ink)] group-open:whitespace-normal"
                            style={T.body}
                          >
                            {c.subjects}
                          </span>
                          <ChevronDown
                            aria-hidden
                            className="h-4 w-4 shrink-0 text-[var(--color-ink-soft)] transition-transform group-open:rotate-180"
                          />
                        </summary>
                        <ul className="mb-3 ml-1 flex flex-wrap gap-2">
                          {c.subjects.split("·").map((s) => (
                            <li
                              key={s.trim()}
                              className="rounded-[var(--radius-pill)] bg-[var(--color-off-white)] px-3 py-1 text-[var(--color-ink)] ring-1 ring-[var(--color-hairline)]"
                              style={{ ...T.body, fontWeight: 600 }}
                            >
                              {s.trim()}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {shownCombos.length === 0 && (
              <p className="text-[var(--color-ink-soft)]" style={T.body}>
                No combination matches &ldquo;{q}&rdquo;{stream !== "all" ? ` in ${stream}` : ""}.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
