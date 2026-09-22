import { SchoolFacilitiesSection } from "@/components/school/facilities-section";
import { SchoolSubNav } from "@/components/school/school-sub-nav";
import { FacilityTile } from "@/components/school/facility-tile";
import {
  CinematicHero,
  HeroCredentials,
  GoldButton,
  GhostButton,
  SectionHead,
  FeatureCard,
  StatBar,
  Marked,
  Backdrop,
  SHELL,
} from "@/components/alpha-ui";
import {
  CombinationList,
  SubjectTileList,
  FormOptionsList,
  type CombinationGroup,
} from "@/components/school/subject-lists";
import { CurriculumBand, GuidanceCallout } from "@/components/school/academics-frame";
import labBench from "@/assets/subjects/lab-bench.webp";
import { UnconfirmedNote } from "@/components/school/unconfirmed-note";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSchoolBundle, getSchoolPhotos, type SchoolBundle } from "@/lib/alpha-content.functions";
import { ParentVoices } from "@/components/school/parent-voices";
import { testimonialsQuery } from "@/lib/testimonials-query";
import { slotPhoto, type SlotPhotoMap } from "@/lib/photo-slots";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { TornEdge } from "@/components/torn-edge";
import { Reveal } from "@/components/reveal";
import {
  ArrowRight,
  Laptop,
  Users,
  GraduationCap,
  Plane,
  Compass,
  Trophy,
  MapPin,
  Award,
} from "lucide-react";
import graduate from "@/assets/alpha-high-graduate.webp";
import campusAerial from "@/assets/alpha-high-campus-aerial.webp";
import clubAviation from "@/assets/club-aviation.webp";

import { T } from "@/components/type-roles";

const slug = "alpha-high" as const;
const ACCENT = "var(--color-deep-blue)";
const GOLD = "var(--color-gold)";

const photosQuery = queryOptions({
  queryKey: ["school-photos", "alpha-high"],
  queryFn: () => getSchoolPhotos({ data: { slug: "alpha-high" as const } }),
  staleTime: 5 * 60 * 1000,
});

const bundleQuery = queryOptions({
  queryKey: ["school-bundle", slug],
  queryFn: () => getSchoolBundle({ data: { slug } }),
});

export const Route = createFileRoute("/schools/alpha-high")({
  head: () => ({
    ...seo({
      title: "Alpha High, Mikocheni — Alpha Schools, Dar es Salaam",
      description:
        "Alpha High School in Mikocheni, Dar es Salaam: a co-education secondary teaching Form 1 to Form 6, with 17 O-Level subjects and 12 A-Level combinations.",
      path: "/schools/alpha-high",
    }),
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(bundleQuery),
      context.queryClient.ensureQueryData(photosQuery),
      context.queryClient.ensureQueryData(testimonialsQuery),
    ]),
  component: AlphaHighRoute,
});

function AlphaHighRoute() {
  const { data } = useSuspenseQuery(bundleQuery);
  return <AlphaHighPage bundle={data} />;
}

// ---------- Page ----------

function AlphaHighPage({ bundle }: { bundle: SchoolBundle }) {
  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <SiteHeader overlay />
      <Hero />
      <SchoolSubNav items={SUB_NAV} />
      <AtAGlance />
      <About />
      <Academics />
      <AdmissionProcess />
      <LifeAtMikocheni />
      <BeyondClassroom />
      <Distinctive />
      <ParentVoices school="alpha-high" accent="var(--color-deep-blue)" />
      <ApplyBanner />
      <AlphaHighFooter />
    </div>
  );
}

// ---------- Entry requirements ----------

function EntryRequirements() {
  return (
    <section id="requirements" className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <p className="text-[var(--color-bright-blue)]" style={T.label}>
          Admissions
        </p>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-[var(--color-deep-blue)] sm:text-4xl">
          Requirements
        </h2>
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-gold)]/70 bg-[var(--color-off-white)] p-7">
          <p className="font-display text-base font-semibold text-[var(--color-deep-blue)]">
            [Entry requirements — to be confirmed with academic offices]
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]/70">
            Placeholder — the confirmed entry requirements for this school will be published here.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------- Hero ----------

