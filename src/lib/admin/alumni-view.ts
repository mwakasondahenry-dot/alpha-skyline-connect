/**
 * View helpers for the Alumni screens: labels, picker rows, chips and the
 * result line. Pure, so the screens stay thin and this stays testable. The
 * merging, filtering and CSV live in ./alumni-directory.
 */
import { normalizeTzPhone } from "@/lib/invites/phone";
import {
  EMPTY_FILTERS,
  filterAlumni,
  filtersToParams,
  type AlumniFilters,
  type AlumniPerson,
} from "./alumni-directory";
import { schoolLabel } from "./format";
import { STATUS_LABEL, type StoryStatus } from "./story-status";

type InviteStatus = AlumniPerson["inviteStatus"];
type Has = AlumniFilters["has"][number];

/** "+255712345678" → "+255 712 345 678". Other checked numbers stay in E.164; anything unreadable as written. */
export function formatPhoneDisplay(raw: string | null | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  const n = normalizeTzPhone(t);
  if (!n.ok) return t;
  const m = n.phone.match(/^\+255(\d{3})(\d{3})(\d{3})$/);
  return m ? `+255 ${m[1]} ${m[2]} ${m[3]}` : n.phone;
}

export function yearChipLabel(from: number | null, to: number | null): string | null {
  if (from !== null && to !== null) {
    return from === to ? `Class of ${from}` : `Class of ${from}–${to}`;
  }
  if (from !== null) return `Class of ${from} or later`;
  if (to !== null) return `Class of ${to} or earlier`;
  return null;
}

export type YearRow = { year: number; count: number; label: string };

/** Every graduation year present, newest first, as "2019 · 14". */
export function yearRows(counts: Record<string, number>): YearRow[] {
  return Object.entries(counts)
    .filter(([k]) => /^\d{4}$/.test(k))
    .map(([k, count]) => ({ year: Number(k), count, label: `${k} · ${count}` }))
    .sort((a, b) => b.year - a.year);
}

export const DECADES = [
  { label: "2020s", from: 2020, to: 2029 },
  { label: "2010s", from: 2010, to: 2019 },
  { label: "2000s", from: 2000, to: 2009 },
] as const;

export function personSchoolLabel(slug: string | null): string {
  if (slug === null || slug === "none") return "Not recorded";
  return schoolLabel(slug);
}

export function storyLabel(status: StoryStatus | "none" | null): string {
  return status === null || status === "none"
    ? "No story"
    : `Story ${STATUS_LABEL[status].toLowerCase()}`;
}

const INVITE_LABEL: Record<InviteStatus, string> = {
  "not-invited": "Not invited",
  pending: "Invited",
  opened: "Opened",
  submitted: "Submitted",
};

export function inviteLabel(status: InviteStatus): string {
  return INVITE_LABEL[status];
}

export const INVITE_OPTIONS: InviteStatus[] = ["not-invited", "pending", "opened", "submitted"];
export const STORY_OPTIONS: Array<StoryStatus | "none"> = [
  "none",
  "waiting",
  "live",
  "hidden",
  "declined",
];

export const HAS_LABEL: Record<Has, string> = {
  photo: "Has photo",
  email: "Has email",
  phone: "Has phone",
};
export const HAS_OPTIONS: Has[] = ["photo", "email", "phone"];

export const SORT_LABEL: Record<AlumniFilters["sort"], string> = {
  year: "Class year, newest first",
  name: "Name A–Z",
  recent: "Recently added",
};

export function classAndSchool(p: Pick<AlumniPerson, "grad_year" | "school_slug">): string {
  const cls = p.grad_year === null ? "Class not recorded" : `Class of ${p.grad_year}`;
  return `${cls} · ${personSchoolLabel(p.school_slug)}`;
}

export function roleAtCompany(p: Pick<AlumniPerson, "role" | "company">): string | null {
  if (p.role && p.company) return `${p.role} at ${p.company}`;
  return p.role ?? p.company ?? null;
}

export type PickerFacet = "school" | "year" | "story" | "invite" | "city" | "has";

export const PICKER_TITLE: Record<PickerFacet, string> = {
  school: "School",
  year: "Class of",
  story: "Story",
  invite: "Invite",
  city: "City or country",
  has: "Contact and photo",
};

export type OptionRow = { value: string; label: string; count: number };

const SCHOOLS = ["alpha-high", "alpha-girls", "nursery-primary", "none"];

/** The three schools and Not recorded always; any other value present after them. */
export function schoolRows(counts: Record<string, number>): OptionRow[] {
  const extra = Object.keys(counts).filter((k) => !SCHOOLS.includes(k));
  return [...SCHOOLS.slice(0, 3), ...extra, "none"].map((value) => ({
    value,
    label: personSchoolLabel(value),
    count: counts[value] ?? 0,
  }));
}

