/**
 * The alumni directory: one person per former student, merged from invites and
 * stories, with search, faceted filters, URL params and a CSV export.
 * Pure functions only, so the screen stays thin and this stays testable.
 */
import { normalizeTzPhone } from "@/lib/invites/phone";
import { schoolLabel } from "./format";
import { STATUS_LABEL, type StoryStatus } from "./story-status";
import type { AdminStory } from "./stories-data";

export type InviteRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  school_slug: string | null;
  grad_year: number | null;
  status: "pending" | "opened" | "submitted";
  created_at: string;
  submitted_at: string | null;
};

export type AlumniStoryRow = Pick<
  AdminStory,
  | "id"
  | "author_name"
  | "relationship"
  | "company"
  | "city_country"
  | "school_slug"
  | "grad_year"
  | "status"
  | "photo_url"
  | "answers"
  | "invite_id"
  | "created_at"
>;

export type AlumniPerson = {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  school_slug: string | null;
  grad_year: number | null;
  role: string | null;
  company: string | null;
  city: string | null;
  photo_url: string | null;
  storyId: string | null;
  storyStatus: StoryStatus | null;
  inviteId: string | null;
  inviteStatus: "not-invited" | "pending" | "opened" | "submitted";
  firstSeen: string;
};

const NONE = "none";
const STORY_STATUSES: StoryStatus[] = ["waiting", "live", "hidden", "declined"];
const INVITE_STATUSES: AlumniPerson["inviteStatus"][] = [
  "not-invited",
  "pending",
  "opened",
  "submitted",
];
const HAS_KEYS = ["photo", "email", "phone"] as const;
const SORTS = ["year", "name", "recent"] as const;

/* ---------- merge ---------- */

function text(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}

function storyContact(s: AlumniStoryRow): { phone: string | null; email: string | null } {
  const a = s.answers;
  const obj = a && typeof a === "object" && !Array.isArray(a) ? a : {};
  const rawPhone = text((obj as Record<string, unknown>).phone);
  const norm = rawPhone ? normalizeTzPhone(rawPhone) : null;
  return {
    phone: rawPhone ? (norm?.ok ? norm.phone : rawPhone) : null,
    email: text((obj as Record<string, unknown>).email),
  };
}

function invitePhone(i: InviteRow): string | null {
  const raw = text(i.phone);
  if (!raw) return null;
  const n = normalizeTzPhone(raw);
  return n.ok ? n.phone : raw;
}

function normalisedKey(raw: string | null): string | null {
  if (!raw) return null;
  const n = normalizeTzPhone(raw);
  return n.ok ? n.phone : null;
}

