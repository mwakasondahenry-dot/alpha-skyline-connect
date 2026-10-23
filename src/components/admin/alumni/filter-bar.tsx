/**
 * The top of the Alumni list: the search box (name, phone, email, company,
 * role, city; it matches as you type), a chip per filter that opens its
 * picker, the sort, and the active filters as removable chips with Clear all.
 *
 * The search waits 150ms after the last key before it changes the address,
 * so typing stays quick; everything else changes it at once. Nothing here
 * animates: filters never do.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { AdminSheet } from "@/components/admin/kit";
import type { AlumniFilters, facetCounts } from "@/lib/admin/alumni-directory";
import {
  PICKER_TITLE,
  SORT_LABEL,
  activeChips,
  clearFilters,
  yearChipLabel,
  type PickerFacet,
} from "@/lib/admin/alumni-view";
import { cn } from "@/lib/utils";
import { FilterPicker } from "./filter-picker";

const SEARCH_WAIT_MS = 150;
const FACETS: PickerFacet[] = ["school", "year", "story", "invite", "city", "has"];
const SORTS = Object.keys(SORT_LABEL) as AlumniFilters["sort"][];

export function FilterBar({
  filters,
  counts,
  hasCounts,
  resultCount,
  onChange,
}: {
  filters: AlumniFilters;
  counts: ReturnType<typeof facetCounts>;
  hasCounts: Record<AlumniFilters["has"][number], number>;
  resultCount: number;
  onChange: (next: AlumniFilters) => void;
}) {
  const [open, setOpen] = useState<PickerFacet | null>(null);
  const chips = activeChips(filters);

  return (
    <div className="space-y-3">
      <SearchBox filters={filters} onChange={onChange} />

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filters">
        {FACETS.map((f) => {
          const n = chosenCount(filters, f);
          const label =
            f === "year"
              ? (yearChipLabel(filters.yearFrom, filters.yearTo) ?? PICKER_TITLE.year)
              : PICKER_TITLE[f];
          return (
            <button
              key={f}
              type="button"
              aria-haspopup="dialog"
              onClick={() => setOpen(f)}
              className={cn(
                "admin-press inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[var(--radius-pill)] border px-3.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]",
                n > 0
                  ? "border-[var(--color-deep-blue)] bg-[var(--color-surface-muted)] text-[var(--color-deep-blue)]"
                  : "border-[var(--color-hairline)] bg-[var(--color-surface)] text-[var(--color-deep-blue)] hover:bg-[var(--color-surface-muted)]",
              )}
            >
              {label}
              {n > 0 && f !== "year" ? (
                <span className="tabular-nums">
                  <span aria-hidden>· {n}</span>
                  <span className="sr-only">, {n} chosen</span>
                </span>
              ) : null}
              <ChevronDown aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2} />
            </button>
          );
        })}
        <label className="ml-auto inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
          <span>Sort</span>
          <select
            value={filters.sort}
            onChange={(e) =>
              onChange({ ...filters, sort: e.target.value as AlumniFilters["sort"] })
            }
            className="min-h-11 rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 text-sm font-semibold text-[var(--color-deep-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {SORT_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {chips.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {chips.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onChange(c.remove(filters))}
                className="admin-press inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-deep-blue)] pl-3.5 pr-2.5 text-sm font-semibold text-[var(--color-surface)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              >
                {c.label}
                <X aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                <span className="sr-only">, remove this filter</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => onChange(clearFilters(filters))}
              className="admin-press inline-flex min-h-11 cursor-pointer items-center rounded-[var(--radius-btn)] px-3 text-sm font-semibold text-[var(--color-deep-blue)] underline underline-offset-4 hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            >
              Clear all
            </button>
          </li>
        </ul>
      ) : null}

      <AdminSheet
        open={open !== null}
        onOpenChange={(o) => {
          if (!o) setOpen(null);
        }}
        title={open ? PICKER_TITLE[open] : ""}
      >
        {open ? (
          <FilterPicker
            facet={open}
            filters={filters}
            counts={counts}
            hasCounts={hasCounts}
            resultCount={resultCount}
            onChange={onChange}
            onDone={() => setOpen(null)}
          />
        ) : null}
      </AdminSheet>
    </div>
  );
}

function chosenCount(f: AlumniFilters, facet: PickerFacet): number {
  switch (facet) {
    case "school":
      return f.schools.length;
    case "year":
      return f.yearFrom !== null || f.yearTo !== null ? 1 : 0;
    case "story":
      return f.story.length;
    case "invite":
      return f.invite.length;
    case "city":
      return f.cities.length;
    case "has":
      return f.has.length;
  }
}

/**
 * The search box keeps its own text and hands it to the address 150ms after
 * the last key. When the address changes for another reason (Back, a
 * bookmark), the box follows it.
 */
function SearchBox({
  filters,
  onChange,
}: {
  filters: AlumniFilters;
  onChange: (next: AlumniFilters) => void;
}) {
  const [draft, setDraft] = useState(filters.q);
  const [sent, setSent] = useState(filters.q);
  const [seen, setSeen] = useState(filters.q);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The latest filters, for the delayed send: chips tapped while typing stay.
  const latest = useRef(filters);
  useEffect(() => {
    latest.current = filters;
  }, [filters]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // The address's q changed, and not because this box sent it: follow it.
  if (filters.q !== seen) {
    setSeen(filters.q);
    if (filters.q !== sent) {
      setDraft(filters.q);
      setSent(filters.q);
    }
  }

  function type(value: string) {
    setDraft(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      setSent(value);
      onChange({ ...latest.current, q: value });
    }, SEARCH_WAIT_MS);
  }

  return (
    <div className="relative">
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-ink-soft)]"
        strokeWidth={2}
      />
      <input
        type="search"
        value={draft}
        onChange={(e) => type(e.target.value)}
        aria-label="Search former students"
        placeholder="Name, phone, email, company, city"
        autoComplete="off"
        enterKeyHint="search"
        className="min-h-12 w-full rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-[var(--color-surface)] pl-11 pr-3 text-base text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
      />
    </div>
  );
}
