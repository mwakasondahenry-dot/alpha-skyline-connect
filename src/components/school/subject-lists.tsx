import { useId, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  Atom,
  BookMarked,
  BookOpen,
  Briefcase,
  Calculator,
  ChevronDown,
  FlaskConical,
  Globe,
  Landmark,
  Languages,
  Laptop,
  Leaf,
  ScrollText,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { T } from "@/components/type-roles";
import imgBiology from "@/assets/subjects/biology.webp";
import imgBookKeeping from "@/assets/subjects/book-keeping.webp";
import imgBusiness from "@/assets/subjects/business.webp";
import imgChemistry from "@/assets/subjects/chemistry.webp";
import imgChinese from "@/assets/subjects/chinese.webp";
import imgCivics from "@/assets/subjects/civics.webp";
import imgComputer from "@/assets/subjects/computer-science.webp";
import imgEnglish from "@/assets/subjects/english.webp";
import imgFrench from "@/assets/subjects/french.webp";
import imgGeography from "@/assets/subjects/geography.webp";
import imgHistoria from "@/assets/subjects/historia.webp";
import imgHistory from "@/assets/subjects/history.webp";
import imgIcs from "@/assets/subjects/ics.webp";
import imgKiswahili from "@/assets/subjects/kiswahili.webp";
import imgLiterature from "@/assets/subjects/literature.webp";
import imgMaths from "@/assets/subjects/maths.webp";
import imgPhysics from "@/assets/subjects/physics.webp";

/**
 * Shared presentation for the academic blocks on the secondary school pages.
 *
 * These components carry NO content. Every list is passed in as data and lives
 * in the page that renders it, so Alpha High and Alpha Girls can diverge later
 * without a refactor. Sharing the copy is exactly how the two pages became the
 * same page; sharing only the presentation is the fix.
 *
 * Built to the "Subjects & Combinations" comp. Three things in that comp are
 * deliberately absent, and the reasons are on record — see the ACADEMICS block
 * in styles.css and design/CONTENT-FROM-SCHOOL.md.
 */

/* ------------------------------------------------------------------ *
 * Subject icons
 *
 * Decoration, not data. An icon says nothing the subject name does not
 * already say, so choosing them here invents no claim about the
 * curriculum. Matched on a keyword rather than an exact string because
 * the two schools spell several subjects differently — "Book Keeping"
 * against "Book-keeping", and the Historia title in either word order.
 * ------------------------------------------------------------------ */
const ICON_RULES: ReadonlyArray<[RegExp, LucideIcon]> = [
  [/historia|maadili/i, Landmark],
  [/civics/i, Users],
  [/history/i, ScrollText],
  [/geograph/i, Globe],
  [/kiswahili/i, BookOpen],
  [/literature/i, BookMarked],
  [/english/i, BookOpen],
  [/chinese|french/i, Languages],
  [/business|commerce/i, Briefcase],
  [/book.?keeping|account/i, Calculator],
  [/computer|^ics$|comp(uter)? stud/i, Laptop],
  [/physics/i, Atom],
  [/chemistry/i, FlaskConical],
  [/biology/i, Leaf],
  [/mathematic/i, Calculator],
  [/shop|entrepreneur/i, Store],
];

/* Subject photographs. Generated still-lifes of objects only (no people,
   no uniforms, no text), so none of them claims to show Alpha pupils or
   Alpha rooms. Matched the same way as the icons; a subject with no match
   renders without a photo. */
const IMAGE_RULES: ReadonlyArray<[RegExp, string]> = [
  [/historia|maadili/i, imgHistoria],
  [/civics/i, imgCivics],
  [/history/i, imgHistory],
  [/geograph/i, imgGeography],
  [/kiswahili/i, imgKiswahili],
  [/literature/i, imgLiterature],
  [/english/i, imgEnglish],
  [/chinese/i, imgChinese],
  [/french/i, imgFrench],
  [/business|commerce/i, imgBusiness],
  [/book.?keeping|account/i, imgBookKeeping],
  [/^ics$|information/i, imgIcs],
  [/computer/i, imgComputer],
  [/physics/i, imgPhysics],
  [/chemistry/i, imgChemistry],
  [/biology/i, imgBiology],
  [/mathematic/i, imgMaths],
];

function imageFor(subject: string): string | undefined {
  return IMAGE_RULES.find(([re]) => re.test(subject))?.[1];
}

function iconFor(subject: string): LucideIcon {
  return ICON_RULES.find(([re]) => re.test(subject))?.[1] ?? BookOpen;
}

/** Sets the accent for a subtree, or nothing when the caller passes none. */
const accentVar = (accent?: string): CSSProperties | undefined =>
  accent ? ({ "--dl-accent": accent } as CSSProperties) : undefined;

/**
 * Binds a row to a step of the panel's stagger. The index is a custom property
 * rather than a written-out delay because the ceiling belongs in the stylesheet
 * next to the rest of the motion, not in eleven call sites.
 */
const step = (i: number): CSSProperties => ({ "--dl-i": i }) as CSSProperties;

/* ------------------------------------------------------------------ *
 * The disclosure card
 * ------------------------------------------------------------------ */

/**
 * One collapsible card. Collapsed on a phone, open from 768px up.
 *
 * The control is a hidden checkbox rather than a button with aria-expanded,
 * and that is the whole reason this works. A button's expanded state lives in
 * React, which means the server has to guess a viewport it cannot see: render
 * open and every phone shows the subjects and then snatches them away once an
 * effect measures the screen. That is the fault the motion audit found in the
 * old reveal — content withheld from a reader already looking at it — with a
 * layout shift added on top.
 *
 * A checkbox has no such problem, because the markup does not encode the
 * state. `:checked` means "the reader changed it from however this viewport
 * starts", and the stylesheet decides what starting means at each width.
 * Identical HTML everywhere, no hydration disagreement, and it still opens and
 * closes with the bundle dead.
 *
 * The cost is real and worth stating: a screen reader announces "Arts, 5
 * combinations, checkbox" rather than a button that is expanded or collapsed.
 * The collapsed panel is hidden with `visibility`, not merely sized to zero,
 * so at least it leaves the accessibility tree honestly.
 */
function Disclosure({
  title,
  note,
  count,
  countLabel,
  accent,
  /** Alternates the header gradient, as the comp draws it. */
  tone = "deep",
  entering,
  children,
}: {
  title: string;
  note?: string;
  count: number;
  /** Omitted where the card is too narrow to seat it beside the chevron. */
  countLabel?: string;
  accent?: string;
  tone?: "deep" | "bright";
  /** Replays the arrival animation when a filter changes the set. */
  entering?: boolean;
  children: ReactNode;
}) {
  const id = useId();

  return (
    <section
      className={[
        "dl-card",
        tone === "bright" ? "dl-card--bright" : "dl-card--deep",
        entering ? "dl-card--entering" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      /* One property drives the band, badge, chevron, rows, code chips and
         border. Setting it here rather than styling six elements is what lets
         Alpha Girls stay sea-green throughout instead of wearing blue chrome
         around a teal heading. Omitted, the stylesheet's default stands. */
      style={accentVar(accent)}
    >
      <input type="checkbox" id={id} className="dl-toggle" />
      <label htmlFor={id} className="dl-band">
        <span className="dl-band__title">
          {/* These were <h3>s before the cards became collapsible, and a page
              of academic sections is one people navigate by heading. A <label>
              only admits phrasing content, so the element cannot come back —
              the role does, which keeps the outline intact without invalid
              markup. */}
          <span role="heading" aria-level={3} className="block font-display" style={T.cardTitle}>
            {title}
          </span>
          {note && (
            <span className="dl-band__note" style={T.label}>
              {note}
            </span>
          )}
        </span>
        <span className="dl-count">{count}</span>
        {countLabel && (
          <span className="dl-count-label" style={T.label}>
            {countLabel}
          </span>
        )}
        <span aria-hidden className="dl-chevron-disc">
          <ChevronDown className="dl-chevron h-4 w-4" strokeWidth={2.5} />
        </span>
      </label>
      <div className="dl-panel">
        <div className="dl-panel__inner">
          <div className="px-[var(--space-card-pad-sm)] py-[var(--space-card-pad-sm)]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * A-Level combinations
 * ------------------------------------------------------------------ */

export type Combination = { code: string; subjects: string };
export type CombinationGroup = { group: string; items: ReadonlyArray<Combination> };

/**
 * A-Level combinations, grouped, with a filter across the top.
 *
 * The chips are real <button>s rather than the CSS-only trick the cards use,
 * and the difference is deliberate. The cards HIDE content, so they must work
 * with the bundle dead. A filter that starts on "All" hides nothing, so with
 * no JS the chips are inert and every combination is still on the page — the
 * correct degraded state. It also means the server and the first client render
 * agree, because "All" is the initial state on both.
 *
 * The groups are the school's own — Arts, Business, Science, confirmed in
 * writing. The comp's five-way taxonomy is not built; a four-way version of it
 * was live once and removed as invented (design/CONTENT-FROM-SCHOOL.md).
 */
export function CombinationList({
  groups,
  accent,
}: {
  groups: ReadonlyArray<CombinationGroup>;
  accent?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const total = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);
  const shown = active ? groups.filter((g) => g.group === active) : groups;

  const chips: ReadonlyArray<{ key: string | null; label: string; n: number }> = [
    { key: null, label: "All", n: total },
    ...groups.map((g) => ({ key: g.group, label: g.group, n: g.items.length })),
  ];

  return (
    <div style={accentVar(accent)}>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter combinations by group">
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            className="dl-chip"
            aria-pressed={active === c.key}
            onClick={() => setActive(c.key)}
          >
            {c.label}
            <span className="dl-chip__count">{c.n}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-[var(--space-card-gap)] md:grid-cols-3">
        {shown.map((g, gi) => (
          <Disclosure
            /* Keyed on the filter so a change replays the arrival animation
               rather than letting the grid re-flow silently under the reader. */
            key={`${active ?? "all"}-${g.group}`}
            title={g.group}
            count={g.items.length}
            accent={accent}
            tone={gi % 2 === 0 ? "deep" : "bright"}
            entering
          >
            <ul className="dl-list dl-list--codes grid gap-1">
              {g.items.map((c, i) => (
                <li key={c.code} className="dl-row dl-item" style={step(i)}>
                  <span
                    className="dl-code font-mono font-bold"
                    style={{ fontSize: "var(--text-body)" }}
                  >
                    {c.code}
                  </span>
                  <span className="dl-row__desc" style={T.body}>
                    {c.subjects}
                  </span>
                </li>
              ))}
            </ul>
          </Disclosure>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The full subject list
 * ------------------------------------------------------------------ */

/**
 * Every subject a school examines at O-Level, as the comp's icon tiles.
 *
 * Flat, and it stays flat. The comp splits this into "Core Subjects (for all
 * students)" and a set of option categories; the school has never said which
 * of its subjects are core, and the one grouping that was invented here before
 * had to be removed. Callers that want to mark the split as outstanding should
 * render a bracketed placeholder beside this list, not slice it.
 */
export function SubjectTileList({
  items,
  accent,
}: {
  items: ReadonlyArray<string>;
  accent?: string;
}) {
  return (
    <ul
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      style={accentVar(accent)}
    >
      {items.map((s) => {
        const Icon = iconFor(s);
        const image = imageFor(s);
        return (
          <li key={s} className="dl-subject">
            {image && (
              <img
                src={image}
                alt=""
                loading="lazy"
                decoding="async"
                width={640}
                height={482}
                className="dl-subject__photo"
              />
            )}
            <span className="dl-subject__name" style={T.body}>
              <span aria-hidden className="dl-tile__icon">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">{s}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ *
 * Option subjects per form
 * ------------------------------------------------------------------ */

/**
 * One option subject. The school supplies names only; the comp shows a
 * description beside each. The shape accepts both so the descriptions drop in
 * the day the school sends them, and the row layout is already two columns —
 * see .dl-list--described in styles.css.
 */
export type OptionSubject = string | { name: string; description?: string };
export type FormOptions = {
  form: string;
  note?: string;
  items: ReadonlyArray<OptionSubject>;
};

const subjectName = (s: OptionSubject) => (typeof s === "string" ? s : s.name);
const subjectDesc = (s: OptionSubject) => (typeof s === "string" ? undefined : s.description);

/**
 * Option subjects per form. A different thing from the subject list above —
 * the subject list is what the school teaches, this is what a pupil in a given
 * form may choose between.
 *
 * The comp puts a checkbox on every row. Not built: this is a public page, not
 * an enrolment form, and a control that submits nothing is a false affordance.
 */
export function FormOptionsList({
  forms,
  accent,
}: {
  forms: ReadonlyArray<FormOptions>;
  accent?: string;
}) {
  return (
    <div className="grid gap-[var(--space-card-gap)] sm:grid-cols-2">
      {forms.map((f, fi) => {
        const described = f.items.some((s) => subjectDesc(s));
        return (
          <Disclosure
            key={f.form}
            title={f.form}
            note={f.note}
            count={f.items.length}
            countLabel="Option subjects"
            accent={accent}
            tone={fi % 2 === 0 ? "deep" : "bright"}
          >
            <ul className={`dl-list grid gap-1 ${described ? "dl-list--described" : ""}`}>
              {f.items.map((s, i) => (
                <li
                  key={subjectName(s)}
                  className="dl-row dl-item"
                  style={{ ...T.body, ...step(i) }}
                >
                  <span className="text-[var(--color-ink)]">{subjectName(s)}</span>
                  {subjectDesc(s) && <span className="dl-row__desc">{subjectDesc(s)}</span>}
                </li>
              ))}
            </ul>
          </Disclosure>
        );
      })}
    </div>
  );
}
