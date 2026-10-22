import { SchoolFacilitiesSection } from "@/components/school/facilities-section";
import { SchoolSubNav } from "@/components/school/school-sub-nav";
import { SubjectExplorer } from "@/components/school/subject-explorer";
import { UnconfirmedNote } from "@/components/school/unconfirmed-note";
import type { CombinationGroup } from "@/components/school/subject-lists";
import { ResultsChart } from "@/components/school/results-chart";
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
import { Photo } from "@/components/photo";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { T, SHELL, heroStep } from "@/components/type-roles";
import { Marked } from "@/components/alpha-ui";
import { ACSEE_2026, CSEE_2024, CSEE_2025, CSEE_2025_ENGLISH } from "@/lib/girls-results";
import {
  ArrowRight,
  Calendar,
  GraduationCap,
  MapPin,
  Trophy,
  ChefHat,
  Car,
  Briefcase,
  Plane,
  Mic,
  Laptop,
  Palette,
  Leaf,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import labPractical from "@/assets/ag-lab-practical.webp";
import labBench from "@/assets/ag-lab-bench.webp";
import gradsGardenGroup from "@/assets/ag-grads-garden-group.webp";
import gradsGardenPair from "@/assets/ag-grads-garden-pair.webp";
import class2026Trio from "@/assets/ag-class-2026-trio.webp";
import class2026Sash from "@/assets/ag-class-2026-sash.webp";
import gradPortrait1 from "@/assets/ag-grad-portrait-1.webp";
import gradPortrait2 from "@/assets/ag-grad-portrait-2.webp";
import gradPortrait3 from "@/assets/ag-grad-portrait-3.webp";
import gradPortrait4 from "@/assets/ag-grad-portrait-4.webp";
import gradPortrait5 from "@/assets/ag-grad-portrait-5.webp";
import gradPortrait6 from "@/assets/ag-grad-portrait-6.webp";
import gradPortrait7 from "@/assets/ag-grad-portrait-7.webp";
import gradPortrait8 from "@/assets/ag-grad-portrait-8.webp";
import avGirlsCessna from "@/assets/av-girls-cessna.webp";

const slug = "alpha-girls" as const;
const ACCENT = "var(--color-girls-teal)";
const DEEP = "var(--color-girls-teal-deep)";
const TINT = "var(--color-girls-teal-tint)";
const GOLD = "var(--color-gold)";

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
      title: "Alpha Girls: Girls' Secondary School in Kunduchi, Dar es Salaam",
      description:
        "A girls' secondary school in Kunduchi, Dar es Salaam, Form 1 to Form 6 (O-Level and A-Level). 30 of 45 girls in Division I in NECTA's 2025 Form Four results, with aviation and coding on the timetable.",
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

/** The six chapters, in the order a parent reads a prospectus. */
const SUB_NAV = [
  { label: "About", href: "#about" },
  { label: "Academics", href: "#academics" },
  { label: "Results", href: "#results" },
  { label: "Student life", href: "#life" },
  { label: "People", href: "#people" },
  { label: "Admission", href: "#admission" },
] as const;

/** Clears the header and the sticky sub-nav when jumping to an anchor. */
const ANCHOR = { scrollMarginTop: "calc(var(--header-h) + 3.75rem)" };

const BTN =
  "inline-flex min-h-[var(--btn-primary-min-h)] items-center gap-2 rounded-[var(--radius-pill)] px-7 transition-transform duration-150 hover:-translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-gold)]";

function AlphaGirlsRoute() {
  const { data } = useSuspenseQuery(bundleQuery);
  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <SiteHeader overlay />
      <Hero />
      <SchoolSubNav items={SUB_NAV} />
      <About />
      <Academics />
      <Results />
      <StudentLife />
      <People staff={data.staff} />
      <Admission />
      <ApplyBanner />
      <SchoolFacilitiesSection slug="alpha-girls" accent={ACCENT} />
      <SiteFooter />
    </div>
  );
}

/* ================================================================== *
 * 1. HERO — who the school is, in one screen
 *
 * Opens on a deep sea-green field rather than a scrimmed photo: the green
 * of the Class of 2026 suits, with gold the colour of the gowns' trim. The
 * graduates' photograph is the admin-managed slideshow, framed rather than
 * full-bleed, so the headline never depends on how dark a slide is.
 * ================================================================== */

