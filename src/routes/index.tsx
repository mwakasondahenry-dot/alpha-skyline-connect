import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "@/components/photo";
import { VoicesSlider } from "@/components/testimonials/voices-slider";
import { seo } from "@/lib/seo";
import { organizationLd, websiteLd } from "@/lib/structured-data";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  GraduationCap,
  Laptop,
  MapPin,
  Plane,
  Quote,
  Users,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { HomeVideo } from "@/components/home-video";
import { VIDEO_HOSTS } from "@/lib/home-video";
import { CinematicHero, Marked, Backdrop, GhostButton } from "@/components/alpha-ui";
import {
  getHomeWhatsNew,
  getHomeUpcomingEvents,
  getTestimonials,
  type HomeWhatsNew,
  type HomeEventItem,
  type TestimonialItem,
} from "@/lib/alpha-content.functions";
import heroCollage from "@/assets/hero-collage-v2.webp";
import campusNurseryImage from "@/assets/campus-nursery.webp";
import campusHighImage from "@/assets/campus-high.webp";
import campusGirlsImage from "@/assets/campus-girls.webp";
import avCockpitGirl from "@/assets/av-hero-cockpit-girl.webp";
import avFlightline from "@/assets/av-flightline-group.webp";
import { T } from "@/components/type-roles";
import { ResultsChart } from "@/components/school/results-chart";
import { CSEE_2025 as HIGH_CSEE_2025, ACSEE_2026 as HIGH_ACSEE_2026 } from "@/lib/high-results";
import { CSEE_2025 as GIRLS_CSEE_2025, ACSEE_2026 as GIRLS_ACSEE_2026 } from "@/lib/girls-results";

const FOUNDED_YEAR = 2007;
const YEARS_OPERATIONAL = new Date().getFullYear() - FOUNDED_YEAR;

const whatsNewQuery = queryOptions({
  queryKey: ["home", "whats-new"],
  queryFn: () => getHomeWhatsNew(),
  staleTime: 5 * 60 * 1000,
});

const upcomingEventsQuery = queryOptions({
  queryKey: ["home", "upcoming-events"],
  queryFn: () => getHomeUpcomingEvents(),
  staleTime: 5 * 60 * 1000,
});

const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: () => getTestimonials(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/")({
  head: () => {
    const base = seo({
      title: "Alpha Schools: Private Schools in Dar es Salaam, Nursery to A-Level",
      description:
        "Three private schools in Dar es Salaam: a nursery and primary school from age 2, a co-education secondary school in Mikocheni and a girls' secondary school in Kunduchi, all teaching to NECTA, with aviation and coding.",
      path: "/",
      ld: [organizationLd(), websiteLd()],
    });
    return {
      ...base,
      /* Open the connections the home video needs while the page is still
         loading; see VIDEO_HOSTS. */
      links: [...base.links, ...VIDEO_HOSTS.map((href) => ({ rel: "preconnect", href }))],
    };
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(whatsNewQuery),
      context.queryClient.ensureQueryData(upcomingEventsQuery),
      context.queryClient.ensureQueryData(testimonialsQuery),
    ]),
  errorComponent: ({ error }) => (
    <div className="p-12 text-center text-sm text-muted-foreground">
      Couldn't load the homepage: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-12 text-center">Not found.</div>,
  component: Home,
});

const BTN_PRIMARY: React.CSSProperties = {
  background: "var(--btn-primary-bg)",
  color: "var(--btn-primary-fg)",
  borderRadius: "var(--btn-primary-radius)",
  padding: "var(--btn-primary-pad-y) var(--btn-primary-pad-x)",
  fontWeight: "var(--btn-primary-weight)",
  minHeight: "var(--btn-primary-min-h)",
  fontSize: "var(--text-body)",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-display transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97] motion-reduce:transition-none motion-reduce:hover:scale-100";

const SHELL = "mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]";

/* The school cards. Every fact here is confirmed in PRODUCT.md or already
   on the school pages: ages and forms, campus, NECTA, aviation and coding.
   The comp's taglines ("Big Beginnings", "Excellence Today"...) and its
   "Cambridge Curriculum" line are not built: the taglines are unapproved
   and Alpha teaches NECTA only. The photos are the school's own. */
