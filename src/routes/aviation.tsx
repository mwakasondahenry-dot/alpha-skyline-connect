import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import heroFloatplane from "@/assets/hero-floatplane.webp";
import avPreFlight from "@/assets/av-pre-flight-check.webp";
import avCessnaBriefing from "@/assets/av-cessna-briefing.webp";
import avTailInspection from "@/assets/av-tail-inspection.webp";
import avGroundSchool1 from "@/assets/av-ground-school-1.webp";
import avFlightline from "@/assets/av-flightline-group.webp";
import avGroundSchool2 from "@/assets/av-ground-school-2.webp";
import avInstrumentDemo from "@/assets/av-instrument-demo.webp";
import avEngineering from "@/assets/av-engineering-hands-on.webp";
import heroSolo from "@/assets/av-hero-solo.webp";
import heroDronePair from "@/assets/av-hero-drone-pair.webp";
import heroDroneGirls from "@/assets/av-hero-drone-girls.webp";
import heroCockpit from "@/assets/av-hero-cockpit-girl.webp";
import avCockpitStudents from "@/assets/av-cockpit-students.webp";
import { T, SHELL } from "@/components/type-roles";
import {
  Marked,
  Backdrop,
  FlightPath,
  CompassRose,
  AltitudeTicks,
  IconDisc,
} from "@/components/alpha-ui";
import { Plane, Wrench } from "lucide-react";

// Real Alpha aviation student photos — KSOF holiday program.
// NOTE: names below remain placeholders until written media-release
// consent is on file for each named student.
const FLYING_STUDENTS = [
  { src: avFlightline, caption: "Pre-flight briefing on the flightline · KSOF, Nairobi" },
  { src: avCessnaBriefing, caption: "Walk-around checks before take-off" },
  { src: avPreFlight, caption: "Equipment review with KSOF instructors" },
  { src: avTailInspection, caption: "Control-surface inspection — empennage" },
  { src: avEngineering, caption: "Hands-on aircraft engineering practical" },
  { src: avInstrumentDemo, caption: "Instrument demonstration during ground school" },
  { src: avGroundSchool1, caption: "Ground school — Kenya School of Flying" },
  { src: avGroundSchool2, caption: "Theory class — Aviation Technology module" },
];


/* Ground school and aircraft engineering modules, supplied by the school in
   September 2026. These replaced the "[Aviation modules — to be provided by
   school]" placeholder.

   Transcribed exactly as given. Nothing is added, reordered or expanded: the
   invented A-Level codes KLF and ECA reached two live pages once already, and
   a subject list is precisely the shape of content that goes wrong that way. */
const GROUND_SCHOOL_MODULES = [
  "Aircraft General Knowledge",
  "Flight Performance and Planning",
  "Human Performance and Limitations",
  "Meteorology",
  "Navigation",
  "Operational Procedures",
  "Principles of Flight",
] as const;

const ENGINEERING_MODULES = [
  "Technical Drawing",
  "Engineering Mathematics",
  "Principles of Aerodynamics",
  "Airframe Design",
  "Aircraft Interiors, Equipment, and Furnishings",
  "Aircraft Hydraulic Systems",
  "Landing Gear Systems",
  "Air Conditioning and Pressurization",
  "Fuel Systems",
  "Aircraft Pneumatic Systems and Maintenance",
] as const;

