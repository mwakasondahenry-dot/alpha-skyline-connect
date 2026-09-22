import { SchoolFacilitiesSection } from "@/components/school/facilities-section";
import { SchoolSubNav } from "@/components/school/school-sub-nav";
import { FacilityTile } from "@/components/school/facility-tile";
import { UnconfirmedNote } from "@/components/school/unconfirmed-note";
import {
  CombinationList,
  SubjectTileList,
  FormOptionsList,
  type CombinationGroup,
} from "@/components/school/subject-lists";
import { CurriculumBand, GuidanceCallout } from "@/components/school/academics-frame";
import labBench from "@/assets/subjects/lab-bench.webp";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { schoolLd, breadcrumbLd } from "@/lib/structured-data";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSchoolBundle, type SchoolBundle } from "@/lib/alpha-content.functions";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { getSchoolPhotos } from "@/lib/alpha-content.functions";
import { ParentVoices } from "@/components/school/parent-voices";
import { testimonialsQuery } from "@/lib/testimonials-query";
import { slotPhoto } from "@/lib/photo-slots";
import { Reveal } from "@/components/reveal";
import girlsHero from "@/assets/school-alpha-girls.webp";
import girlUniform from "@/assets/alpha-girl-uniform.webp";
import campusGirls from "@/assets/campus-girls.webp";
import { T, heroStep } from "@/components/type-roles";
import { Marked, Backdrop, CinematicHero, HeroCredentials } from "@/components/alpha-ui";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { Users, GraduationCap, MapPin } from "lucide-react";

const slug = "alpha-girls" as const;
const ACCENT = "var(--color-girls-teal)";
const GOLD = "var(--color-gold)";

/**
 * Page-local ramp for Alpha Girls, built around --color-girls-teal.
 * Deliberately NOT in styles.css: used only on this page.
 *
 * Replaces the lilac ramp this page ran on. The washes were the "purple
 * shade" doing most of the work, so they are gone rather than recoloured —
 * the page now sits on the site's own white and off-white, with teal used as
 * a figure rather than as a bath.
 */
const SEA = {
  tint: "var(--color-girls-teal-tint)",
  accent: "var(--color-girls-teal)",
  deep: "var(--color-girls-teal-deep)",
} as const;

const photosQuery = queryOptions({
  queryKey: ["school-photos", "alpha-girls"],
  queryFn: () => getSchoolPhotos({ data: { slug: "alpha-girls" as const } }),
  staleTime: 5 * 60 * 1000,
});

const bundleQuery = queryOptions({
  queryKey: ["school-bundle", slug],
  queryFn: () => getSchoolBundle({ data: { slug } }),
});

export const Route = createFileRoute("/schools/alpha-girls")({
  head: () => ({
    ...seo({
      title: "Alpha Girls, Kunduchi — Alpha Schools, Dar es Salaam",
      description:
        "Alpha Girls High School in Kunduchi, Dar es Salaam: a girls' secondary teaching Form 1 to Form 6, with 15 O-Level subjects and 12 A-Level combinations.",
      path: "/schools/alpha-girls",
      ld: [
        schoolLd(
          "alpha-girls",
          "A girls' secondary school in Kunduchi, Dar es Salaam, teaching Form 1 to Form 6.",
        ),
        breadcrumbLd([{ name: "Alpha Girls", path: "/schools/alpha-girls" }]),
      ],
    }),
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(bundleQuery),
      context.queryClient.ensureQueryData(photosQuery),
      context.queryClient.ensureQueryData(testimonialsQuery),
    ]),
  component: AlphaGirlsRoute,
});

function AlphaGirlsRoute() {
  const { data } = useSuspenseQuery(bundleQuery);
  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <SiteHeader overlay />
      <Hero />
      <SchoolSubNav items={SUB_NAV} />
      {/* Claim, then proof, then the school behind it. The calendar used to
          sit between the competitions and About, which put term dates in
          front of a reader who did not yet know what the school was. It now
          follows the campus, where someone already convinced is looking for
          when things happen. */}
      <WhatMakesAlphaGirls />
      <WhereTheyCompete />
      <About />
      <Academics />
      <LifeAtKunduchi />
      <TheSchoolYear />
      <Staff staff={data.staff} />
      <ParentVoices school="alpha-girls" accent="var(--color-girls-teal)" />
      <ApplyBanner />
      <GirlsFooter />
    </div>
  );
}