/**
 * The opening screen. Where ShapedHero put the first viewport inside a
 * rounded card on a white page, this fills the screen with the campus
 * itself and stages the copy over it.
 *
 * The photographs that were pinned to the old mosaic become the slides,
 * on the `alpha-high` hero_slides key the schema already reserves — so
 * the school can change this hero from the admin tool exactly as it can
 * change the homepage's.
 */
function Hero() {
  return (
    <CinematicHero
      eyebrow="Mikocheni · Form 1–6 · Co-education"
      lineOne="Excellence through challenge."
      lineTwo="Built for the long climb."
      blurb="Our flagship secondary in Mikocheni. NECTA rigour, with aviation and coding at the core."
      media={
        <HeroSlideshow
          pageKey="alpha-high"
          fallback={[
            { src: campusAerial, alt: "The Mikocheni campus from the air" },
            { src: graduate, alt: "An Alpha High graduate in cap and gown" },
            { src: clubAviation, alt: "Alpha High aviation club students" },
          ]}
        />
      }
      actions={
        <>
          <GoldButton href="#academics">
            Explore our school
            <ArrowRight className="h-4 w-4" aria-hidden />
          </GoldButton>
          <GhostButton to="/contact" onNavy>
            Book a school tour
          </GhostButton>
        </>
      }
      foot={
        <HeroCredentials
          items={[
            {
              label: "Co-education",
              sub: "Boys and girls, Form 1–6",
              icon: <Users className="h-5 w-5" />,
            },
            {
              label: "NECTA curriculum",
              sub: "CSEE and ACSEE",
              icon: <GraduationCap className="h-5 w-5" />,
            },
            {
              label: "Aviation programme",
              sub: "Ground school to PPL",
              icon: <Plane className="h-5 w-5" />,
            },
            {
              label: "Coding",
              sub: "From primary up",
              icon: <Laptop className="h-5 w-5" />,
            },
          ]}
        />
      }
    />
  );
}

function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-[var(--color-off-white)]">
      <Backdrop
        kind="arrow"
        className="right-[4%] top-12 hidden md:block"
        width="4.5rem"
        rotate={-8}
      />
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <div className="grid items-start gap-12 lg:grid-cols-[1.3fr_1fr]">
          <Reveal direction="left">
            <p style={{ ...T.label, color: ACCENT }}>About Alpha High</p>
            <h2
              className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl"
              style={{ color: ACCENT }}
            >
              Excellence through challenge —{" "}
              <Marked kind="underline" color="var(--color-gold)">
                <span style={{ color: "var(--color-bright-blue)" }}>since 2007.</span>
              </Marked>
            </h2>
            <p className="mt-6 text-[var(--color-ink)]/80" style={T.body}>
              Established <strong>19 March 2007</strong>, Alpha High was founded to enable students
              to achieve academic excellence through intellectual and physical challenge, and to
              become responsible citizens of a dynamic society.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-ink)]/80">
              A nurturing ground for accomplished professionals and leaders — locally and globally.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-5">
              <Stat value="2007" label="Founded" />
              <Stat value="Form 1–6" label="O & A-Level" />
              <Stat value="11" label="A-Level combos" />
            </div>
          </Reveal>

          <Reveal direction="right">
            <div
              className="relative overflow-hidden rounded-2xl p-7 text-white shadow-xl"
              style={{ background: ACCENT }}
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-25 blur-2xl"
                style={{ background: GOLD }}
              />
              <p
                className="text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: GOLD }}
              >
                Our Mission
              </p>
              <h3 className="mt-2 font-display" style={T.cardTitle}>
                Education that grows the whole student.
              </h3>
              <ul className="mt-5 space-y-3 text-white/90" style={T.body}>
                {[
                  "A source of intellectual, spiritual and cultural growth.",
                  "Knowledge that meets individual needs.",
                  "Critical and divergent thinking.",
                  "All-rounded students.",
                  "Attitudes that make students social, mobile, interactive, ambitious and self-directed.",
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
    <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
      <div className="font-display text-2xl font-black leading-none" style={{ color: ACCENT }}>
        {value}
      </div>
      <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink)]/60">
        {label}
      </div>
    </div>
  );
}

