import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plane, Award, GraduationCap, Quote } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import alphaLogo from "@/assets/alpha-logo.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Alpha Schools — Dar es Salaam" },
      {
        name: "description",
        content:
          "From a single school in 2007 to three schools across Dar es Salaam — founded on one belief: your education is our priority.",
      },
      { property: "og:title", content: "About Alpha Schools" },
      {
        property: "og:description",
        content:
          "Mission, vision, values and the story of Alpha Education Centre — founded 2007 in Dar es Salaam.",
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  { name: "Integrity", blurb: "Doing the right thing — especially when no one is watching." },
  { name: "Excellence", blurb: "A standard we hold to ourselves before we ask it of pupils." },
  { name: "Innovation", blurb: "From aviation to coding, leading where Tanzanian schools have not gone." },
  { name: "Discipline", blurb: "The quiet habit behind every result worth having." },
  { name: "Service", blurb: "Education that gives back to family, community and country." },
] as const;

const TIMELINE: ReadonlyArray<{ year: string; title: string; body: string; placeholder?: boolean }> = [
  {
    year: "2007",
    title: "Alpha Schools founded",
    body: "Alpha High established on 19 March 2007 by the late Professor Wenceslaus Aloyce Mayo.",
  },
  {
    year: "[Year — TBC]",
    title: "Nursery & Primary opens",
    body: "[Opening date for the Kunduchi Nursery & Primary campus — to be provided by the school.]",
    placeholder: true,
  },
  {
    year: "[Year — TBC]",
    title: "Alpha Girls opens",
    body: "[Opening date for Alpha Girls (Kunduchi) — to be provided by the school.]",
    placeholder: true,
  },
  {
    year: "[Year — TBC]",
    title: "Aviation programme launches",
    body: "[Launch year of the aviation programme — first of its kind in Tanzania. To be confirmed.]",
    placeholder: true,
  },
];

