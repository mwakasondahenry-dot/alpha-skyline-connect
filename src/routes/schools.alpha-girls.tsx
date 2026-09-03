import { SchoolFacilitiesSection } from "@/components/school/facilities-section";
import { SchoolSubNav } from "@/components/school/school-sub-nav";
import { UnconfirmedNote } from "@/components/school/unconfirmed-note";
import { CombinationList, SubjectPillList, FormOptionsList, type CombinationGroup } from "@/components/school/subject-lists";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSchoolBundle, type SchoolBundle } from "@/lib/alpha-content.functions";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import girlsHero from "@/assets/school-alpha-girls.webp";
import girlUniform from "@/assets/alpha-girl-uniform.webp";
import campusGirls from "@/assets/campus-girls.webp";
import campusHigh from "@/assets/campus-high.webp";
import campusNursery from "@/assets/campus-nursery.webp";
import aviation from "@/assets/aviation-uniform.webp";
import { T } from "@/components/type-roles";

const slug = "alpha-girls" as const;
const ACCENT = "var(--color-blue-violet)";
const GOLD = "var(--color-gold)";

/**
 * Page-local violet ramp for Alpha Girls -- decorative tints and shades built
 * around --color-blue-violet. Deliberately NOT in styles.css: used only on
 * this page, not part of the Alpha brand palette.
 */
const VIOLET = {
  soft: "#F4F2FB",
  mid: "#E8E3F7",
  deep: "#D7CEF0",
  bright: "#6549C8",
} as const;

const bundleQuery = queryOptions({
  queryKey: ["school-bundle", slug],
  queryFn: () => getSchoolBundle({ data: { slug } }),
});