// ---------- Academics ----------

/** Section anchors for the shared sub-nav. Alpha High's own order. */
const SUB_NAV = [
  { label: "About", href: "#about" },
  { label: "Academics", href: "#academics" },
  { label: "Admission", href: "#admission" },
  { label: "Life at Mikocheni", href: "#life" },
  { label: "Clubs & sport", href: "#clubs" },
] as const;

/* ------------------------------------------------------------------ *
 * ACADEMIC DATA — confirmed by the school 2026-09-02.
 * See design/CONTENT-FROM-SCHOOL.md. Data lives here, not in a shared
 * module, so Alpha High and Alpha Girls can diverge without a refactor.
 *
 * Removed as fabrications at the same time: A-Level codes KLF and ECA
 * (in no school document), the typo PMC (correct code is PMCs), and the
 * invented "Science / Arts / Business / Optional" O-Level grouping.
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

/** The documented admission process. NOT a fee structure — see below. */
const ADMISSION_STEPS = [
  "Pay the application fee of TSh 35,000",
  "Sit the entrance examination",
  "Pass at the school average of 55%",
  "Receive joining instructions after paying TSh 500,000 as part of the first tuition instalment",
] as const;

/* design/README.md: the years figure is calculated from the 2007 founding
   date and must never be hardcoded. Every figure below is derivable from
   confirmed data — the subject and combination counts come from the lists
   on this page. No invented statistics. */
const FOUNDED = 2007;

function AtAGlance() {
  const years = new Date().getFullYear() - FOUNDED;
  return (
    <section className={`${SHELL} pb-[var(--space-section-y)]`}>
      <StatBar
        items={[
          { figure: `${years}+`, label: "Years since 2007", icon: <Award className="h-5 w-5" /> },
          {
            figure: String(O_LEVEL_SUBJECTS.length),
            label: "O-Level subjects",
            icon: <GraduationCap className="h-5 w-5" />,
          },
          {
            figure: String(A_COMBOS.reduce((n, g) => n + g.items.length, 0)),
            label: "A-Level combinations",
            icon: <Compass className="h-5 w-5" />,
          },
          { figure: "1", label: "Aviation programme", icon: <Plane className="h-5 w-5" /> },
        ]}
      />
    </section>
  );
}

function Academics() {
  return (
    <section id="academics" className="bg-[var(--color-surface)]">
      <CurriculumBand
        image={labBench}
        title="Seventeen subjects at O-Level, twelve combinations at A-Level."
        intro="Every subject examinable across Forms One to Four, what a pupil in each form may choose between, and all twelve A-Level combinations with their subjects written out."
      />

      <div className={`${SHELL} py-[var(--space-section-y)]`}>
        <div>
          <h3 className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
            Subjects offered
          </h3>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            Every subject examinable at O-Level across Forms One to Four.
          </p>
          <div className="mt-5">
            <SubjectTileList items={O_LEVEL_SUBJECTS} />
          </div>
          {/* The comp splits this list into "Core Subjects (for all students)"
              and a set of option categories. The school has never said which
              of the seventeen are core, and the one grouping invented here
              before had to be removed — so the question is marked, not
              answered. See design/CONTENT-FROM-SCHOOL.md. */}
          <UnconfirmedNote>
            [Which of these seventeen are core for every pupil, and which are offered as options —
            to be provided by the school.]
          </UnconfirmedNote>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
            Option subjects by form
          </h3>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            What a pupil in each form may choose between — a different thing from the full subject
            list above.
          </p>
          <div className="mt-5">
            <FormOptionsList forms={FORM_OPTIONS} />
          </div>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
            A-Level combinations
          </h3>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            All twelve, with their subjects written out. Form 5&ndash;6, ACSEE.
          </p>
          <div className="mt-5">
            <CombinationList groups={A_COMBOS} />
          </div>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <GuidanceCallout
            title="Not sure which combination fits?"
            body="The academic team can talk a pupil through the options before Form Five."
            cta="Talk to our team"
          />
        </div>
      </div>
    </section>
  );
}

