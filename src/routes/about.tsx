import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/structured-data";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { ArrowRight, Award, Building2, Calendar, GraduationCap, Plane, Quote } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import { CinematicHero, GoldButton, GhostButton, HeroCredentials, Marked } from "@/components/alpha-ui";
import { T, SHELL } from "@/components/type-roles";
import { CSEE_2025 as HIGH_CSEE_2025, ACSEE_2026 as HIGH_ACSEE_2026 } from "@/lib/high-results";
import { CSEE_2025 as GIRLS_CSEE_2025, ACSEE_2026 as GIRLS_ACSEE_2026 } from "@/lib/girls-results";
import type { ReactNode } from "react";

import heroCollage from "@/assets/hero-collage-v2.webp";
import campusAerial from "@/assets/alpha-high-campus-aerial.webp";
import profMayo from "@/assets/prof-mayo.webp";
import campusNurseryImage from "@/assets/campus-nursery.webp";
import campusHighImage from "@/assets/campus-high.webp";
import campusGirlsImage from "@/assets/campus-girls.webp";
import avCadets from "@/assets/av-boys-cessna.webp";
import gradPortrait from "@/assets/alpha-high-graduate.webp";

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

const TIMELINE: ReadonlyArray<{ year: string; title: string; body: string }> = [
  {
    year: "2007",
    title: "Alpha High School",
    body: "Established on 19 March 2007 by the late Professor Aloysius Mayo, in Mikocheni.",
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

function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <SiteHeader overlay />

      {/* 1. HERO — the group in one screen. */}
      <CinematicHero
        srLead="About Alpha Schools, Dar es Salaam:"
        lineOne="Your child's education,"
        lineTwo="our priority."
        blurb={`Three schools on two campuses in Dar es Salaam, from the first day of nursery to Form Six. One family since 2007, with aviation and coding on the timetable.`}
        media={
          <HeroSlideshow
            pageKey="about"
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
            <GoldButton to="/admission">
              Enroll Now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </GoldButton>
            <GhostButton to="/contact" onNavy>
              Book a Visit
            </GhostButton>
          </>
        }
        foot={
          <HeroCredentials
            items={[
              {
                label: `${YEARS} years`,
                sub: "Since 19 March 2007",
                icon: <Calendar className="h-5 w-5" aria-hidden />,
              },
              {
                label: "Three schools",
                sub: "Nursery to Form Six",
                icon: <Building2 className="h-5 w-5" aria-hidden />,
              },
              {
                label: "Two campuses",
                sub: "Mikocheni and Kunduchi",
                icon: <GraduationCap className="h-5 w-5" aria-hidden />,
              },
              {
                label: "Aviation",
                sub: "Across our schools",
                icon: <Plane className="h-5 w-5" aria-hidden />,
              },
            ]}
          />
        }
      />

      {/* 2. WHO WE ARE */}
      <section className="bg-white">
        <div className={`${SHELL} grid gap-12 py-[var(--space-section-y)] lg:grid-cols-[1fr_1.1fr] lg:gap-16`}>
          <div>
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
                  (Kunduchi) — operating under ALFA EDUCATION CENTRE, P.O. Box 35136, Dar es
                  Salaam.
                </>
              }
            />
            <Reveal direction="up">
              <p className="mt-4 max-w-2xl text-[var(--color-ink)]/85" style={T.body}>
                We were founded to enable students to achieve their best — intellectually and
                physically — and to grow into responsible citizens of their society.
              </p>
              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6">
                {[
                  ["Founded", "19 March 2007"],
                  ["Schools", "Nursery & Primary · Alpha High · Alpha Girls"],
                  ["Campuses", "Kunduchi & Mikocheni, Dar es Salaam"],
                  ["Operator", "ALFA EDUCATION CENTRE, P.O. Box 35136, Dar es Salaam"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-display" style={{ ...T.body, fontWeight: 800, color: NAVY }}>
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
              src={avCadets}
              alt="Alpha students in safety vests beside a Cessna on the apron"
              width={1200}
              height={900}
              loading="lazy"
              decoding="async"
              className="absolute bottom-0 left-4 w-[46%] -rotate-2 rounded-[1.25rem] border-4 border-white object-cover shadow-[var(--shadow-card-hover)] sm:left-8"
              style={{ aspectRatio: "3 / 2" }}
            />
            <img
              src={gradPortrait}
              alt="An Alpha High graduate in cap and gown"
              width={1080}
              height={1440}
              loading="lazy"
              decoding="async"
              className="absolute bottom-6 right-4 w-[26%] rotate-2 rounded-[1.25rem] border-4 object-cover shadow-[var(--shadow-card-hover)] sm:right-8"
              style={{ aspectRatio: "4 / 5", borderColor: GOLD }}
            />
          </Reveal>
        </div>
      </section>

      {/* 3. THE THREE SCHOOLS */}
      <section className="bg-[var(--color-off-white)]">
        <div className={`${SHELL} py-[var(--space-section-y)]`}>
          <ChapterHead
            title="From the first day of nursery to Form Six."
            lead="Each school has its own page: what it teaches, how its students perform, and how to join."
          />
          <ul className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
            {SCHOOLS.map((s) => (
              <li key={s.to} style={{ ["--band" as string]: s.band }}>
                <Link
                  to={s.to}
                  className="group relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-[var(--band)] text-white transition-transform duration-200 hover:-translate-y-[2px] motion-reduce:transition-none md:min-h-[26rem]"
                >
                  <img
                    width={800}
                    height={600}
                    src={s.image}
                    alt={s.alt}
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
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. OUR JOURNEY */}
      <section className="bg-white">
        <div className={`${SHELL} py-[var(--space-section-y)]`}>
          <ChapterHead title="From one classroom to three schools." />
          <ol className="mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
            {TIMELINE.map((t, i) => (
              <Reveal key={`${t.year}-${t.title}`} direction="up" delay={i * 90}>
                <li className="relative pl-8 md:pl-0 md:pt-10">
                  <span
                    aria-hidden
                    className="absolute left-[7px] top-2 h-full w-0.5 bg-[var(--color-gold)]/40 md:left-0 md:top-[7px] md:h-0.5 md:w-full"
                  />
                  <span
                    aria-hidden
                    className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-[var(--color-gold)] ring-4 ring-white md:top-0"
                  />
                  <p className="font-display" style={{ ...T.hero, lineHeight: 1, color: NAVY }}>
                    {t.year}
                  </p>
                  <p className="mt-3 font-display text-[var(--color-ink)]" style={T.cardTitle}>
                    {t.title}
                  </p>
                  <p className="mt-2 text-[var(--color-ink)]/75" style={T.body}>
                    {t.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. MISSION, VISION, VALUES — the school's own words, on a navy field. */}
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

      {/* 6. OUR FOUNDER */}
      <section className="bg-[var(--color-off-white)]">
        <div className={`${SHELL} grid items-center gap-12 py-[var(--space-section-y)] lg:grid-cols-[1fr_1.4fr] lg:gap-16`}>
          <Reveal direction="up" className="mx-auto w-full max-w-sm lg:mx-0">
            <div className="aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-banner)]">
              <img
                width={1100}
                height={1010}
                src={profMayo}
                alt="Professor Aloysius Mayo, founder of Alpha Schools"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Reveal>
          <div>
            <ChapterHead
              title={
                <>
                  In honour of the late{" "}
                  <Marked kind="underline" color={GOLD}>
                    Professor Aloysius Mayo.
                  </Marked>
                </>
              }
              lead="Alpha Schools was founded in 2007 by the late Professor Aloysius Mayo — a man whose conviction that education should serve both intellect and character still anchors everything we do."
            />
            <Reveal direction="up">
              <p className="mt-6 text-[var(--color-ink-soft)]" style={T.body}>
                [Founder biography &mdash; to be provided by the family / school office.]
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 7. DIRECTOR MESSAGE
          School-supplied, September 2026. Reproduced verbatim — this is a
          signed letter from a named person, so it is not edited for house
          style. It names the founder "Professor Aloysius Mayo", the form the
          site adopted on 2026-09-10, and uses "Alpha Girls High School" and
          "Alpha Nursery and Primary School" where the brand names are "Alpha
          Girls" and "Nursery & Primary": the naming rule governs the site's
          own copy, not a quotation. Her photograph is still owed; the
          placeholder stays visible. */}
      <section className="overflow-x-clip bg-white">
        <div className={`${SHELL} grid items-start gap-12 py-[var(--space-section-y)] lg:grid-cols-[1.4fr_1fr] lg:gap-16`}>
          <div>
            <ChapterHead title="A word from the Director of Alpha High School." />
            <Reveal direction="up">
              <div className="relative mt-8 rounded-[1.75rem] p-8 text-white sm:p-10" style={{ background: NAVY }}>
                <Quote aria-hidden className="absolute -top-4 left-6 h-10 w-10" style={{ color: GOLD }} />
                <p className="font-display leading-snug text-balance" style={T.section}>
                  &ldquo;Together, we can empower the next generation to thrive and make a meaningful
                  impact in their communities and beyond.&rdquo;
                </p>
                <p className="mt-6 font-display" style={{ ...T.cardTitle, color: GOLD }}>
                  Ms. Fatina Said
                </p>
                <p className="mt-1 text-white/75" style={T.body}>
                  Managing Director, Alpha High School
                </p>
              </div>

              <div className="mt-8 max-w-2xl space-y-5 text-[var(--color-ink)]/85" style={T.body}>
                <p>
                  As the Managing Director of Alpha High School, I am honoured to pay tribute to our
                  esteemed founder, Professor Aloysius Mayo. His visionary leadership laid the
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
                <p className="text-[var(--color-ink)]/70">
                  Warm regards,
                  <br />
                  <span className="font-display font-semibold" style={{ color: NAVY }}>
                    Ms. Fatina Said
                  </span>
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal direction="up" className="mx-auto w-full max-w-sm lg:sticky lg:top-24 lg:mx-0">
            <div className="flex aspect-[4/5] flex-col items-start justify-end rounded-[1.75rem] bg-[var(--color-surface-muted)] p-6 ring-1 ring-[var(--color-hairline)]">
              <p className="font-display" style={{ ...T.cardTitle, color: NAVY }}>
                Ms. Fatina Said
              </p>
              <p className="mt-1 text-[var(--color-ink-soft)]" style={T.body}>
                [Photograph of Ms. Fatina Said &mdash; to be provided]
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8. A RECORD OF EXCELLENCE — the NECTA figures are from the results
          modules, as published; the faculty figure is the school's claim and
          still carries its re-confirmation note. */}
      <section className="bg-[var(--color-off-white)]">
        <div className={`${SHELL} py-[var(--space-section-y)]`}>
          <ChapterHead
            title="Two decades. Real results."
            lead="NECTA's own published figures for the two secondary schools, and the programme no other school in Dar es Salaam can copy."
          />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {[
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
            ].map((r) => (
              <Reveal key={r.title} direction="up">
                <article className="flex h-full flex-col rounded-[1.75rem] bg-white p-7 ring-1 ring-[var(--color-hairline)]">
                  <span className="grid h-12 w-12 place-items-center rounded-full" style={{ background: GOLD }}>
                    <r.Icon className="h-6 w-6" style={{ color: NAVY }} aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display" style={{ ...T.cardTitle, color: NAVY }}>
                    {r.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[var(--color-ink)]/85" style={T.body}>
                    {r.body}
                  </p>
                  <Link
                    to={r.to}
                    hash={r.to.startsWith("/schools") ? "results" : undefined}
                    className="mt-5 inline-flex items-center gap-1.5 font-display hover:underline"
                    style={{ ...T.body, fontWeight: 800, color: NAVY }}
                  >
                    {r.cta} <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </article>
              </Reveal>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            The school also reports that 80% of teachers hold a bachelor&rsquo;s degree or higher
            across the three schools. Figure to be re-confirmed with the school office before it is
            given more prominence.
          </p>
        </div>
      </section>

      {/* 9. CTA */}
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