export const Route = createFileRoute("/schools/alpha-girls")({
  head: () => ({
    meta: [
      { title: "Alpha Girls · Alpha Schools" },
      {
        name: "description",
        content:
          "Alpha Girls High School, Kunduchi — Form 1–6 for girls. The same rigour, aviation and coding as the flagship, on a campus built for girls to lead.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(bundleQuery),
  component: AlphaGirlsRoute,
});

function AlphaGirlsRoute() {
  const { data } = useSuspenseQuery(bundleQuery);
  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <SiteHeader />
      <SchoolSubNav items={SUB_NAV} />
      <Hero />
      <WhatMakesAlphaGirls />
      <WhereTheyCompete />
      <TheSchoolYear />
      <About />
      <Academics />
      <LifeAtKunduchi />
      <Staff staff={data.staff} />
      <ApplyBanner />
      <GirlsFooter />
      <MotionStyles />
    </div>
  );
}

// ---------- Entry requirements ----------

function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden ag-hero"
      style={{
        background: `linear-gradient(135deg, ${VIOLET.soft} 0%, ${VIOLET.mid} 45%, ${VIOLET.deep} 100%)`,
      }}
    >
      {/* drifting violet/gold blooms */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full opacity-40 blur-3xl ag-bloom-a"
        style={{ background: ACCENT }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-[22rem] w-[22rem] rounded-full opacity-30 blur-3xl ag-bloom-b"
        style={{ background: GOLD }}
      />

      <div className="relative mx-auto grid max-w-7xl items-end gap-10 px-6 pt-14 pb-0 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:px-10 lg:pt-24">
        <Reveal direction="up" className="max-w-2xl pb-12 lg:pb-20">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur"
            style={{ borderColor: `color-mix(in srgb, ${ACCENT} 20%, transparent)`, background: "#ffffffaa", color: ACCENT }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />
            Girls Only · Form 1–6 · Kunduchi Campus
          </span>
          <h1
            className="mt-6 font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: ACCENT }}
          >
            Built for girls who <span style={{ color: "var(--color-bright-blue)" }}>mean to lead.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-ink)]/80 sm:text-lg">
            The same rigour, the same aviation and coding, the same path to top results — on a campus designed for girls to take up every inch of space.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/admission"
              className="inline-flex items-center rounded-md px-5 py-3 text-sm font-semibold text-[var(--color-accent-foreground)] shadow-md transition-transform hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: GOLD }}
            >
              Enroll Now →
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md border-2 px-5 py-3 text-sm font-semibold transition hover:bg-white"
              style={{ borderColor: ACCENT, color: ACCENT, background: "#ffffffaa" }}
            >
              Book a Visit
            </Link>
          </div>
        </Reveal>

        <Reveal
          direction="right"
          className="relative mx-auto flex w-full max-w-md items-end justify-center self-end lg:max-w-none"
        >
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at center, rgba(60,52,137,0.55), rgba(60,52,137,0.12) 55%, transparent 75%)",
            }}
          />
          <img
            src={girlsHero}
            alt="Alpha Girls students on campus"
            className="relative z-10 h-auto w-full max-w-[28rem] rounded-t-[3rem] object-cover shadow-2xl"
            style={{ aspectRatio: "4/5", objectFit: "cover" }}
            loading="eager"
            decoding="async"
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------- About ----------------- */

function About() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <div className="grid items-start gap-12 lg:grid-cols-[1.3fr_1fr]">
          <Reveal direction="left">
            <p style={{ ...T.label, color: ACCENT  }}>
              About Alpha Girls
            </p>
            <h2
              className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl"
              style={{ color: ACCENT }}
            >
              Excellence, <span style={{ color: "var(--color-bright-blue)" }}>no exceptions.</span>
            </h2>
            <p className="mt-6 text-[var(--color-ink)]/80" style={T.body}>
              Alpha Girls High School (Kunduchi) gives girls the same ambitious education as the flagship — academic rigour, aviation, coding, and leadership — in an environment built for them to thrive and lead.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-ink)]/80">
              Founded on the same Alpha vision: enabling students to achieve their best intellectually and physically, and become responsible, self-directed citizens of a dynamic society.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-5">
              <Stat value="Form 1–6" label="O & A-Level" />
              <Stat value="11" label="A-Level combos" />
              <Stat value="100%" label="Girls leadership" />
            </div>
          </Reveal>

          <Reveal direction="right">
            <div
              className="relative overflow-hidden rounded-2xl p-7 text-white shadow-xl"
              style={{ background: ACCENT }}
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-2xl"
                style={{ background: GOLD }}
              />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
                Our Promise
              </p>
              <h3 className="mt-2 font-display" style={T.cardTitle}>
                Every seat at the table is theirs.
              </h3>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/90">
                {[
                  "Same syllabus, same labs, same expectations as Alpha High.",
                  "Aviation and coding built into the timetable — not optional extras.",
                  "Leadership practised daily — house, prefect and club roles led by girls.",
                  "A campus where every voice is the loudest one in the room.",
                ].map((m) => (
                  <li key={m} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: GOLD }}
                    />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-[var(--color-off-white)] p-4 ring-1 ring-black/5">
      <div
        className="font-display text-2xl font-black leading-none"
        style={{ color: ACCENT }}
      >
        {value}
      </div>
      <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink)]/60">
        {label}
      </div>
    </div>
  );
}


/** Section anchors. Alpha Girls leads with what is distinctly hers, not with
 *  the academics both schools share. Deliberately a different order from
 *  Alpha High. */
const SUB_NAV = [
  { label: "What's distinctive", href: "#distinctive" },
  { label: "Competing", href: "#compete" },
  { label: "The school year", href: "#year" },
  { label: "Academics", href: "#academics" },
  { label: "Life at Kunduchi", href: "#life" },
] as const;

/* ------------------------------------------------------------------ *
 * ACADEMIC DATA — confirmed by the school 2026-09-02.
 * See design/CONTENT-FROM-SCHOOL.md. Data lives here rather than in a
 * shared module so Alpha Girls and Alpha High can diverge without a
 * refactor — sharing the copy is how they became the same page.
 *
 * Removed as fabrications: A-Level codes KLF and ECA (in no school
 * document), the typo PMC (correct code is PMCs), BUAcCs and MEBu (in the
 * Alpha Girls document but not offered), and the invented
 * "Science / Arts / Business / Optional" O-Level grouping.
 * ------------------------------------------------------------------ */

/** All 17 examinable subjects offered at O-Level. */
const O_LEVEL_SUBJECTS = [
  "Historia ya Tanzania na Maadili", "Civics", "History", "Geography",
  "Kiswahili", "English Language", "Business Studies", "Book Keeping",
  "Computer Science", "Physics", "Chemistry", "Biology", "Chinese",
  "French", "Literature in English", "ICS", "Additional Mathematics",
] as const;

