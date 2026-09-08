import { createFileRoute, Link } from "@tanstack/react-router";
import aboutHeroFallback from "@/assets/campus-high.webp";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { ArrowRight, Plane, Award, GraduationCap, Quote } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import alphaLogo from "@/assets/alpha-logo.webp";
import profMayo from "@/assets/prof-mayo.webp";

import { T, SHELL } from "@/components/type-roles";

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
          "Mission, vision, values and the story of ALFA EDUCATION CENTRE — founded 2007 in Dar es Salaam.",
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

const TIMELINE: ReadonlyArray<{ year: string; title: string; body: string }> = [
  {
    year: "2007",
    title: "Alpha High School",
    body: "Established on 19 March 2007 by the late Professor Wenceslaus Aloyce Mayo, in Mikocheni.",
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

const RECORD = [
  {
    icon: Plane,
    title: "Aviation Program in Alpha Schools",
    body: "[Aviation positioning statement — wording to be confirmed] Ground school, modules and flying hours through KSOF.",
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
        <HeroSlideshow
          pageKey="about"
          fallback={[{ src: aboutHeroFallback, alt: "" }]}
          className="opacity-25"
          showDots={false}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-[var(--color-gold)] blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[var(--color-bright-blue)] blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-[var(--space-section-y)] lg:grid-cols-[1.4fr_1fr] lg:px-10 lg:py-28">
          <Reveal direction="left">
            <p className="text-[11px] text-[var(--color-gold)]" style={T.label}>
              About Alpha Schools
            </p>
            <h1 className="mt-4 font-display leading-[1.04] tracking-tight lg:text-7xl" style={T.section}>
              Your education<br />is our <span className="italic text-[var(--color-gold)]">priority.</span>
            </h1>
            <p className="mt-6 max-w-xl text-white/85" style={T.body}>
              From a single school in 2007 to three schools across Dar es Salaam — founded on one belief: your education is our priority.
            </p>
          </Reveal>
          <Reveal direction="right" className="flex justify-center">
            <div className="relative">
              <div aria-hidden className="absolute inset-0 -m-8 rounded-full bg-[var(--color-gold)]/15 blur-2xl" />
              <img
                src={alphaLogo}
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
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-[var(--space-section-y)] lg:grid-cols-[1.3fr_1fr] lg:px-10">
          <Reveal direction="up">
            <p className="text-[var(--color-brand-blue)]" style={T.label}>
              Who we are
            </p>
            <h2 className="mt-3 font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
              One Alpha. Three schools.
            </h2>
            <p className="mt-6 text-[var(--color-ink)]/85" style={T.body}>
              Alpha Schools comprises <strong>Alpha High</strong> (Mikocheni), <strong>Alpha Girls</strong> (Kunduchi),
              and <strong>Nursery & Primary</strong> (Kunduchi) — operating under ALFA EDUCATION CENTRE,
              P.O. Box 35136, Dar es Salaam.
            </p>
            <p className="mt-4 text-[var(--color-ink)]/80" style={T.body}>
              We were founded to enable students to achieve their best — intellectually and physically —
              and to grow into responsible citizens of their society.
            </p>
          </Reveal>
          <Reveal direction="right" className="rounded-2xl bg-[var(--color-off-white)] p-8 ring-1 ring-[var(--color-deep-blue)]/10">
            <p className="text-[11px] text-[var(--color-brand-blue)]" style={T.label}>
              At a glance
            </p>
            <dl className="mt-4 space-y-4" style={T.body}>
              {[
                ["Founded", "19 March 2007"],
                ["Schools", "Nursery & Primary · Alpha High · Alpha Girls"],
                ["Campuses", "Kunduchi & Mikocheni, Dar es Salaam"],
                ["Operator", "ALFA EDUCATION CENTRE"],
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
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-[var(--space-section-y)] lg:grid-cols-[1fr_1.4fr] lg:px-10">
          <Reveal direction="left" className="flex justify-center">
            <div className="relative w-full max-w-sm">
              <div aria-hidden className="absolute -inset-3 rounded-2xl bg-[var(--color-gold)]/20 blur-xl" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-deep-blue)]/90 ring-1 ring-[var(--color-deep-blue)]/20">
                <img
                  src={profMayo}
                  alt="Professor Wenceslaus Aloyce Mayo, founder of Alpha Schools"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </Reveal>
          <Reveal direction="right">
            <p className="text-[var(--color-brand-blue)]" style={T.label}>
              Our founder
            </p>
            <h2 className="mt-3 font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
              In honour of the late<br />Professor Wenceslaus Aloyce Mayo.
            </h2>
            <p className="mt-6 text-[var(--color-ink)]/85" style={T.body}>
              Alpha Schools was founded in 2007 by the late Professor Wenceslaus Aloyce Mayo —
              a man whose conviction that education should serve both intellect and character
              still anchors everything we do.
            </p>
            <div className="mt-6 rounded-xl border border-dashed border-[var(--color-deep-blue)]/30 bg-white/60 p-5 text-[var(--color-ink)]/70" style={T.body}>
              <span className="font-semibold uppercase tracking-[0.18em] text-[10px] text-[var(--color-brand-blue)]">
                Awaiting copy
              </span>
              <p className="mt-2 leading-relaxed">[Founder biography — to be provided by the family / school office.]</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DIRECTOR MESSAGE
          School-supplied, September 2026. Reproduced verbatim — this is a
          signed letter from a named person, so it is not edited for house
          style. Two consequences worth knowing about:

          1. It names the founder "Professor Aloysius Mayo". The rest of this
             page says "Professor Wenceslaus Aloyce Mayo", which is the form
             the school gave for the timeline and the founder section. The two
             are almost certainly the same man, but nobody has confirmed which
             form is correct, so neither has been changed to match the other.
             design/CONTENT-FROM-SCHOOL.md is where that gets resolved.

          2. It uses "Alpha Girls High School" and "Alpha Nursery and Primary
             School" where the brand names in AGENTS.md are "Alpha Girls" and
             "Nursery & Primary". The naming rule governs the site's own
             marketing copy, not a quotation of someone's words.

          Her photograph is still owed. The placeholder stays visible.

          overflow-x-clip: the decorative -inset-3 glow behind the portrait
          extends 12px past its column and pushed the document to 381px at a
          375px viewport. Pre-existing, and the same defect commit 54f000f
          clipped on the aviation page. Clip rather than hidden, so the
          sticky portrait still sticks. */}
      <section className="overflow-x-clip bg-white">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-6 py-[var(--space-section-y)] lg:grid-cols-[1.4fr_1fr] lg:px-10">
          <Reveal direction="left">
            <p className="text-[var(--color-brand-blue)]" style={T.label}>
              A word from our Director
            </p>
            <h2
              className="mt-3 font-display tracking-tight text-[var(--color-deep-blue)]"
              style={T.section}
            >
              A Word from the Director<br />of Alpha High School.
            </h2>

            <div className="relative mt-8 rounded-2xl bg-[var(--color-deep-blue)] p-8 text-white shadow-xl sm:p-10">
              <Quote
                aria-hidden
                className="absolute -top-4 left-6 h-10 w-10 text-[var(--color-gold)]"
              />
              {/* Her own words. The sentence that stood here before was
                  unattributed, and with a named Director on the page it would
                  have read as hers. */}
              <p className="font-display leading-snug" style={T.section}>
                “Together, we can empower the next generation to thrive and make
                a meaningful impact in their communities and beyond.”
              </p>
              <p
                className="mt-6 font-semibold uppercase tracking-[0.18em] text-[var(--color-gold)]"
                style={T.body}
              >
                Ms. Fatina Said
              </p>
              <p className="mt-1 text-white/75" style={T.body}>
                Managing Director, Alpha High School
              </p>
            </div>

            <div className="mt-8 space-y-5 text-[var(--color-ink)]/85" style={T.body}>
              <p>
                As the Managing Director of Alpha High School, I am honoured to
                pay tribute to our esteemed founder, Professor Aloysius Mayo.
                His visionary leadership laid the foundation for Alpha Schools,
                which include Alpha Nursery and Primary School, Alpha Girls High
                School, and Alpha High School. Professor Mayo's commitment to
                preparing young Tanzanians for success in the competitive realms
                of technology, entrepreneurship, and the evolving challenges of
                our global landscape continues to inspire us all.
              </p>
              <p>
                At Alpha, we take pride in the remarkable achievements of our
                alumni, who represent a diverse range of professions both locally
                and internationally. Our graduates have excelled as accountants,
                medical doctors, lawyers, engineers, pilots, and in many other
                fields, demonstrating the effectiveness of our comprehensive
                educational approach. I warmly invite all parents and guardians
                to consider registering their sons and daughters at Alpha
                Schools. Here, we offer a well-rounded curriculum that fosters
                not only academic excellence but also personal growth and
                character development. Together, we can empower the next
                generation to thrive and make a meaningful impact in their
                communities and beyond.
              </p>
              <p>
                Thank you for your continued support in shaping the future of our
                youth.
              </p>
              <p className="text-[var(--color-ink)]/70">
                Warm regards,
                <br />
                <span className="font-display font-semibold text-[var(--color-deep-blue)]">
                  Ms. Fatina Said
                </span>
              </p>
            </div>
          </Reveal>

          <Reveal direction="right" className="flex justify-center lg:sticky lg:top-24">
            <div className="relative w-full max-w-sm">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-2xl bg-[var(--color-bright-blue)]/15 blur-xl"
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-bright-blue)]/10 ring-1 ring-[var(--color-deep-blue)]/15">
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-[var(--color-deep-blue)]/70">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-blue)]">
                    Photo placeholder
                  </span>
                  <span className="mt-3" style={T.body}>
                    [Photograph of Ms. Fatina Said — to be provided]
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* OUR JOURNEY */}
      <section className="bg-[var(--color-off-white)]">
        <div className={`${SHELL} py-[var(--space-section-y)]`}>
          <Reveal direction="up">
            <p className="text-[var(--color-brand-blue)]" style={T.label}>
              Our journey
            </p>
            <h2 className="mt-3 font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
              From one classroom<br />to three schools.
            </h2>
          </Reveal>
          <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
            {TIMELINE.map((t, i) => (
              <Reveal key={i} direction="up" delay={i * 90}>
                <li className="relative pl-8 md:pl-0 md:pt-10">
                  {/* rail */}
                  <span
                    aria-hidden
                    className="absolute left-[7px] top-2 h-full w-0.5 bg-[var(--color-gold)]/40 md:left-0 md:top-[7px] md:h-0.5 md:w-full"
                  />
                  <span
                    aria-hidden
                    className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-[var(--color-gold)] ring-4 ring-[var(--color-off-white)] md:top-0"
                  />
                  <p className="font-display text-[var(--color-deep-blue)]" style={T.section}>
                    {t.year}
                  </p>
                  <p className="mt-2 font-display font-bold text-[var(--color-ink)]" style={T.body}>{t.title}</p>
                  <p className="mt-2 text-[var(--color-ink)]/75" style={T.body}>{t.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* MISSION VISION VALUES */}
      <section className="bg-white">
        <div className={`${SHELL} py-[var(--space-section-y)]`}>
          <div className="grid gap-8 lg:grid-cols-2">
            <Reveal direction="left" className="rounded-2xl bg-[var(--color-deep-blue)] p-10 text-white">
              <p className="text-[11px] text-[var(--color-gold)]" style={T.label}>Our mission</p>
              <p className="mt-4 font-display leading-snug" style={T.section}>
                To enable pupils to prosper academically by solving their intellectual and environmental challenges,
                to become good citizens, responsible to their society.
              </p>
            </Reveal>
            <Reveal direction="right" className="rounded-2xl bg-[var(--color-gold)] p-10 text-[var(--color-deep-blue)]">
              <p className="text-[11px]" style={T.label}>Our vision</p>
              <p className="mt-4 font-display leading-tight" style={T.section}>
                To strive for excellence.
              </p>
            </Reveal>
          </div>

          <div className="mt-14">
            <Reveal direction="up">
              <p className="text-[var(--color-brand-blue)]" style={T.label}>Our values</p>
              <h3 className="mt-3 font-display text-[var(--color-deep-blue)]" style={T.section}>
                Five things we won't compromise.
              </h3>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {VALUES.map((v, i) => (
                <Reveal key={v.name} direction="up" delay={i * 80}>
                  <div className="group h-full rounded-xl border border-[var(--color-deep-blue)]/10 bg-[var(--color-off-white)] p-6 transition-all hover:-translate-y-1 hover:border-[var(--color-gold)] hover:shadow-lg">
                    <div className="h-1 w-10 rounded-full bg-[var(--color-gold)] transition-all group-hover:w-16" />
                    <p className="mt-4 font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>{v.name}</p>
                    <p className="mt-2 text-[var(--color-ink)]/75" style={T.body}>{v.blurb}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RECORD OF EXCELLENCE */}
      <section className="bg-[var(--color-off-white)]">
        <div className={`${SHELL} py-[var(--space-section-y)]`}>
          <Reveal direction="up">
            <p className="text-[var(--color-brand-blue)]" style={T.label}>
              A record of excellence
            </p>
            <h2 className="mt-3 max-w-3xl font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
              Two decades. Real results.
            </h2>
            <p className="mt-4 max-w-2xl italic text-[var(--color-ink)]/60" style={T.body}>
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
                  <h3 className="mt-5 font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
                    {r.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[var(--color-ink)]/80" style={T.body}>{r.body}</p>
                  {r.href ? (
                    <Link
                      to={r.href}
                      className="mt-5 inline-flex items-center gap-1.5 font-semibold text-[var(--color-brand-blue)] hover:translate-x-0.5" style={T.body}
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
            <h2 className="font-display text-[var(--color-deep-blue)]" style={T.section}>
              Come and see Alpha for yourself.
            </h2>
            <p className="mt-2 text-[var(--color-deep-blue)]/85" style={T.body}>
              Book a campus visit and meet the people behind the results.
            </p>
          </Reveal>
          <Reveal direction="right">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-deep-blue)] px-6 py-3 font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]" style={T.body}
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
