import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import heroFloatplane from "@/assets/hero-floatplane.jpg.asset.json";
import avPreFlight from "@/assets/av-pre-flight-check.jpg.asset.json";
import avCessnaBriefing from "@/assets/av-cessna-briefing.jpg.asset.json";
import avTailInspection from "@/assets/av-tail-inspection.jpg.asset.json";
import avGroundSchool1 from "@/assets/av-ground-school-1.jpg.asset.json";
import avFlightline from "@/assets/av-flightline-group.jpg.asset.json";
import avGroundSchool2 from "@/assets/av-ground-school-2.jpg.asset.json";
import avInstrumentDemo from "@/assets/av-instrument-demo.jpg.asset.json";
import avEngineering from "@/assets/av-engineering-hands-on.jpg.asset.json";
import heroSolo from "@/assets/av-hero-solo.jpg.asset.json";
import heroDronePair from "@/assets/av-hero-drone-pair.jpg.asset.json";
import heroDroneGirls from "@/assets/av-hero-drone-girls.jpg.asset.json";
import heroCockpit from "@/assets/av-hero-cockpit-girl.jpg.asset.json";
import avCockpitStudents from "@/assets/av-cockpit-students.jpg.asset.json";

// Real Alpha aviation student photos — KSOF holiday program.
// NOTE: names below remain placeholders until written media-release
// consent is on file for each named student.
const FLYING_STUDENTS = [
  { src: avFlightline.url, caption: "Pre-flight briefing on the flightline · KSOF, Nairobi" },
  { src: avCessnaBriefing.url, caption: "Walk-around checks before take-off" },
  { src: avPreFlight.url, caption: "Equipment review with KSOF instructors" },
  { src: avTailInspection.url, caption: "Control-surface inspection — empennage" },
  { src: avEngineering.url, caption: "Hands-on aircraft engineering practical" },
  { src: avInstrumentDemo.url, caption: "Instrument demonstration during ground school" },
  { src: avGroundSchool1.url, caption: "Ground school — Kenya School of Flying" },
  { src: avGroundSchool2.url, caption: "Theory class — Aviation Technology module" },
];


export const Route = createFileRoute("/aviation")({
  head: () => ({
    meta: [
      { title: "Aviation Programme · Alpha Schools" },
      {
        name: "description",
        content:
          "In partnership with the Kenya School of Flying, students train toward a real Private Pilot Licence.",
      },
      { property: "og:title", content: "Aviation Programme · Alpha Schools" },
      {
        property: "og:description",
        content:
          "Ground school, simulator hours and time in the air — the Alpha aviation pathway from Form One to the cockpit.",
      },
      { property: "og:image", content: heroFloatplane.url },
    ],
  }),
  component: AviationPage,
});