/* ⚠ SOURCE FLAG — FOR REVIEW, NOT FOR PARENTS ⚠
 * The school's document lists Form Three and Form Four option subjects as
 * IDENTICAL, and its numbering SKIPS (ix) in both, so nine items are
 * numbered to ten. A genuine duplication and a copy-paste error look the
 * same in a Word table.
 * ASK THE SCHOOL before publishing Form Three and Form Four as identical.
 */
const FORM_OPTIONS = [
  {
    form: "Form One",
    note: "Seven option subjects",
    items: ["Chinese", "French", "Computer Science", "History", "Biology", "Physics", "Chemistry"],
  },
  {
    form: "Form Two",
    note: "The same seven, plus Book Keeping",
    items: ["Chinese", "French", "Computer Science", "History", "Biology", "Physics", "Chemistry", "Book Keeping"],
  },
  {
    form: "Form Three",
    note: "Nine option subjects",
    items: ["Chinese", "French", "ICS", "Literature in English", "Commerce", "Book Keeping", "Physics", "Chemistry", "Additional Mathematics"],
  },
  {
    form: "Form Four",
    note: "Nine option subjects",
    items: ["Chinese", "French", "ICS", "Literature in English", "Commerce", "Book Keeping", "Physics", "Chemistry", "Additional Mathematics"],
  },
] as const;

/** The 12 A-Level combinations. Confirmed identical at both schools. */
const A_COMBOS: ReadonlyArray<CombinationGroup> = [
  {
    group: "Arts",
    items: [
      { code: "HGL", subjects: "History · Geography · English Language" },
      { code: "HKL", subjects: "History · Kiswahili · English Language" },
    ],
  },
  {
    group: "Business",
    items: [
      { code: "EBuAC", subjects: "Economics · Business Studies · Accountancy" },
      { code: "BUAcM", subjects: "Business Studies · Accountancy · Advanced Mathematics" },
      { code: "ECsM", subjects: "Economics · Computer Studies · Advanced Mathematics" },
      { code: "HGE", subjects: "History · Geography · Economics" },
      { code: "EGM", subjects: "Economics · Geography · Advanced Mathematics" },
    ],
  },
  {
    group: "Science",
    items: [
      { code: "PCM", subjects: "Physics · Chemistry · Advanced Mathematics" },
      { code: "PCB", subjects: "Physics · Chemistry · Biology" },
      { code: "PMCs", subjects: "Physics · Advanced Mathematics · Computer Studies" },
      { code: "PGM", subjects: "Physics · Geography · Advanced Mathematics" },
      { code: "CBG", subjects: "Chemistry · Biology · Geography" },
    ],
  },
];

/** Entry criteria per stream. From ALPHA_GIRLS_WEBSITE.docx — NOT yet
 *  confirmed in writing, so it is rendered under an UnconfirmedNote. */
const ENTRY_CRITERIA = [
  { group: "Arts", rule: "At least Division III, maximum 23 points, with a minimum of C in every principal subject." },
  { group: "Business", rule: "Division II with at least C in every principal subject, plus the mathematics or computer requirement for the chosen combination." },
  { group: "Science", rule: "Minimum Division II with 19 points, plus the subject-specific requirements for the chosen combination." },
] as const;

/* ------------------------------------------------------------------ *
 * ALPHA GIRLS-SPECIFIC CONTENT
 * All of this is from ALPHA_GIRLS_WEBSITE.docx and is UNCONFIRMED.
 * It is what genuinely distinguishes this school from Alpha High, so it
 * carries the page — but every block of it is labelled on the page.
 * ------------------------------------------------------------------ */

/** The cookery club runs as an enterprise, not a hobby. */
const ENTERPRISE_PATHWAY = [
  "Learn", "Practise", "Produce", "Package", "Market", "Sell", "Account",
] as const;

/* ⚠ SOURCE FLAG — the school's table gives the Driving Club's focus as
 * "Scientific inquiry", which is a copy-paste error in their document.
 * It is deliberately not reproduced. No focus line is invented for it. */
const GIRLS_CLUBS: ReadonlyArray<{ name: string; note?: string }> = [
  { name: "Driving", note: "Not offered at Alpha High." },
  { name: "Entrepreneurship", note: "Not offered at Alpha High." },
  { name: "Aviation" },
  { name: "Debate" },
  { name: "ICT / Computer" },
  { name: "Music / Arts" },
  { name: "Environmental" },
] as const;