function time(iso: string | null | undefined): number {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

/** Newer source's value wins; the other fills in when the newer one is empty. */
function newer<T>(storyNewer: boolean, fromStory: T | null, fromInvite: T | null): T | null {
  const [first, second] = storyNewer ? [fromStory, fromInvite] : [fromInvite, fromStory];
  return first ?? second;
}

export function mergeAlumni(invites: InviteRow[], stories: AlumniStoryRow[]): AlumniPerson[] {
  const byId = new Map(invites.map((i) => [i.id, i]));
  const byPhone = new Map<string, InviteRow>();
  for (const i of invites) {
    const k = normalisedKey(i.phone);
    if (k && !byPhone.has(k)) byPhone.set(k, i);
  }

  const claimed = new Set<string>();
  const pairs: Array<{ story: AlumniStoryRow; invite: InviteRow | null }> = stories.map(
    (story) => ({ story, invite: null }),
  );

  // Pass 1: explicit link. Pass 2: phone match against invites still free.
  for (const p of pairs) {
    const inv = p.story.invite_id ? byId.get(p.story.invite_id) : undefined;
    if (inv && !claimed.has(inv.id)) {
      p.invite = inv;
      claimed.add(inv.id);
    }
  }
  for (const p of pairs) {
    if (p.invite) continue;
    const k = normalisedKey(storyContact(p.story).phone);
    const inv = k ? byPhone.get(k) : undefined;
    if (inv && !claimed.has(inv.id)) {
      p.invite = inv;
      claimed.add(inv.id);
    }
  }

  const people: AlumniPerson[] = [];

  for (const { story, invite } of pairs) {
    const c = storyContact(story);
    const storyNewer =
      !invite || time(story.created_at) >= time(invite.submitted_at ?? invite.created_at);
    const iPhone = invite ? invitePhone(invite) : null;
    people.push({
      key: `story:${story.id}`,
      name: text(story.author_name) ?? invite?.full_name ?? "",
      phone: newer(storyNewer, c.phone, iPhone),
      email: newer(storyNewer, c.email, text(invite?.email)),
      school_slug: newer(storyNewer, story.school_slug, invite?.school_slug ?? null),
      grad_year: newer(storyNewer, story.grad_year, invite?.grad_year ?? null),
      role: text(story.relationship),
      company: text(story.company),
      city: text(story.city_country),
      photo_url: text(story.photo_url),
      storyId: story.id,
      storyStatus: story.status,
      inviteId: invite?.id ?? null,
      inviteStatus: invite ? invite.status : "not-invited",
      firstSeen:
        invite && time(invite.created_at) < time(story.created_at)
          ? invite.created_at
          : story.created_at,
    });
  }

  for (const i of invites) {
    if (claimed.has(i.id)) continue;
    people.push({
      key: `invite:${i.id}`,
      name: i.full_name,
      phone: invitePhone(i),
      email: text(i.email),
      school_slug: i.school_slug,
      grad_year: i.grad_year,
      role: null,
      company: null,
      city: null,
      photo_url: null,
      storyId: null,
      storyStatus: null,
      inviteId: i.id,
      inviteStatus: i.status,
      firstSeen: i.created_at,
    });
  }

  return people;
}

/* ---------- filters ---------- */

export type AlumniFilters = {
  q: string;
  schools: string[];
  yearFrom: number | null;
  yearTo: number | null;
  story: Array<StoryStatus | "none">;
  invite: AlumniPerson["inviteStatus"][];
  cities: string[];
  has: Array<"photo" | "email" | "phone">;
  sort: "year" | "name" | "recent";
};

export const EMPTY_FILTERS: AlumniFilters = {
  q: "",
  schools: [],
  yearFrom: null,
  yearTo: null,
  story: [],
  invite: [],
  cities: [],
  has: [],
  sort: "year",
};

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’']/g, "'")
    .toLowerCase();
}

/** Digits only, with a leading 0 or 255 dropped so 0712… finds +255712…. */
function phoneDigits(s: string): string {
  const d = s.replace(/\D/g, "");
  if (d.startsWith("255")) return d.slice(3);
  if (d.startsWith("0")) return d.slice(1);
  return d;
}

function matchesQuery(p: AlumniPerson, q: string): boolean {
  const needle = fold(q.trim());
  if (!needle) return true;
  const hay = fold(
    [p.name, p.email, p.company, p.role, p.city, p.phone].filter(Boolean).join(" \n "),
  );
  if (needle.split(/\s+/).every((w) => hay.includes(w))) return true;
  if (/^[\d\s+().-]+$/.test(q.trim()) && p.phone) {
    const qd = phoneDigits(q);
    return qd.length >= 3 && phoneDigits(p.phone).includes(qd);
  }
  return false;
}

type Facet = "school" | "story" | "invite" | "city" | "year";

function passes(p: AlumniPerson, f: AlumniFilters, skip?: Facet): boolean {
  if (!matchesQuery(p, f.q)) return false;
  if (skip !== "school" && f.schools.length && !f.schools.includes(p.school_slug ?? NONE)) {
    return false;
  }
  if (skip !== "year" && (f.yearFrom !== null || f.yearTo !== null)) {
    if (p.grad_year === null) return false;
    if (f.yearFrom !== null && p.grad_year < f.yearFrom) return false;
    if (f.yearTo !== null && p.grad_year > f.yearTo) return false;
  }
  if (skip !== "story" && f.story.length && !f.story.includes(p.storyStatus ?? NONE)) {
    return false;
  }
  if (skip !== "invite" && f.invite.length && !f.invite.includes(p.inviteStatus)) return false;
  if (skip !== "city" && f.cities.length && !(p.city && f.cities.includes(p.city))) return false;
  for (const h of f.has) {
    const ok = h === "photo" ? p.photo_url : h === "email" ? p.email : p.phone;
    if (!ok) return false;
  }
  return true;
}