function Hero() {
  return (
    <section className="relative overflow-hidden text-white" style={{ background: DEEP }}>
      <div
        className={`${SHELL} grid items-center gap-10 pb-10 pt-[calc(var(--header-h)+2.5rem)] lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-14`}
      >
        <div>
          <h1 className="font-display tracking-tight text-balance" style={T.hero}>
            <span className="sr-only">Alpha Girls High School, Kunduchi, Dar es Salaam: </span>
            <span className="hero-rise block" style={heroStep("var(--hero-t-line-1)", "420ms")}>
              Where girls learn
            </span>
            <span
              className="hero-rise block"
              style={{ ...heroStep("var(--hero-t-line-2)", "420ms"), color: GOLD }}
            >
              to lead.
            </span>
          </h1>
          <p
            className="hero-rise mt-5 max-w-lg text-white/90"
            style={{ ...T.body, ...heroStep("var(--hero-t-blurb)") }}
          >
            A girls&rsquo; secondary on the Kunduchi campus, Form 1 to Form 6, teaching the
            Tanzanian national curriculum to NECTA. Leadership is practised daily: house, prefect
            and club roles are all held by girls.
          </p>
          <div
            className="hero-rise mt-7 flex flex-wrap gap-3"
            style={heroStep("var(--hero-t-cta)")}
          >
            <Link
              to="/admission"
              className={`${BTN} text-[var(--color-accent-foreground)]`}
              style={{ ...T.body, fontWeight: 800, background: GOLD }}
            >
              Enroll Now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="#results"
              className={`${BTN} border border-white/45 text-white hover:bg-white/10`}
              style={{ ...T.body, fontWeight: 800 }}
            >
              See the results
            </a>
          </div>
        </div>

        <div
          className="hero-rise relative pb-8 pl-8 sm:pb-10 sm:pl-14"
          style={heroStep("var(--hero-t-tail)", "420ms")}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] lg:aspect-[4/5] lg:max-h-[min(36rem,calc(100svh-14rem))] lg:w-auto">
            <HeroSlideshow
              pageKey="alpha-girls"
              showDots={false}
              fallback={[
                {
                  src: gradsGardenGroup,
                  alt: "Alpha Girls graduates in black and gold gowns in the school garden",
                },
                {
                  src: class2026Trio,
                  alt: "Three Alpha Girls students of the Class of 2026 in green suits",
                },
                {
                  src: labPractical,
                  alt: "Alpha Girls students at work in the science laboratory",
                },
              ]}
              imgClassName="object-cover"
            />
          </div>
          <Photo
            sizes="(min-width: 1024px) 13vw, 24vw"
            src={gradPortrait1}
            alt=""
            width={700}
            height={980}
            className="absolute bottom-0 left-0 w-[24%] -rotate-3 rounded-2xl border-4 object-cover shadow-[0_18px_36px_-16px_rgba(0,0,0,0.6)]"
            style={{ borderColor: GOLD, aspectRatio: "5 / 7" }}
          />
          <Photo
            sizes="(min-width: 1024px) 11vw, 20vw"
            src={gradPortrait2}
            alt=""
            width={700}
            height={980}
            className="absolute bottom-6 left-[20%] hidden w-[20%] rotate-3 rounded-2xl border-4 border-white object-cover shadow-[0_18px_36px_-16px_rgba(0,0,0,0.6)] sm:block"
            style={{ aspectRatio: "5 / 7" }}
          />
        </div>
      </div>

      {/* Four facts at the hero's foot: the prospectus cover line. */}
      <div
        className="hero-rise border-t border-white/15"
        style={{ ...heroStep("var(--hero-t-tail)", "320ms"), background: ACCENT }}
      >
        <ul
          className={`${SHELL} hero-cred-strip flex gap-6 overflow-x-auto py-4 [scrollbar-width:none] sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible sm:py-5 [&::-webkit-scrollbar]:hidden`}
        >
          {[
            { label: "Form 1 to 6", sub: "O-Level and A-Level", Icon: GraduationCap },
            { label: "Kunduchi", sub: "Dar es Salaam", Icon: MapPin },
            { label: "Girls only", sub: "A girls' secondary", Icon: Users },
            { label: "Since 2020", sub: "Alpha's girls' school", Icon: Calendar },
          ].map((c) => (
            <li key={c.label} className="flex shrink-0 items-center gap-3 sm:shrink">
              <span
                aria-hidden
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full sm:h-12 sm:w-12"
                style={{ background: GOLD }}
              >
                <c.Icon className="h-5 w-5" style={{ color: DEEP }} />
              </span>
              <span className="min-w-0">
                <span className="block whitespace-nowrap font-display sm:whitespace-normal" style={T.cardTitle}>
                  {c.label}
                </span>
                <span className="hidden text-white/80 sm:block" style={T.label}>
                  {c.sub}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ================================================================== *
 * Shared pieces for the chapters
 * ================================================================== */

function ChapterHead({
  title,
  lead,
  onDark = false,
}: {
  title: ReactNode;
  lead?: ReactNode;
  onDark?: boolean;
}) {
  return (
    <Reveal direction="up" className="max-w-3xl">
      <h2
        className="font-display tracking-tight text-balance"
        style={{ ...T.hero, color: onDark ? "#fff" : DEEP }}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={`mt-5 max-w-2xl ${onDark ? "text-white/85" : "text-[var(--color-ink)]/85"}`}
          style={T.body}
        >
          {lead}
        </p>
      )}
    </Reveal>
  );
}

/* ================================================================== *
 * 2. ABOUT — who the school is
 * ================================================================== */

/** The milestones the site already records, oldest first. */
const MILESTONES = [
  {
    when: "2020",
    what: "Alpha Girls opens at the Kunduchi campus",
    body: "A girls-only secondary school in the Alpha group, whose first school dates from 2007.",
  },
  {
    when: "18 April 2026",
    what: "The 5th Form VI graduation",
    body: "Five Form Six classes have now graduated from Kunduchi.",
  },
  {
    when: "22 August 2026",
    what: "The 4th Form IV graduation day",
    body: "Form Four girls in their gowns, ahead of the CSEE in November.",
  },
  {
    when: "2026",
    what: "Every Form Six girl in Division I or II",
    body: "Ten in Division I, ten in Division II, in NECTA's ACSEE.",
  },
] as const;

function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-white" style={ANCHOR}>
      <div className={`${SHELL} grid gap-12 py-[var(--space-section-y)] lg:grid-cols-[1fr_1.1fr] lg:gap-16`}>
        <div>
          <ChapterHead
            title={
              <>
                Excellence,{" "}
                <Marked kind="underline" color={GOLD}>
                  no exceptions.
                </Marked>
              </>
            }
            lead="Alpha Girls High School sits at Kunduchi and teaches the Tanzanian national curriculum from Form 1 to Form 6 — NECTA sciences and arts, with aviation, coding and enterprise on the timetable rather than beside it."
          />
          <Reveal direction="up">
            <p className="mt-4 max-w-xl text-[var(--color-ink)]/85" style={T.body}>
              The school exists to enable its students to achieve their best intellectually and
              physically, and to become responsible, self-directed citizens of a dynamic society.
            </p>

            <ol className="mt-10 border-l-[3px] pl-7" style={{ borderColor: GOLD }}>
              {MILESTONES.map((m) => (
                <li key={m.what} className="relative pb-7 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute -left-[2.2rem] top-1 h-4 w-4 rounded-full border-[3px] bg-white"
                    style={{ borderColor: DEEP }}
                  />
                  <p className="font-display" style={{ ...T.body, fontWeight: 800, color: ACCENT }}>
                    {m.when}
                  </p>
                  <p className="mt-0.5 font-display" style={{ ...T.cardTitle, color: "var(--color-ink)" }}>
                    {m.what}
                  </p>
                  <p className="mt-1 text-[var(--color-ink-soft)]" style={T.body}>
                    {m.body}
                  </p>
                </li>
              ))}
            </ol>
            <UnconfirmedNote>
              The graduation dates come from the 2026 calendar supplied by the school in August 2026,
              not yet confirmed in writing. The 2026 Form Six results are NECTA&rsquo;s.
            </UnconfirmedNote>
          </Reveal>
        </div>

        <Reveal direction="up" className="grid grid-cols-2 gap-3 sm:gap-4">
          <figure className="col-span-2">
            <Photo
              sizes="(min-width: 1024px) 55vw, 100vw"
              src={class2026Trio}
              alt="Three Alpha Girls students of the Class of 2026 in green suits"
              width={1400}
              height={1887}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-[1.75rem] object-cover object-[50%_25%]"
            />
            <figcaption className="mt-2.5 text-[var(--color-ink-soft)]" style={T.body}>
              The Class of 2026.
            </figcaption>
          </figure>
          <Photo
            sizes="(min-width: 1024px) 55vw, 100vw"
            src={class2026Sash}
            alt="An Alpha Girls student wearing a Class of 2026 sash"
            width={900}
            height={1311}
            loading="lazy"
            decoding="async"
            className="aspect-[3/4] w-full rounded-[1.75rem] object-cover object-top"
          />
          <Photo
            sizes="(min-width: 1024px) 28vw, 50vw"
            src={gradsGardenPair}
            alt="Alpha Girls graduates in gowns in the school garden"
            width={1000}
            height={1500}
            loading="lazy"
            decoding="async"
            className="aspect-[3/4] w-full rounded-[1.75rem] object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== *
 * 3. ACADEMICS — what it teaches
 *
 * ACADEMIC DATA — confirmed by the school 2026-09-02.
 * See design/CONTENT-FROM-SCHOOL.md. Data lives here rather than in a
 * shared module so Alpha Girls and Alpha High can diverge without a
 * refactor — sharing the copy is how they became the same page.
 *
 * Removed as fabrications: A-Level codes KLF and ECA (in no school
 * document), the typo PMC (correct code is PMCs), BUAcCs and MEBu (in the
 * Alpha Girls document but not offered), and the invented
 * "Science / Arts / Business / Optional" O-Level grouping.
 * ================================================================== */

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

function Academics() {
  return (
    <section id="academics" className="bg-[var(--color-off-white)]" style={ANCHOR}>
      <div className="text-white" style={{ background: DEEP }}>
        <div
          className={`${SHELL} grid items-center gap-10 py-[var(--space-section-y)] lg:grid-cols-[1.1fr_1fr] lg:gap-14`}
        >
          <div>
            <h2 className="font-display tracking-tight text-balance" style={T.hero}>
              Seventeen subjects at O-Level,{" "}
              <span style={{ color: GOLD }}>twelve combinations at A-Level.</span>
            </h2>
            <p className="mt-5 max-w-xl text-white/90" style={T.body}>
              Every subject examinable across Forms One to Four, what a girl in each form may choose
              between, and all twelve A-Level combinations with their subjects written out. Pick a
              form or a stream, or search a subject.
            </p>
          </div>
          <Photo
            sizes="(min-width: 1024px) 50vw, 100vw"
            src={labBench}
            alt="Alpha Girls students at a laboratory bench during a science practical"
            width={1200}
            height={1273}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full rounded-[1.75rem] object-cover"
          />
        </div>
      </div>

      <div className={`${SHELL} py-[var(--space-section-y)]`}>
        <SubjectExplorer
          subjects={O_LEVEL_SUBJECTS}
          forms={FORM_OPTIONS}
          combos={A_COMBOS}
          accent={ACCENT}
          subjectsNote={
            /* The comp splits this list into "Core Subjects (for all students)"
               and a set of option categories. The school has never said which
               are core, and the one grouping invented here before had to be
               removed — so the question is marked, not answered. See
               design/CONTENT-FROM-SCHOOL.md. */
            <UnconfirmedNote>
              [Which of these seventeen are core for every girl, and which are offered as options —
              to be provided by the school.]
            </UnconfirmedNote>
          }
        />
        <p className="mt-6 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
          Not sure which combination fits? The academic team can talk a girl through the options
          before Form Five.{" "}
          <Link to="/contact" className="font-bold underline underline-offset-4" style={{ color: ACCENT }}>
            Talk to our team
          </Link>
        </p>

        <h3 className="mt-14 font-display" style={{ ...T.section, color: DEEP }}>
          Also on the timetable.
        </h3>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6">
          <li>
            <Link
              to="/aviation"
              className="group relative isolate flex min-h-[18rem] flex-col justify-end overflow-hidden rounded-[1.75rem] text-white transition-transform duration-200 hover:-translate-y-[2px] motion-reduce:transition-none sm:min-h-[22rem]"
            >
              <Photo
                sizes="(min-width: 640px) 50vw, 100vw"
                src={avGirlsCessna}
                alt="Alpha aviation students in safety vests beside a Cessna"
                width={1200}
                height={900}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <span
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in srgb, var(--color-girls-teal-deep) 92%, transparent) 0%, color-mix(in srgb, var(--color-girls-teal-deep) 45%, transparent) 45%, transparent 75%)",
                }}
              />
              <span className="p-6 sm:p-7">
                <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: GOLD }}>
                  <Plane className="h-5 w-5" style={{ color: DEEP }} aria-hidden />
                </span>
                <span className="mt-3 block font-display" style={T.section}>
                  Aviation
                </span>
                <span className="mt-1 block max-w-sm text-white/90" style={T.body}>
                  Ground school, aircraft engineering and flying, with holiday training and study
                  tours on the Kunduchi calendar.
                </span>
                <span
                  className="mt-3 inline-flex items-center gap-1.5 font-display"
                  style={{ ...T.body, fontWeight: 800, color: GOLD }}
                >
                  Read more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/coding"
              className="group flex min-h-[18rem] flex-col justify-end rounded-[1.75rem] p-6 text-white transition-transform duration-200 hover:-translate-y-[2px] motion-reduce:transition-none sm:min-h-[22rem] sm:p-7"
              style={{ background: ACCENT }}
            >
              <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: GOLD }}>
                <Laptop className="h-5 w-5" style={{ color: DEEP }} aria-hidden />
              </span>
              <span className="mt-3 block font-display" style={T.section}>
                Coding
              </span>
              <span className="mt-1 block max-w-sm text-white/90" style={T.body}>
                Coding runs through the timetable alongside the sciences, and the ICT club after it.
              </span>
              <span
                className="mt-3 inline-flex items-center gap-1.5 font-display"
                style={{ ...T.body, fontWeight: 800, color: GOLD }}
              >
                Read more
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ================================================================== *
 * 4. RESULTS — how its students perform
 * ================================================================== */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const COMPETITIONS = [
  { name: "Pan African Schools Championship", where: "South Africa", when: "June" },
  {
    name: "Tanzania National World Schools Debate Championship",
    where: "National",
    when: "August",
  },
  { name: "TCRO Dar Open Schools Debate Championship", where: "Dar es Salaam", when: "May" },
] as const;

