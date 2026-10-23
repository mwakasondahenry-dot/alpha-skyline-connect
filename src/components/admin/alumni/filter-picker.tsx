/**
 * What a filter chip opens: the choices for one filter, each with how many
 * former students it would show. Choices apply at once, so the counts and the
 * list behind the sheet follow every tap; "Show …" closes it.
 *
 * The Class of picker (owner request 2026-10-23: "filter by graduation
 * year") lists every year present, newest first, as "2019 · 14". A tap on a
 * year shows that one class and closes the sheet; From and To set a range,
 * and the decade picks set one in a tap.
 */
import { useId } from "react";
import { Check } from "lucide-react";
import { AdminButton } from "@/components/admin/kit";
import type { AlumniFilters, facetCounts } from "@/lib/admin/alumni-directory";
import {
  DECADES,
  HAS_LABEL,
  HAS_OPTIONS,
  INVITE_OPTIONS,
  STORY_OPTIONS,
  cityRows,
  inviteLabel,
  resultLine,
  schoolRows,
  storyLabel,
  toggle,
  yearRows,
  type OptionRow,
  type PickerFacet,
} from "@/lib/admin/alumni-view";
import { cn } from "@/lib/utils";

type Counts = ReturnType<typeof facetCounts>;

export function FilterPicker({
  facet,
  filters,
  counts,
  hasCounts,
  resultCount,
  onChange,
  onDone,
}: {
  facet: PickerFacet;
  filters: AlumniFilters;
  counts: Counts;
  hasCounts: Record<AlumniFilters["has"][number], number>;
  /** How many the list shows with the filters as they are now. */
  resultCount: number;
  onChange: (next: AlumniFilters) => void;
  onDone: () => void;
}) {
  return (
    <div className="space-y-5">
      {facet === "year" ? (
        <YearPicker filters={filters} counts={counts.year} onChange={onChange} onDone={onDone} />
      ) : facet === "school" ? (
        <Checklist
          label="School"
          rows={schoolRows(counts.school)}
          chosen={filters.schools}
          onToggle={(v) => onChange({ ...filters, schools: toggle(filters.schools, v) })}
        />
      ) : facet === "story" ? (
        <Checklist
          label="Story"
          rows={STORY_OPTIONS.map((s) => ({
            value: s,
            label: storyLabel(s),
            count: counts.story[s] ?? 0,
          }))}
          chosen={filters.story}
          onToggle={(v) =>
            onChange({
              ...filters,
              story: toggle(filters.story, v as (typeof STORY_OPTIONS)[number]),
            })
          }
        />
      ) : facet === "invite" ? (
        <Checklist
          label="Invite"
          rows={INVITE_OPTIONS.map((s) => ({
            value: s,
            label: inviteLabel(s),
            count: counts.invite[s] ?? 0,
          }))}
          chosen={filters.invite}
          onToggle={(v) =>
            onChange({
              ...filters,
              invite: toggle(filters.invite, v as (typeof INVITE_OPTIONS)[number]),
            })
          }
        />
      ) : facet === "city" ? (
        <Checklist
          label="City or country"
          rows={cityRows(counts.city, filters.cities)}
          chosen={filters.cities}
          empty="No city or country recorded yet."
          onToggle={(v) => onChange({ ...filters, cities: toggle(filters.cities, v) })}
        />
      ) : (
        <Checklist
          label="Contact and photo"
          rows={HAS_OPTIONS.map((h) => ({ value: h, label: HAS_LABEL[h], count: hasCounts[h] }))}
          chosen={filters.has}
          onToggle={(v) =>
            onChange({ ...filters, has: toggle(filters.has, v as (typeof HAS_OPTIONS)[number]) })
          }
        />
      )}

      <AdminButton variant="primary" className="w-full" onClick={onDone}>
        Show {resultLine(resultCount, 0)}
      </AdminButton>
    </div>
  );
}