// ---------- Entry requirements ----------
/**
 * The opening screen.
 *
 * A full-viewport photographic hero, with the navigation over it.
 *
 * This page used to open on a lilac gradient with drifting blooms. That
 * ramp was the "purple shade" doing most of the work, and it is gone
 * rather than recoloured.
 *
 * The scrim underneath is the shared navy one, because design/README.md
 * requires the headline to stay legible over ANY photograph and that
 * guarantee is not something to re-derive per page. The teal wash sits on
 * top of it: identity without touching legibility.
 */
function Hero() {
  return (
    <CinematicHero
      eyebrow="Girls only · Form 1–6 · Kunduchi"
      lineOne="Where girls learn"
      lineTwo="to lead."
      blurb="Leadership is practised daily here — house, prefect and club roles are all held by girls. NECTA sciences and arts, Form 1 to Form 6 on the Kunduchi campus."
      media={
        <HeroSlideshow
          pageKey="alpha-girls"
          fallback={[
            { src: girlsHero, alt: "Alpha Girls students on the Kunduchi campus" },
            { src: girlUniform, alt: "An Alpha Girls student in school uniform" },
            { src: campusGirls, alt: "Alpha Girls debate team with their medals and certificates" },
          ]}
        />
      }
      overlays={
        /* The page's own temperature, laid over the shared navy scrim rather
           than replacing it — the scrim is what guarantees the headline reads
           over any slide, and that is not a guarantee to re-derive per page.

           Held to the left, behind the copy, and fully clear by 62%. Carried
           further across it mixed with the warm light of the classroom slide
           and cast the right-hand side of the photograph green. A tint that
           discolours the photograph is not identity, it is a fault. */
        <div
          aria-hidden
          className="hero-scrim absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(118deg, color-mix(in srgb, var(--color-girls-teal-deep) 68%, transparent) 0%, color-mix(in srgb, var(--color-girls-teal-deep) 26%, transparent) 38%, transparent 62%)",
          }}
        />
      }
      actions={
        <>
          <Link
            to="/admission"
            className="inline-flex min-h-[var(--btn-primary-min-h)] items-center rounded-[var(--radius-pill)] px-7 text-[var(--color-accent-foreground)] shadow-md transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] motion-reduce:transition-none"
            style={{ ...T.body, fontWeight: "var(--btn-primary-weight)", background: GOLD }}
          >
            Enroll Now
          </Link>
          <Link
            to="/contact"
            className="inline-flex min-h-[var(--btn-primary-min-h)] items-center rounded-[var(--radius-pill)] border border-[var(--color-surface)]/45 px-7 text-[var(--color-surface)] transition-colors duration-150 hover:bg-[var(--color-surface)]/10 active:scale-[0.97] motion-reduce:transition-none"
            style={{ ...T.body, fontWeight: "var(--btn-primary-weight)" }}
          >
            Book a Visit
          </Link>
        </>
      }
      foot={
        <HeroCredentials
          items={[
            {
              label: "Girls only",
              sub: "Form 1 to Form 6",
              icon: <Users className="h-5 w-5" />,
            },
            {
              label: "NECTA curriculum",
              sub: "CSEE and ACSEE",
              icon: <GraduationCap className="h-5 w-5" />,
            },
            {
              label: "Kunduchi campus",
              sub: "Dar es Salaam",
              icon: <MapPin className="h-5 w-5" />,
            },
          ]}
        />
      }
    />
  );
}

/* ----------------- About ----------------- */