function AdmissionProcess() {
  return (
    <section id="admission" className="bg-[var(--color-off-white)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <p className="text-[var(--color-deep-blue)]" style={T.label}>
          Admission
        </p>
        <h2
          className="mt-2 max-w-3xl font-display tracking-tight text-[var(--color-ink)]"
          style={T.section}
        >
          How a place at Alpha High is offered.
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

        <ol className="mt-[var(--space-block-y)] grid gap-[var(--space-card-gap)] sm:grid-cols-2 lg:grid-cols-4">
          {ADMISSION_STEPS.map((step, i) => (
            <li
              key={step}
              className="rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] shadow-[var(--card-shadow)]"
            >
              <span className="font-display text-[var(--color-deep-blue)]" style={T.stat}>
                {i + 1}
              </span>
              <p className="mt-2 text-[var(--color-ink)]" style={T.body}>
                {step}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-6 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
          These two figures are part of the admission process, not the cost of attending. [Fee
          structure per school &mdash; to be provided]
        </p>
      </div>
    </section>
  );
}

function Distinctive() {
  return (
    <section className="bg-[var(--color-off-white)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="max-w-2xl">
          <p style={{ ...T.label, color: ACCENT }}>Distinctive at Alpha High</p>
          <h2
            className="mt-2 font-display text-2xl font-black sm:text-3xl"
            style={{ color: ACCENT }}
          >
            Two things you'll only find here.
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <SignpostCard
            eyebrow="Aviation"
            title="Aviation Program in Alpha Schools"
            body="Ground school, PPL pathway and simulator training — built into the timetable, not bolted on."
            href="/aviation"
            cta="Inside the aviation programme"
          />
          <SignpostCard
            eyebrow="Coding & digital skills"
            title="Real programming, from the classroom."
            body="Computer literacy for every student, with coding pathways that take serious learners much further."
            href="/coding"
            cta="See the curriculum"
          />
        </div>
      </div>
    </section>
  );
}

function SignpostCard({
  eyebrow,
  title,
  body,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: "/aviation" | "/coding";
  cta: string;
}) {
  return (
    <Reveal direction="up">
      <article className="group relative h-full overflow-hidden rounded-2xl bg-white p-7 ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1 active:translate-y-0 hover:shadow-xl">
        <div
          aria-hidden
          className="absolute right-0 top-0 h-1 w-full origin-left scale-x-0 transition-transform duration-150 group-hover:scale-x-100"
          style={{ background: GOLD }}
        />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
          {eyebrow}
        </p>
        <h3 className="mt-2 font-display" style={{ ...T.cardTitle, color: ACCENT }}>
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]/75">{body}</p>
        <Link
          to={href}
          className="mt-5 inline-flex items-center gap-1 text-sm font-bold transition-transform group-hover:translate-x-1"
          style={{ color: ACCENT }}
        >
          {cta} →
        </Link>
      </article>
    </Reveal>
  );
}

// ---------- Beyond the classroom ----------

const CLUBS = [
  { name: "Aviation", key: "alpha-high.clubs.aviation" },
  { name: "Drama", key: "alpha-high.clubs.drama" },
  { name: "Music & Dance", key: "alpha-high.clubs.music" },
  { name: "Debate", key: "alpha-high.clubs.debate" },
  { name: "Art & Drawing", key: "alpha-high.clubs.art" },
  { name: "Cookery", key: "alpha-high.clubs.cookery" },
  { name: "Scout", key: "alpha-high.clubs.scout" },
  { name: "Public Speaking", key: "alpha-high.clubs.speaking" },
  { name: "Model UN", key: "alpha-high.clubs.model-un" },
  { name: "Environment", key: "alpha-high.clubs.environment" },
];
const SPORTS = [
  { name: "Football", key: "alpha-high.sport.football" },
  { name: "Basketball", key: "alpha-high.sport.basketball" },
  { name: "Volleyball", key: "alpha-high.sport.volleyball" },
  { name: "Netball", key: "alpha-high.sport.netball" },
  { name: "Athletics", key: "alpha-high.sport.athletics" },
];

function ClubsRibbon({ photos }: { photos: SlotPhotoMap }) {
  // Duplicate the list so the marquee loops seamlessly.
  const loop = [...CLUBS, ...CLUBS];
  return (
    <Reveal direction="up" className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <h3 className="font-display text-2xl font-black" style={{ color: ACCENT }}>
          Clubs & societies
        </h3>
        <span style={{ ...T.label, color: ACCENT }}>{CLUBS.length}+ student-led clubs</span>
      </div>

      <div
        className="group relative mt-5 overflow-x-auto overflow-y-hidden rounded-2xl border border-black/5 bg-[var(--color-off-white)] py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex w-max gap-5 px-5 animate-[clubsMarquee_38s_linear_infinite] [animation-play-state:paused] motion-safe:[animation-play-state:running] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
          {loop.map((c, i) => (
            <figure
              key={`${c.name}-${i}`}
              className="relative h-56 w-72 shrink-0 overflow-hidden rounded-xl shadow-md ring-1 ring-black/10 transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] hover:shadow-xl"
            >
              <img
                src={slotPhoto(photos, c.key)!.src}
                alt={photos[c.key]?.alt_text ?? `${c.name} club at Alpha High`}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                loading="lazy"
                decoding="async"
                width={800}
                height={1024}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(12,68,124,0.85) 0%, rgba(12,68,124,0.15) 45%, transparent 65%)",
                }}
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-4 pb-3 text-white">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: GOLD }}
                />
                <span className="font-display text-sm font-bold tracking-wide">{c.name}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes clubsMarquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        }
      `}</style>
    </Reveal>
  );
}

function BeyondClassroom() {
  const photos = useSuspenseQuery(photosQuery).data;
  // Two states rather than a half-filled grid: the pills below are the
  // current design and stay until a sport photograph actually exists.
  const anySport = SPORTS.some((s) => photos[s.key]);
  return (
    <section id="clubs" className="bg-white">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="max-w-2xl">
          <p style={{ ...T.label, color: ACCENT }}>Beyond the classroom</p>
          <h2 className="mt-2 font-display" style={{ ...T.section, color: ACCENT }}>
            The other half of an Alpha education.
          </h2>
        </Reveal>

        <ClubsRibbon photos={photos} />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal direction="up" delay={80}>
            <div className="h-full rounded-2xl border border-black/5 bg-[var(--color-off-white)] p-6">
              <h3 className="font-display text-lg font-bold" style={{ color: ACCENT }}>
                Sports
              </h3>
              {anySport ? (
                <ul className="mt-4 grid grid-cols-2 gap-3">
                  {SPORTS.map((s) => {
                    const photo = slotPhoto(photos, s.key);
                    return (
                      <li
                        key={s.key}
                        className="relative aspect-[4/5] overflow-hidden rounded-lg ring-1 ring-black/5"
                      >
                        {photo ? (
                          <>
                            <img
                              src={photo.src}
                              alt={photos[s.key]?.alt_text ?? `${s.name} at Alpha High`}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          </>
                        ) : (
                          <div
                            aria-hidden
                            className="absolute inset-0"
                            style={{ background: ACCENT }}
                          />
                        )}
                        <span className="absolute inset-x-0 bottom-0 p-2 text-xs font-semibold text-white">
                          {s.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="mt-4 space-y-2">
                  {SPORTS.map((s) => (
                    <li
                      key={s.key}
                      className="flex items-center gap-3 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-black/5"
                      style={{ color: ACCENT }}
                    >
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ background: GOLD }}
                      />
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>

          <Reveal direction="up" delay={160}>
            <div
              className="relative h-full overflow-hidden rounded-2xl p-7 text-white shadow-xl"
              style={{ background: ACCENT }}
            >
              <div
                aria-hidden
                className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full opacity-25 blur-2xl"
                style={{ background: GOLD }}
              />
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: GOLD }}
              >
                Counselling
              </p>
              <h3 className="mt-2 font-display" style={T.cardTitle}>
                A confidential ear, always available.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/85">
                Alpha High runs a school counselling department, accessible to every student —
                confidential, professional, and built into school life.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ---------- Life at Mikocheni ----------

const FACILITIES = [
  { key: "alpha-high.facilities.science-labs", label: "Science labs" },
  { key: "alpha-high.facilities.library", label: "Library" },
  { key: "alpha-high.facilities.sports-field", label: "Sports field" },
  { key: "alpha-high.facilities.boarding", label: "Boarding" },
];

function LifeAtMikocheni() {
  const photos = useSuspenseQuery(photosQuery).data;
  return (
    <section id="life" className="bg-[var(--color-off-white)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p style={{ ...T.label, color: ACCENT }}>Campus</p>
            <h2 className="mt-2 font-display" style={{ ...T.section, color: ACCENT }}>
              Life at Mikocheni.
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

// ---------- Staff ----------

function Staff({ staff }: { staff: SchoolBundle["staff"] }) {
  // seed Head Teacher if backend hasn't supplied anyone yet
  const list =
    staff.length > 0
      ? staff
      : [{ id: "seed-head", name: "Richard Gatere Maina", title: "Head Teacher", photo_url: null }];

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="max-w-2xl">
          <p style={{ ...T.label, color: ACCENT }}>Leadership & teaching</p>
          <h2 className="mt-2 font-display" style={{ ...T.section, color: ACCENT }}>
            The people behind the climb.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <Reveal key={p.id} direction="up">
              <article className="group h-full overflow-hidden rounded-2xl bg-[var(--color-off-white)] ring-1 ring-black/5 transition hover:-translate-y-1 active:translate-y-0 hover:shadow-xl">
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
                      style={{
                        background: `linear-gradient(135deg, ${ACCENT}, var(--color-bright-blue))`,
                      }}
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

// ---------- Apply CTA banner ----------

function ApplyBanner() {
  return (
    <section style={{ background: GOLD }}>
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-6 py-12 sm:flex-row sm:items-center lg:px-10">
        <Reveal direction="left">
          <h2 className="font-display text-2xl font-black sm:text-3xl" style={{ color: ACCENT }}>
            Applications for the next intake are open.
          </h2>
          <p className="mt-2 max-w-xl text-sm font-semibold text-[var(--color-accent-foreground)]/80">
            Visit Mikocheni, sit the assessment, join the climb.
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

// ---------- Footer ----------

function AlphaHighFooter() {
  return (
    <>
      <div className="bg-[var(--color-deep-blue)] py-5 text-center text-xs font-bold uppercase tracking-[0.22em] text-white/80">
        ALPHA SCHOOLS · <span style={{ color: GOLD }}>Alpha High</span>
        <div className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-white/55">
          Mikocheni campus · Dar es Salaam · part of ALFA EDUCATION CENTRE
        </div>
      </div>
      <SchoolFacilitiesSection slug="alpha-high" accent="var(--color-deep-blue)" />
      <SiteFooter />
    </>
  );
}