/** Only dates still ahead. A list of past dates reads as abandoned. */
const UPCOMING_2026 = [
  { when: "7–11 September", what: "Field trip / study tour" },
  { when: "3 October", what: "Annual Sports Day" },
  { when: "5–9 October", what: "Alpha Girls High School Week" },
] as const;

const COMPETITIONS = [
  { name: "Pan African Schools Championship", where: "South Africa", when: "June" },
  { name: "Tanzania National World Schools Debate Championship", where: "National", when: "August" },
  { name: "TCRO Dar Open Schools Debate Championship", where: "Dar es Salaam", when: "May" },
] as const;

/** Alpha Girls leads with what only Alpha Girls has. */
function WhatMakesAlphaGirls() {
  return (
    <section id="distinctive" className="bg-[var(--color-surface)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <p style={{ ...T.label, color: ACCENT }}>What only Alpha Girls has</p>
        <h2 className="mt-2 max-w-3xl font-display tracking-tight text-[var(--color-ink)]" style={T.section}>
          Cookery that runs as a business, and two clubs Alpha High does not offer.
        </h2>
        <span aria-hidden className="mt-[var(--heading-rule-gap)] block" style={{ width: "var(--heading-rule-w)", height: "var(--heading-rule-h)", background: "var(--heading-rule-color)", borderRadius: "var(--heading-rule-radius)" }} />

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-ink)]" style={T.cardTitle}>
            The cookery enterprise pathway
          </h3>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            Girls do not just cook. They take a product the whole way.
          </p>
          <ol className="mt-5 flex flex-wrap items-center gap-2">
            {ENTERPRISE_PATHWAY.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span
                  className="rounded-[var(--radius-pill)] px-4 py-2 text-[var(--color-surface)]"
                  style={{ ...T.body, background: ACCENT, fontWeight: "var(--btn-primary-weight)" }}
                >
                  {step}
                </span>
                {i < ENTERPRISE_PATHWAY.length - 1 && (
                  <span aria-hidden className="text-[var(--color-gold)]">&rarr;</span>
                )}
              </li>
            ))}
          </ol>
          <UnconfirmedNote>
            Supplied by the school, August 2026. Not yet confirmed in writing.
          </UnconfirmedNote>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-ink)]" style={T.cardTitle}>
            Clubs
          </h3>
          <ul className="mt-5 grid gap-[var(--space-card-gap)] sm:grid-cols-2 lg:grid-cols-3">
            {GIRLS_CLUBS.map((c) => (
              <li
                key={c.name}
                className="rounded-[var(--radius-card)] border border-[var(--color-hairline)] p-[var(--space-card-pad)]"
              >
                <span className="font-display text-[var(--color-ink)]" style={T.cardTitle}>{c.name}</span>
                {c.note && (
                  <span className="mt-1 block text-[var(--color-ink-soft)]" style={T.label}>{c.note}</span>
                )}
              </li>
            ))}
          </ul>
          <UnconfirmedNote>
            Supplied by the school, August 2026. Not yet confirmed in writing.
            Club photographs are still outstanding.
          </UnconfirmedNote>
        </div>
      </div>
    </section>
  );
}

/** Where the girls compete - the second thing that is genuinely theirs. */
function WhereTheyCompete() {
  return (
    <section id="compete" className="bg-[var(--color-off-white)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <p style={{ ...T.label, color: ACCENT }}>Beyond Kunduchi</p>
        <h2 className="mt-2 max-w-3xl font-display tracking-tight text-[var(--color-ink)]" style={T.section}>
          They compete well past Dar es Salaam.
        </h2>
        <span aria-hidden className="mt-[var(--heading-rule-gap)] block" style={{ width: "var(--heading-rule-w)", height: "var(--heading-rule-h)", background: "var(--heading-rule-color)", borderRadius: "var(--heading-rule-radius)" }} />

        <ul className="mt-[var(--space-block-y)] grid gap-[var(--space-card-gap)] md:grid-cols-3">
          {COMPETITIONS.map((c) => (
            <li key={c.name} className="rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] shadow-[var(--card-shadow)]">
              <span style={{ ...T.label, color: ACCENT }}>{c.when}</span>
              <h3 className="mt-2 font-display text-[var(--color-ink)]" style={T.cardTitle}>{c.name}</h3>
              <p className="mt-1 text-[var(--color-ink-soft)]" style={T.body}>{c.where}</p>
            </li>
          ))}
        </ul>
        <UnconfirmedNote>
          Supplied by the school, August 2026. Not yet confirmed in writing.
        </UnconfirmedNote>
      </div>
    </section>
  );
}

