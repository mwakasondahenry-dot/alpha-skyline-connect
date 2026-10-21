import { SchoolFacilitiesSection } from "@/components/school/facilities-section";
import { SchoolSubNav } from "@/components/school/school-sub-nav";
import {
  CinematicHero,
  GoldButton,
  GhostButton,
  HeroCredentials,
  Marked,
} from "@/components/alpha-ui";
import { SubjectExplorer } from "@/components/school/subject-explorer";
import type { CombinationGroup } from "@/components/school/subject-lists";
import { UnconfirmedNote } from "@/components/school/unconfirmed-note";
import { ResultsChart } from "@/components/school/results-chart";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { schoolLd, breadcrumbLd } from "@/lib/structured-data";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSchoolBundle, getSchoolPhotos, type SchoolBundle } from "@/lib/alpha-content.functions";
import { ParentVoices } from "@/components/school/parent-voices";
import { testimonialsQuery } from "@/lib/testimonials-query";
import { slotPhoto } from "@/lib/photo-slots";
import { ACSEE_2026, CSEE_2024, CSEE_2025, CSEE_2025_ENGLISH } from "@/lib/high-results";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import { T, SHELL } from "@/components/type-roles";
import {
  ArrowRight,
  Calendar,
  ExternalLink,
  GraduationCap,
  Laptop,
  MapPin,
  Plane,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import campusAerial from "@/assets/alpha-high-campus-aerial.webp";
import labPractical from "@/assets/ah-lab-practical.webp";
import libraryShelves from "@/assets/ah-library-shelves.webp";
import libraryBoy from "@/assets/ah-library-boy.webp";
import libraryGirl from "@/assets/ah-library-girl.webp";
import classroom from "@/assets/ah-classroom.webp";
import gradPortrait1 from "@/assets/ah-grad-portrait-1.webp";
import gradPortrait2 from "@/assets/ah-grad-portrait-2.webp";
import gradPortrait3 from "@/assets/ah-grad-portrait-3.webp";
import gradsTree from "@/assets/ah-grads-tree.webp";
import gradSashBoy from "@/assets/ah-grad-sash-boy.webp";
import gradSashGirl from "@/assets/ah-grad-sash-girl.webp";
import f4GradStage from "@/assets/ah-f4-grad-stage.webp";
import f4GradTrio from "@/assets/ah-f4-grad-trio.webp";
import f4GradBoys from "@/assets/ah-f4-grad-boys.webp";
import f4GradGirl1 from "@/assets/ah-f4-grad-girl-1.webp";
import charityVisit from "@/assets/ah-charity-visit.webp";
import beachCleanup1 from "@/assets/ah-beach-cleanup-1.webp";
import beachCleanup2 from "@/assets/ah-beach-cleanup-2.webp";
import taweceTeam from "@/assets/ah-tawece-team.webp";
import taweceDemo from "@/assets/ah-tawece-demo.webp";
import taweceTrophy from "@/assets/ah-tawece-trophy.webp";
import tbcDesk from "@/assets/ah-tbc-desk.webp";
import tbcCamera from "@/assets/ah-tbc-camera.webp";
import tbcControl from "@/assets/ah-tbc-control.webp";
import timexpoStand from "@/assets/ah-timexpo-stand.webp";
import timexpoTeam from "@/assets/ah-timexpo-team.webp";
import tablets from "@/assets/ah-tablets.webp";
import chemBeakers from "@/assets/ah-chem-beakers.webp";
import chemLab from "@/assets/ah-chem-lab.webp";
import studyGirl from "@/assets/ah-study-girl.webp";
import djClub2 from "@/assets/ah-dj-club-2.webp";
import foodServing from "@/assets/ah-food-serving.webp";
import foodFruit from "@/assets/ah-food-fruit.webp";
import foodLunch from "@/assets/ah-food-lunch.webp";
import debatePlaque from "@/assets/ah-debate-plaque.webp";
import debateTrophy from "@/assets/ah-debate-trophy.webp";
import debateTeam from "@/assets/ah-debate-team.webp";
import avCadets from "@/assets/av-boys-cessna.webp";

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
        "Alpha High School in Mikocheni, Dar es Salaam: a co-education secondary teaching Form 1 to Form 6. In NECTA's 2025 Form Four results, 60 of 92 students reached Division I.",
      path: "/schools/alpha-high",
      ld: [
        schoolLd(
          "alpha-high",
          "A co-education secondary school in Mikocheni, Dar es Salaam, teaching Form 1 to Form 6.",
        ),
        breadcrumbLd([{ name: "Alpha High", path: "/schools/alpha-high" }]),
      ],
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
const SPORTS = ["Football", "Basketball", "Volleyball", "Netball", "Athletics"] as const;

/** The school's own mission, as it supplied it. */
const MISSION_LEAD =
  "Established 19 March 2007, Alpha High was founded to enable students to achieve academic excellence through intellectual and physical challenge, and to become responsible citizens of a dynamic society.";
const MISSION_POINTS = [
  "A source of intellectual, spiritual and cultural growth.",
  "Knowledge that meets individual needs.",
  "Critical and divergent thinking.",
  "All-rounded students.",
  "Attitudes that make students social, mobile, interactive, ambitious and self-directed.",
] as const;

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

type Photo = { src: string; alt: string; w: number; h: number };

function AlphaHighPage({ bundle }: { bundle: SchoolBundle }) {
  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <SiteHeader overlay />
      <Hero />
      <SchoolSubNav items={SUB_NAV} />
      <About />
      <Academics />
      <Results />
      <StudentLife />
      <People staff={bundle.staff} />
      <Admission />
      <ApplyBanner />
      <SchoolFacilitiesSection slug="alpha-high" accent={ACCENT} />
      <SiteFooter />
    </div>
  );
}

