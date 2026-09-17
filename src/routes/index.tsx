import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  Award,
  Building2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MapPin,
  Plane,
  Quote,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { CinematicHero, Marked, Backdrop } from "@/components/alpha-ui";
import {
  getHomeWhatsNew,
  getHomeUpcomingEvents,
  getTestimonials,
  parentQuotes,
  type HomeWhatsNew,
  type HomeEventItem,
  type TestimonialItem,
} from "@/lib/alpha-content.functions";
import heroCollage from "@/assets/hero-collage-v2.webp";
import aviationUniformAsset from "@/assets/aviation-uniform.webp";
import campusNurseryImage from "@/assets/campus-nursery.webp";
import campusHighImage from "@/assets/campus-high.webp";
import campusGirlsImage from "@/assets/campus-girls.webp";
import { T } from "@/components/type-roles";

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
  head: () => ({
    meta: [
      { title: "Alpha Schools — Learning that takes off · Dar es Salaam" },
      {
        name: "description",
        content:
          "Three schools, two campuses in Dar es Salaam. NECTA O-Level and A-Level, coding and an aviation programme.",
      },
      { property: "og:title", content: "Alpha Schools — Learning that takes off" },
      {
        property: "og:description",
        content:
          "Nursery & Primary, Alpha High, Alpha Girls — Your Child's Education is Our Priority.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
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

const SCHOOLS = [
  {
    slug: "nursery-primary",
    badge: "AGE 2 – 12",
    name: "Nursery & Primary",
    campus: "COMBINED CAMPUS",
    blurb:
      "Where curiosity starts. Play-led early years into a strong, structured primary foundation.",
    to: "/schools/nursery-primary",
    image: campusNurseryImage,
    alt: "Young Alpha primary students in green sports kit",
    band: "var(--color-bright-blue)",
    Icon: Building2,
  },
  {
    slug: "alpha-high",
    badge: "FORM 1 – 6",
    name: "Alpha High",
    /* PRODUCT.md and AGENTS.md: say "Co-education", never "Mixed". This card
       was the last place on the site still saying Mixed. */
    campus: "CO-EDUCATION · MIKOCHENI",
    blurb:
      "Our flagship secondary. NECTA pathways, aviation and coding at the core.",
    to: "/schools/alpha-high",
    image: campusHighImage,
    alt: "Alpha High aviation students in safety vests at JNIA",
    band: "var(--color-deep-blue)",
    Icon: GraduationCap,
  },
  {
    slug: "alpha-girls",
    badge: "FORM 1 – 6",
    name: "Alpha Girls",
    campus: "GIRLS ONLY · KUNDUCHI",
    blurb:
      "A secondary built for girls to lead — same rigour, same aviation and coding, room to thrive.",
    to: "/schools/alpha-girls",
    image: campusGirlsImage,
    alt: "Alpha Girls debate team celebrating with medals and certificates",
    band: "var(--color-girls-teal)",
    Icon: Award,
  },
] as const;

/* Values and labels are unchanged — only `Icon` was added, for the rail
   layout. design/README.md: the year figure is calculated from the 2007
   founding date and must never be hardcoded. */
const STATS: ReadonlyArray<{
  value: number;
  suffix?: string;
  label: [string, string];
  Icon: typeof Award;
}> = [
  { value: YEARS_OPERATIONAL, suffix: "+", label: ["years shaping", "leaders since 2007"], Icon: Award },
  { value: 3, label: ["schools across", "Dar es Salaam"], Icon: Building2 },
  { value: 1, label: ["aviation programme", "across our schools"], Icon: Plane },
  { value: 2, label: ["campuses —", "Kunduchi & Mikocheni"], Icon: MapPin },
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
        <h2
          className="font-display tracking-tight text-[var(--color-ink)]"
          style={T.section}
        >
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
      <AviationBanner />
      <Testimonials items={testimonials} />
      <NewsAndEvents news={data.news} events={upcomingEvents} />
      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 1. HERO + STAT RAIL — the opening screen.
 *
 * The hero fills the viewport (100svh) with the navigation overlaid on
 * it, so nothing from "Find the Right School" shows beneath the fold.
 *
 * The stat rail keeps the layout design/README.md asks for — a vertical
 * rail on desktop, a grid on mobile — but the two now sit in different
 * places. On desktop it is the hero's right-hand column, translucent
 * rather than solid so the photograph still reads through it: the
 * desktop scrim is deliberately lightest at the right edge, and a solid
 * navy block there would cover the only part of the picture that is not
 * already dimmed. On mobile it moves out of the hero entirely and
 * becomes the first thing the reader discovers on scrolling, because a
 * 100svh opening screen on a phone has room for the headline and the
 * call to action or for four statistics, but not for both.
 *
 * Only one of the two is ever in the accessibility tree: each is
 * display:none at the other's breakpoint.
 * ------------------------------------------------------------------ */
function Hero() {
  return (
    <>
      <CinematicHero
        eyebrow="Dar es Salaam, Tanzania · Since 2007"
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
          <a
            href="#find-the-right-school"
            className={`${BTN_BASE} w-full sm:w-auto`}
            style={BTN_PRIMARY}
          >
            Find the Right School
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        }
        rail={<StatRail variant="rail" />}
        cueHref="#find-the-right-school"
        cueLabel="Skip to Find the Right School"
      />
      <StatRail variant="band" />
    </>
  );
}

function StatRail({ variant }: { variant: "rail" | "band" }) {
  const isRail = variant === "rail";
  return (
    <aside
      aria-label="Alpha Schools at a glance"
      className={
        isRail
          ? "h-full w-full border-l border-[var(--color-surface)]/15 bg-[rgba(0,26,60,0.55)] backdrop-blur-sm"
          : "bg-[var(--stat-row-bg)] lg:hidden"
      }
    >
      <ul
        className={
          isRail
            ? "flex h-full flex-col justify-center"
            : "grid grid-cols-2"
        }
      >
        {STATS.map((s, i) => (
          <li
            key={i}
            className="flex items-center gap-3 p-[var(--stat-pad)]"
            style={{ borderTop: i === 0 ? undefined : "var(--stat-divider)" }}
          >
            <s.Icon
              className="h-5 w-5 shrink-0 text-[var(--stat-icon-color)]"
              aria-hidden
            />
            <div className="min-w-0">
              <div
                className="font-display text-[var(--stat-figure-color)]"
                style={T.stat}
              >
                {s.value}
                {s.suffix ?? ""}
              </div>
              <div
                className="text-[var(--stat-label-color)]"
                style={T.statLabel}
              >
                {s.label[0]} {s.label[1]}
              </div>
            </div>
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
      </Reveal>

      <ul
        suppressHydrationWarning data-reveal
        data-reveal-delay="120"
        className="mt-[var(--space-block-y)] grid gap-0 overflow-hidden rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] md:grid-cols-3 md:gap-[var(--space-card-gap)] md:overflow-visible md:bg-transparent md:shadow-none"
      >
        {SCHOOLS.map((s, i) => (
          <li
            key={s.slug}
            style={{ ["--band" as string]: s.band }}
            className={
              i === 0 ? undefined : "border-t border-[var(--color-hairline)] md:border-t-0"
            }
          >
            <Link
              to={s.to}
              className="group flex h-full items-center gap-4 p-[var(--space-card-pad-sm)] md:block md:overflow-hidden md:rounded-[var(--radius-card)] md:bg-[var(--card-bg)] md:p-0 md:shadow-[var(--card-shadow)] md:transition-shadow md:hover:shadow-[var(--card-shadow-hover)]"
            >
              {/* 375px: icon tile. Hidden from md up. */}
              <span
                aria-hidden
                className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius-btn)] bg-[var(--band)] text-[var(--color-surface)] md:hidden"
              >
                <s.Icon className="h-6 w-6" />
              </span>

              {/* Desktop: photo. Hidden below md. */}
              <div className="hidden md:block">
                <img
                  src={s.image}
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 items-center justify-between gap-3 md:block md:bg-[var(--band)] md:p-[var(--space-card-pad-sm)]">
                <div className="min-w-0">
                  <h3
                    className="font-display text-[var(--color-ink)] md:text-[var(--color-surface)]"
                    style={T.cardTitle}
                  >
                    {s.name}
                  </h3>
                  <p
                    className="mt-1 text-[var(--color-ink-soft)] md:text-[var(--color-surface)]/85"
                    style={T.label}
                  >
                    {s.campus}
                  </p>
                  <p
                    className="mt-0.5 text-[var(--color-ink-soft)] md:text-[var(--color-surface)]/85"
                    style={T.label}
                  >
                    {s.badge}
                  </p>
                </div>

                {/* 375px: coloured pill on a white row. From md up it sits
                    inside the coloured band, so it inverts to a white pill —
                    these must be Tailwind classes, not inline style, or the
                    breakpoint cannot override them. */}
                <span
                  className={`${BTN_BASE} shrink-0 bg-[var(--band)] text-[var(--color-surface)] md:mt-4 md:bg-[var(--color-surface)] md:text-[var(--color-ink)]`}
                  style={{
                    borderRadius: "var(--btn-primary-radius)",
                    padding: "0.5rem 0.875rem",
                    fontWeight: "var(--btn-primary-weight)",
                    fontSize: "var(--text-label)",
                  }}
                >
                  Explore
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
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
 * 3. AVIATION BANNER
 * ------------------------------------------------------------------ */
function AviationBanner() {
  return (
    <section className={`${SHELL} pb-[var(--space-section-y)]`}>
      <Reveal direction="up">
        <div className="relative isolate overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-banner)]">
          <img
            src={aviationUniformAsset}
            alt="Alpha Schools aviation cadet in uniform at the airport"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundImage: "var(--hero-scrim)" }}
          />
          <div className="relative max-w-lg p-[var(--space-card-pad)]">
            <p className="text-[var(--color-gold)]" style={T.label}>
              The Alpha difference
            </p>
            <h2
              className="mt-2 font-display text-[var(--color-surface)]"
              style={T.section}
            >
              Soar Higher with Alpha Aviation
            </h2>
            <p
              className="mt-3 text-[var(--color-surface)]/90"
              style={T.body}
            >
              Ground school, simulator hours and first principles of flight.
              [Aviation positioning statement — wording to be confirmed]
            </p>
            <Link
              to="/aviation"
              className={`${BTN_BASE} mt-5 w-full sm:w-auto`}
              style={BTN_PRIMARY}
            >
              Discover Aviation Programme
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 4. TESTIMONIALS (two-up)
 * design/README.md: the mockup's quotes are invented. This renders only
 * published rows and disappears completely when there are none — no
 * placeholder names, ever.
 * ------------------------------------------------------------------ */
/* Was a regex over `relationship`. That field now holds an alumni's job
   title, so the regex would have filed every submission under Parent
   Testimonials. grad_year is the reliable signal: required on the alumni
   form, never set on a parent quote. */
function isAlumni(t: TestimonialItem) {
  return t.grad_year != null;
}

function Testimonials({ items }: { items: TestimonialItem[] }) {
  /* Parent stories rotate, newest first, so quotes parents send in lead and
     older staff-entered quotes follow. The alumni card shows one story. */
  const parents = parentQuotes(items);
  const alumni = items.find(isAlumni);

  if (parents.length === 0 && !alumni) return null;

  return (
    <section className={`${SHELL} pb-[var(--space-section-y)]`}>
      <div suppressHydrationWarning data-reveal className="grid gap-[var(--space-card-gap)] md:grid-cols-2">
        {parents.length > 0 && (
          <TestimonialCard
            title="Parent Testimonials"
            tint="var(--color-tint-parent)"
            items={parents}
          />
        )}
        {alumni && (
          <TestimonialCard
            title="Alumni Testimonials"
            tint="var(--color-tint-alumni)"
            items={[alumni]}
          />
        )}
      </div>
    </section>
  );
}

function TestimonialCard({
  title,
  tint,
  items,
}: {
  title: string;
  tint: string;
  items: TestimonialItem[];
}) {
  const [index, setIndex] = useState(0);
  const count = items.length;
  const item = items[Math.min(index, count - 1)];
  const step =
    "grid h-11 w-11 place-items-center rounded-full bg-white/70 text-[var(--color-brand-blue)] " +
    "transition-colors duration-150 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-[var(--color-brand-blue)] disabled:cursor-not-allowed disabled:opacity-35 " +
    "motion-reduce:transition-none";

  return (
    <article
      className="flex gap-4 rounded-[var(--radius-card)] p-[var(--space-card-pad)] shadow-[var(--card-shadow)]"
      style={{ background: tint }}
    >
      <Quote
        className="h-6 w-6 shrink-0 text-[var(--color-brand-blue)]"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <h2
          className="font-display text-[var(--color-brand-blue)]"
          style={T.cardTitle}
        >
          {title}
        </h2>
        <blockquote
          className="mt-3 text-[var(--color-ink)]"
          style={T.body}
        >
          “{item.quote}”
        </blockquote>
        <p className="mt-3 text-[var(--color-ink-soft)]" style={T.label}>
          {item.author_name}
          {item.relationship ? `, ${item.relationship}` : ""}
        </p>
        {count > 1 && (
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              aria-label={`Previous ${title.toLowerCase()}`}
              className={step}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <span
              aria-live="polite"
              className="min-w-[4.5rem] text-center tabular-nums text-[var(--color-ink-soft)]"
              style={T.body}
            >
              {index + 1} of {count}
            </span>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(count - 1, i + 1))}
              disabled={index === count - 1}
              aria-label={`Next ${title.toLowerCase()}`}
              className={step}
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        )}
      </div>
      {item.photo_url && (
        <img
          key={item.id}
          src={item.photo_url}
          alt=""
          loading="lazy"
          decoding="async"
          className="hidden h-20 w-20 shrink-0 rounded-[var(--radius-btn)] object-cover sm:block"
        />
      )}
    </article>
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

function NewsAndEvents({
  news,
  events,
}: {
  news: HomeWhatsNew["news"];
  events: HomeEventItem[];
}) {
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
          Nothing published yet. News and upcoming events will appear here as
          soon as the school posts them.
        </p>
      ) : (
        <ul
          suppressHydrationWarning data-reveal
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
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/10] w-full object-cover"
                  />
                )}
                <div className="flex flex-1 gap-4 p-[var(--space-card-pad-sm)]">
                  <DateChip iso={c.date} />
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-display text-[var(--color-ink)]"
                      style={T.cardTitle}
                    >
                      {c.title}
                    </h3>
                    <p
                      className="mt-1 text-[var(--color-ink-soft)]"
                      style={T.label}
                    >
                      {SCHOOL_LABELS[c.school] ?? c.school}
                    </p>
                    {c.blurb && (
                      <p
                        className="mt-2 line-clamp-2 text-[var(--color-ink-soft)]"
                        style={T.body}
                      >
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