/** Only dates still ahead. A list of past dates reads as abandoned. */
function TheSchoolYear() {
  return (
    <section id="year" className="bg-[var(--color-surface)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <p style={{ ...T.label, color: ACCENT }}>Still to come in 2026</p>
        <h2 className="mt-2 max-w-3xl font-display tracking-tight text-[var(--color-ink)]" style={T.section}>
          What is next on the Kunduchi calendar.
        </h2>
        <span aria-hidden className="mt-[var(--heading-rule-gap)] block" style={{ width: "var(--heading-rule-w)", height: "var(--heading-rule-h)", background: "var(--heading-rule-color)", borderRadius: "var(--heading-rule-radius)" }} />

        <ul className="mt-[var(--space-block-y)] grid gap-[var(--space-card-gap)] sm:grid-cols-3">
          {UPCOMING_2026.map((e) => (
            <li key={e.what} className="rounded-[var(--radius-card)] border border-[var(--color-hairline)] p-[var(--space-card-pad)]">
              <span style={{ ...T.label, color: ACCENT }}>{e.when}</span>
              <p className="mt-2 font-display text-[var(--color-ink)]" style={T.cardTitle}>{e.what}</p>
            </li>
          ))}
        </ul>
        <UnconfirmedNote>
          From the 2026 calendar supplied by the school in August 2026, not yet
          confirmed in writing. Earlier dates in that calendar have passed and
          are not listed.
        </UnconfirmedNote>
      </div>
    </section>
  );
}

function Academics() {
  return (
    <section id="academics" className="bg-[var(--color-off-white)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <p style={{ ...T.label, color: ACCENT }}>Academics</p>
        <h2 className="mt-2 max-w-3xl font-display tracking-tight text-[var(--color-ink)]" style={T.section}>
          Seventeen subjects at O-Level, twelve combinations at A-Level.
        </h2>
        <span aria-hidden className="mt-[var(--heading-rule-gap)] block" style={{ width: "var(--heading-rule-w)", height: "var(--heading-rule-h)", background: "var(--heading-rule-color)", borderRadius: "var(--heading-rule-radius)" }} />

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-ink)]" style={T.cardTitle}>Subjects offered</h3>
          <div className="mt-5"><SubjectPillList items={O_LEVEL_SUBJECTS} /></div>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-ink)]" style={T.cardTitle}>Option subjects by form</h3>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            What a girl in each form may choose between &mdash; a different thing
            from the full subject list above.
          </p>
          <div className="mt-5"><FormOptionsList forms={FORM_OPTIONS} /></div>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-ink)]" style={T.cardTitle}>A-Level combinations</h3>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            All twelve, with their subjects written out. Form 5&ndash;6, ACSEE.
          </p>
          <div className="mt-5"><CombinationList groups={A_COMBOS} accent={ACCENT} /></div>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-ink)]" style={T.cardTitle}>Entry criteria</h3>
          <ul className="mt-5 grid gap-[var(--space-card-gap)] md:grid-cols-3">
            {ENTRY_CRITERIA.map((e) => (
              <li key={e.group} className="rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] shadow-[var(--card-shadow)]">
                <span style={{ ...T.label, color: ACCENT }}>{e.group}</span>
                <p className="mt-2 text-[var(--color-ink)]" style={T.body}>{e.rule}</p>
              </li>
            ))}
          </ul>
          <UnconfirmedNote>
            Entry criteria come from the Alpha Girls document and are not yet
            confirmed in writing. They have not been applied to Alpha High,
            where no equivalent source exists.
          </UnconfirmedNote>
        </div>
      </div>
    </section>
  );
}




const FACILITIES = [
  { label: "Science labs", img: campusHigh },
  { label: "Library", img: campusNursery },
  { label: "Sports field", img: campusGirls },
  { label: "Boarding", img: aviation },
];