/** One module list on the tarmac ground. */
function ModuleCard({
  eyebrow,
  title,
  items,
  icon,
}: {
  eyebrow: string;
  title: string;
  items: ReadonlyArray<string>;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm">
      {/* Altimeter ticks down the card's edge. The instrument a student is
          taught to read, used as the card's own rule. */}
      <AltitudeTicks
        className="alpha-backdrop alpha-backdrop--onDark -right-2 top-6 h-40 w-10"
      />
      <IconDisc tone="gold">{icon}</IconDisc>
      <p className="mt-5 text-[var(--color-gold)]" style={T.label}>
        {eyebrow}
      </p>
      <h3 className="mt-2 font-display text-white" style={T.cardTitle}>
        {title}
      </h3>
      <ul className="mt-6 space-y-3">
        {items.map((m) => (
          <li key={m} className="flex items-start gap-3 text-white/85" style={T.body}>
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gold)]"
            />
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Route = createFileRoute("/aviation")({
  head: () => ({
    ...seo({
      title: "Aviation Programme — Alpha Schools, Dar es Salaam",
      description:
        "Alpha secondary students study ground school and aircraft engineering, train in hangars with qualified instructors, and can progress toward a PPL.",
      path: "/aviation",
    }),
  }),
  component: AviationPage,
});


const PATHWAY = [
  {
    step: "01",
    title: "Partner",
    body:
      "Kenya School of Flying (KSOF) in Nairobi conducts the pilot courses and ground school — a fully certified training partner.",
  },
  {
    step: "02",
    title: "Qualification",
    body:
      "A real Private Pilot Licence (PPL) — offered to Form Four and Form Six leavers who complete the programme.",
  },
  {
    step: "03",
    title: "Requirement",
    body:
      "A minimum of 40 flying hours, built up steadily through holiday flying programs at KSOF.",
  },
  {
    step: "04",
    title: "Two entry paths",
    body:
      "O-Level students start at Form One and complete their hours before CSEE. A-Level students joining at Form Five follow an accelerated programme with more flying and ground school.",
  },
];

// (Real student photos imported above as FLYING_STUDENTS.)


function AviationPage() {
  return (
    <div className="min-h-screen bg-[var(--color-off-white)]">
      <SiteHeader />

      {/* 1. HERO — sky gradient with drifting CSS clouds */}
      <section className="alpha-sky relative overflow-hidden text-white">
        {/* Soft horizon glow */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{ background: "linear-gradient(to top, rgba(255,255,255,0.18), transparent)" }}
          aria-hidden
        />

        {/* Drifting clouds — CSS only, prefers-reduced-motion handled in styles.css */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="alpha-cloud"
            style={{
              top: "14%", width: "180px", height: "44px",
              ["--cloud-duration" as never]: "62s",
              ["--cloud-delay" as never]: "-8s",
              ["--cloud-opacity" as never]: "0.5",
              ["--cloud-static-x" as never]: "20vw",
            }}
          />
          <div
            className="alpha-cloud"
            style={{
              top: "32%", width: "240px", height: "56px",
              ["--cloud-duration" as never]: "85s",
              ["--cloud-delay" as never]: "-30s",
              ["--cloud-opacity" as never]: "0.45",
              ["--cloud-static-x" as never]: "55vw",
            }}
          />
          <div
            className="alpha-cloud"
            style={{
              top: "58%", width: "140px", height: "36px",
              ["--cloud-duration" as never]: "50s",
              ["--cloud-delay" as never]: "-18s",
              ["--cloud-opacity" as never]: "0.4",
              ["--cloud-static-x" as never]: "75vw",
            }}
          />
          <div
            className="alpha-cloud"
            style={{
              top: "72%", width: "200px", height: "48px",
              ["--cloud-duration" as never]: "95s",
              ["--cloud-delay" as never]: "-45s",
              ["--cloud-opacity" as never]: "0.35",
              ["--cloud-static-x" as never]: "10vw",
            }}
          />
        </div>

        {/* Subtle aircraft silhouette via photo, kept very low so text stays readable */}
        <HeroSlideshow
          pageKey="aviation"
          fallback={[{ src: heroFloatplane, alt: "" }]}
          className="pointer-events-none opacity-[0.18] mix-blend-luminosity"
          showDots={false}
        />
        {/* Left-side darken so headline contrast is bulletproof */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(12,68,124,0.55) 0%, rgba(12,68,124,0.25) 50%, transparent 100%)",
          }}
          aria-hidden
        />


        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 sm:pt-32 lg:pb-32 lg:pt-36">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            {/* LEFT — copy */}
            <div className="relative z-10">
              <p className="text-[var(--color-gold)]" style={T.label}>
                The Alpha difference
              </p>
              <h1 className="mt-5 max-w-3xl font-display leading-[1.02] tracking-tight lg:text-7xl" style={T.section}>
                Learning that <span className="text-[var(--color-gold)]">takes off.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                [Aviation positioning statement — wording to be confirmed] In partnership with the
                Kenya School of Flying, our students train toward a real Private Pilot Licence —
                ground school, simulator hours, and time in the air.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/admission"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-6 py-3.5 font-semibold text-[var(--color-accent-foreground)] shadow-lg shadow-black/20 transition hover:scale-[1.03] hover:shadow-xl" style={T.body}
                >
                  How to join →
                </Link>
                <a
                  href="#pathway"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/10" style={T.body}
                >
                  See the pathway
                </a>
              </div>

              {/* mini stat strip */}
              <div className="mt-12 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/15 pt-8">
                <div>
                  <div className="font-display text-[var(--color-gold)]" style={T.section}>PPL</div>
                  <div className="mt-1 text-white/70" style={T.label}>Pathway with KSOF</div>
                </div>
                <div>
                  <div className="font-display text-[var(--color-gold)]" style={T.section}>40h+</div>
                  <div className="mt-1 text-white/70" style={T.label}>Minimum flying hours</div>
                </div>
                <div>
                  <div className="font-display text-[var(--color-gold)]" style={T.section}>KSOF</div>
                  <div className="mt-1 text-white/70" style={T.label}>Training partner</div>
                </div>
              </div>
            </div>

            {/* RIGHT — layered photo collage */}
            <div className="relative mx-auto h-[460px] w-full max-w-[560px] sm:h-[540px] lg:h-[600px]">
              {/* Soft gold halo */}
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(60% 55% at 55% 45%, rgba(232,160,32,0.35), transparent 70%)",
                  filter: "blur(20px)",
                }}
                aria-hidden
              />

              {/* Card 1 — solo pilot on wing (anchor, large) */}
              <figure
                className="alpha-hero-card absolute left-[6%] top-[4%] h-[58%] w-[54%] overflow-hidden rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-white/20"
                style={{ ["--float-delay" as never]: "0s" }}
              >
                <img
                  src={heroSolo}
                  alt="Alpha student pilot after his first solo flight"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-[11px] font-medium uppercase tracking-wider text-white/90">
                  First solo · KSOF
                </figcaption>
              </figure>

              {/* Card 2 — cockpit girl (top right) */}
              <figure
                className="alpha-hero-card absolute right-[2%] top-0 h-[40%] w-[44%] overflow-hidden rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-[var(--color-gold)]/40"
                style={{ ["--float-delay" as never]: "-2.5s" }}
              >
                <img
                  src={heroCockpit}
                  alt="Alpha aviation student at the controls of a training aircraft"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </figure>

              {/* Card 3 — drone training pair (bottom right) */}
              <figure
                className="alpha-hero-card absolute bottom-[2%] right-[4%] h-[44%] w-[52%] overflow-hidden rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-white/20"
                style={{ ["--float-delay" as never]: "-5s" }}
              >
                <img
                  src={heroDronePair}
                  alt="Alpha aviation students during practical drone training"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </figure>

              {/* Card 4 — drone girls (bottom left, smaller accent) */}
              <figure
                className="alpha-hero-card absolute bottom-[8%] left-0 h-[34%] w-[38%] overflow-hidden rounded-3xl shadow-xl shadow-black/40 ring-1 ring-white/20"
                style={{ ["--float-delay" as never]: "-1.2s" }}
              >
                <img
                  src={heroDroneGirls}
                  alt="Alpha girls operating drones during aviation practical"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </figure>

              {/* Floating badge */}
              <div className="absolute -left-3 top-[36%] hidden rounded-2xl border border-white/15 bg-[var(--color-deep-blue)]/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-gold)] shadow-lg backdrop-blur sm:block">
                ✈ Class of 2024
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 2. WHY IT MATTERS */}
      <section className="bg-[var(--color-off-white)] py-[var(--space-section-y)] sm:py-28">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-[var(--color-gold)]" style={T.label}>
            Why it matters
          </p>
          <p className="mx-auto mt-6 max-w-4xl font-display leading-snug text-[var(--color-deep-blue)] lg:text-[2.75rem]" style={T.section}>
            Alpha schools introduce aviation
            and flying through extra-curricular activities — giving students the chance to explore
            aviation technology, build confidence, and open a genuine career pathway.
          </p>
        </div>
      </section>

      {/* 3. PATHWAY */}
      <section id="pathway" className="relative overflow-hidden bg-[var(--color-deep-blue)] py-[var(--space-section-y)] text-white sm:py-28">
        <div
          className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(232,160,32,0.4), transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-[var(--color-gold)]" style={T.label}>
              The pathway
            </p>
            <h2 className="mt-4 font-display tracking-tight" style={T.section}>
              From Form One to the cockpit.
            </h2>
            <p className="mt-4 text-white/75">
              A clear, structured route from secondary school into a real pilot licence —
              built around the academic calendar and KSOF's training schedule.
            </p>
          </div>

          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PATHWAY.map((p) => (
              <li
                key={p.step}
                className="group relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:scale-[1.02] hover:border-[var(--color-gold)]/40 hover:bg-white/[0.07]"
              >
                <div className="font-display text-[var(--color-gold)]/80" style={T.section}>
                  {p.step}
                </div>
                <h3 className="mt-3 font-display" style={T.cardTitle}>{p.title}</h3>
                <p className="mt-2 text-white/75" style={T.body}>{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. MODULES — tarmac */}
      <section className="alpha-tarmac relative overflow-hidden py-[var(--space-section-y)] text-white sm:py-28">
        {/* The instrument, used as the section's watermark. Faint enough that
            it changes no contrast reading; present enough that the tarmac
            stops being a flat black band. */}
        <CompassRose className="alpha-backdrop alpha-backdrop--onDark -right-16 top-16 hidden h-72 w-72 lg:block" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="alpha-runway-divider mx-auto mb-14 w-40" aria-hidden />

          {/* Prose beside the two things it describes: the theory class and
              the hangar. The photographs earn their place by being the
              evidence for the paragraph next to them — PRODUCT.md's second
              success condition is a parent believing the aviation programme
              is real rather than a marketing line. */}
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-[var(--color-gold)]" style={T.label}>
              What students learn
            </p>
            <h2 className="mt-4 font-display tracking-tight" style={T.section}>
              Aviation Technology at{" "}
              <Marked kind="sweep" color="var(--color-gold)">
                Alpha Schools
              </Marked>
            </h2>
            {/* School-supplied, September 2026. Describes the programme; makes
                no claim about being first or only, so it is not covered by the
                positioning ruling in design/CONTENT-FROM-SCHOOL.md. */}
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Our secondary school students are provided with a foundational
              understanding of aeronautics, covering essential topics such as
              regulations, safety, meteorology, and flight operations. Through
              our aviation programme, students learn how weather and various
              factors influence flying and flight operations. The curriculum
              guides students in understanding aircraft engines, electrical
              systems, and structural components.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-white/80">
              Additionally, students gain practical experience through hands-on
              activities in hangars, where they learn to operate aircraft under
              the guidance of qualified instructors. As students progress, they
              ultimately achieve solo flights and can acquire Private Pilot
              Licence (PPL) certifications.
            </p>
          </div>

            <figure className="relative">
              <FlightPath className="absolute -top-10 left-0 hidden h-16 w-full lg:block" />
              <div className="alpha-photo overflow-hidden rounded-2xl border-4 border-white/90 shadow-2xl" style={{ ["--tilt" as string]: "-2deg", transform: "rotate(-2deg)" }}>
                <img
                  src={avGroundSchool2}
                  alt="Alpha students in an Aviation Technology theory class"
                  loading="lazy"
                  decoding="async"
                  className="block aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="alpha-photo -mt-6 ml-10 overflow-hidden rounded-2xl border-4 border-white/90 shadow-2xl" style={{ ["--tilt" as string]: "3deg", transform: "rotate(3deg)" }}>
                <img
                  src={avEngineering}
                  alt="Alpha students working on an aircraft during a hangar practical"
                  loading="lazy"
                  decoding="async"
                  className="block aspect-[4/3] w-full object-cover"
                />
              </div>
              <figcaption className="mt-8 text-white/60" style={T.label}>
                Ground school and hangar practicals · Kenya School of Flying
              </figcaption>
            </figure>
          </div>

          {/* The confirmed module lists. These replace
              "[Aviation modules — to be provided by school]" — the school
              supplied them in September 2026. */}
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <ModuleCard
              eyebrow="Ground school"
              title="Areas of specialisation"
              items={GROUND_SCHOOL_MODULES}
              icon={<Plane className="h-6 w-6" />}
            />
            <ModuleCard
              eyebrow="Aircraft engineering"
              title="Fundamentals of aviation technology"
              items={ENGINEERING_MODULES}
              icon={<Wrench className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* PASSION TO FLY — school-supplied, September 2026.
          The students here are unnamed and this is the school's own prose
          about its club, not a quoted testimonial: AGENTS.md forbids invented
          named quotes, and there are none. The Hunt line is attributed. */}
      <section className="relative overflow-hidden bg-[var(--color-off-white)] py-[var(--space-section-y)] sm:py-28">
        {/* Three paper planes climbing across the section, the same gesture
            the club is about. Sparse and faint — a wash behind the copy, not
            a pattern competing with it. */}
        <Backdrop kind="plane" className="left-[4%] top-16" width="3.5rem" rotate={-12} />
        <Backdrop kind="plane" className="right-[8%] top-40 hidden sm:block" width="5rem" rotate={8} />
        <Backdrop kind="plane" className="bottom-16 left-[38%] hidden lg:block" width="4rem" rotate={-4} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="text-[var(--color-brand-blue)]" style={T.label}>
                The Alpha Aviation Club
              </p>
              <h2
                className="mt-4 font-display tracking-tight text-[var(--color-deep-blue)]"
                style={T.section}
              >
                A passion to{" "}
                <Marked kind="ring" color="var(--color-bright-blue)">
                  fly.
                </Marked>
              </h2>
              <p className="mt-6 text-[var(--color-ink)]/80" style={T.body}>
                Speaking to members of the Alpha Aviation Club, students express
                how fulfilling it is to pursue their dreams through flying. They
                find joy and fulfilment in taking flight, all while advancing
                their careers from an early age.
              </p>
              <p className="mt-5 text-[var(--color-ink)]/80" style={T.body}>
                The aviation programme at Alpha nurtures students' aspirations,
                allowing them to reach their dreams of defying gravity. We offer
                opportunities for students who are passionate about aviation
                technology and aspire to fly.
              </p>
            </div>

            <figure className="relative rounded-2xl bg-[var(--color-deep-blue)] p-8 text-white shadow-xl sm:p-10">
              <span
                aria-hidden
                className="absolute -top-3 left-8 font-display text-6xl leading-none text-[var(--color-gold)]"
              >
                &ldquo;
              </span>
              <blockquote className="font-display leading-snug" style={T.section}>
                For most people, the sky is the limit. For those who love
                aviation, the sky is home.
              </blockquote>
              <figcaption
                className="mt-6 text-[var(--color-gold)]"
                style={T.label}
              >
                Jack R. Hunt, naval aviator
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 5. TRAINING & TECHNOLOGY — tarmac continued */}
      <section className="alpha-tarmac relative py-[var(--space-section-y)] text-white sm:py-28">
        {/* runway divider between the two tarmac sections */}
        <div
          className="alpha-runway-divider absolute left-1/2 top-0 w-64 -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">

          <div>
            <p className="text-[var(--color-gold)]" style={T.label}>
              Training & technology
            </p>
            <h2 className="mt-4 font-display tracking-tight" style={T.section}>
              Real cockpits. Professional simulators.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/80">
              Students train on full-flight simulators including the{" "}
              <span className="font-semibold text-[var(--color-gold)]">CAE 7000XR Series Level D</span>
              {" "}— professional-grade simulation that improves training efficiency and real
              understanding — alongside actual flying lessons at KSOF in Nairobi.
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/15 pt-8">
              <div>
                <dt className="text-white/60" style={T.label}>Simulator</dt>
                <dd className="mt-1 font-display" style={T.cardTitle}>CAE 7000XR · Level D</dd>
              </div>
              <div>
                <dt className="text-white/60" style={T.label}>Live flying</dt>
                <dd className="mt-1 font-display" style={T.cardTitle}>KSOF · Nairobi</dd>
              </div>
              <div>
                <dt className="text-white/60" style={T.label}>Ground school</dt>
                <dd className="mt-1 font-display" style={T.cardTitle}>[To be confirmed]</dd>
              </div>
              <div>
                <dt className="text-white/60" style={T.label}>Outcome</dt>
                <dd className="mt-1 font-display" style={T.cardTitle}>PPL qualification</dd>
              </div>
            </dl>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="absolute -inset-6 rounded-[2rem] opacity-60 blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(232,160,32,0.45), transparent 70%)" }}
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
              <img
                src={avCockpitStudents}
                alt="Alpha student pilots training inside a Cessna cockpit"

                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <div className="text-[var(--color-gold)]" style={T.label}>
                  Simulator + live flight
                </div>
                <div className="font-display" style={T.cardTitle}>
                  Hours that count toward the licence.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OUR FLYING STUDENTS — real photos from the KSOF holiday program */}
      {/* NOTE: photos are published with school approval. Individual student
          NAMES remain withheld until written media-release consent is on
          file for each student. Add names to the FLYING_STUDENTS array
          once consents are confirmed. */}
      <section className="bg-[var(--color-off-white)] py-[var(--space-section-y)] sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-[var(--color-gold)]" style={T.label}>
                Our flying students
              </p>
              <h2 className="mt-4 font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
                From classroom to flightline.
              </h2>
              <p className="mt-4 text-[var(--color-ink)]/75">
                Real Alpha students on the June holiday program at the Kenya School of
                Flying — ground school in Nairobi, pre-flight checks on the apron,
                hands-on engineering with KSOF instructors.
              </p>
            </div>
            <div className="rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-deep-blue)]">
              June Holiday Program · KSOF
            </div>
          </div>

          {/* Mosaic: first tile is taller, rest fill the grid */}
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2">
            {FLYING_STUDENTS.map((s, i) => (
              <figure
                key={i}
                className={`group relative overflow-hidden rounded-2xl bg-[var(--color-deep-blue)]/5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                  i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-[4/5]"
                }`}
              >
                <img
                  src={s.src}
                  alt={s.caption}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-90" />
                <figcaption className="absolute inset-x-0 bottom-0 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
                    KSOF · Nairobi
                  </div>
                  <div className="mt-1 font-display font-bold leading-tight text-white" style={T.body}>
                    {s.caption}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="mt-6 text-xs italic text-[var(--color-ink)]/55">
            Individual student names are withheld pending written media-release consent.
          </p>
        </div>
      </section>


      {/* 7. HOW TO JOIN */}
      <section className="bg-white py-[var(--space-section-y)] sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-[var(--color-gold)]" style={T.label}>
              How to join
            </p>
            <h2 className="mt-4 font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
              Joining the aviation programme.
            </h2>
          </div>

          <div className="mt-12">
            <ol className="space-y-5">
              {[
                {
                  t: "Enrol at Alpha High or Alpha Girls",
                  b: "Aviation is open to secondary students at both campuses. Complete the standard Alpha admission first.",
                },
                {
                  t: "Register interest in the aviation programme",
                  b: "Tell admissions you'd like to join — they'll add your child to the aviation roster and KSOF intake list.",
                },
                {
                  t: "Ground school + simulator hours during term",
                  b: "Ground school taught alongside the NECTA curriculum, with simulator practice scheduled into the academic week.",
                },
                {
                  t: "Holiday flying programs at KSOF (Nairobi)",
                  b: "Students travel to Kenya School of Flying during school holidays to build their 40+ flying hours.",
                },
                {
                  t: "PPL on completion",
                  b: "After Form Four (or Form Six for A-Level joiners) and the required hours, students sit the PPL.",
                },
              ].map((s, i) => (
                <li
                  key={i}
                  className="flex gap-5 rounded-2xl border border-[var(--color-deep-blue)]/10 bg-[var(--color-off-white)] p-5"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-deep-blue)] font-display font-black text-[var(--color-gold)]" style={T.body}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
                      {s.t}
                    </div>
                    <div className="mt-1 text-[var(--color-ink)]/75" style={T.body}>{s.b}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 8. GOLD CTA BANNER */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 60%, var(--color-gold-dark) 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/15 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-10 h-72 w-72 rounded-full bg-[var(--color-deep-blue)]/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between md:py-[var(--space-section-y)]">
          <div className="max-w-2xl">
            <h2 className="font-display leading-tight text-[var(--color-accent-foreground)]" style={T.section}>
              Ready to give your child a head start in the sky?
            </h2>
            <p className="mt-3 text-[var(--color-accent-foreground)]/80">
              Visit a campus and ask about the aviation programme.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-deep-blue)] px-6 py-3.5 font-semibold text-white shadow-lg shadow-black/15 transition hover:scale-[1.03] hover:bg-[#08365f]" style={T.body}
          >
            Book a Visit →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