const SCHOOLS = [
  {
    slug: "nursery-primary",
    tag: "Early years",
    TagIcon: Users,
    name: "Nursery & Primary",
    blurb: "Where curiosity starts: play-led early years into a strong, structured primary.",
    facts: [
      { Icon: Users, text: "Ages 2 to 12" },
      { Icon: MapPin, text: "Kunduchi campus" },
      { Icon: Laptop, text: "Coding from primary" },
    ],
    to: "/schools/nursery-primary",
    image: campusNurseryImage,
    alt: "Young Alpha primary students in green sports kit",
    focus: "50% 30%",
    band: "var(--color-bright-blue)",
    Icon: Building2,
  },
  {
    slug: "alpha-high",
    /* PRODUCT.md and AGENTS.md: say "Co-education", never "Mixed". */
    tag: "Co-education",
    TagIcon: GraduationCap,
    name: "Alpha High",
    blurb: "Our flagship secondary, with aviation and coding at the core.",
    facts: [
      { Icon: Users, text: "Forms 1 to 6, Mikocheni" },
      { Icon: BookOpen, text: "NECTA: CSEE and ACSEE" },
      { Icon: Plane, text: "Aviation and coding" },
    ],
    to: "/schools/alpha-high",
    image: campusHighImage,
    alt: "Alpha High aviation students in safety vests at JNIA",
    focus: "50% 35%",
    band: "var(--color-deep-blue)",
    Icon: GraduationCap,
  },
  {
    slug: "alpha-girls",
    tag: "Girls only",
    TagIcon: Award,
    name: "Alpha Girls",
    blurb: "A secondary built for girls to lead, with the same rigour, aviation and coding.",
    facts: [
      { Icon: Users, text: "Forms 1 to 6, Kunduchi" },
      { Icon: BookOpen, text: "NECTA: CSEE and ACSEE" },
      { Icon: Plane, text: "Aviation and coding" },
    ],
    to: "/schools/alpha-girls",
    image: campusGirlsImage,
    alt: "Alpha Girls debate team celebrating with medals and certificates",
    focus: "50% 35%",
    band: "var(--color-girls-teal)",
    Icon: Award,
  },
] as const;

/* Values and labels are unchanged. design/README.md: the year figure is
   calculated from the 2007 founding date and must never be hardcoded. */
const STATS: ReadonlyArray<{
  value: number;
  suffix?: string;
  label: string;
}> = [
  { value: YEARS_OPERATIONAL, suffix: "+", label: "years shaping leaders since 2007" },
  { value: 3, label: "schools across Dar es Salaam" },
  { value: 1, label: "aviation programme across our schools" },
  { value: 2, label: "campuses — Kunduchi & Mikocheni" },
] as const;

const SCHOOL_LABELS: Record<string, string> = {
  "group-wide": "All Schools",
  "nursery-primary": "Nursery & Primary",
  "alpha-high": "Alpha High",
  "alpha-girls": "Alpha Girls",
};

/* Section heading with the gold rule beneath it. */
function SectionHeading({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display tracking-tight text-[var(--color-ink)]" style={T.section}>
          {children}
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
      </div>
      {action}
    </div>
  );
}