function Results() {
  const photos = useSuspenseQuery(photosQuery).data;
  const plate = slotPhoto(photos, "alpha-girls.students.campus-plate")!;
  return (
    <section
      id="results"
      className="relative overflow-hidden py-[var(--space-section-y)] text-white"
      style={{ ...ANCHOR, background: DEEP }}
    >
      <div className={SHELL}>
        <ChapterHead
          onDark
          title={
            <>
              The results, as{" "}
              <Marked kind="underline" color={GOLD}>
                NECTA
              </Marked>{" "}
              published them.
            </>
          }
          lead="One square for every girl who sat the exam, coloured by the division she reached."
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div>
            <h3 className="font-display" style={{ ...T.section, fontWeight: 900 }}>
              Form Four {CSEE_2025.year}:{" "}
              <span style={{ color: GOLD }}>
                {CSEE_2025.divisions.I} of {CSEE_2025.candidates} girls in Division I.
              </span>{" "}
              All {CSEE_2025.passed} passed.
            </h3>
            <div className="mt-6">
              <ResultsChart sitting={CSEE_2025} columns={15} />
            </div>
          </div>
          <div>
            <h3 className="font-display" style={{ ...T.section, fontWeight: 900 }}>
              Form Six {ACSEE_2026.year}:{" "}
              <span style={{ color: GOLD }}>all {ACSEE_2026.candidates} in Division I or II.</span>
            </h3>
            <div className="mt-6">
              <ResultsChart sitting={ACSEE_2026} columns={10} />
            </div>
          </div>
        </div>

        {/* The year before, square for square, so the rise is seen not told. */}
        <div className="mt-14 grid gap-12 border-t border-white/20 pt-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div>
            <h3 className="font-display" style={{ ...T.section, fontWeight: 900 }}>
              The year before: {CSEE_2024.divisions.I} in Division I.{" "}
              <span style={{ color: GOLD }}>
                In {CSEE_2025.year}, {CSEE_2025.divisions.I}.
              </span>
            </h3>
            <p className="mt-2 text-white/85" style={T.body}>
              Form Four {CSEE_2024.year}, also {CSEE_2024.candidates} girls.
            </p>
            <div className="mt-6">
              <ResultsChart sitting={CSEE_2024} columns={15} />
            </div>
          </div>
          <dl className="self-end border-t border-white/20">
            {[
              {
                k: "Form Four centre GPA",
                v: `${CSEE_2025.gpaGrade}: ${CSEE_2025.gpa} in ${CSEE_2025.year}, from ${CSEE_2024.gpa} in ${CSEE_2024.year}.`,
              },
              {
                k: "English Language",
                v: `${CSEE_2025_ENGLISH.grade}: GPA ${CSEE_2025_ENGLISH.gpa} across all ${CSEE_2025_ENGLISH.candidates} Form Four girls in ${CSEE_2025.year}.`,
              },
              {
                k: "Form Six centre GPA",
                v: `${ACSEE_2026.gpaGrade}: ${ACSEE_2026.gpa} in ${ACSEE_2026.year}.`,
              },
            ].map((r) => (
              <div key={r.k} className="border-b border-white/20 py-4">
                <dt className="font-display" style={{ ...T.body, fontWeight: 800, color: GOLD }}>
                  {r.k}
                </dt>
                <dd className="mt-1 text-white/90" style={T.body}>
                  {r.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Beyond the exam hall: where the girls compete. */}
        <div className="mt-16 grid gap-10 border-t border-white/20 pt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <Reveal direction="up">
            <figure>
              <Photo
                sizes="(min-width: 1024px) 55vw, 100vw"
                src={plate.src}
                alt={
                  photos["alpha-girls.students.campus-plate"]?.alt_text ??
                  "Alpha Girls students celebrating with medals and certificates"
                }
                width={1600}
                height={1000}
                loading="lazy"
                decoding="async"
                className="aspect-[3/2] w-full rounded-[1.75rem] object-cover"
              />
              <figcaption className="mt-3 text-white/90" style={T.body}>
                Medals and certificates, brought back to Kunduchi.
              </figcaption>
            </figure>
          </Reveal>
          <Reveal direction="up">
            <h3 className="font-display tracking-tight text-balance" style={T.section}>
              And beyond the exam hall.
            </h3>
            <ul className="mt-5 border-t border-white/25">
              {[...COMPETITIONS]
                .sort((x, y) => MONTHS.indexOf(x.when) - MONTHS.indexOf(y.when))
                .map((c) => (
                  <li key={c.name} className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-white/25 py-3.5">
                    <span className="font-display" style={{ ...T.body, fontWeight: 800, color: GOLD }}>
                      {c.when}
                    </span>
                    <span>
                      <span className="block font-display" style={{ ...T.body, fontWeight: 800 }}>
                        {c.name}
                      </span>
                      <span className="text-white/80" style={T.body}>
                        {c.where}
                      </span>
                    </span>
                  </li>
                ))}
            </ul>
            <div className="mt-4 [&_*]:!text-white/80">
              <UnconfirmedNote>
                Competitions were supplied by the school in August 2026 and are not yet confirmed
                in writing.
              </UnconfirmedNote>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== *
 * 5. STUDENT LIFE — life outside class
 *
 * ALPHA GIRLS-SPECIFIC CONTENT. All of this is from ALPHA_GIRLS_WEBSITE.docx
 * and is UNCONFIRMED. It is what genuinely distinguishes this school from
 * Alpha High, so it carries the chapter — but every block is labelled.
 * ================================================================== */

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
const GIRLS_CLUBS: ReadonlyArray<{ name: string }> = [
  { name: "Driving" },
  { name: "Entrepreneurship" },
  { name: "Aviation" },
  { name: "Debate" },
  { name: "ICT / Computer" },
  { name: "Music / Arts" },
  { name: "Environmental" },
] as const;

const CLUB_ICONS: Record<string, typeof Trophy> = {
  Driving: Car,
  Entrepreneurship: Briefcase,
  Aviation: Plane,
  Debate: Mic,
  "ICT / Computer": Laptop,
  "Music / Arts": Palette,
  Environmental: Leaf,
};

const FACILITIES = [
  { key: "alpha-girls.facilities.science-labs", label: "Science labs" },
  { key: "alpha-girls.facilities.library", label: "Library" },
  { key: "alpha-girls.facilities.sports-field", label: "Sports field" },
  { key: "alpha-girls.facilities.boarding", label: "Boarding" },
];

const PORTRAITS = [
  gradPortrait3,
  gradPortrait4,
  gradPortrait5,
  gradPortrait6,
  gradPortrait7,
  gradPortrait8,
  gradPortrait2,
  gradPortrait1,
];

/** The school's 2026 calendar. Each entry ends on `until` (inclusive). */
const CALENDAR_2026 = [
  { when: "24 October", until: "2026-10-24", what: "Visiting Day & PTC" },
  { when: "9–26 November", until: "2026-11-26", what: "CSEE Examination" },
  { when: "4 December", until: "2026-12-04", what: "Annual Staff Meeting" },
  { when: "5 December", until: "2026-12-05", what: "School Board Meeting" },
  { when: "5–23 December", until: "2026-12-23", what: "Aviation Holiday Training / Study Tour" },
] as const;

/** A sub-chapter of student life: a heading on the left, the material on the right. */
function LifeGroup({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <div className="grid gap-8 border-t border-[var(--color-hairline)] pt-10 lg:grid-cols-[14rem_1fr] lg:gap-14">
      <Reveal direction="up">
        <h3 className="font-display" style={{ ...T.section, color: DEEP }}>
          {title}
        </h3>
        {lead && (
          <p className="mt-3 text-[var(--color-ink-soft)]" style={T.body}>
            {lead}
          </p>
        )}
      </Reveal>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function StudentLife() {
  const photos = useSuspenseQuery(photosQuery).data;
  const today = new Date().toISOString().slice(0, 10);
  const next = CALENDAR_2026.filter((e) => e.until >= today).slice(0, 3);
  return (
    <section id="life" className="bg-white" style={ANCHOR}>
      <div className={`${SHELL} py-[var(--space-section-y)]`}>
        <ChapterHead
          title={
            <>
              Cookery that runs as a business, debate that travels, and girls who learn to{" "}
              <Marked kind="underline" color={GOLD}>
                drive.
              </Marked>
            </>
          }
          lead="Life at Kunduchi outside the exam hall: the enterprise pathway, seven clubs, the campus and the calendar."
        />

        <div className="mt-12 space-y-12">
          {/* Enterprise and clubs */}
          <LifeGroup title="Clubs." lead="Seven clubs, every role held by a girl.">
            <div className="rounded-[1.75rem] p-6 text-white sm:p-8" style={{ background: ACCENT }}>
              <h4 className="flex items-center gap-2 font-display" style={{ ...T.cardTitle, color: GOLD }}>
                <ChefHat className="h-5 w-5" aria-hidden /> The cookery enterprise pathway
              </h4>
              <p className="mt-2 text-white/90" style={T.body}>
                Girls do not just cook. They take a product the whole way.
              </p>
              <ol className="mt-5 flex flex-wrap gap-2">
                {ENTERPRISE_PATHWAY.map((step, i) => (
                  <li
                    key={step}
                    className="flex items-center gap-2 rounded-[var(--radius-pill)] bg-white px-4 py-1.5 font-display"
                    style={{ ...T.body, fontWeight: 800, color: DEEP }}
                  >
                    <span className="tabular-nums" style={{ color: ACCENT }}>
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <ul className="mt-6 grid border-t border-[var(--color-hairline)] sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
              {GIRLS_CLUBS.map((c) => {
                const Icon = CLUB_ICONS[c.name] ?? Trophy;
                return (
                  <li key={c.name} className="flex items-center gap-3 border-b border-[var(--color-hairline)] py-3.5">
                    <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: GOLD }}>
                      <Icon className="h-4 w-4" style={{ color: DEEP }} aria-hidden />
                    </span>
                    <span className="font-display" style={{ ...T.body, fontWeight: 800, color: DEEP }}>
                      {c.name}
                    </span>
                  </li>
                );
              })}
            </ul>
            <UnconfirmedNote>
              The enterprise pathway and clubs were supplied by the school in August 2026 and are
              not yet confirmed in writing. Club photographs are still outstanding.
            </UnconfirmedNote>
          </LifeGroup>

          {/* Campus */}
          <LifeGroup title="The campus." lead="Kunduchi, and the spaces the girls learn in.">
            <Reveal direction="up">
              <figure className="relative overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-banner)]">
                <Photo
                  sizes="(min-width: 1024px) 65vw, 100vw"
                  width={1600}
                  height={1511}
                  src={labPractical}
                  alt="Alpha Girls students in blue uniforms working through a practical in the science laboratory"
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
                  <p className="max-w-xl text-white" style={T.body}>
                    A practical in the Kunduchi science laboratory.
                  </p>
                </figcaption>
              </figure>
            </Reveal>
            <ul className="mt-6 grid border-t border-[var(--color-hairline)] sm:grid-cols-2 sm:gap-x-10">
              {FACILITIES.map((f) => {
                const uploaded = slotPhoto(photos, f.key);
                const src = uploaded?.src ?? (f.key.endsWith("science-labs") ? labBench : null);
                return (
                  <li key={f.key} className="flex items-center gap-4 border-b border-[var(--color-hairline)] py-4">
                    {src ? (
                      <Photo
                        sizes="7rem"
                        src={src}
                        alt={photos[f.key]?.alt_text ?? `${f.label} at Alpha Girls`}
                        width={1200}
                        height={900}
                        loading="lazy"
                        decoding="async"
                        className="h-20 w-28 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="h-20 w-28 shrink-0 rounded-xl border border-dashed"
                        style={{ borderColor: ACCENT, background: TINT }}
                      />
                    )}
                    <div>
                      <p className="font-display text-[var(--color-ink)]" style={T.cardTitle}>
                        {f.label}
                      </p>
                      {!src && (
                        <p className="mt-0.5 text-[var(--color-ink-soft)]" style={T.body}>
                          [Photograph to be provided by the school]
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link
              to="/facilities"
              className="mt-4 inline-flex items-center gap-1.5 font-display hover:underline"
              style={{ ...T.body, fontWeight: 800, color: ACCENT }}
            >
              See all facilities
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </LifeGroup>

          {/* Graduation day */}
          <LifeGroup title="Graduation day." lead="Black and gold gowns in the garden.">
            <Reveal direction="up">
              <ul className="grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-8">
                {PORTRAITS.map((src, i) => (
                  <li key={src} className={i % 2 ? "md:translate-y-6" : ""}>
                    <Photo
                      sizes="(min-width: 768px) 12.5vw, 25vw"
                      src={src}
                      alt="An Alpha Girls graduate in a black and gold gown"
                      width={700}
                      height={980}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[5/7] w-full rounded-2xl object-cover"
                    />
                  </li>
                ))}
              </ul>
            </Reveal>
          </LifeGroup>

          {/* Coming up: only dates still ahead. A list of past dates reads as
              abandoned, so the group hides itself once the calendar runs out. */}
          {next.length > 0 && (
            <LifeGroup title="Coming up." lead="On the Kunduchi calendar.">
              <ul className="grid gap-4 sm:grid-cols-3">
                {next.map((e) => (
                  <li key={e.what} className="rounded-[1.25rem] p-6" style={{ background: TINT }}>
                    <span aria-hidden className="mb-4 block h-1.5 w-10 rounded-full" style={{ background: GOLD }} />
                    <p className="font-display" style={{ ...T.body, fontWeight: 800, color: ACCENT }}>
                      {e.when}
                    </p>
                    <p className="mt-1 font-display text-[var(--color-ink)]" style={T.cardTitle}>
                      {e.what}
                    </p>
                  </li>
                ))}
              </ul>
              <UnconfirmedNote>
                From the 2026 calendar supplied by the school in August 2026, not yet confirmed in
                writing.
              </UnconfirmedNote>
            </LifeGroup>
          )}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== *
 * 6. PEOPLE — who runs it
 * ================================================================== */

function People({ staff }: { staff: SchoolBundle["staff"] }) {
  return (
    <div id="people" style={ANCHOR}>
      <section style={{ background: TINT }}>
        <div className={`${SHELL} py-[var(--space-section-y)]`}>
          <ChapterHead title="The women and men behind the climb." />
          {staff.length === 0 ? (
            /* The chapter stays on the page while the school owes the list:
               a placeholder is kept visible, never a section quietly dropped. */
            <p className="mt-6 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
              [Staff &mdash; names, roles and photographs to be provided by the school]
            </p>
          ) : (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {staff.map((p) => (
                <li key={p.id}>
                  <Reveal direction="up">
                    <article className="h-full overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-[var(--color-hairline)]">
                      {p.photo_url && (
                        <Photo
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                          width={600}
                          height={800}
                          src={p.photo_url}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[4/5] w-full object-cover"
                        />
                      )}
                      <div className="p-5">
                        <h3 className="font-display" style={{ ...T.cardTitle, color: DEEP }}>
                          {p.name}
                        </h3>
                        {p.title && (
                          <p className="mt-1 text-[var(--color-ink-soft)]" style={T.body}>
                            {p.title}
                          </p>
                        )}
                        {!p.photo_url && (
                          <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
                            [Photograph to be provided by the school]
                          </p>
                        )}
                      </div>
                    </article>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <ParentVoices school="alpha-girls" accent={ACCENT} />
    </div>
  );
}

/* ================================================================== *
 * 7. ADMISSION — how to join
 * ================================================================== */

function Admission() {
  return (
    <section id="admission" className="bg-white" style={ANCHOR}>
      <div className={`${SHELL} grid gap-10 py-[var(--space-section-y)] lg:grid-cols-[1fr_1.1fr] lg:gap-16`}>
        <div>
          <ChapterHead
            title="How to join Alpha Girls."
            lead="Entry to Form Five by stream, as the school documents it. Form One admission and the fee structure are still to be supplied."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/admission"
              className={`${BTN} text-[var(--color-accent-foreground)]`}
              style={{ ...T.body, fontWeight: 800, background: GOLD }}
            >
              Get the application form
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/contact"
              className={`${BTN} border border-[var(--color-hairline)] hover:bg-[var(--color-surface-muted)]`}
              style={{ ...T.body, fontWeight: 800, color: DEEP }}
            >
              Book a Visit
            </Link>
          </div>
        </div>
        <Reveal direction="up">
          <h3 className="font-display" style={{ ...T.cardTitle, color: DEEP }}>
            Entry criteria for Form Five
          </h3>
          <dl className="mt-4 border-t border-[var(--color-hairline)]">
            {ENTRY_CRITERIA.map((e) => (
              <div
                key={e.group}
                className="grid gap-1 border-b border-[var(--color-hairline)] py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
              >
                <dt className="font-display" style={{ ...T.body, fontWeight: 800, color: ACCENT }}>
                  {e.group}
                </dt>
                <dd className="text-[var(--color-ink)]" style={T.body}>
                  {e.rule}
                </dd>
              </div>
            ))}
          </dl>
          <UnconfirmedNote>
            Entry criteria come from the Alpha Girls document and are not yet confirmed in writing.
          </UnconfirmedNote>
          <p className="mt-5 text-[var(--color-ink-soft)]" style={T.body}>
            [Form One admission steps &mdash; to be provided by the school]
          </p>
          <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
            [Fee structure per school &mdash; to be provided]
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function ApplyBanner() {
  return (
    <section style={{ background: GOLD }}>
      <div
        className={`${SHELL} flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center`}
      >
        <div>
          <h2 className="font-display tracking-tight" style={{ ...T.section, color: DEEP }}>
            Applications for the next intake are open.
          </h2>
          <p className="mt-2 max-w-xl text-[var(--color-accent-foreground)]" style={T.body}>
            Visit Kunduchi, sit the assessment, claim your place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admission"
            className={`${BTN} text-white`}
            style={{ ...T.body, fontWeight: 800, background: DEEP }}
          >
            Enroll Now
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            to="/contact"
            className={`${BTN} border-2`}
            style={{ ...T.body, fontWeight: 800, borderColor: DEEP, color: DEEP }}
          >
            Book a Visit
          </Link>
        </div>
      </div>
    </section>
  );
}
