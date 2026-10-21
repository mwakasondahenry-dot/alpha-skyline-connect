import { SchoolFacilitiesSection } from "@/components/school/facilities-section";
import { SchoolSubNav } from "@/components/school/school-sub-nav";
import { UnconfirmedNote } from "@/components/school/unconfirmed-note";
import {
  CombinationList,
  FormOptionsList,
  type CombinationGroup,
} from "@/components/school/subject-lists";
import { GuidanceCallout } from "@/components/school/academics-frame";
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
import { HeroSlideshow } from "@/components/hero-slideshow";
import { T, SHELL, heroStep } from "@/components/type-roles";
import { Marked, Backdrop } from "@/components/alpha-ui";
import { ACSEE_2026, CSEE_2024, CSEE_2025, CSEE_2025_ENGLISH } from "@/lib/girls-results";
import {
  ArrowRight,
  ExternalLink,
  Trophy,
  ChefHat,
  Car,
  Briefcase,
  Plane,
  Mic,
  Laptop,
  Palette,
  Leaf,
} from "lucide-react";
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

const slug = "alpha-girls" as const;
const ACCENT = "var(--color-girls-teal)";
const DEEP = "var(--color-girls-teal-deep)";
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
      title: "Alpha Girls, Kunduchi — Alpha Schools, Dar es Salaam",
      description:
        "Alpha Girls High School in Kunduchi, Dar es Salaam: a girls' secondary from Form 1 to Form 6. In NECTA's 2025 Form Four results, 30 of 45 girls reached Division I.",
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

/** Section anchors, in the order the reader meets them. */
const SUB_NAV = [
  { label: "Results", href: "#results" },
  { label: "Our journey", href: "#journey" },
  { label: "Leading", href: "#distinctive" },
  { label: "Academics", href: "#academics" },
  { label: "Campus", href: "#life" },
  { label: "Coming up", href: "#year" },
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
      <Results />
      <Journey />
      <HowTheyLead />
      <Academics />
      <LifeAtKunduchi />
      <ComingUp />
      <Staff staff={data.staff} />
      <ParentVoices school="alpha-girls" accent="var(--color-girls-teal)" />
      <ApplyBanner />
      <GirlsFooter />
    </div>
  );
}

// ---------- Hero ----------

/**
 * Opens on a deep sea-green field rather than a scrimmed photo: the green of
 * the Class of 2026 suits, with gold the colour of the gowns' trim. The
 * graduates' photograph is the admin-managed slideshow, framed rather than
 * full-bleed, so the headline never depends on how dark a slide is.
 */
function Hero() {
  return (
    <section className="relative overflow-hidden text-white" style={{ background: DEEP }}>
      <div
        className={`${SHELL} grid items-center gap-10 pb-10 pt-[calc(var(--header-h)+2.5rem)] lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-14`}
      >
        <div>
          <h1 className="font-display tracking-tight text-balance" style={T.hero}>
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
            Leadership is practised daily here — house, prefect and club roles are all held by
            girls. NECTA sciences and arts, Form 1 to Form 6 on the Kunduchi campus.
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
            </Link>
            <Link
              to="/contact"
              className={`${BTN} border border-white/45 text-white hover:bg-white/10`}
              style={{ ...T.body, fontWeight: 800 }}
            >
              Book a Visit
            </Link>
          </div>
        </div>

        <div
          className="hero-rise relative pb-8 pl-8 sm:pb-10 sm:pl-14"
          style={heroStep("var(--hero-t-tail)", "420ms")}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] lg:aspect-[4/5] lg:max-h-[min(36rem,calc(100svh-12rem))] lg:w-auto">
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
          <img
            src={gradPortrait1}
            alt=""
            width={700}
            height={980}
            className="absolute bottom-0 left-0 w-[24%] -rotate-3 rounded-2xl border-4 object-cover shadow-[0_18px_36px_-16px_rgba(0,0,0,0.6)]"
            style={{ borderColor: GOLD, aspectRatio: "5 / 7" }}
          />
          <img
            src={gradPortrait2}
            alt=""
            width={700}
            height={980}
            className="absolute bottom-6 left-[20%] hidden w-[20%] rotate-3 rounded-2xl border-4 border-white object-cover shadow-[0_18px_36px_-16px_rgba(0,0,0,0.6)] sm:block"
            style={{ aspectRatio: "5 / 7" }}
          />
        </div>
      </div>

      {/* The results, at the hero's foot: the first proof a parent reads. */}
      <a
        href="#results"
        className="hero-rise group block border-t border-black/10"
        style={{ ...heroStep("var(--hero-t-tail)", "320ms"), background: GOLD }}
      >
        <div
          className={`${SHELL} flex flex-col gap-2 py-4 text-[var(--color-deep-blue)] sm:flex-row sm:items-center sm:gap-8`}
        >
          <p className="font-display" style={{ ...T.body, fontWeight: 900 }}>
            Form Four 2025: {CSEE_2025.divisions.I} of {CSEE_2025.candidates} in Division I
          </p>
          <p className="font-display" style={{ ...T.body, fontWeight: 900 }}>
            Form Six 2026: all {ACSEE_2026.candidates} in Division I or II
          </p>
          <span
            className="flex items-center gap-1.5 sm:ml-auto"
            style={{ ...T.body, fontWeight: 700 }}
          >
            See the results
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </span>
        </div>
      </a>
    </section>
  );
}