const RECORD = [
  {
    icon: Plane,
    title: "First in Tanzania to teach aviation",
    body: "Alpha is the first school in the country to put aviation on the timetable — ground school, modules and flying hours through KSOF.",
    href: "/aviation" as const,
    cta: "Inside the aviation programme",
  },
  {
    icon: Award,
    title: "Proven NECTA results",
    body: "2nd in the Dar es Salaam zone for 2012 Form Six (ACSEE) and 4th in the zone for 2011 Form Four (CSEE). Figures to be re-confirmed with the school before publishing.",
  },
  {
    icon: GraduationCap,
    title: "A degree-qualified faculty",
    body: "80% of teachers hold a bachelor's degree or higher — anchoring three schools from nursery through A-Level.",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[var(--color-deep-blue)] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-[var(--color-gold)] blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[var(--color-bright-blue)] blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-[1.4fr_1fr] lg:px-10 lg:py-28">
          <Reveal direction="left">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold)]">
              About Alpha Schools
            </p>
            <h1 className="mt-4 font-display text-5xl font-black leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Your education<br />is our <span className="italic text-[var(--color-gold)]">priority.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              From a single school in 2007 to three schools across Dar es Salaam — founded on one belief: your education is our priority.
            </p>
          </Reveal>
          <Reveal direction="right" className="flex justify-center">
            <div className="relative">
              <div aria-hidden className="absolute inset-0 -m-8 rounded-full bg-[var(--color-gold)]/15 blur-2xl" />
              <img
                src={alphaLogo.url}
                alt="Alpha Schools crest"
                className="relative h-auto w-[260px] drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] sm:w-[320px] lg:w-[380px]"
                loading="eager"
                decoding="async"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.3fr_1fr] lg:px-10">
          <Reveal direction="up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
              Who we are
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
              One Alpha. Three schools.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--color-ink)]/85">
              Alpha Schools comprises <strong>Alpha High</strong> (Mikocheni), <strong>Alpha Girls</strong> (Kunduchi),
              and <strong>Nursery & Primary</strong> (Kunduchi) — operating under Alpha Education Centre Limited,
              P.O. Box 35136, Dar es Salaam.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-ink)]/80">
              We were founded to enable students to achieve their best — intellectually and physically —
              and to grow into responsible citizens of their society.
            </p>
          </Reveal>
          <Reveal direction="right" className="rounded-2xl bg-[var(--color-off-white)] p-8 ring-1 ring-[var(--color-deep-blue)]/10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-brand-blue)]">
              At a glance
            </p>
            <dl className="mt-4 space-y-4 text-sm">
              {[
                ["Founded", "19 March 2007"],
                ["Schools", "Nursery & Primary · Alpha High · Alpha Girls"],
                ["Campuses", "Kunduchi & Mikocheni, Dar es Salaam"],
                ["Operator", "Alpha Education Centre Limited"],
                ["Postal", "P.O. Box 35136, Dar es Salaam"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 border-b border-[var(--color-deep-blue)]/10 pb-3 last:border-0 last:pb-0">
                  <dt className="font-semibold text-[var(--color-deep-blue)]">{k}</dt>
                  <dd className="text-right text-[var(--color-ink)]/80">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* OUR FOUNDER */}
      <section className="bg-[var(--color-off-white)]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_1.4fr] lg:px-10">
          <Reveal direction="left" className="flex justify-center">
            <div className="relative w-full max-w-sm">
              <div aria-hidden className="absolute -inset-3 rounded-2xl bg-[var(--color-gold)]/20 blur-xl" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-deep-blue)]/90 ring-1 ring-[var(--color-deep-blue)]/20">
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-white/80">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold)]">
                    Photo placeholder
                  </span>
                  <span className="mt-3 text-sm leading-relaxed">[Founder photo — to be provided]</span>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal direction="right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
              Our founder
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
              In honour of the late<br />Professor Wenceslaus Aloyce Mayo.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--color-ink)]/85">
              Alpha Schools was founded in 2007 by the late Professor Wenceslaus Aloyce Mayo —
              a man whose conviction that education should serve both intellect and character
              still anchors everything we do.
            </p>
            <div className="mt-6 rounded-xl border border-dashed border-[var(--color-deep-blue)]/30 bg-white/60 p-5 text-sm text-[var(--color-ink)]/70">
              <span className="font-semibold uppercase tracking-[0.18em] text-[10px] text-[var(--color-brand-blue)]">
                Awaiting copy
              </span>
              <p className="mt-2 leading-relaxed">[Founder biography — to be provided by the family / school office.]</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DIRECTOR MESSAGE */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.4fr_1fr] lg:px-10">
          <Reveal direction="left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
              A message from our Director
            </p>
            <div className="relative mt-6 rounded-2xl bg-[var(--color-deep-blue)] p-8 text-white shadow-xl sm:p-10">
              <Quote aria-hidden className="absolute -top-4 left-6 h-10 w-10 text-[var(--color-gold)]" />
              <p className="font-display text-2xl leading-snug sm:text-3xl">
                “We provide a safe, supportive, and engaging environment that ignites our learners
                to discover the genius each of them possesses.”
              </p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-gold)]">
                [Director's name — to be provided]
              </p>
              <p className="mt-1 text-sm text-white/75">Director, Alpha Schools</p>
            </div>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-[var(--color-ink)]/75">
              Following the passing of the late Professor Mayo, Alpha Schools is now led by his widow,
              who continues the founding mission as Director.
            </p>
          </Reveal>
          <Reveal direction="right" className="flex justify-center">
            <div className="relative w-full max-w-sm">
              <div aria-hidden className="absolute -inset-3 rounded-2xl bg-[var(--color-bright-blue)]/15 blur-xl" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-bright-blue)]/10 ring-1 ring-[var(--color-deep-blue)]/15">
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-[var(--color-deep-blue)]/70">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-blue)]">
                    Photo placeholder
                  </span>
                  <span className="mt-3 text-sm leading-relaxed">[Director's photo — to be provided]</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* OUR JOURNEY */}
      <section className="bg-[var(--color-off-white)]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <Reveal direction="up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
              Our journey
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
              From one classroom<br />to three schools.
            </h2>
          </Reveal>
          <ol className="mt-12 relative border-l-2 border-[var(--color-gold)]/40 pl-8">
            {TIMELINE.map((t, i) => (
              <Reveal key={i} direction="up" delay={i * 80}>
                <li className="relative mb-10 last:mb-0">
                  <span
                    aria-hidden
                    className={`absolute -left-[42px] top-1 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-[var(--color-off-white)] ${
                      t.placeholder
                        ? "bg-white border-2 border-dashed border-[var(--color-gold)]"
                        : "bg-[var(--color-gold)]"
                    }`}
                  />
                  <p className={`font-display text-2xl font-semibold ${
                    t.placeholder ? "text-[var(--color-ink)]/40" : "text-[var(--color-deep-blue)]"
                  }`}>
                    {t.year}
                  </p>
                  <p className="mt-1 text-base font-semibold text-[var(--color-ink)]">{t.title}</p>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--color-ink)]/75">{t.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* MISSION VISION VALUES */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <Reveal direction="left" className="rounded-2xl bg-[var(--color-deep-blue)] p-10 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">Our mission</p>
              <p className="mt-4 font-display text-2xl leading-snug sm:text-3xl">
                To enable pupils to prosper academically by solving their intellectual and environmental challenges,
                to become good citizens, responsible to their society.
              </p>
            </Reveal>
            <Reveal direction="right" className="rounded-2xl bg-[var(--color-gold)] p-10 text-[var(--color-deep-blue)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Our vision</p>
              <p className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                To strive for excellence.
              </p>
            </Reveal>
          </div>

          <div className="mt-14">
            <Reveal direction="up">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">Our values</p>
              <h3 className="mt-3 font-display text-3xl font-semibold text-[var(--color-deep-blue)] sm:text-4xl">
                Five things we won't compromise.
              </h3>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {VALUES.map((v, i) => (
                <Reveal key={v.name} direction="up" delay={i * 80}>
                  <div className="group h-full rounded-xl border border-[var(--color-deep-blue)]/10 bg-[var(--color-off-white)] p-6 transition-all hover:-translate-y-1 hover:border-[var(--color-gold)] hover:shadow-lg">
                    <div className="h-1 w-10 rounded-full bg-[var(--color-gold)] transition-all group-hover:w-16" />
                    <p className="mt-4 font-display text-xl font-semibold text-[var(--color-deep-blue)]">{v.name}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]/75">{v.blurb}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RECORD OF EXCELLENCE */}
      <section className="bg-[var(--color-off-white)]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <Reveal direction="up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
              A record of excellence
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
              Two decades. Real results.
            </h2>
            <p className="mt-4 max-w-2xl text-sm italic text-[var(--color-ink)]/60">
              Figures below to be re-confirmed with the school office before publishing.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {RECORD.map((r, i) => (
              <Reveal key={r.title} direction="up" delay={i * 100}>
                <div className="flex h-full flex-col rounded-2xl bg-white p-7 ring-1 ring-[var(--color-deep-blue)]/10 transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-gold)]/15 text-[var(--color-deep-blue)]">
                    <r.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-[var(--color-deep-blue)]">
                    {r.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-ink)]/80">{r.body}</p>
                  {r.href ? (
                    <Link
                      to={r.href}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand-blue)] hover:translate-x-0.5"
                    >
                      {r.cta} <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-gold)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-6 py-14 sm:flex-row sm:items-center lg:px-10">
          <Reveal direction="left">
            <h2 className="font-display text-3xl font-semibold text-[var(--color-deep-blue)] sm:text-4xl">
              Come and see Alpha for yourself.
            </h2>
            <p className="mt-2 text-sm text-[var(--color-deep-blue)]/85">
              Book a campus visit and meet the people behind the results.
            </p>
          </Reveal>
          <Reveal direction="right">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-deep-blue)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              Book a Visit <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