function sortPeople(list: AlumniPerson[], sort: AlumniFilters["sort"]): AlumniPerson[] {
  const byName = (a: AlumniPerson, b: AlumniPerson) => a.name.localeCompare(b.name);
  const out = [...list];
  if (sort === "name") return out.sort(byName);
  if (sort === "recent") {
    return out.sort((a, b) => time(b.firstSeen) - time(a.firstSeen) || byName(a, b));
  }
  return out.sort((a, b) => {
    if (a.grad_year === b.grad_year) return byName(a, b);
    if (a.grad_year === null) return 1;
    if (b.grad_year === null) return -1;
    return b.grad_year - a.grad_year;
  });
}

export function filterAlumni(people: AlumniPerson[], f: AlumniFilters): AlumniPerson[] {
  return sortPeople(
    people.filter((p) => passes(p, f)),
    f.sort,
  );
}

export function facetCounts(
  people: AlumniPerson[],
  f: AlumniFilters,
): Record<Facet, Record<string, number>> {
  const out: Record<Facet, Record<string, number>> = {
    school: {},
    story: {},
    invite: {},
    city: {},
    year: {},
  };
  const bump = (facet: Facet, key: string) => {
    out[facet][key] = (out[facet][key] ?? 0) + 1;
  };
  for (const p of people) {
    if (passes(p, f, "school")) bump("school", p.school_slug ?? NONE);
    if (passes(p, f, "story")) bump("story", p.storyStatus ?? NONE);
    if (passes(p, f, "invite")) bump("invite", p.inviteStatus);
    if (p.city && passes(p, f, "city")) bump("city", p.city);
    if (passes(p, f, "year")) bump("year", p.grad_year === null ? NONE : String(p.grad_year));
  }
  return out;
}

/* ---------- URL params ---------- */

const join = (items: string[]) => items.map(encodeURIComponent).join(",");

export function filtersToParams(f: AlumniFilters): Record<string, string> {
  const p: Record<string, string> = {};
  if (f.q) p.q = f.q;
  if (f.schools.length) p.schools = join(f.schools);
  if (f.yearFrom !== null) p.yearFrom = String(f.yearFrom);
  if (f.yearTo !== null) p.yearTo = String(f.yearTo);
  if (f.story.length) p.story = join(f.story);
  if (f.invite.length) p.invite = join(f.invite);
  if (f.cities.length) p.cities = join(f.cities);
  if (f.has.length) p.has = join(f.has);
  if (f.sort !== EMPTY_FILTERS.sort) p.sort = f.sort;
  return p;
}

function list(v: unknown): string[] {
  if (typeof v !== "string" || !v) return [];
  return v
    .split(",")
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    })
    .filter(Boolean);
}

function year(v: unknown): number | null {
  const n =
    typeof v === "number" ? v : typeof v === "string" && /^\d{4}$/.test(v) ? Number(v) : NaN;
  return Number.isInteger(n) && n >= 1900 && n <= 2200 ? n : null;
}

function only<T extends string>(v: unknown, allowed: readonly T[]): T[] {
  return list(v).filter((s): s is T => (allowed as readonly string[]).includes(s));
}

export function filtersFromParams(p: Record<string, unknown>): AlumniFilters {
  const sort = SORTS.find((s) => s === p.sort) ?? EMPTY_FILTERS.sort;
  return {
    q: typeof p.q === "string" ? p.q : "",
    schools: list(p.schools),
    yearFrom: year(p.yearFrom),
    yearTo: year(p.yearTo),
    story: only(p.story, [...STORY_STATUSES, NONE] as const),
    invite: only(p.invite, INVITE_STATUSES),
    cities: list(p.cities),
    has: only(p.has, HAS_KEYS),
    sort,
  };
}

/* ---------- CSV ---------- */

const INVITE_LABEL: Record<AlumniPerson["inviteStatus"], string> = {
  "not-invited": "Not invited",
  pending: "Invited",
  opened: "Opened",
  submitted: "Submitted",
};

function cell(v: string | number | null): string {
  const s = v === null ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function alumniCsv(people: AlumniPerson[]): string {
  const rows: Array<Array<string | number | null>> = [
    [
      "Name",
      "Phone",
      "Email",
      "School",
      "Class of",
      "Role",
      "Company",
      "City or country",
      "Story",
      "Invite",
    ],
    ...people.map((p) => [
      p.name,
      p.phone,
      p.email,
      schoolLabel(p.school_slug),
      p.grad_year,
      p.role,
      p.company,
      p.city,
      p.storyStatus ? STATUS_LABEL[p.storyStatus] : "None",
      INVITE_LABEL[p.inviteStatus],
    ]),
  ];
  return rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