// ---------- Results ----------

function Results() {
  return (
    <section
      id="results"
      className="relative overflow-hidden py-[var(--space-section-y)] text-white"
      style={{ ...ANCHOR, background: DEEP }}
    >
      <div className={SHELL}>
        <Reveal>
          <h2 className="max-w-3xl font-display tracking-tight text-balance" style={T.hero}>
            The results, as{" "}
            <Marked kind="underline" color={GOLD}>
              NECTA
            </Marked>{" "}
            published them.
          </h2>
          <p className="mt-4 max-w-2xl text-white/85" style={T.body}>
            One square for every girl who sat the exam, coloured by the division she reached.
          </p>
        </Reveal>

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
                v: `${CSEE_2025.gpaGrade}: ${CSEE_2025.gpa} in ${CSEE_2025.year}, from ${CSEE_2024.gpa} in ${CSEE_2024.year}. Lower is better on NECTA's scale.`,
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

        <p className="mt-8 text-white/75" style={T.body}>
          Source: NECTA&rsquo;s published results for Alpha Girls&rsquo; Secondary School, centre
          S5889 —{" "}
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
      </div>
    </section>
  );
}

// ---------- Journey ----------

/** The milestones the site already records, oldest first. */
const MILESTONES = [
  {
    when: "2020",
    what: "Alpha Girls opens at the Kunduchi campus",
    body: "A girls-only secondary school, part of Alpha Schools since 2007.",
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

function Journey() {
  return (
    <section
      id="journey"
      className="relative overflow-hidden bg-white py-[var(--space-section-y)]"
      style={ANCHOR}
    >
      <div className={`${SHELL} grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16`}>
        <Reveal>
          <h2
            className="font-display tracking-tight text-balance"
            style={{ ...T.hero, color: DEEP }}
          >
            Excellence,{" "}
            <Marked kind="underline" color={GOLD}>
              no exceptions.
            </Marked>
          </h2>
          <p className="mt-6 max-w-xl text-[var(--color-ink)]/85" style={T.body}>
            Alpha Girls High School sits at Kunduchi and teaches the Tanzanian national curriculum
            from Form 1 to Form 6 — NECTA sciences and arts, with aviation, coding and enterprise on
            the timetable rather than beside it.
          </p>
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
                <p
                  className="mt-0.5 font-display"
                  style={{ ...T.cardTitle, color: "var(--color-ink)" }}
                >
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

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <figure className="col-span-2">
            <img
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
          <img
            src={class2026Sash}
            alt="An Alpha Girls student wearing a Class of 2026 sash"
            width={900}
            height={1311}
            loading="lazy"
            decoding="async"
            className="aspect-[3/4] w-full rounded-[1.75rem] object-cover object-top"
          />
          <img
            src={gradsGardenPair}
            alt="Alpha Girls graduates in gowns in the school garden"
            width={1000}
            height={1500}
            loading="lazy"
            decoding="async"
            className="aspect-[3/4] w-full rounded-[1.75rem] object-cover"
          />
        </div>
      </div>

      {/* Graduation day: a wall of portraits. */}
      <div className={`${SHELL} mt-16`}>
        <h3 className="font-display" style={{ ...T.section, color: DEEP }}>
          Graduation day.
        </h3>
        <ul className="mt-6 grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-8">
          {PORTRAITS.map((src, i) => (
            <li key={src} className={i % 2 ? "md:translate-y-6" : ""}>
              <img
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
        <p className="mt-10 text-[var(--color-ink-soft)]" style={T.body}>
          Students&rsquo; names are withheld pending written media-release consent.
        </p>
      </div>
    </section>
  );
}

// ---------- How they lead ----------

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

const CLUB_ICONS: Record<string, typeof Trophy> = {
  Driving: Car,
  Entrepreneurship: Briefcase,
  Aviation: Plane,
  Debate: Mic,
  "ICT / Computer": Laptop,
  "Music / Arts": Palette,
  Environmental: Leaf,
};

/** Alpha Girls leads with what only Alpha Girls has. */
function HowTheyLead() {
  const photos = useSuspenseQuery(photosQuery).data;
  const plate = slotPhoto(photos, "alpha-girls.students.campus-plate")!;
  return (
    <section
      id="distinctive"
      className="relative overflow-hidden py-[var(--space-section-y)] text-white"
      style={{ ...ANCHOR, background: ACCENT }}
    >
      <Backdrop kind="star" onDark className="right-[5%] top-12" width="2.75rem" rotate={12} />
      <div className={SHELL}>
        <Reveal>
          <h2 className="max-w-3xl font-display tracking-tight text-balance" style={T.hero}>
            Cookery that runs as a business, debate that travels, and girls who learn to drive.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <figure>
            <img
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

          <div>
            <h3
              className="flex items-center gap-2 font-display"
              style={{ ...T.cardTitle, color: GOLD }}
            >
              <Trophy className="h-5 w-5" aria-hidden /> Where they compete
            </h3>
            <ul className="mt-4 border-t border-white/25">
              {[...COMPETITIONS]
                .sort((x, y) => MONTHS.indexOf(x.when) - MONTHS.indexOf(y.when))
                .map((c) => (
                  <li
                    key={c.name}
                    className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-white/25 py-3.5"
                  >
                    <span
                      className="font-display"
                      style={{ ...T.body, fontWeight: 800, color: GOLD }}
                    >
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
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h3
              className="flex items-center gap-2 font-display"
              style={{ ...T.cardTitle, color: GOLD }}
            >
              <ChefHat className="h-5 w-5" aria-hidden /> The cookery enterprise pathway
            </h3>
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
          <div>
            <h3 className="font-display" style={{ ...T.cardTitle, color: GOLD }}>
              Clubs
            </h3>
            <ul className="mt-4 grid border-t border-white/25 sm:grid-cols-2 sm:gap-x-8">
              {GIRLS_CLUBS.map((c) => {
                const Icon = CLUB_ICONS[c.name] ?? Trophy;
                return (
                  <li
                    key={c.name}
                    className="flex items-center gap-3 border-b border-white/25 py-3"
                  >
                    <span
                      className="grid h-8 w-8 place-items-center rounded-full"
                      style={{ background: GOLD }}
                    >
                      <Icon className="h-4 w-4" style={{ color: DEEP }} aria-hidden />
                    </span>
                    <span className="font-display" style={{ ...T.body, fontWeight: 800 }}>
                      {c.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="mt-8 [&_*]:!text-white/85">
          <UnconfirmedNote>
            Competitions, the enterprise pathway and clubs were supplied by the school in August
            2026 and are not yet confirmed in writing. Club photographs are still outstanding.
          </UnconfirmedNote>
        </div>
      </div>
    </section>
  );
}

// ---------- Coming up ----------

/** The school's 2026 calendar. Each entry ends on `until` (inclusive). */
const CALENDAR_2026 = [
  { when: "24 October", until: "2026-10-24", what: "Visiting Day & PTC" },
  { when: "9–26 November", until: "2026-11-26", what: "CSEE Examination" },
  { when: "4 December", until: "2026-12-04", what: "Annual Staff Meeting" },
  { when: "5 December", until: "2026-12-05", what: "School Board Meeting" },
  { when: "5–23 December", until: "2026-12-23", what: "Aviation Holiday Training / Study Tour" },
] as const;

/** Only dates still ahead. A list of past dates reads as abandoned, so the
 *  section hides itself once the year's calendar has run out. */
function ComingUp() {
  const today = new Date().toISOString().slice(0, 10);
  const next = CALENDAR_2026.filter((e) => e.until >= today).slice(0, 3);
  if (next.length === 0) return null;
  return (
    <section
      id="year"
      className="bg-[var(--color-girls-teal-tint)] py-[var(--space-section-y)]"
      style={ANCHOR}
    >
      <div className={SHELL}>
        <h2 className="font-display tracking-tight" style={{ ...T.section, color: DEEP }}>
          Coming up on the Kunduchi calendar.
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {next.map((e) => (
            <li
              key={e.what}
              className="rounded-[1.25rem] bg-white p-6 shadow-[0_14px_30px_-22px_rgba(10,82,84,0.6)]"
            >
              <span
                aria-hidden
                className="mb-4 block h-1.5 w-10 rounded-full"
                style={{ background: GOLD }}
              />
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
      </div>
    </section>
  );
}

// ---------- Apply ----------

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

function GirlsFooter() {
  return (
    <>
      <SchoolFacilitiesSection slug="alpha-girls" accent="var(--color-girls-teal)" />
      <SiteFooter />
    </>
  );
}

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

const COMPETITIONS = [
  { name: "Pan African Schools Championship", where: "South Africa", when: "June" },
  {
    name: "Tanzania National World Schools Debate Championship",
    where: "National",
    when: "August",
  },
  { name: "TCRO Dar Open Schools Debate Championship", where: "Dar es Salaam", when: "May" },
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
              between, and all twelve A-Level combinations with their subjects written out.
            </p>
          </div>
          <img
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

      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <div>
          <h3 className="font-display text-[var(--color-ink)]" style={T.cardTitle}>
            Subjects offered
          </h3>
          <div className="mt-5">
            <ul className="grid border-t border-[var(--color-hairline)] sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
              {O_LEVEL_SUBJECTS.map((sub) => (
                <li
                  key={sub}
                  className="flex items-center gap-3 border-b border-[var(--color-hairline)] py-3 font-display text-[var(--color-ink)]"
                  style={{ ...T.body, fontWeight: 700 }}
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: GOLD }}
                  />
                  {sub}
                </li>
              ))}
            </ul>
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
          <dl className="mt-5 border-t border-[var(--color-hairline)]">
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
  return (
    <section id="life" className="relative overflow-hidden bg-white" style={ANCHOR}>
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="font-display" style={{ ...T.section, color: ACCENT }}>
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

        <Reveal direction="up" className="relative mt-[var(--space-block-y)]">
          <figure className="relative overflow-hidden rounded-[var(--panel-radius)] shadow-[var(--shadow-banner)]">
            <img
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
              <p className="max-w-xl text-[var(--color-surface)]" style={T.body}>
                A practical in the Kunduchi science laboratory.
              </p>
            </figcaption>
          </figure>
        </Reveal>

        <ul className="mt-10 grid border-t border-[var(--color-hairline)] sm:grid-cols-2 sm:gap-x-10">
          {FACILITIES.map((f) => {
            const uploaded = slotPhoto(photos, f.key);
            const src = uploaded?.src ?? (f.key.endsWith("science-labs") ? labBench : null);
            return (
              <li
                key={f.key}
                className="flex items-center gap-4 border-b border-[var(--color-hairline)] py-4"
              >
                {src ? (
                  <img
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
                    style={{ borderColor: ACCENT, background: "var(--color-girls-teal-tint)" }}
                  />
                )}
                <div>
                  <p className="font-display text-[var(--color-ink)]" style={{ ...T.cardTitle }}>
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
      </div>
    </section>
  );
}

/* ----------------- Staff ----------------- */

function Staff({ staff }: { staff: SchoolBundle["staff"] }) {
  if (staff.length === 0) return null;
  return (
    <section style={{ background: "var(--color-girls-teal-tint)" }}>
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="max-w-2xl">
          <h2 className="font-display" style={{ ...T.section, color: ACCENT }}>
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
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${DEEP})` }}
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
