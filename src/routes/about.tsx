import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/structured-data";
import { ArrowRight, Award, Plane, Quote } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import { GoldButton, GhostButton, Marked } from "@/components/alpha-ui";
import { Photo } from "@/components/photo";
import { T, SHELL } from "@/components/type-roles";
import { CSEE_2025 as HIGH_CSEE_2025, ACSEE_2026 as HIGH_ACSEE_2026 } from "@/lib/high-results";
import { CSEE_2025 as GIRLS_CSEE_2025, ACSEE_2026 as GIRLS_ACSEE_2026 } from "@/lib/girls-results";
import type { ReactNode } from "react";

import campusAerial from "@/assets/alpha-high-campus-aerial.webp";
import profMayo from "@/assets/prof-mayo.webp";
import campusNurseryImage from "@/assets/campus-nursery.webp";
import campusHighImage from "@/assets/campus-high.webp";
import campusGirlsImage from "@/assets/campus-girls.webp";

const FOUNDED_YEAR = 2007;
const YEARS = new Date().getFullYear() - FOUNDED_YEAR;

export const Route = createFileRoute("/about")({
  head: () => ({
    ...seo({
      title: "About Alpha Schools — three schools in Dar es Salaam since 2007",
      description:
        "How Alpha grew from one school in Mikocheni in 2007 into three across Dar es Salaam: a nursery and primary, a co-education secondary and a girls' secondary, with aviation on the timetable.",
      path: "/about",
      ld: [breadcrumbLd([{ name: "About", path: "/about" }])],
    }),
  }),
  component: AboutPage,
});

const GOLD = "var(--color-gold)";
const NAVY = "var(--color-deep-blue)";
const NAVY_DARK = "var(--color-deep-blue-dark)";

/* Clears the fixed header when an in-page link lands on a chapter. */
const ANCHOR = { scrollMarginTop: "calc(var(--header-h) + 1.5rem)" };

const VALUES = [
  { name: "Integrity", blurb: "Doing the right thing — especially when no one is watching." },
  { name: "Excellence", blurb: "A standard we hold to ourselves before we ask it of pupils." },
  {
    name: "Innovation",
    blurb: "From aviation to coding, leading where Tanzanian schools have not gone.",
  },
  { name: "Discipline", blurb: "The quiet habit behind every result worth having." },
  { name: "Service", blurb: "Education that gives back to family, community and country." },
] as const;

/* What the founder started, and what grew from it. */
const TIMELINE: ReadonlyArray<{ year: string; title: string; body: string }> = [
  {
    year: "2007",
    title: "Alpha High School",
    body: "Established on 19 March 2007 by the late Prof. Aloyce W. Mayo, in Mikocheni.",
  },
  {
    year: "2020",
    title: "Alpha Girls",
    body: "A girls-only secondary school opens at the Kunduchi campus.",
  },
  {
    year: "2022",
    title: "Alpha Nursery & Primary",
    body: "Early years and primary join the group, completing the journey from age 2 to Form 6.",
  },
  {
    year: "2022",
    title: "Aviation programme",
    body: "Aviation joins the timetable in partnership with the Kenya School of Flying.",
  },
];

/* The three schools, with the facts already confirmed on their own pages. */
const SCHOOLS = [
  {
    to: "/schools/nursery-primary",
    name: "Nursery & Primary",
    line: "Ages 2 to 12, Kunduchi. Play-led early years into a structured primary, with coding from primary.",
    image: campusNurseryImage,
    alt: "Young Alpha primary pupils in green sports kit",
    band: "var(--color-bright-blue)",
  },
  {
    to: "/schools/alpha-high",
    name: "Alpha High",
    line: "Co-education, Form 1 to 6, Mikocheni. The flagship secondary, established 2007.",
    image: campusHighImage,
    alt: "Alpha High aviation students in safety vests at the airport",
    band: NAVY,
  },
  {
    to: "/schools/alpha-girls",
    name: "Alpha Girls",
    line: "Girls only, Form 1 to 6, Kunduchi. Leadership practised daily since 2020.",
    image: campusGirlsImage,
    alt: "Alpha Girls debate team celebrating with medals and certificates",
    band: "var(--color-girls-teal)",
  },
] as const;

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
        style={{ ...T.hero, color: onDark ? "#fff" : NAVY }}
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