/* ================================================================== *
 * 1. HERO — who the school is, in one screen
 * ================================================================== */

function Hero() {
  return (
    <CinematicHero
      lineOne="Excellence through challenge."
      lineTwo="Built for the long climb."
      blurb="Our flagship secondary in Mikocheni, Dar es Salaam: boys and girls, Form 1 to Form 6, the Tanzanian national curriculum to NECTA, with aviation and coding on the timetable."
      media={
        <HeroSlideshow
          pageKey="alpha-high"
          fallback={[
            { src: labPractical, alt: "Alpha High students running a practical in the laboratory" },
            { src: f4GradStage, alt: "The Form Four graduating class on stage" },
            { src: classroom, alt: "A teacher with students in an Alpha High classroom" },
          ]}
        />
      }
      actions={
        <>
          <GoldButton to="/admission">
            Enroll Now
            <ArrowRight className="h-4 w-4" aria-hidden />
          </GoldButton>
          <GhostButton href="#results" onNavy>
            See the results
          </GhostButton>
        </>
      }
      foot={
        <HeroCredentials
          items={[
            {
              label: "Form 1 to 6",
              sub: "O-Level and A-Level",
              icon: <GraduationCap className="h-5 w-5" aria-hidden />,
            },
            {
              label: "Mikocheni",
              sub: "Dar es Salaam",
              icon: <MapPin className="h-5 w-5" aria-hidden />,
            },
            {
              label: "Co-education",
              sub: "Boys and girls",
              icon: <Users className="h-5 w-5" aria-hidden />,
            },
            {
              label: "Since 2007",
              sub: "Established 19 March",
              icon: <Calendar className="h-5 w-5" aria-hidden />,
            },
          ]}
        />
      }
    />
  );
}

/* ================================================================== *
 * Shared pieces for the chapters
 * ================================================================== */

const Img = ({
  p,
  className = "",
  eager = false,
}: {
  p: Photo;
  className?: string;
  eager?: boolean;
}) => (
  <img
    src={p.src}
    alt={p.alt}
    width={p.w}
    height={p.h}
    loading={eager ? "eager" : "lazy"}
    decoding="async"
    className={`h-full w-full object-cover ${className}`}
  />
);