function Home() {
  const { data } = useSuspenseQuery(whatsNewQuery);
  const { data: upcomingEvents } = useSuspenseQuery(upcomingEventsQuery);
  const { data: testimonials } = useSuspenseQuery(testimonialsQuery);

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader overlay />
      <Hero />
      <FindTheRightSchool />
      <ResultsBand />
      <HomeVideo />
      <AviationChapter />
      <Testimonials items={testimonials} />
      <NewsAndEvents news={data.news} events={upcomingEvents} />
      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 1. HERO + STAT STRIP — the opening screen.
 *
 * The hero fills the viewport (100svh) with the navigation overlaid on
 * it, so nothing from "Find the Right School" shows beneath the fold.
 *
 * The four figures sit in a strip across the hero's foot on desktop,
 * set in the headline's own face: the numeral at hero size in white, the
 * label in gold, bold. (Until 2026-10-22 they were a thin icon rail down
 * the right edge, in small type; the owner found it weak.) The strip is
 * translucent so the photograph still reads through it. On mobile it
 * moves out of the hero and becomes the first thing the reader discovers
 * on scrolling, because a 100svh opening screen on a phone has room for
 * the headline and the call to action or for four figures, not both.
 *
 * Only one of the two is ever in the accessibility tree: each is
 * display:none at the other's breakpoint.
 * ------------------------------------------------------------------ */
function Hero() {
  return (
    <>
      <CinematicHero
        srLead="Alpha Schools, Dar es Salaam:"
        lineOne="Your potential,"
        lineTwo="unlocked."
        blurb="Three schools. One family. Limitless futures."
        media={
          <HeroSlideshow
            pageKey="home"
            fallback={[
              {
                src: heroCollage,
                alt: "Alpha Schools students across nursery, primary, secondary and aviation",
              },
            ]}
          />
        }
        actions={
          <>
            <Link to="/admission" className={`${BTN_BASE} w-full sm:w-auto`} style={BTN_PRIMARY}>
              Enroll Now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <GhostButton href="#find-the-right-school" onNavy>
              Find the Right School
            </GhostButton>
          </>
        }
        foot={<StatStrip variant="foot" />}
      />
      <StatStrip variant="band" />
    </>
  );
}

function StatStrip({ variant }: { variant: "foot" | "band" }) {
  const foot = variant === "foot";
  return (
    <aside
      aria-label="Alpha Schools at a glance"
      className={
        foot
          ? "hidden border-t border-[var(--color-surface)]/15 bg-[rgba(0,26,60,0.55)] backdrop-blur-sm lg:block"
          : "bg-[var(--stat-row-bg)] lg:hidden"
      }
    >
      <ul
        className={`${SHELL} grid ${
          foot ? "grid-cols-4 gap-8 py-7" : "grid-cols-2 gap-x-6 gap-y-8 py-9"
        }`}
      >
        {STATS.map((s) => (
          <li key={s.label}>
            <span
              className="block font-display tabular-nums tracking-tight text-[var(--color-surface)]"
              style={{ ...T.hero, lineHeight: 1 }}
            >
              {s.value}
              {s.suffix ?? ""}
            </span>
            <span
              className="mt-2 block max-w-[16rem] font-display text-[var(--color-gold)]"
              style={{ ...T.body, fontWeight: 800, lineHeight: 1.3 }}
            >
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* ------------------------------------------------------------------ *
 * 2. FIND THE RIGHT SCHOOL
 * Desktop: three photo cards with a coloured band.
 * 375px:   horizontal list rows inside one white card.
 * One <li> per school — the photo and the icon tile swap by breakpoint
 * so the school name is never duplicated in the DOM.
 * ------------------------------------------------------------------ */
function FindTheRightSchool() {
  return (
    <section
      id="find-the-right-school"
      className={`${SHELL} relative scroll-mt-24 overflow-hidden py-[var(--space-section-y)]`}
    >
      <Backdrop kind="star" className="right-2 top-8" width="2.75rem" rotate={12} />
      <Reveal direction="up">
        <SectionHeading>
          Find the{" "}
          <Marked kind="ring" color="var(--color-gold)">
            <span className="text-[var(--heading-accent-color)]">Right School</span>
          </Marked>{" "}
          for Your Child
        </SectionHeading>
        <p className="mt-4 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
          Three schools on two campuses in Dar es Salaam, from the first day of nursery to Form Six.
        </p>
      </Reveal>

      <ul
        suppressHydrationWarning
        data-reveal
        data-reveal-delay="120"
        className="mt-[var(--space-block-y)] grid gap-[var(--space-card-gap)] md:grid-cols-3"
      >
        {SCHOOLS.map((s) => (
          <li key={s.slug} style={{ ["--band" as string]: s.band }}>
            <Link
              to={s.to}
              className="group relative isolate flex h-full min-h-[32rem] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-[var(--band)] text-[var(--color-surface)] shadow-[var(--card-shadow)] transition-shadow duration-200 hover:shadow-[var(--card-shadow-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--band)] md:min-h-[33rem]"
            >
              <Photo
                width={800}
                height={600}
                src={s.image}
                sizes="(min-width: 768px) 33vw, 100vw"
                alt={s.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                style={{ objectPosition: s.focus }}
              />
              {/* The school colour rises from the bottom so the text always
                  sits on a solid ground, whatever the photograph does. */}
              <span
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    "linear-gradient(to top, var(--band) 0%, var(--band) 38%, color-mix(in srgb, var(--band) 70%, transparent) 55%, transparent 80%)",
                }}
              />

              <span
                className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[var(--band)] px-3 py-1.5 font-semibold text-[var(--color-surface)] shadow-sm"
                style={T.body}
              >
                <s.TagIcon className="h-4 w-4" aria-hidden />
                {s.tag}
              </span>

              <div className="p-[var(--space-card-pad)]">
                <h3 className="font-display" style={T.section}>
                  {s.name}
                </h3>
                <p className="mt-1 text-[var(--color-surface)]/90" style={T.body}>
                  {s.blurb}
                </p>
                <ul className="mt-4 space-y-2">
                  {s.facts.map((f) => (
                    <li
                      key={f.text}
                      className="flex items-center gap-3 text-[var(--color-surface)]/95"
                      style={T.body}
                    >
                      <f.Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                      {f.text}
                    </li>
                  ))}
                </ul>
                <span
                  className={`${BTN_BASE} mt-6 bg-[var(--color-surface)] text-[var(--color-ink)] group-hover:scale-[1.02]`}
                  style={{
                    borderRadius: "var(--btn-primary-radius)",
                    padding: "0.625rem 1.125rem",
                    fontWeight: "var(--btn-primary-weight)",
                    fontSize: "var(--text-body)",
                  }}
                >
                  Explore {s.name}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 3. RESULTS BAND
 * Both secondary schools' NECTA results, one square per candidate, from
 * the same data modules the school pages draw. Nothing is rounded; each
 * chart links to the full results chapter on its school page.
 * ------------------------------------------------------------------ */
function ResultsBand() {
  const schools = [
    {
      name: "Alpha High",
      to: "/schools/alpha-high",
      csee: HIGH_CSEE_2025,
      acsee: HIGH_ACSEE_2026,
      columns: 23,
      who: "students",
    },
    {
      name: "Alpha Girls",
      to: "/schools/alpha-girls",
      csee: GIRLS_CSEE_2025,
      acsee: GIRLS_ACSEE_2026,
      columns: 15,
      who: "girls",
    },
  ] as const;
  return (
    <section
      id="results"
      aria-labelledby="home-results"
      className="relative overflow-hidden bg-[var(--color-deep-blue)] py-[var(--space-section-y)] text-[var(--color-surface)]"
    >
      <div className={SHELL}>
        <Reveal direction="up" className="max-w-3xl">
          <h2 id="home-results" className="font-display tracking-tight text-balance" style={T.hero}>
            The results, as{" "}
            <Marked kind="underline" color="var(--color-gold)">
              NECTA
            </Marked>{" "}
            published them.
          </h2>
          <p className="mt-5 max-w-2xl text-[var(--color-surface)]/85" style={T.body}>
            Form Four {HIGH_CSEE_2025.year} at both secondary schools: one square for every
            candidate, coloured by the division they reached.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {schools.map((s) => (
            <Reveal key={s.name} direction="up">
              <h3 className="font-display" style={{ ...T.section, fontWeight: 900 }}>
                {s.name}:{" "}
                <span className="text-[var(--color-gold)]">
                  {s.csee.divisions.I} of {s.csee.candidates} {s.who} in Division I.
                </span>
              </h3>
              <div className="mt-6">
                <ResultsChart sitting={s.csee} columns={s.columns} />
              </div>
              <p className="mt-6 text-[var(--color-surface)]/85" style={T.body}>
                Form Six {s.acsee.year}: {s.acsee.divisions.I + s.acsee.divisions.II} of{" "}
                {s.acsee.candidates} in Division I or II.
              </p>
              <Link
                to={s.to}
                hash="results"
                className="mt-3 inline-flex items-center gap-1.5 font-display text-[var(--color-gold)] underline-offset-4 hover:underline"
                style={{ ...T.body, fontWeight: 800 }}
              >
                Every year, square by square
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 4. AVIATION CHAPTER
 * The one thing no other school in Dar es Salaam can copy from its
 * prospectus, given a whole band rather than a card. The sentence is the
 * school's approved wording (AVIATION IN ALPHA SCHOOLS, 2026-10-21) and
 * the module names are the school's own list, live on /aviation.
 * ------------------------------------------------------------------ */
const AVIATION_TASTER = [
  "Aircraft General Knowledge",
  "Meteorology",
  "Navigation",
  "Principles of Flight",
  "Airframe Design",
  "Aircraft Hydraulic Systems",
] as const;

function AviationChapter() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-deep-blue-dark)] text-[var(--color-surface)]">
      <div
        className={`${SHELL} grid items-center gap-10 py-[var(--space-section-y)] lg:grid-cols-[1fr_1.1fr] lg:gap-16`}
      >
        <Reveal direction="up">
          <h2 className="font-display tracking-tight text-balance" style={T.hero}>
            Pilots and engineers,{" "}
            <span className="text-[var(--color-gold)]">from Form One.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[var(--color-surface)]/90" style={T.body}>
            Alpha Schools proudly stand as the pioneer institutions in Tanzania to introduce
            aviation and flying as part of our extracurricular activities. Ground school, aircraft
            engineering and practical work in hangars under qualified instructors, progressing to
            solo flights and a Private Pilot Licence.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {AVIATION_TASTER.map((m) => (
              <li
                key={m}
                className="rounded-[var(--radius-pill)] border border-[var(--color-surface)]/25 px-3.5 py-1.5 text-[var(--color-surface)]/90"
                style={{ ...T.body, fontWeight: 600 }}
              >
                {m}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/aviation" className={`${BTN_BASE} w-full sm:w-auto`} style={BTN_PRIMARY}>
              Discover the aviation programme
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
        <Reveal direction="up" className="relative pb-14 pr-6 sm:pb-20 sm:pr-10">
          <Photo
            width={1080}
            height={1350}
            src={avCockpitGirl}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="An Alpha aviation student in the cockpit wearing a headset"
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full rounded-[1.75rem] object-cover shadow-[var(--shadow-banner)] sm:aspect-[4/3] lg:aspect-[4/5]"
          />
          <Photo
            width={853}
            height={568}
            src={avFlightline}
            sizes="(min-width: 1024px) 26vw, 52vw"
            alt="Alpha aviation students lined up on the flight line beside the aircraft"
            loading="lazy"
            decoding="async"
            className="absolute bottom-0 right-0 w-[52%] rotate-2 rounded-[1.25rem] border-4 object-cover shadow-[var(--shadow-card-hover)]"
            style={{ aspectRatio: "3 / 2", borderColor: "var(--color-gold)" }}
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 6. IN THEIR WORDS
 * Every published quote, parents and former students alike, one at a
 * time across the full width, sliding on every few seconds. Until
 * 2026-10-22 this was two small cards, and the alumni card showed only
 * one of the stories; the owner asked for all of them, in motion.
 * ------------------------------------------------------------------ */
function Testimonials({ items }: { items: TestimonialItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className={`${SHELL} py-[var(--space-section-y)]`} aria-labelledby="home-voices">
      <SectionHeading
        action={
          <Link
            to="/testimonials"
            className="inline-flex items-center gap-1.5 font-display text-[var(--color-deep-blue)] hover:underline"
            style={{ ...T.body, fontWeight: 800 }}
          >
            All testimonials <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        }
      >
        <span id="home-voices">In their words</span>
      </SectionHeading>
      <div className="mt-10">
        <VoicesSlider items={items} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 5. NEWS & EVENTS
 * ------------------------------------------------------------------ */
type FeedCard = {
  key: string;
  date: string;
  title: string;
  blurb: string | null;
  image: string | null;
  school: string;
  to: "/news" | "/events";
};

function toFeed(news: HomeWhatsNew["news"], events: HomeEventItem[]): FeedCard[] {
  const e: FeedCard[] = events.map((x) => ({
    key: `e-${x.id}`,
    date: x.event_date,
    title: x.title,
    blurb: x.description,
    image: null,
    school: x.school_slug,
    to: "/events",
  }));
  const n: FeedCard[] = news
    .filter((x) => x.published_at)
    .map((x) => ({
      key: `n-${x.id}`,
      date: x.published_at as string,
      title: x.title,
      blurb: x.body,
      image: x.cover_url,
      school: x.school_slug,
      to: "/news",
    }));
  return [...e, ...n].slice(0, 3);
}

function NewsAndEvents({ news, events }: { news: HomeWhatsNew["news"]; events: HomeEventItem[] }) {
  const cards = toFeed(news, events);

  return (
    <section className={`${SHELL} pb-[var(--space-section-y)]`}>
      <Reveal direction="up">
        <SectionHeading
          action={
            <Link
              to="/news"
              className="font-display text-[var(--color-brand-blue)] hover:underline"
              style={T.label}
            >
              View all news →
            </Link>
          }
        >
          News &amp; Events
        </SectionHeading>
      </Reveal>

      {cards.length === 0 ? (
        <p
          className="mt-[var(--space-block-y)] rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] text-[var(--color-ink-soft)] shadow-[var(--card-shadow)]"
          style={T.body}
        >
          Nothing published yet. News and upcoming events will appear here as soon as the school
          posts them.
        </p>
      ) : (
        <ul
          suppressHydrationWarning
          data-reveal
          data-reveal-delay="120"
          className="mt-[var(--space-block-y)] grid gap-[var(--space-card-gap)] sm:grid-cols-2 lg:grid-cols-3"
        >
          {cards.map((c) => (
            <li key={c.key}>
              <Link
                to={c.to}
                className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] transition-shadow hover:shadow-[var(--card-shadow-hover)] motion-reduce:transition-none"
              >
                {c.image && (
                  <Photo
                    width={1600}
                    height={1000}
                    src={c.image}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/10] w-full object-cover"
                  />
                )}
                <div className="flex flex-1 gap-4 p-[var(--space-card-pad-sm)]">
                  <DateChip iso={c.date} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[var(--color-ink)]" style={T.cardTitle}>
                      {c.title}
                    </h3>
                    <p className="mt-1 text-[var(--color-ink-soft)]" style={T.label}>
                      {SCHOOL_LABELS[c.school] ?? c.school}
                    </p>
                    {c.blurb && (
                      <p className="mt-2 line-clamp-2 text-[var(--color-ink-soft)]" style={T.body}>
                        {c.blurb}
                      </p>
                    )}
                    <span
                      className="mt-3 inline-flex items-center gap-1.5 font-display text-[var(--color-brand-blue)]"
                      style={T.label}
                    >
                      Read more
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* The "18 MAY" block: a white box with a pale border and blue text —
   measured from the mockup, not a filled blue block. */
function DateChip({ iso }: { iso: string }) {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString(undefined, { month: "short" }).toUpperCase();
  return (
    <time
      dateTime={iso}
      className="flex h-fit shrink-0 flex-col items-center bg-[var(--chip-bg)] text-[var(--chip-fg)]"
      style={{
        border: "var(--chip-border)",
        borderRadius: "var(--chip-radius)",
        padding: "var(--chip-pad)",
      }}
    >
      <span
        className="font-display leading-none"
        style={{
          fontSize: "var(--chip-day-size)",
          fontWeight: "var(--chip-day-weight)",
        }}
      >
        {day}
      </span>
      <span
        className="mt-0.5 leading-none"
        style={{
          fontSize: "var(--chip-month-size)",
          fontWeight: "var(--chip-month-weight)",
          letterSpacing: "var(--tracking-label)",
        }}
      >
        {month}
      </span>
    </time>
  );
}