function LifeAtKunduchi() {
  return (
    <section id="life" className="bg-white">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p style={{ ...T.label, color: ACCENT  }}>
              Campus
            </p>
            <h2 className="mt-2 font-display" style={{ ...T.section, color: ACCENT  }}>
              Life at Kunduchi.
            </h2>
          </div>
          <Link to="/facilities" className="font-bold hover:underline" style={{ ...T.body, color: ACCENT  }}>
            See facilities →
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FACILITIES.map((f, i) => (
            <Reveal key={f.label} direction="up" delay={i * 70}>
              <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 active:translate-y-0 hover:shadow-xl">
                <img
                  src={f.img}
                  alt={f.label}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
                    Facility
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-white">{f.label}</h3>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------- Staff ----------------- */

function Staff({ staff }: { staff: SchoolBundle["staff"] }) {
  if (staff.length === 0) return null;
  return (
    <section style={{ background: VIOLET.soft }}>
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="max-w-2xl">
          <p style={{ ...T.label, color: ACCENT  }}>
            Leadership & teaching
          </p>
          <h2 className="mt-2 font-display" style={{ ...T.section, color: ACCENT  }}>
            The women and men behind the climb.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {staff.map((p) => (
            <Reveal key={p.id} direction="up">
              <article className="group h-full overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:-translate-y-1 active:translate-y-0 hover:shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden">
                  {p.photo_url ? (
                    <img
                      src={p.photo_url}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="absolute inset-0 grid place-items-center"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${VIOLET.bright})` }}
                    >
                      <span className="font-display text-6xl font-black text-white/30">
                        {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: GOLD }} />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-bold" style={{ color: ACCENT }}>
                    {p.name}
                  </h3>
                  {p.title && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]/60">
                      {p.title}
                    </p>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------- Apply banner ----------------- */

function ApplyBanner() {
  return (
    <section style={{ background: GOLD }}>
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-6 py-12 sm:flex-row sm:items-center lg:px-10">
        <Reveal direction="left">
          <h2 className="font-display text-2xl font-black sm:text-3xl" style={{ color: ACCENT }}>
            Applications for the next intake are open.
          </h2>
          <p className="mt-2 max-w-xl text-sm font-semibold text-[var(--color-accent-foreground)]/80">
            Visit Kunduchi, sit the assessment, claim your place.
          </p>
        </Reveal>
        <Reveal direction="right" className="flex flex-wrap gap-3">
          <Link
            to="/admission"
            className="inline-flex items-center rounded-md px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: ACCENT }}
          >
            Enroll Now →
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center rounded-md border-2 px-6 py-3 text-sm font-bold transition hover:bg-white/40"
            style={{ borderColor: ACCENT, color: ACCENT }}
          >
            Book a Visit
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------- Footer ----------------- */

function GirlsFooter() {
  return (
    <>
      <div
        className="py-5 text-center text-xs font-bold uppercase tracking-[0.22em] text-white/85"
        style={{ background: ACCENT }}
      >
        ALPHA SCHOOLS · <span style={{ color: GOLD }}>Alpha Girls</span>
        <div className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-white/60">
          Kunduchi campus · Dar es Salaam · part of ALFA EDUCATION CENTRE
        </div>
      </div>
      <SchoolFacilitiesSection slug="alpha-girls" accent="var(--color-blue-violet)" />
      <SiteFooter />
    </>
  );
}

/* ----------------- Motion styles ----------------- */

function MotionStyles() {
  return (
    <style>{`
      :root { --ag-gold: ${GOLD}; }
      @keyframes agComboIn {
        0% { opacity: 0; transform: translateY(8px) scale(.92); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @media (prefers-reduced-motion: no-preference) {
        @keyframes agDriftA {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(20px, -10px, 0) scale(1.05); }
        }
        @keyframes agDriftB {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-25px, 12px, 0) scale(1.08); }
        }
        .ag-bloom-a { animation: agDriftA 14s ease-in-out infinite; }
        .ag-bloom-b { animation: agDriftB 18s ease-in-out infinite; }
        .ag-hero { background-size: 200% 200%; animation: agHeroShift 22s ease-in-out infinite; }
        @keyframes agHeroShift {
          0%,100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
      }
    `}</style>
  );
}