/** A chapter heading: the heading carries the section, no label above it. */
function ChapterHead({
  title,
  lead,
  onDark = false,
  className = "",
}: {
  title: ReactNode;
  lead?: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <Reveal direction="up" className={`max-w-3xl ${className}`}>
      <h2
        className="font-display tracking-tight text-balance"
        style={{ ...T.hero, color: onDark ? "#fff" : ACCENT }}
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

/** A photo set with a bold caption line under it, the school's words as source. */
function PhotoStory({
  title,
  body,
  source,
  photos,
  layout = "wide",
  onDark = false,
  children,
}: {
  title: string;
  body?: string;
  source?: string;
  photos: ReadonlyArray<Photo>;
  layout?: "wide" | "pair" | "trio" | "tall";
  onDark?: boolean;
  children?: ReactNode;
}) {
  const [first, ...rest] = photos;
  const ink = onDark ? "text-white" : "text-[var(--color-ink)]";
  const soft = onDark ? "text-white/75" : "text-[var(--color-ink-soft)]";
  return (
    <Reveal direction="up" className="min-w-0">
      {layout === "wide" && (
        <div className="grid gap-2 sm:gap-3">
          <div className="aspect-[3/2] overflow-hidden rounded-[1.5rem]">
            <Img p={first} />
          </div>
          {rest.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {rest.slice(0, 2).map((p) => (
                <div key={p.src} className="aspect-[4/3] overflow-hidden rounded-[1.25rem]">
                  <Img p={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {layout === "pair" && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {photos.slice(0, 2).map((p) => (
            <div key={p.src} className="aspect-[4/5] overflow-hidden rounded-[1.5rem]">
              <Img p={p} />
            </div>
          ))}
        </div>
      )}
      {layout === "trio" && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="col-span-2 row-span-2 aspect-[4/5] overflow-hidden rounded-[1.5rem]">
            <Img p={first} />
          </div>
          {rest.slice(0, 2).map((p) => (
            <div key={p.src} className="aspect-[4/5] overflow-hidden rounded-[1.25rem]">
              <Img p={p} />
            </div>
          ))}
        </div>
      )}
      {layout === "tall" && (
        <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] sm:aspect-[3/4]">
          <Img p={first} className="object-top" />
        </div>
      )}
      <h3 className={`mt-4 font-display ${ink}`} style={T.cardTitle}>
        {title}
      </h3>
      {body && (
        <p className={`mt-1 ${onDark ? "text-white/85" : "text-[var(--color-ink)]/85"}`} style={T.body}>
          {body}
        </p>
      )}
      {source && (
        <p className={`mt-1.5 ${soft}`} style={T.body}>
          {source}
        </p>
      )}
      {children}
    </Reveal>
  );
}

/* ================================================================== *
 * 2. ABOUT — who the school is
 * ================================================================== */

function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-white" style={ANCHOR}>
      <div className={`${SHELL} py-[var(--space-section-y)]`}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <ChapterHead
              title={
                <>
                  A school that teaches the{" "}
                  <Marked kind="underline" color={GOLD}>
                    whole student.
                  </Marked>
                </>
              }
              lead={MISSION_LEAD}
            />
            <Reveal direction="up">
              <ul className="mt-8 border-t border-[var(--color-hairline)]">
                {MISSION_POINTS.map((m) => (
                  <li
                    key={m}
                    className="flex gap-3 border-b border-[var(--color-hairline)] py-3 text-[var(--color-ink)]/90"
                    style={T.body}
                  >
                    <span
                      aria-hidden
                      className="mt-2.5 h-1.5 w-4 shrink-0 rounded-full"
                      style={{ background: GOLD }}
                    />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal direction="up">
              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6">
                {[
                  ["Campus", "Mikocheni, Dar es Salaam"],
                  ["Intake", "Co-education, boys and girls"],
                  ["Levels", "Form 1 to Form 6: CSEE and ACSEE"],
                  ["Established", "19 March 2007"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-display" style={{ ...T.body, fontWeight: 800, color: ACCENT }}>
                      {k}
                    </dt>
                    <dd className="mt-0.5 text-[var(--color-ink)]/85" style={T.body}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* The campus from the air, with the classroom and the library
              tucked over its corner: the place before the paperwork. */}
          <Reveal direction="up" className="relative pb-16 sm:pb-20 lg:self-start lg:pb-24">
            <img
              src={campusAerial}
              alt="The Alpha High campus in Mikocheni from the air: three blocks around a planted courtyard"
              width={1440}
              height={810}
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full rounded-[1.75rem] object-cover shadow-[var(--shadow-banner)]"
            />
            <img
              src={classroom}
              alt="A teacher with students in an Alpha High classroom"
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
              className="absolute bottom-0 left-4 w-[46%] -rotate-2 rounded-[1.25rem] border-4 border-white object-cover shadow-[var(--shadow-card-hover)] sm:left-8"
              style={{ aspectRatio: "3 / 2" }}
            />
            <img
              src={libraryShelves}
              alt="Two students reaching for books on the tall library shelves"
              width={1600}
              height={1067}
              loading="lazy"
              decoding="async"
              className="absolute bottom-6 right-4 w-[38%] rotate-2 rounded-[1.25rem] border-4 object-cover shadow-[var(--shadow-card-hover)] sm:right-8"
              style={{ aspectRatio: "3 / 2", borderColor: GOLD }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== *
 * 3. ACADEMICS — what it teaches
 * ================================================================== */

function Academics() {
  return (
    <section id="academics" className="bg-[var(--color-off-white)]" style={ANCHOR}>
      <div className="text-white" style={{ background: ACCENT }}>
        <div
          className={`${SHELL} grid items-center gap-10 py-[var(--space-section-y)] lg:grid-cols-[1.1fr_1fr] lg:gap-14`}
        >
          <div>
            <h2 className="font-display tracking-tight text-balance" style={T.hero}>
              Seventeen subjects at O-Level,{" "}
              <span style={{ color: GOLD }}>twelve combinations at A-Level.</span>
            </h2>
            <p className="mt-5 max-w-xl text-white/90" style={T.body}>
              Every subject examinable across Forms One to Four, what a pupil in each form may
              choose between, and all twelve A-Level combinations with their subjects written out.
              Pick a form or a stream, or search a subject.
            </p>
          </div>
          <div className="grid grid-cols-[1.3fr_1fr] gap-3">
            <img
              src={labPractical}
              alt="Three Alpha High students in green uniform running a practical at a laboratory bench"
              width={1800}
              height={1200}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full rounded-[1.75rem] object-cover"
            />
            <div className="grid gap-3">
              <img
                src={chemBeakers}
                alt="Two beakers of blue and yellow solutions on a laboratory bench"
                width={1200}
                height={1200}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full rounded-[1.25rem] object-cover"
              />
              <img
                src={chemLab}
                alt="Alpha High students at work during a laboratory practical"
                width={1200}
                height={1200}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full rounded-[1.25rem] object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`${SHELL} py-[var(--space-section-y)]`}>
        <SubjectExplorer
          subjects={O_LEVEL_SUBJECTS}
          forms={FORM_OPTIONS}
          combos={A_COMBOS}
          accent={ACCENT}
          subjectsNote={
            /* The school has never said which of the seventeen are core; the
               one grouping invented here before had to be removed. See
               design/CONTENT-FROM-SCHOOL.md. */
            <UnconfirmedNote>
              [Which of these seventeen are core for every pupil, and which are offered as options —
              to be provided by the school.]
            </UnconfirmedNote>
          }
        />
        <p className="mt-6 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
          Not sure which combination fits? The academic team can talk a pupil through the options
          before Form Five.{" "}
          <Link
            to="/contact"
            className="font-bold text-[var(--color-deep-blue)] underline underline-offset-4"
          >
            Talk to our team
          </Link>
        </p>

        {/* Beyond the syllabus: the two programmes that make Alpha Alpha. */}
        <h3 className="mt-14 font-display" style={{ ...T.section, color: ACCENT }}>
          Also on the timetable.
        </h3>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6">
          {(
            [
              {
                to: "/aviation",
                title: "Aviation",
                body: "Ground school, aircraft engineering and flying, inside a NECTA secondary school.",
                src: avCadets,
                alt: "Alpha students in safety vests beside a Cessna on the apron",
                Icon: Plane,
              },
              {
                to: "/coding",
                title: "Coding",
                body: "Tablets in class alongside the books, and coding through the timetable.",
                src: tablets,
                alt: "Two Alpha students in blue tracksuits working on a tablet together",
                Icon: Laptop,
              },
            ] as const
          ).map((x) => (
            <li key={x.to}>
              <Link
                to={x.to}
                className="group relative isolate flex min-h-[18rem] flex-col justify-end overflow-hidden rounded-[1.75rem] text-white transition-transform duration-200 hover:-translate-y-[2px] motion-reduce:transition-none sm:min-h-[22rem]"
              >
                <img
                  src={x.src}
                  alt={x.alt}
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
                      "linear-gradient(to top, rgba(0,26,60,0.9) 0%, rgba(0,26,60,0.45) 45%, transparent 75%)",
                  }}
                />
                <span className="p-6 sm:p-7">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-full"
                    style={{ background: GOLD }}
                  >
                    <x.Icon className="h-5 w-5 text-[var(--color-deep-blue)]" aria-hidden />
                  </span>
                  <span className="mt-3 block font-display" style={T.section}>
                    {x.title}
                  </span>
                  <span className="mt-1 block max-w-sm text-white/90" style={T.body}>
                    {x.body}
                  </span>
                  <span
                    className="mt-3 inline-flex items-center gap-1.5 font-display"
                    style={{ ...T.body, fontWeight: 800, color: GOLD }}
                  >
                    Read more
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                      aria-hidden
                    />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ================================================================== *
 * 4. RESULTS — how its students perform
 * ================================================================== */

function Results() {
  return (
    <section
      id="results"
      className="relative overflow-hidden py-[var(--space-section-y)] text-white"
      style={{ ...ANCHOR, background: ACCENT }}
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
          lead="One square for every student who sat the exam, coloured by the division they reached."
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <h3 className="font-display" style={{ ...T.section, fontWeight: 900 }}>
              Form Four {CSEE_2025.year}:{" "}
              <span style={{ color: GOLD }}>
                {CSEE_2025.divisions.I} of {CSEE_2025.candidates} in Division I.
              </span>{" "}
              All {CSEE_2025.passed} passed.
            </h3>
            <div className="mt-6">
              <ResultsChart sitting={CSEE_2025} columns={23} />
            </div>
          </div>
          <div>
            <h3 className="font-display" style={{ ...T.section, fontWeight: 900 }}>
              Form Six {ACSEE_2026.year}:{" "}
              <span style={{ color: GOLD }}>
                {ACSEE_2026.divisions.I + ACSEE_2026.divisions.II} of {ACSEE_2026.candidates} in
                Division I or II.
              </span>{" "}
              Nobody below Division III.
            </h3>
            <div className="mt-6">
              <ResultsChart sitting={ACSEE_2026} columns={24} />
            </div>
          </div>
        </div>

        {/* The year before, square for square, so the rise is seen not told. */}
        <div className="mt-14 grid gap-12 border-t border-white/20 pt-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <h3 className="font-display" style={{ ...T.section, fontWeight: 900 }}>
              The year before: {CSEE_2024.divisions.I} in Division I.{" "}
              <span style={{ color: GOLD }}>
                In {CSEE_2025.year}, {CSEE_2025.divisions.I}.
              </span>
            </h3>
            <p className="mt-2 text-white/85" style={T.body}>
              Form Four {CSEE_2024.year}, {CSEE_2024.candidates} students.
            </p>
            <div className="mt-6">
              <ResultsChart sitting={CSEE_2024} columns={23} />
            </div>
          </div>
          <dl className="self-end border-t border-white/20">
            {[
              {
                k: "Form Four centre GPA",
                v: `${CSEE_2025.gpaGrade}: ${CSEE_2025.gpa} in ${CSEE_2025.year}, from ${CSEE_2024.gpa} in ${CSEE_2024.year}. Lower is better on NECTA's scale.`,
              },
              {
                k: "English Language",
                v: `${CSEE_2025_ENGLISH.grade}: GPA ${CSEE_2025_ENGLISH.gpa} across all ${CSEE_2025_ENGLISH.candidates} Form Four students in ${CSEE_2025.year}.`,
              },
              {
                k: "Form Six centre GPA",
                v: `${ACSEE_2026.gpaGrade}: ${ACSEE_2026.gpa} in ${ACSEE_2026.year}, ${ACSEE_2026.candidates} candidates.`,
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

        <p className="mt-8 text-white/75" style={T.body}>
          Source: NECTA&rsquo;s published results for Alpha Secondary School, Dar es Salaam, centre
          S2549 —{" "}
          {[
            ["Form Four 2025", CSEE_2025.source],
            ["Form Four 2024", CSEE_2024.source],
            ["Form Six 2026", ACSEE_2026.source],
          ].map(([label, href], i) => (
            <span key={href}>
              {i > 0 && " · "}
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-white underline underline-offset-4 hover:text-[var(--color-gold)]"
              >
                {label}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </span>
          ))}
          .
        </p>

        {/* Beyond the exam hall: what the students have won, in their own
            school's words (Instagram captions), with the photographs. */}
        <div className="mt-16 border-t border-white/20 pt-12">
          <h3 className="font-display tracking-tight text-balance" style={T.section}>
            And beyond the exam hall.
          </h3>
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <PhotoStory
              onDark
              layout="trio"
              title="2nd overall out of 24 schools."
              body="At the 9th Tanzania Women Engineers Convention Exhibition (TAWECE 2024) at the JNICC, Alpha High and Alpha Girls students presented five projects: a Smart Reading Table, Smart Blind Glasses, a Radar and a Smart Blind Stick from Alpha High, and Greenhouse Effects from Alpha Girls."
              source="Alpha Schools on Instagram, 22 August 2024"
              photos={[
                {
                  src: taweceTeam,
                  alt: "Alpha students in uniform standing in front of the TAWECE 2024 banner",
                  w: 719,
                  h: 479,
                },
                {
                  src: taweceTrophy,
                  alt: "The TAWECE 2024 second runner-up award plaque, engraved on a glass trophy",
                  w: 720,
                  h: 481,
                },
                {
                  src: taweceDemo,
                  alt: "A student demonstrating a project model to visitors at the exhibition stand",
                  w: 720,
                  h: 481,
                },
              ]}
            >
              <div className="mt-4">
                <span
                  className="inline-block rounded-[var(--radius-pill)] px-3 py-1.5 text-[var(--color-accent-foreground)]"
                  style={{ ...T.label, background: GOLD }}
                >
                  Engineering · 2024
                </span>
              </div>
            </PhotoStory>
            <PhotoStory
              onDark
              layout="trio"
              title="Best Institution from East Africa."
              body="At the Tanzania National World Schools Debate Championship 2026, Alpha took two awards: Best Institution from East Africa, and Junior Plate winners."
              source="Alpha Schools on Instagram, 17 August 2026"
              photos={[
                {
                  src: debateTeam,
                  alt: "Alpha debaters in blue tracksuits holding their medals together",
                  w: 1000,
                  h: 1196,
                },
                {
                  src: debatePlaque,
                  alt: "The award plaque for Best Institution from East Africa",
                  w: 900,
                  h: 1080,
                },
                { src: debateTrophy, alt: "The Junior Plate winners' gold trophy", w: 809, h: 970 },
              ]}
            >
              <div className="mt-4">
                <span
                  className="inline-block rounded-[var(--radius-pill)] px-3 py-1.5 text-[var(--color-accent-foreground)]"
                  style={{ ...T.label, background: GOLD }}
                >
                  Debate · 2026
                </span>
              </div>
            </PhotoStory>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== *
 * 5. STUDENT LIFE — life outside class
 * ================================================================== */

/** A sub-chapter of student life: a heading on the left, photo stories on the right. */
function LifeGroup({
  title,
  lead,
  children,
  cols = 2,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
  cols?: 1 | 2;
}) {
  return (
    <div className="grid gap-8 border-t border-[var(--color-hairline)] pt-10 lg:grid-cols-[14rem_1fr] lg:gap-14">
      <Reveal direction="up">
        <h3 className="font-display" style={{ ...T.section, color: ACCENT }}>
          {title}
        </h3>
        {lead && (
          <p className="mt-3 text-[var(--color-ink-soft)]" style={T.body}>
            {lead}
          </p>
        )}
      </Reveal>
      <div className={`grid min-w-0 gap-8 ${cols === 2 ? "md:grid-cols-2 md:gap-10" : ""}`}>
        {children}
      </div>
    </div>
  );
}

function StudentLife() {
  const photos = useSuspenseQuery(photosQuery).data;
  return (
    <section id="life" className="bg-white" style={ANCHOR}>
      <div className={`${SHELL} py-[var(--space-section-y)]`}>
        <ChapterHead
          title={
            <>
              The other half of an{" "}
              <Marked kind="ring" color={GOLD}>
                Alpha
              </Marked>{" "}
              education.
            </>
          }
          lead="Ten student-led clubs, five sports, trips out of the gate, four meals a day and a counselling department. Every photograph here is the school's own."
        />

        <div className="mt-12 space-y-12">
          {/* Clubs and sport */}
          <LifeGroup
            title="Clubs and sport."
            lead="Every club has its own photograph; staff can replace any of them."
            cols={1}
          >
            <div className="min-w-0">
              <ul
                className="-mx-[var(--container-gutter)] flex snap-x gap-3 overflow-x-auto px-[var(--container-gutter)] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:px-0"
                style={{
                  maskImage: "linear-gradient(to right, black 92%, transparent)",
                  WebkitMaskImage: "linear-gradient(to right, black 92%, transparent)",
                }}
              >
                {CLUBS.map((c) => {
                  const p = slotPhoto(photos, c.key)!;
                  return (
                    <li key={c.key} className="w-40 shrink-0 snap-start sm:w-44">
                      <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem]">
                        <img
                          src={p.src}
                          alt={photos[c.key]?.alt_text ?? `${c.name} club at Alpha High`}
                          width={800}
                          height={1024}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p
                        className="mt-2 font-display text-[var(--color-deep-blue)]"
                        style={{ ...T.body, fontWeight: 800 }}
                      >
                        {c.name}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-10">
                <PhotoStory
                  layout="wide"
                  title="The decks, and the beach."
                  body="The DJ club on the decks; the environment club's beach clean-up."
                  source="Alpha Schools on Instagram, June 2024"
                  photos={[
                    {
                      src: djClub2,
                      alt: "An Alpha student in a blue tracksuit on the DJ decks with a laptop",
                      w: 1080,
                      h: 609,
                    },
                    {
                      src: beachCleanup1,
                      alt: "Environment club members collecting litter on the beach",
                      w: 1080,
                      h: 1080,
                    },
                    {
                      src: beachCleanup2,
                      alt: "The environment club in blue and teal tracksuits on the beach after the clean-up",
                      w: 1080,
                      h: 1080,
                    },
                  ]}
                />
                <div>
                  <h4 className="font-display" style={{ ...T.cardTitle, color: ACCENT }}>
                    Sport
                  </h4>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {SPORTS.map((s) => (
                      <li
                        key={s}
                        className="rounded-[var(--radius-pill)] px-4 py-2 font-display text-white"
                        style={{ ...T.body, fontWeight: 700, background: ACCENT }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                  <h4 className="mt-8 font-display" style={{ ...T.cardTitle, color: ACCENT }}>
                    Counselling
                  </h4>
                  <p className="mt-2 text-[var(--color-ink)]/85" style={T.body}>
                    Alpha High runs a school counselling department, accessible to every student:
                    confidential, professional, and built into school life.
                  </p>
                </div>
              </div>
            </div>
          </LifeGroup>

          {/* Trips and visits */}
          <LifeGroup title="Out of the gate." lead="Trips the school has posted about.">
            <PhotoStory
              layout="trio"
              title="On air at TBC."
              body="A visit to the Tanzania Broadcasting Corporation: the news desk, the studio cameras, the control room."
              source="Alpha Schools on Instagram, 6 August 2024"
              photos={[
                {
                  src: tbcDesk,
                  alt: "Alpha High students standing behind the TBC news desk in the studio",
                  w: 1200,
                  h: 1472,
                },
                {
                  src: tbcCamera,
                  alt: "A student operating a broadcast camera in the TBC studio",
                  w: 1200,
                  h: 1468,
                },
                {
                  src: tbcControl,
                  alt: "Students watching the monitors in the TBC control room",
                  w: 1200,
                  h: 1467,
                },
              ]}
            />
            <PhotoStory
              layout="pair"
              title="Out at TIMEXPO."
              body="Alpha students at the Tanzania International Manufacturers Expo at Diamond Jubilee."
              source="Alpha Schools on Instagram, 21 October 2023"
              photos={[
                {
                  src: timexpoTeam,
                  alt: "Alpha students lined up in white shirts at the TIMEXPO exhibition",
                  w: 897,
                  h: 503,
                },
                {
                  src: timexpoStand,
                  alt: "A student examining a machine at an exhibition stand",
                  w: 897,
                  h: 502,
                },
              ]}
            />
          </LifeGroup>

          {/* Every day */}
          <LifeGroup title="Every day." lead="The library, the lunch line and the desks.">
            <PhotoStory
              layout="trio"
              title="Four meals a day."
              body="Good food, properly served: four meals every day, with fruit and vegetables daily."
              source="Alpha Schools on Instagram, 5 October 2021"
              photos={[
                {
                  src: foodLunch,
                  alt: "Students in blue tracksuits eating together at a dining table",
                  w: 720,
                  h: 481,
                },
                {
                  src: foodServing,
                  alt: "Students collecting their meals at the serving line",
                  w: 720,
                  h: 480,
                },
                { src: foodFruit, alt: "A tray of cut watermelon and fruit", w: 720, h: 481 },
              ]}
            />
            <PhotoStory
              layout="trio"
              title="Reading is on the timetable."
              body="Shelves of set books and references, quiet desks, and tablets in class alongside the books."
              source="Alpha High, school photographs; Instagram, August 2023"
              photos={[
                { src: libraryBoy, alt: "A student reading between the library shelves", w: 1000, h: 1500 },
                { src: libraryGirl, alt: "A student holding a textbook in the library aisle", w: 1000, h: 1500 },
                { src: studyGirl, alt: "A student in a blue polo shirt studying at a desk", w: 1200, h: 1200 },
              ]}
            />
          </LifeGroup>

          {/* Giving back */}
          <LifeGroup title="Giving back.">
            <PhotoStory
              layout="tall"
              title="Alpha Aid."
              body="The school's charity event: students giving time to a community visit."
              source="Alpha High, school photographs"
              photos={[
                {
                  src: charityVisit,
                  alt: "An Alpha student in a blue uniform carrying a small child at the charity visit",
                  w: 720,
                  h: 1280,
                },
              ]}
            />
          </LifeGroup>

          {/* Graduation */}
          <LifeGroup
            title="Graduation day."
            lead="Form Four in their gowns, and Form Six two years on: the climb finished."
            cols={1}
          >
            <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:gap-10">
              <PhotoStory
                layout="wide"
                title="Form Four, together on the stage."
                source="Alpha High, school photographs"
                photos={[
                  {
                    src: f4GradStage,
                    alt: "The Form Four graduating class on stage in black gowns in front of the Alpha Schools banner",
                    w: 1800,
                    h: 1200,
                  },
                  { src: f4GradTrio, alt: "Three graduates in black outfits posing together", w: 1400, h: 933 },
                  { src: f4GradBoys, alt: "Graduates in suits seated in the hall", w: 1400, h: 1066 },
                ]}
              />
              <PhotoStory
                layout="tall"
                title="Class of 2026."
                source="Alpha High, school photographs"
                photos={[
                  {
                    src: f4GradGirl1,
                    alt: "A graduate in a pink dress wearing her Class of 2026 sash",
                    w: 900,
                    h: 1176,
                  },
                ]}
              />
            </div>
            <Reveal direction="up">
              <ul className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6">
                {(
                  [
                    { src: gradsTree, alt: "Two Form Six graduates in gowns and caps under a tree" },
                    { src: gradPortrait1, alt: "A Form Six graduate in cap and gown" },
                    { src: gradPortrait2, alt: "A Form Six graduate in cap and gown" },
                    { src: gradPortrait3, alt: "A Form Six graduate in cap and gown" },
                    { src: gradSashBoy, alt: "A graduate in a suit with a Form Six HGE sash" },
                    { src: gradSashGirl, alt: "A graduate wearing her Class of 2026 sash" },
                  ] as const
                ).map((p, i) => (
                  <li key={p.src} className={i % 2 ? "md:translate-y-4" : ""}>
                    <img
                      src={p.src}
                      alt={p.alt}
                      width={800}
                      height={1120}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[5/7] w-full rounded-[1.25rem] object-cover"
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[var(--color-ink-soft)]" style={T.body}>
                Form Six, done. Students&rsquo; names are withheld pending written media-release
                consent.
              </p>
            </Reveal>
          </LifeGroup>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== *
 * 6. PEOPLE — who runs it
 * ================================================================== */

function People({ staff }: { staff: SchoolBundle["staff"] }) {
  // Seed the Head Teacher until the backend supplies the staff list.
  const list =
    staff.length > 0
      ? staff
      : [{ id: "seed-head", name: "Richard Gatere Maina", title: "Head Teacher", photo_url: null }];

  return (
    <div id="people" style={ANCHOR}>
      <section className="bg-[var(--color-off-white)]">
        <div className={`${SHELL} py-[var(--space-section-y)]`}>
          <ChapterHead title="The people behind the climb." />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((p) => (
              <li key={p.id}>
                <Reveal direction="up">
                  {/* With a photograph: a portrait card. Without one: a short
                      row that says so, rather than a tall empty panel. */}
                  <article className="h-full overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-[var(--color-hairline)]">
                    {p.photo_url && (
                      <img
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
                      <h3 className="font-display" style={{ ...T.cardTitle, color: ACCENT }}>
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
        </div>
      </section>
      <ParentVoices school="alpha-high" accent={ACCENT} />
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
            title="How a place at Alpha High is offered."
            lead="Four steps, as the school documents them."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <GoldButton to="/admission">
              Get the application form
              <ArrowRight className="h-4 w-4" aria-hidden />
            </GoldButton>
            <GhostButton to="/contact">Book a school tour</GhostButton>
          </div>
        </div>
        <Reveal direction="up">
          <ol className="border-t border-[var(--color-hairline)]">
            {ADMISSION_STEPS.map((step, i) => (
              <li
                key={step}
                className="grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-[var(--color-hairline)] py-5"
              >
                <span
                  className="font-display tabular-nums"
                  style={{ ...T.hero, lineHeight: 1, color: GOLD }}
                >
                  {i + 1}
                </span>
                <p className="text-[var(--color-ink)]" style={{ ...T.cardTitle, fontWeight: 600 }}>
                  {step}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-[var(--color-ink-soft)]" style={T.body}>
            These two figures are part of the admission process, not the cost of attending. [Fee
            structure per school &mdash; to be provided]
          </p>
          <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
            [Entry requirements &mdash; to be confirmed with academic offices]
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
          <h2 className="font-display tracking-tight" style={{ ...T.section, color: ACCENT }}>
            Applications for the next intake are open.
          </h2>
          <p className="mt-2 max-w-xl text-[var(--color-accent-foreground)]" style={T.body}>
            Visit Mikocheni, sit the assessment, join the climb.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admission"
            className="inline-flex min-h-[var(--btn-primary-min-h)] items-center gap-2 rounded-[var(--radius-pill)] px-7 text-white transition-transform hover:-translate-y-[1px] motion-reduce:transition-none"
            style={{ ...T.body, fontWeight: 800, background: ACCENT }}
          >
            Enroll Now
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            to="/contact"
            className="inline-flex min-h-[var(--btn-primary-min-h)] items-center rounded-[var(--radius-pill)] border-2 px-7 transition-colors hover:bg-white/40"
            style={{ ...T.body, fontWeight: 800, borderColor: ACCENT, color: ACCENT }}
          >
            Book a Visit
          </Link>
        </div>
      </div>
    </section>
  );
}