/** Cities present, most people first then A–Z; chosen ones stay listed even at 0. */
export function cityRows(counts: Record<string, number>, chosen: string[]): OptionRow[] {
  const rows = Object.entries(counts)
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  for (const c of chosen) {
    if (!(c in counts)) rows.push({ value: c, label: c, count: 0 });
  }
  return rows;
}

/** How many would match with each "has" requirement added to the current filters. */
export function hasCounts(people: AlumniPerson[], f: AlumniFilters): Record<Has, number> {
  const out = {} as Record<Has, number>;
  for (const h of HAS_OPTIONS) {
    const has = f.has.includes(h) ? f.has : [...f.has, h];
    out[h] = filterAlumni(people, { ...f, has }).length;
  }
  return out;
}

export function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export type FilterChip = {
  id: string;
  label: string;
  remove: (f: AlumniFilters) => AlumniFilters;
};

/** One removable chip per chosen value, one for the year range. Search and sort are not chips. */
export function activeChips(f: AlumniFilters): FilterChip[] {
  const chips: FilterChip[] = [];
  for (const s of f.schools) {
    chips.push({
      id: `school:${s}`,
      label: personSchoolLabel(s),
      remove: (x) => ({ ...x, schools: x.schools.filter((v) => v !== s) }),
    });
  }
  const year = yearChipLabel(f.yearFrom, f.yearTo);
  if (year) {
    chips.push({
      id: "year",
      label: year,
      remove: (x) => ({ ...x, yearFrom: null, yearTo: null }),
    });
  }
  for (const s of f.story) {
    chips.push({
      id: `story:${s}`,
      label: storyLabel(s),
      remove: (x) => ({ ...x, story: x.story.filter((v) => v !== s) }),
    });
  }
  for (const s of f.invite) {
    chips.push({
      id: `invite:${s}`,
      label: inviteLabel(s),
      remove: (x) => ({ ...x, invite: x.invite.filter((v) => v !== s) }),
    });
  }
  for (const c of f.cities) {
    chips.push({
      id: `city:${c}`,
      label: c,
      remove: (x) => ({ ...x, cities: x.cities.filter((v) => v !== c) }),
    });
  }
  for (const h of f.has) {
    chips.push({
      id: `has:${h}`,
      label: HAS_LABEL[h],
      remove: (x) => ({ ...x, has: x.has.filter((v) => v !== h) }),
    });
  }
  return chips;
}

export function activeFilterCount(f: AlumniFilters): number {
  return activeChips(f).length;
}

/** Everything cleared except the search and the sort. */
export function clearFilters(f: AlumniFilters): AlumniFilters {
  return { ...EMPTY_FILTERS, q: f.q, sort: f.sort };
}

export function resultLine(n: number, filters: number): string {
  const people = `${n} former ${n === 1 ? "student" : "students"}`;
  if (filters === 0) return people;
  return `${people} · ${filters} ${filters === 1 ? "filter" : "filters"}`;
}

/** How many people the list draws at once; a phone stays quick with thousands. */
export const ALUMNI_PAGE = 200;

export type AlumniPageView<T> = {
  visible: T[];
  /** "Showing 200 of 512", or null when everything is shown. */
  showing: string | null;
  /** "Show 200 more", or null when nothing is left. */
  moreLabel: string | null;
  nextLimit: number;
};

/** The first `limit` matches, and what the "show more" control should say. */
export function alumniPage<T>(items: T[], limit: number): AlumniPageView<T> {
  const visible = items.length > limit ? items.slice(0, limit) : items;
  const left = items.length - visible.length;
  return {
    visible,
    showing: left > 0 ? `Showing ${visible.length} of ${items.length}` : null,
    moreLabel: left > 0 ? `Show ${Math.min(ALUMNI_PAGE, left)} more` : null,
    nextLimit: limit + ALUMNI_PAGE,
  };
}

export type AlumniSearch = Partial<
  Record<"q" | "schools" | "story" | "invite" | "cities" | "has" | "sort", string> &
    Record<"yearFrom" | "yearTo", number>
>;

/** The address's search params: filtersToParams, with years as numbers so they read 2019, not "2019". */
export function alumniSearch(f: AlumniFilters): AlumniSearch {
  const { yearFrom, yearTo, ...rest } = filtersToParams(f);
  const out: AlumniSearch = { ...rest };
  if (yearFrom !== undefined) out.yearFrom = Number(yearFrom);
  if (yearTo !== undefined) out.yearTo = Number(yearTo);
  return out;
}

const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Dar_es_Salaam",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function alumniCsvFilename(now: Date = new Date()): string {
  return `alpha-alumni-${dayKey.format(now)}.csv`;
}