/* ------------------------------------------------------------------ *
 * 1. HERO
 * The home page opens on a full-bleed slideshow; this page opens on the
 * founder. A light split: the story in words on the left, his portrait
 * on the right, and the three
 * figures that summarise the group as large numerals rather than the
 * icon strip the home hero uses.
 * ------------------------------------------------------------------ */
function Hero() {
  const figures = [
    { n: String(YEARS), label: "years", sub: "since 19 March 2007" },
    { n: "3", label: "schools", sub: "nursery to Form Six" },
    { n: "2", label: "campuses", sub: "Mikocheni and Kunduchi" },
  ];
  return (
    <section className="bg-[var(--color-off-white)] pt-[var(--space-section-y)]">
      <div className={`${SHELL} grid gap-12 pb-[var(--space-section-y)] lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16`}>
        <div>
          <h1 className="font-display tracking-tight text-balance" style={{ ...T.hero, color: NAVY }}>
            <span className="sr-only">About Alpha Schools, Dar es Salaam: </span>
            Three schools.{" "}
            <Marked kind="underline" color={GOLD}>
              One idea,
            </Marked>{" "}
            since 2007.
          </h1>
          <p className="mt-6 max-w-xl text-[var(--color-ink)]/85" style={T.body}>
            Alpha began on 19 March 2007 with one secondary school in Mikocheni, founded by the
            late Prof. Aloyce W. Mayo. Today it is three schools on two campuses in Dar es
            Salaam, from the first day of nursery to Form Six, with aviation and coding on the
            timetable.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GoldButton to="/admission">
              Enroll Now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </GoldButton>
            <GhostButton href="#director">Read the Director&rsquo;s word</GhostButton>
          </div>
          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-[var(--color-hairline)] pt-8 sm:gap-6">
            {figures.map((f) => (
              <div key={f.label}>
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <span
                    className="block font-display tabular-nums"
                    style={{ ...T.hero, lineHeight: 1, color: NAVY }}
                  >
                    {f.n}
                  </span>
                  <span className="mt-1 block font-display" style={{ ...T.cardTitle, color: NAVY }}>
                    {f.label}
                  </span>
                  <span className="mt-0.5 block text-[var(--color-ink-soft)]" style={T.body}>
                    {f.sub}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-banner)]">
            <Photo
              width={1100}
              height={1010}
              src={profMayo}
              alt="Prof. Aloyce W. Mayo, founder of Alpha Schools"
              sizes="(min-width: 1024px) 40vw, 24rem"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <figcaption className="mt-5">
            <span aria-hidden className="mb-3 block h-1 w-12 rounded-full" style={{ background: GOLD }} />
            <span className="block font-display" style={{ ...T.cardTitle, color: NAVY }}>
              Prof. Aloyce W. Mayo
            </span>
            <span className="block text-[var(--color-ink-soft)]" style={T.body}>
              Founder. Opened Alpha High School in Mikocheni on 19 March 2007.
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 2. THE FOUNDER
 * His chapter carries what is on record about him and what grew from
 * the school he opened. The biography itself is still owed by the family
 * and the school office; the placeholder stays visible until it arrives.
 * The quotation is the Director's, from her signed letter below.
 * ------------------------------------------------------------------ */
function Founder() {
  return (
    <section id="founder" className="bg-white" style={ANCHOR}>
      <div className={`${SHELL} grid gap-12 py-[var(--space-section-y)] lg:grid-cols-[1.4fr_1fr] lg:gap-16`}>
        <div>
          <ChapterHead
            title={
              <>
                In honour of the late{" "}
                <Marked kind="underline" color={GOLD}>
                  Prof. Aloyce W. Mayo.
                </Marked>
              </>
            }
            lead="Alpha Schools was founded in 2007 by the late Prof. Aloyce W. Mayo — a man whose conviction that education should serve both intellect and character still anchors everything we do."
          />
          <Reveal direction="up" className="mt-8 max-w-2xl space-y-5 text-[var(--color-ink)]/85" style={T.body}>
            <p>
              He opened Alpha High School in Mikocheni on 19 March 2007, to enable students to
              achieve their best — intellectually and physically — and to grow into responsible
              citizens of their society. The girls&rsquo; school, the nursery and primary, and the
              aviation programme all grew from that one school.
            </p>
            <blockquote className="relative rounded-[1.5rem] p-6 pt-8 sm:p-8 sm:pt-10" style={{ background: NAVY }}>
              <Quote aria-hidden className="absolute -top-4 left-6 h-9 w-9" style={{ color: GOLD }} />
              <p className="font-display text-white text-balance" style={T.cardTitle}>
                &ldquo;His visionary leadership laid the foundation for Alpha Schools. Professor
                Mayo&rsquo;s commitment to preparing young Tanzanians for success in the competitive
                realms of technology, entrepreneurship, and the evolving challenges of our global
                landscape continues to inspire us all.&rdquo;
              </p>
              <footer className="mt-4 text-white/75" style={T.body}>
                Ms. Fatina Said, Managing Director, Alpha High School
              </footer>
            </blockquote>
            <p className="rounded-[1rem] border border-dashed border-[var(--color-hairline)] p-5 text-[var(--color-ink-soft)]">
              [Founder biography &mdash; his life, career and the founding of the school, to be
              provided by the family / school office.]
            </p>
          </Reveal>
        </div>

        <Reveal direction="up">
          <h3 className="font-display" style={{ ...T.section, color: NAVY }}>
            What he started.
          </h3>
          <ol className="mt-6 border-t border-[var(--color-hairline)]">
            {TIMELINE.map((t) => (
              <li
                key={`${t.year}-${t.title}`}
                className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-[var(--color-hairline)] py-5"
              >
                <span
                  className="font-display tabular-nums"
                  style={{ ...T.section, lineHeight: 1.1, color: GOLD }}
                >
                  {t.year}
                </span>
                <span>
                  <span className="block font-display text-[var(--color-ink)]" style={T.cardTitle}>
                    {t.title}
                  </span>
                  <span className="mt-1 block text-[var(--color-ink)]/75" style={T.body}>
                    {t.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 3. A WORD FROM THE DIRECTOR
 * School-supplied, September 2026. Reproduced verbatim — this is a
 * signed letter from a named person, so it is not edited for house
 * style, with one exception: the founder's name. Her letter as supplied
 * read "Professor Aloysius Mayo"; the owner confirmed on 2026-10-22 that
 * the founder is Prof. Aloyce W. Mayo, so the letter now carries that
 * form rather than show two names on one page. It uses "Alpha Girls High School" and
 * "Alpha Nursery and Primary School" where the brand names are "Alpha
 * Girls" and "Nursery & Primary": the naming rule governs the site's
 * own copy, not a quotation. Her photograph is still owed; the
 * placeholder stays visible.
 * ------------------------------------------------------------------ */
function Director() {
  return (
    <section id="director" className="text-white" style={{ ...ANCHOR, background: NAVY_DARK }}>
      <div className={`${SHELL} grid items-start gap-12 py-[var(--space-section-y)] lg:grid-cols-[1fr_1.5fr] lg:gap-16`}>
        <Reveal direction="up" className="lg:sticky lg:top-24">
          <h2 className="font-display tracking-tight text-balance" style={T.hero}>
            A word from{" "}
            <Marked kind="underline" color={GOLD}>
              the Director.
            </Marked>
          </h2>
          <div className="mt-8 flex aspect-[4/5] w-full max-w-sm flex-col items-start justify-end rounded-[1.75rem] border border-white/15 bg-white/5 p-6">
            <p className="font-display" style={{ ...T.cardTitle, color: GOLD }}>
              Ms. Fatina Said
            </p>
            <p className="mt-1 text-white/80" style={T.body}>
              Managing Director, Alpha High School
            </p>
            <p className="mt-3 text-white/60" style={T.body}>
              [Photograph of Ms. Fatina Said &mdash; to be provided]
            </p>
          </div>
        </Reveal>

        <Reveal direction="up">
          <p className="font-display leading-snug text-balance" style={{ ...T.section, color: GOLD }}>
            &ldquo;Together, we can empower the next generation to thrive and make a meaningful
            impact in their communities and beyond.&rdquo;
          </p>
          <div className="mt-8 max-w-2xl space-y-5 text-white/85" style={T.body}>
            <p>
              As the Managing Director of Alpha High School, I am honoured to pay tribute to our
              esteemed founder, Prof. Aloyce W. Mayo. His visionary leadership laid the
              foundation for Alpha Schools, which include Alpha Nursery and Primary School, Alpha
              Girls High School, and Alpha High School. Professor Mayo's commitment to preparing
              young Tanzanians for success in the competitive realms of technology,
              entrepreneurship, and the evolving challenges of our global landscape continues to
              inspire us all.
            </p>
            <p>
              At Alpha, we take pride in the remarkable achievements of our alumni, who represent
              a diverse range of professions both locally and internationally. Our graduates have
              excelled as accountants, medical doctors, lawyers, engineers, pilots, and in many
              other fields, demonstrating the effectiveness of our comprehensive educational
              approach. I warmly invite all parents and guardians to consider registering their
              sons and daughters at Alpha Schools. Here, we offer a well-rounded curriculum that
              fosters not only academic excellence but also personal growth and character
              development. Together, we can empower the next generation to thrive and make a
              meaningful impact in their communities and beyond.
            </p>
            <p>Thank you for your continued support in shaping the future of our youth.</p>
            <p className="text-white/70">
              Warm regards,
              <br />
              <span className="font-display font-semibold" style={{ color: GOLD }}>
                Ms. Fatina Said
              </span>
              <br />
              Managing Director, Alpha High School
            </p>
          </div>
          <div className="mt-8">
            <GoldButton to="/admission">
              Enroll Now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </GoldButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 4. ONE ALPHA, THREE SCHOOLS
 * The group as it stands: the campus from the air, the facts, and one
 * tile per school leading to its own page.
 * ------------------------------------------------------------------ */
function Schools() {
  return (
    <section className="bg-white">
      <div className={`${SHELL} py-[var(--space-section-y)]`}>
        <ChapterHead
          title={
            <>
              One Alpha.{" "}
              <Marked kind="underline" color={GOLD}>
                Three schools.
              </Marked>
            </>
          }
          lead={
            <>
              Alpha Schools comprises <strong>Alpha High</strong> (Mikocheni),{" "}
              <strong>Alpha Girls</strong> (Kunduchi), and <strong>Nursery &amp; Primary</strong>{" "}
              (Kunduchi) — operating under ALFA EDUCATION CENTRE, P.O. Box 35136, Dar es Salaam.
              Each school has its own page: what it teaches, how its students perform, and how to
              join.
            </>
          }
        />
        <Reveal direction="up" className="mt-10">
          <figure>
            <Photo
              src={campusAerial}
              alt="The Alpha High campus in Mikocheni from the air: three blocks around a planted courtyard"
              width={1440}
              height={810}
              sizes="100vw"
              loading="lazy"
              decoding="async"
              className="aspect-[16/7] w-full rounded-[1.75rem] object-cover shadow-[var(--shadow-banner)]"
            />
            <figcaption className="mt-3 text-[var(--color-ink-soft)]" style={T.body}>
              The Alpha High campus in Mikocheni, where it all began.
            </figcaption>
          </figure>
        </Reveal>
        <ul className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {SCHOOLS.map((s, i) => (
            <Reveal key={s.to} direction="up" delay={i * 90} as="li" style={{ ["--band" as string]: s.band }}>
              <Link
                to={s.to}
                className="group relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-[var(--band)] text-white transition-transform duration-200 hover:-translate-y-[2px] motion-reduce:transition-none md:min-h-[26rem]"
              >
                <Photo
                  width={800}
                  height={600}
                  src={s.image}
                  alt={s.alt}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10"
                  style={{
                    background:
                      "linear-gradient(to top, var(--band) 0%, var(--band) 32%, color-mix(in srgb, var(--band) 65%, transparent) 55%, transparent 80%)",
                  }}
                />
                <span className="p-6 sm:p-7">
                  <span className="block font-display" style={T.section}>
                    {s.name}
                  </span>
                  <span className="mt-1 block text-white/90" style={T.body}>
                    {s.line}
                  </span>
                  <span
                    className="mt-3 inline-flex items-center gap-1.5 font-display"
                    style={{ ...T.body, fontWeight: 800, color: GOLD }}
                  >
                    Explore {s.name}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                      aria-hidden
                    />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 5. MISSION, VISION, VALUES — the school's own words, on a navy field.
 * ------------------------------------------------------------------ */
function Mission() {
  return (
    <section className="text-white" style={{ background: NAVY }}>
      <div className={`${SHELL} py-[var(--space-section-y)]`}>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Reveal direction="up">
            <h2 className="font-display" style={{ ...T.section, color: GOLD }}>
              Our mission
            </h2>
            <p className="mt-4 font-display tracking-tight text-balance" style={T.section}>
              To enable pupils to prosper academically by solving their intellectual and
              environmental challenges, to become good citizens, responsible to their society.
            </p>
          </Reveal>
          <Reveal
            direction="up"
            className="self-start rounded-[1.75rem] p-8 sm:p-10"
            style={{ background: GOLD }}
          >
            <h2 className="font-display" style={{ ...T.section, color: NAVY }}>
              Our vision
            </h2>
            <p
              className="mt-4 font-display tracking-tight text-[var(--color-accent-foreground)]"
              style={T.section}
            >
              To strive for excellence.
            </p>
          </Reveal>
        </div>

        <Reveal direction="up" className="mt-14">
          <h3 className="font-display" style={{ ...T.section }}>
            Five things we won&rsquo;t compromise.
          </h3>
          <ul className="mt-6 grid border-t border-white/20 md:grid-cols-2 md:gap-x-10">
            {VALUES.map((v, i) => (
              <li key={v.name} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-white/20 py-5">
                <span className="font-display tabular-nums" style={{ ...T.hero, lineHeight: 1, color: GOLD }}>
                  {i + 1}
                </span>
                <span>
                  <span className="block font-display" style={T.cardTitle}>
                    {v.name}
                  </span>
                  <span className="mt-1 block text-white/85" style={T.body}>
                    {v.blurb}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 6. A RECORD OF EXCELLENCE — the NECTA figures are from the results
 * modules, as published; the faculty figure is the school's claim and
 * still carries its re-confirmation note.
 * ------------------------------------------------------------------ */
function Record() {
  const rows = [
    {
      Icon: Award,
      title: "Alpha High, NECTA results",
      body: `Form Four ${HIGH_CSEE_2025.year}: ${HIGH_CSEE_2025.divisions.I} of ${HIGH_CSEE_2025.candidates} in Division I. Form Six ${HIGH_ACSEE_2026.year}: ${HIGH_ACSEE_2026.divisions.I + HIGH_ACSEE_2026.divisions.II} of ${HIGH_ACSEE_2026.candidates} in Division I or II.`,
      to: "/schools/alpha-high" as const,
      cta: "See every square",
    },
    {
      Icon: Award,
      title: "Alpha Girls, NECTA results",
      body: `Form Four ${GIRLS_CSEE_2025.year}: ${GIRLS_CSEE_2025.divisions.I} of ${GIRLS_CSEE_2025.candidates} girls in Division I. Form Six ${GIRLS_ACSEE_2026.year}: all ${GIRLS_ACSEE_2026.candidates} in Division I or II.`,
      to: "/schools/alpha-girls" as const,
      cta: "See every square",
    },
    {
      Icon: Plane,
      title: "Aviation in Alpha Schools",
      body: "Alpha Schools proudly stand as the pioneer institutions in Tanzania to introduce aviation and flying as part of our extracurricular activities. Ground school, modules and flying hours through KSOF.",
      to: "/aviation" as const,
      cta: "Inside the aviation programme",
    },
  ];
  return (
    <section className="bg-[var(--color-off-white)]">
      <div className={`${SHELL} py-[var(--space-section-y)]`}>
        <ChapterHead
          title={`${YEARS} years. Real results.`}
          lead="NECTA's own published figures for the two secondary schools, and the programme no other school in Dar es Salaam can copy."
        />
        <ul className="mt-10 border-t border-[var(--color-hairline)]">
          {rows.map((r) => (
            <li
              key={r.title}
              className="grid gap-4 border-b border-[var(--color-hairline)] py-6 sm:grid-cols-[3.5rem_1fr_auto] sm:items-start sm:gap-6"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full" style={{ background: GOLD }}>
                <r.Icon className="h-6 w-6" style={{ color: NAVY }} aria-hidden />
              </span>
              <div>
                <h3 className="font-display" style={{ ...T.cardTitle, color: NAVY }}>
                  {r.title}
                </h3>
                <p className="mt-2 max-w-2xl text-[var(--color-ink)]/85" style={T.body}>
                  {r.body}
                </p>
              </div>
              <Link
                to={r.to}
                hash={r.to.startsWith("/schools") ? "results" : undefined}
                className="inline-flex items-center gap-1.5 font-display hover:underline sm:mt-1"
                style={{ ...T.body, fontWeight: 800, color: NAVY }}
              >
                {r.cta} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
          The school also reports that 80% of teachers hold a bachelor&rsquo;s degree or higher
          across the three schools, and earlier NECTA placings of 2nd in the Dar es Salaam zone
          for the 2012 Form Six (ACSEE) and 4th in the zone for the 2011 Form Four (CSEE). Figures
          to be re-confirmed with the school office before they are given more prominence.
        </p>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <SiteHeader />
      <Hero />
      <Founder />
      <Director />
      <Schools />
      <Mission />
      <Record />

      {/* 7. CTA */}
      <section style={{ background: GOLD }}>
        <div className={`${SHELL} flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center`}>
          <div>
            <h2 className="font-display tracking-tight" style={{ ...T.section, color: NAVY }}>
              Come and see Alpha for yourself.
            </h2>
            <p className="mt-2 max-w-xl text-[var(--color-accent-foreground)]" style={T.body}>
              Book a campus visit and meet the people behind the results.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex min-h-[var(--btn-primary-min-h)] items-center gap-2 rounded-[var(--radius-pill)] px-7 text-white transition-transform hover:-translate-y-[1px] motion-reduce:transition-none"
              style={{ ...T.body, fontWeight: 800, background: NAVY }}
            >
              Book a Visit
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/admission"
              className="inline-flex min-h-[var(--btn-primary-min-h)] items-center rounded-[var(--radius-pill)] border-2 px-7 transition-colors hover:bg-white/40"
              style={{ ...T.body, fontWeight: 800, borderColor: NAVY, color: NAVY }}
            >
              Enroll Now
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