function Checklist({
  label,
  rows,
  chosen,
  onToggle,
  empty,
}: {
  label: string;
  rows: OptionRow[];
  chosen: string[];
  onToggle: (value: string) => void;
  empty?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--color-ink-soft)]">{empty}</p>;
  }
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <ul className="divide-y divide-[var(--color-hairline)]">
        {rows.map((r) => (
          <li key={r.value}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 py-1 text-sm text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={chosen.includes(r.value)}
                onChange={() => onToggle(r.value)}
                className="h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-deep-blue)]"
              />
              <span className="min-w-0 flex-1 break-words">{r.label}</span>
              <span className="shrink-0 tabular-nums text-[var(--color-ink-soft)]">{r.count}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

function YearPicker({
  filters,
  counts,
  onChange,
  onDone,
}: {
  filters: AlumniFilters;
  counts: Record<string, number>;
  onChange: (next: AlumniFilters) => void;
  onDone: () => void;
}) {
  const id = useId();
  const rows = yearRows(counts);
  const { yearFrom: from, yearTo: to } = filters;
  // The years present, plus a chosen end that has no one in it (a decade pick).
  const options = [...new Set([...rows.map((r) => r.year), from, to])]
    .filter((y): y is number => y !== null)
    .sort((a, b) => a - b);

  function setRange(nextFrom: number | null, nextTo: number | null) {
    // A reversed range is turned round rather than matching nobody.
    if (nextFrom !== null && nextTo !== null && nextFrom > nextTo) {
      [nextFrom, nextTo] = [nextTo, nextFrom];
    }
    onChange({ ...filters, yearFrom: nextFrom, yearTo: nextTo });
  }

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--color-ink-soft)]">No class years recorded yet.</p>;
  }

  const selectClass =
    "min-h-11 w-full rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]";

  return (
    <>
      <section aria-labelledby={`${id}-one`}>
        <h3
          id={`${id}-one`}
          className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-deep-blue)]"
        >
          One class
        </h3>
        <ul className="divide-y divide-[var(--color-hairline)]">
          {rows.map((r) => {
            const single = from === r.year && to === r.year;
            const inRange =
              (from !== null || to !== null) &&
              (from === null || r.year >= from) &&
              (to === null || r.year <= to);
            return (
              <li key={r.year}>
                <button
                  type="button"
                  aria-pressed={single}
                  onClick={() => {
                    setRange(r.year, r.year);
                    onDone();
                  }}
                  className={cn(
                    "admin-hover flex min-h-11 w-full cursor-pointer items-center gap-3 px-2 text-left text-sm tabular-nums text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-gold)]",
                    inRange && "font-semibold text-[var(--color-deep-blue)]",
                  )}
                >
                  <span className="flex-1">{r.label}</span>
                  {inRange ? (
                    <Check aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby={`${id}-range`} className="space-y-3">
        <h3
          id={`${id}-range`}
          className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-deep-blue)]"
        >
          A range of classes
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm font-semibold text-[var(--color-deep-blue)]">
            <span className="block">From</span>
            <select
              className={selectClass}
              value={from ?? ""}
              onChange={(e) => setRange(e.target.value ? Number(e.target.value) : null, to)}
            >
              <option value="">Any year</option>
              {options.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-[var(--color-deep-blue)]">
            <span className="block">To</span>
            <select
              className={selectClass}
              value={to ?? ""}
              onChange={(e) => setRange(from, e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Any year</option>
              {options.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Decades">
          {DECADES.map((d) => (
            <AdminButton
              key={d.label}
              variant="secondary"
              aria-pressed={from === d.from && to === d.to}
              className="aria-pressed:border-[var(--color-deep-blue)] aria-pressed:bg-[var(--color-surface-muted)]"
              onClick={() => setRange(d.from, d.to)}
            >
              {d.label}
            </AdminButton>
          ))}
          {from !== null || to !== null ? (
            <AdminButton variant="quiet" onClick={() => setRange(null, null)}>
              Any class year
            </AdminButton>
          ) : null}
        </div>
      </section>
    </>
  );
}