const MODULES = [
  "Aviation Technology",
  "Basic Aeronautics",
  "Flight Operations & Regulations",
  "Safety in Aviation",
  "Meteorology & Weather",
  "Aircraft Engineering & Maintenance",
  "Air Traffic Control",
  "Electrical Systems in Aircraft",
  "Flight Dispatch Procedures",
  "Cabin Crew",
  "Aerodynamics",
];

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
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.18] mix-blend-luminosity"
          style={{ backgroundImage: `url(${heroFloatplane.url})` }}
          aria-hidden
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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
                The Alpha difference
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
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
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-6 py-3.5 text-sm font-semibold text-[#1a1a18] shadow-lg shadow-black/20 transition hover:scale-[1.03] hover:shadow-xl"
                >
                  How to join →
                </Link>
                <a
                  href="#pathway"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  See the pathway
                </a>
              </div>

              {/* mini stat strip */}
              <div className="mt-12 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/15 pt-8">
                <div>
                  <div className="font-display text-3xl font-black text-[var(--color-gold)] sm:text-4xl">PPL</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-white/70">Pathway with KSOF</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-black text-[var(--color-gold)] sm:text-4xl">40h+</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-white/70">Minimum flying hours</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-black text-[var(--color-gold)] sm:text-4xl">11</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-white/70">Aviation modules</div>
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
                  src={heroSolo.url}
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
                  src={heroCockpit.url}
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
                  src={heroDronePair.url}
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
                  src={heroDroneGirls.url}
                  alt="Alpha girls operating drones during aviation practical"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </figure>

              {/* Floating badge */}
              <div className="absolute -left-3 top-[36%] hidden rounded-2xl border border-white/15 bg-[#0C447C]/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-gold)] shadow-lg backdrop-blur sm:block">
                ✈ Class of 2024
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 2. WHY IT MATTERS */}
      <section className="bg-[var(--color-off-white)] py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
            Why it matters
          </p>
          <p className="mx-auto mt-6 max-w-4xl font-display text-3xl font-bold leading-snug text-[var(--color-deep-blue)] sm:text-4xl lg:text-[2.75rem]">
            Alpha schools introduce aviation
            and flying through extra-curricular activities — giving students the chance to explore
            aviation technology, build confidence, and open a genuine career pathway.
          </p>
        </div>
      </section>

      {/* 3. PATHWAY */}
      <section id="pathway" className="relative overflow-hidden bg-[#0C447C] py-20 text-white sm:py-28">
        <div
          className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(232,160,32,0.4), transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
              The pathway
            </p>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
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
                <div className="font-display text-5xl font-black text-[var(--color-gold)]/80">
                  {p.step}
                </div>
                <h3 className="mt-3 font-display text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. 11 MODULES — tarmac */}
      <section className="alpha-tarmac relative py-20 text-white sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Runway centre-line marking */}
          <div className="alpha-runway-divider mx-auto mb-14 w-40" aria-hidden />

          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
                What students learn
              </p>
              <h2 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
                Eleven modules. One real licence.
              </h2>
            </div>
            <p className="max-w-md text-white/70">
              Ground school content runs alongside flying hours so students arrive at every
              lesson prepared for the cockpit.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m, i) => (
              <div
                key={m}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[var(--color-gold)]/60 hover:bg-white/[0.08]"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-gold)] font-display text-sm font-black text-[#1a1a18]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-display font-semibold text-white">{m}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRAINING & TECHNOLOGY — tarmac continued */}
      <section className="alpha-tarmac relative py-20 text-white sm:py-28">
        {/* runway divider between the two tarmac sections */}
        <div
          className="alpha-runway-divider absolute left-1/2 top-0 w-64 -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
              Training & technology
            </p>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
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
                <dt className="text-xs uppercase tracking-wider text-white/60">Simulator</dt>
                <dd className="mt-1 font-display text-xl font-bold">CAE 7000XR · Level D</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/60">Live flying</dt>
                <dd className="mt-1 font-display text-xl font-bold">KSOF · Nairobi</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/60">Ground school</dt>
                <dd className="mt-1 font-display text-xl font-bold">11 modules</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/60">Outcome</dt>
                <dd className="mt-1 font-display text-xl font-bold">PPL qualification</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-6 rounded-[2rem] opacity-60 blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(232,160,32,0.45), transparent 70%)" }}
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
              <img
                src={avCockpitStudents.url}
                alt="Alpha student pilots training inside a Cessna cockpit"

                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <div className="text-xs uppercase tracking-wider text-[var(--color-gold)]">
                  Simulator + live flight
                </div>
                <div className="font-display text-lg font-bold">
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
      <section className="bg-[var(--color-off-white)] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
                Our flying students
              </p>
              <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
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
                  <div className="mt-1 font-display text-sm font-bold leading-tight text-white sm:text-base">
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
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
              How to join
            </p>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
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
                  b: "11 modules taught alongside the NECTA curriculum, with simulator practice scheduled into the academic week.",
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
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-deep-blue)] font-display text-sm font-black text-[var(--color-gold)]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-lg font-bold text-[var(--color-deep-blue)]">
                      {s.t}
                    </div>
                    <div className="mt-1 text-sm text-[var(--color-ink)]/75">{s.b}</div>
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
            "linear-gradient(135deg, var(--color-gold) 0%, #f0b240 60%, #d68f15 100%)",
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
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between md:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-black leading-tight text-[#1a1a18] sm:text-4xl">
              Ready to give your child a head start in the sky?
            </h2>
            <p className="mt-3 text-[#1a1a18]/80">
              Visit a campus and ask about the aviation programme.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-deep-blue)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/15 transition hover:scale-[1.03] hover:bg-[#08365f]"
          >
            Book a Visit →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