function About() {
  return (
    <section className="relative overflow-hidden bg-white">
      <Backdrop kind="orbit" className="-left-8 top-16 hidden lg:block" width="7rem" rotate={-8} />
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <div className="grid items-start gap-12 lg:grid-cols-[1.3fr_1fr]">
          <Reveal direction="left">
            <p style={{ ...T.label, color: ACCENT }}>About Alpha Girls</p>
            <h2
              className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl"
              style={{ color: ACCENT }}
            >
              Excellence,{" "}
              <Marked kind="underline" color="var(--color-gold)">
                <span style={{ color: "var(--color-bright-blue)" }}>no exceptions.</span>
              </Marked>
            </h2>
            <p className="mt-6 text-[var(--color-ink)]/80" style={T.body}>
              Alpha Girls High School sits at Kunduchi and teaches the Tanzanian national curriculum
              from Form 1 to Form 6 — NECTA sciences and arts, with aviation, coding and enterprise
              on the timetable rather than beside it.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-ink)]/80">
              The school exists to enable its students to achieve their best intellectually and
              physically, and to become responsible, self-directed citizens of a dynamic society.
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
              <p
                className="text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: GOLD }}
              >
                Our Promise
              </p>
              <h3 className="mt-2 font-display" style={T.cardTitle}>
                Leadership is practised, not promised.
              </h3>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/90">
                {[
                  "A full NECTA syllabus, its own laboratories, and no ceiling on what is expected.",
                  "Aviation and coding built into the timetable — not optional extras.",
                  "Leadership practised daily — house, prefect and club roles led by girls.",
                  "A campus where speaking up is ordinary, not brave.",
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
      <div className="font-display text-2xl font-black leading-none" style={{ color: ACCENT }}>
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
/* Order follows the page. A sub-nav that lists sections in a different
   order than the reader meets them is a map of a different building. */
const SUB_NAV = [
  { label: "What's distinctive", href: "#distinctive" },
  { label: "Competing", href: "#compete" },
  { label: "Academics", href: "#academics" },
  { label: "Life at Kunduchi", href: "#life" },
  { label: "The school year", href: "#year" },
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
  "Historia ya Tanzania na Maadili",
  "Civics",
  "History",
  "Geography",
  "Kiswahili",
  "English Language",
  "Business Studies",
  "Book Keeping",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Chinese",
  "French",
  "Literature in English",
  "ICS",
  "Additional Mathematics",
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
    items: [
      "Chinese",
      "French",
      "Computer Science",
      "History",
      "Biology",
      "Physics",
      "Chemistry",
      "Book Keeping",
    ],
  },
  {
    form: "Form Three",
    note: "Nine option subjects",
    items: [
      "Chinese",
      "French",
      "ICS",
      "Literature in English",
      "Commerce",
      "Book Keeping",
      "Physics",
      "Chemistry",
      "Additional Mathematics",
    ],
  },
  {
    form: "Form Four",
    note: "Nine option subjects",
    items: [
      "Chinese",
      "French",
      "ICS",
      "Literature in English",
      "Commerce",
      "Book Keeping",
      "Physics",
      "Chemistry",
      "Additional Mathematics",
    ],
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
  {
    group: "Arts",
    rule: "At least Division III, maximum 23 points, with a minimum of C in every principal subject.",
  },
  {
    group: "Business",
    rule: "Division II with at least C in every principal subject, plus the mathematics or computer requirement for the chosen combination.",
  },
  {
    group: "Science",
    rule: "Minimum Division II with 19 points, plus the subject-specific requirements for the chosen combination.",
  },
] as const;

/* ------------------------------------------------------------------ *
 * ALPHA GIRLS-SPECIFIC CONTENT
 * All of this is from ALPHA_GIRLS_WEBSITE.docx and is UNCONFIRMED.
 * It is what genuinely distinguishes this school from Alpha High, so it
 * carries the page — but every block of it is labelled on the page.
 * ------------------------------------------------------------------ */

/** The cookery club runs as an enterprise, not a hobby. */
const ENTERPRISE_PATHWAY = [
  "Learn",
  "Practise",
  "Produce",
  "Package",
  "Market",
  "Sell",
  "Account",
] as const;

/* ⚠ SOURCE FLAG — the school's table gives the Driving Club's focus as
 * "Scientific inquiry", which is a copy-paste error in their document.
 * It is deliberately not reproduced. No focus line is invented for it. */
const GIRLS_CLUBS: ReadonlyArray<{ name: string; note?: string }> = [
  { name: "Driving" },
  { name: "Entrepreneurship" },
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
  {
    name: "Tanzania National World Schools Debate Championship",
    where: "National",
    when: "August",
  },
  { name: "TCRO Dar Open Schools Debate Championship", where: "Dar es Salaam", when: "May" },
] as const;

/** Alpha Girls leads with what only Alpha Girls has. */
function WhatMakesAlphaGirls() {
  return (
    <section id="distinctive" className="bg-[var(--color-surface)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <p style={{ ...T.label, color: ACCENT }}>How they learn to lead</p>
        <h2
          className="mt-2 max-w-3xl font-display tracking-tight text-[var(--color-ink)]"
          style={T.section}
        >
          Cookery that runs as a business, debate that travels, and girls who learn to drive.
        </h2>
        <span
          aria-hidden
          className="mt-[var(--heading-rule-gap)] block"
          style={{
            width: "var(--heading-rule-w)",
            height: "var(--heading-rule-h)",
            background: "var(--heading-rule-color)",
            borderRadius: "var(--heading-rule-radius)",
          }}
        />

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
                  <span aria-hidden className="text-[var(--color-gold)]">
                    &rarr;
                  </span>
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
                <span className="font-display text-[var(--color-ink)]" style={T.cardTitle}>
                  {c.name}
                </span>
                {c.note && (
                  <span className="mt-1 block text-[var(--color-ink-soft)]" style={T.label}>
                    {c.note}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <UnconfirmedNote>
            Supplied by the school, August 2026. Not yet confirmed in writing. Club photographs are
            still outstanding.
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
        <h2
          className="mt-2 max-w-3xl font-display tracking-tight text-[var(--color-ink)]"
          style={T.section}
        >
          They compete well past Dar es Salaam.
        </h2>
        <span
          aria-hidden
          className="mt-[var(--heading-rule-gap)] block"
          style={{
            width: "var(--heading-rule-w)",
            height: "var(--heading-rule-h)",
            background: "var(--heading-rule-color)",
            borderRadius: "var(--heading-rule-radius)",
          }}
        />

        <ul className="mt-[var(--space-block-y)] grid gap-[var(--space-card-gap)] md:grid-cols-3">
          {COMPETITIONS.map((c) => (
            <li
              key={c.name}
              className="rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] shadow-[var(--card-shadow)]"
            >
              <span style={{ ...T.label, color: ACCENT }}>{c.when}</span>
              <h3 className="mt-2 font-display text-[var(--color-ink)]" style={T.cardTitle}>
                {c.name}
              </h3>
              <p className="mt-1 text-[var(--color-ink-soft)]" style={T.body}>
                {c.where}
              </p>
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
        <h2
          className="mt-2 max-w-3xl font-display tracking-tight text-[var(--color-ink)]"
          style={T.section}
        >
          What is next on the Kunduchi calendar.
        </h2>
        <span
          aria-hidden
          className="mt-[var(--heading-rule-gap)] block"
          style={{
            width: "var(--heading-rule-w)",
            height: "var(--heading-rule-h)",
            background: "var(--heading-rule-color)",
            borderRadius: "var(--heading-rule-radius)",
          }}
        />

        <ul className="mt-[var(--space-block-y)] grid gap-[var(--space-card-gap)] sm:grid-cols-3">
          {UPCOMING_2026.map((e) => (
            <li
              key={e.what}
              className="rounded-[var(--radius-card)] border border-[var(--color-hairline)] p-[var(--space-card-pad)]"
            >
              <span style={{ ...T.label, color: ACCENT }}>{e.when}</span>
              <p className="mt-2 font-display text-[var(--color-ink)]" style={T.cardTitle}>
                {e.what}
              </p>
            </li>
          ))}
        </ul>
        <UnconfirmedNote>
          From the 2026 calendar supplied by the school in August 2026, not yet confirmed in
          writing. Earlier dates in that calendar have passed and are not listed.
        </UnconfirmedNote>
      </div>
    </section>
  );
}

function Academics() {
  return (
    <section id="academics" className="bg-[var(--color-off-white)]">
      <CurriculumBand
        image={labBench}
        title="Seventeen subjects at O-Level, twelve combinations at A-Level."
        intro="Every subject examinable across Forms One to Four, what a girl in each form may choose between, and all twelve A-Level combinations with their subjects written out."
        accent={ACCENT}
      />

      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <div>
          <h3 className="font-display text-[var(--color-ink)]" style={T.cardTitle}>
            Subjects offered
          </h3>
          <div className="mt-5">
            <SubjectTileList items={O_LEVEL_SUBJECTS} accent={ACCENT} />
          </div>
          {/* The comp splits this list into "Core Subjects (for all students)"
              and a set of option categories. The school has never said which
              are core, and the one grouping invented here before had to be
              removed — so the question is marked, not answered. See
              design/CONTENT-FROM-SCHOOL.md. */}
          <UnconfirmedNote>
            [Which of these seventeen are core for every girl, and which are offered as options — to
            be provided by the school.]
          </UnconfirmedNote>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-ink)]" style={T.cardTitle}>
            Option subjects by form
          </h3>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            What a girl in each form may choose between &mdash; a different thing from the full
            subject list above.
          </p>
          <div className="mt-5">
            <FormOptionsList forms={FORM_OPTIONS} accent={ACCENT} />
          </div>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-ink)]" style={T.cardTitle}>
            A-Level combinations
          </h3>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            All twelve, with their subjects written out. Form 5&ndash;6, ACSEE.
          </p>
          <div className="mt-5">
            <CombinationList groups={A_COMBOS} accent={ACCENT} />
          </div>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-ink)]" style={T.cardTitle}>
            Entry criteria
          </h3>
          <ul className="mt-5 grid gap-[var(--space-card-gap)] md:grid-cols-3">
            {ENTRY_CRITERIA.map((e) => (
              <li
                key={e.group}
                className="rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] shadow-[var(--card-shadow)]"
              >
                <span style={{ ...T.label, color: ACCENT }}>{e.group}</span>
                <p className="mt-2 text-[var(--color-ink)]" style={T.body}>
                  {e.rule}
                </p>
              </li>
            ))}
          </ul>
          <UnconfirmedNote>
            Entry criteria come from the Alpha Girls document and are not yet confirmed in writing.
          </UnconfirmedNote>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <GuidanceCallout
            title="Not sure which combination fits?"
            body="The academic team can talk a girl through the options before Form Five."
            cta="Talk to our team"
            accent={ACCENT}
          />
        </div>
      </div>
    </section>
  );
}

const FACILITIES = [
  { key: "alpha-girls.facilities.science-labs", label: "Science labs" },
  { key: "alpha-girls.facilities.library", label: "Library" },
  { key: "alpha-girls.facilities.sports-field", label: "Sports field" },
  { key: "alpha-girls.facilities.boarding", label: "Boarding" },
];

function LifeAtKunduchi() {
  const photos = useSuspenseQuery(photosQuery).data;
  const plate = slotPhoto(photos, "alpha-girls.students.campus-plate")!;
  return (
    <section id="life" className="relative overflow-hidden bg-white">
      {/* Marks around the campus plate rather than on it: the photograph is
          the subject here, and a doodle over a face is graffiti. */}
      <Backdrop
        kind="scribble"
        className="left-[3%] top-24 hidden md:block"
        width="6rem"
        rotate={-8}
      />
      <Backdrop kind="star" className="right-[6%] top-40" width="2.75rem" rotate={14} />
      <Backdrop
        kind="orbit"
        className="bottom-24 right-[2%] hidden lg:block"
        width="8rem"
        rotate={6}
      />

      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p style={{ ...T.label, color: ACCENT }}>Campus</p>
            <h2 className="mt-2 font-display" style={{ ...T.section, color: ACCENT }}>
              Life at{" "}
              <Marked kind="underline" color="var(--color-gold)">
                Kunduchi.
              </Marked>
            </h2>
          </div>
          <Link
            to="/facilities"
            className="font-bold hover:underline"
            style={{ ...T.body, color: ACCENT }}
          >
            See facilities →
          </Link>
        </Reveal>

        {/* The campus at full width, ahead of the facility tiles. It was a
            quarter-width thumbnail in a row of four; a parent deciding
            whether their daughter will spend five years somewhere wants to
            see the place, not a contact sheet. */}
        <Reveal direction="up" className="relative mt-[var(--space-block-y)]">
          <figure className="relative overflow-hidden rounded-[var(--panel-radius)] shadow-[var(--shadow-banner)]">
            {/* campus-girls.webp is the debate team with their certificates,
                not a view of the campus — the filename is misleading. Described
                for what it actually shows: alt text that names the wrong
                subject is a lie told to a screen reader. */}
            <img
              width={1600}
              height={1000}
              src={plate.src}
              alt={
                photos["alpha-girls.students.campus-plate"]?.alt_text ??
                "Alpha Girls students celebrating with medals and certificates"
              }
              loading="lazy"
              decoding="async"
              className="block aspect-[16/10] w-full object-cover sm:aspect-[2/1]"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, color-mix(in srgb, var(--color-girls-teal-deep) 82%, transparent) 0%, transparent 55%)",
              }}
            />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="max-w-xl text-[var(--color-surface)]" style={T.body}>
                Medals and certificates, brought back to Kunduchi.
              </p>
            </figcaption>
          </figure>
          {/* A drawn arrow pointing into the plate, sitting half off it. */}
          <Backdrop
            kind="arrow"
            className="-top-6 right-10 hidden sm:block"
            width="4.5rem"
            rotate={18}
          />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FACILITIES.map((f, i) => (
            <FacilityTile
              key={f.key}
              slotKey={f.key}
              label={f.label}
              photos={photos}
              accent={ACCENT}
              delay={i * 70}
            />
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
    <section style={{ background: SEA.tint }}>
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="max-w-2xl">
          <p style={{ ...T.label, color: ACCENT }}>Leadership & teaching</p>
          <h2 className="mt-2 font-display" style={{ ...T.section, color: ACCENT }}>
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
                      width={600}
                      height={800}
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
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${SEA.deep})` }}
                    >
                      <span className="font-display text-6xl font-black text-white/30">
                        {p.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
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

/* The page-local <style> block that lived here is gone.

   It defined agDriftA, agDriftB and agHeroShift — three infinite loops
   driving the lilac gradient and the two blurred blooms behind the old
   hero. That hero no longer exists, so the animations had nothing left to
   animate, and a looping background wash is the exact pattern
   motion-audits/2026-09-02 was commissioned to remove. agComboIn went with
   them: nothing referenced it. */
