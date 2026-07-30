import { createFileRoute, Link } from "@tanstack/react-router";
import admissionHeroFallback from "@/assets/campus-nursery.jpg.asset.json";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { ArrowRight, Download, Mail, MapPin, Phone, Check } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/admission")({
  head: () => ({
    meta: [
      { title: "Admissions · Alpha Schools" },
      {
        name: "description",
        content:
          "Apply to Alpha Schools — Nursery, Primary, Alpha High and Alpha Girls. Rolling admissions across the year in Dar es Salaam.",
      },
      { property: "og:title", content: "Admissions · Alpha Schools" },
      {
        property: "og:description",
        content:
          "How to apply to Alpha Schools — six-step admission process, required documents, entry requirements, intake and fees.",
      },
    ],
  }),
  component: AdmissionPage,
});

// [Application form PDF — upload to Supabase Storage and link here before launch]
// Replace the value below with the public URL of the application form PDF from
// the `media` bucket once it has been uploaded.
const APPLICATION_FORM_URL = "/application-form-placeholder.pdf";

const STEPS = [
  { n: "01", title: "Pay application fees", body: "Pay the application fee at the campus or by bank transfer, and keep the receipt for your file." },
  { n: "02", title: "Download and complete the form", body: "Download the application form, complete every section and gather the supporting documents." },
  { n: "03", title: "Submit", body: "Submit the completed form and documents in person at the campus or by email to the admissions office." },
  { n: "04", title: "Selection / Entrance exams", body: "Applicants sit an entrance assessment or interview according to each school's schedule." },
  { n: "05", title: "Admission and joining instructions", body: "Successful applicants receive an admission letter together with joining instructions." },
  { n: "06", title: "Fees payment", body: "Complete the fee payment to confirm your child's place at Alpha." },
] as const;

const REQUIRED_DOCS = [
  "Completed application form",
  "Birth certificate",
  "Passport-size photographs",
] as const;

const SCHOOL_CARDS = [
  {
    name: "Nursery & Primary",
    accent: "#1E7FC2",
    campus: "Kunduchi campus",
    entry: "From 2 years old (Nursery) and 5 years old (Primary).",
    note: null,
    to: "/schools/nursery-primary" as const,
  },
  {
    name: "Alpha High",
    accent: "#0C447C",
    campus: "Mikocheni campus",
    entry: "Form 1–6, mixed secondary. Entry by assessment.",
    note: "[Specific academic entry requirements — to be confirmed]",
    to: "/schools/alpha-high" as const,
  },
  {
    name: "Alpha Girls",
    accent: "#3C3489",
    campus: "Kunduchi campus",
    entry: "Form 1–6, girls' secondary. Entry by assessment.",
    note: "[Specific academic entry requirements — to be confirmed]",
    to: "/schools/alpha-girls" as const,
  },
] as const;

function AdmissionPage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)]">
      <SiteHeader />

      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-[var(--color-deep-blue)] text-white">
        <HeroSlideshow
          pageKey="admission"
          fallback={[{ src: admissionHeroFallback.url, alt: "" }]}
          className="opacity-25"
          showDots={false}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 20%, rgba(232,160,32,0.35) 0%, transparent 60%), radial-gradient(50% 50% at 80% 80%, rgba(30,127,194,0.45) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold)]">
              Admissions
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Join the Alpha family.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/85 sm:text-lg">
              Applications are open throughout the year, across all three schools — from
              nursery to A-Level. Here's how to begin.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={APPLICATION_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--color-gold)] px-5 py-3 text-sm font-semibold text-[#1a1a18] shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md"
              >
                <Download className="h-4 w-4" />
                Download Application Form
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Book a Visit
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/60">
              [Application form PDF — upload to Supabase Storage and link here before launch]
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2. Admission process — 6 steps */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-bright-blue)]">
            The admission process
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-[var(--color-deep-blue)] sm:text-4xl">
            Six simple steps.
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 80}>
              <li className="group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <div
                  aria-hidden
                  className="absolute right-3 top-2 font-display text-6xl font-bold leading-none text-[var(--color-bright-blue)]/10 transition-colors group-hover:text-[var(--color-gold)]/30"
                >
                  {step.n}
                </div>
                <div className="relative">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-deep-blue)] font-display text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-[var(--color-deep-blue)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]/80">
                    {step.body}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>

        <p className="mt-8 max-w-3xl text-sm text-[var(--color-ink)]/70">
          Application forms are available throughout the year; interviews and assessments
          are conducted according to each school's schedule.
        </p>
      </section>

      {/* 3. What you'll need */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-bright-blue)]">
                What you'll need
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-[var(--color-deep-blue)] sm:text-4xl">
                Required documents.
              </h2>
              <p className="mt-4 max-w-lg text-[var(--color-ink)]/80">
                Have these ready before you submit your application. Bring originals plus
                clear copies on the day.
              </p>
            </Reveal>

            <Reveal direction="left">
              <ul className="space-y-3 rounded-2xl border border-black/5 bg-[var(--color-cream)] p-6 shadow-sm">
                {REQUIRED_DOCS.map((d) => (
                  <li key={d} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-gold)] text-[#1a1a18]">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="font-medium text-[var(--color-ink)]">{d}</span>
                  </li>
                ))}
                <li className="flex items-start gap-3 border-t border-black/10 pt-4 text-sm text-[var(--color-ink)]/70">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-dashed border-[var(--color-ink)]/40 text-[10px] font-bold">
                    +
                  </span>
                  <span>[Any additional documents per school — to be confirmed]</span>
                </li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. Entry requirements by school */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-bright-blue)]">
            Entry requirements
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-[var(--color-deep-blue)] sm:text-4xl">
            By school.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SCHOOL_CARDS.map((s, i) => (
            <Reveal key={s.name} delay={i * 100}>
              <article
                className="group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{ borderTopColor: s.accent, borderTopWidth: 4 }}
              >
                <div className="p-6">
                  <span
                    className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                    style={{ background: s.accent }}
                  >
                    {s.campus}
                  </span>
                  <h3
                    className="mt-4 font-display text-xl font-bold"
                    style={{ color: s.accent }}
                  >
                    {s.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]/85">
                    {s.entry}
                  </p>
                  {s.note && (
                    <p className="mt-3 text-xs italic text-[var(--color-ink)]/55">{s.note}</p>
                  )}
                  <Link
                    to={s.to}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:underline"
                    style={{ color: s.accent }}
                  >
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5. Intake & timing */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <Reveal as="div" className="lg:col-span-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-bright-blue)]">
                Intake & timing
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-[var(--color-deep-blue)] sm:text-4xl">
                Rolling admissions.
              </h2>
            </Reveal>
            <Reveal as="div" className="lg:col-span-7" direction="left">
              <div className="rounded-2xl border border-black/5 bg-[var(--color-cream)] p-7 shadow-sm">
                <p className="text-base leading-relaxed text-[var(--color-ink)]">
                  We accept applications throughout the year — January through December —
                  so you can begin the process whenever you're ready.
                </p>
                <p className="mt-4 text-sm italic text-[var(--color-ink)]/60">
                  [Specific term start dates / application deadlines — to be confirmed]
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6. Fees */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-bright-blue)]">
            Fees
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-[var(--color-deep-blue)] sm:text-4xl">
            School fees.
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-ink)]/25 bg-white p-8 shadow-sm">
            <p className="font-display text-lg font-semibold text-[var(--color-deep-blue)]">
              [Fee structure per school — to be provided]
            </p>
            <p className="mt-3 max-w-2xl text-[var(--color-ink)]/80">
              For the most current fee schedule across Nursery & Primary, Alpha High and
              Alpha Girls, please contact our admissions office directly.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="tel:+255734036010"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--color-deep-blue)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                <Phone className="h-4 w-4" /> Call admissions
              </a>
              <a
                href="mailto:alphaschoolsdsm@gmail.com"
                className="inline-flex items-center gap-2 rounded-md border border-[var(--color-deep-blue)]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-deep-blue)] transition-colors hover:bg-[var(--color-deep-blue)]/5"
              >
                <Mail className="h-4 w-4" /> Email admissions
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 7. Get in touch / apply */}
      <section className="bg-[var(--color-deep-blue)] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold)]">
                Get in touch
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
                Ready to apply? Start here.
              </h2>
              <p className="mt-5 max-w-md text-white/85">
                Download the form, complete it, and submit it with your child's birth
                certificate and passport-size photos — in person at the campus or by email
                to{" "}
                <a
                  href="mailto:alphaschoolsdsm@gmail.com"
                  className="font-semibold text-[var(--color-gold)] hover:underline"
                >
                  alphaschoolsdsm@gmail.com
                </a>
                .
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href={APPLICATION_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--color-gold)] px-5 py-3 text-sm font-semibold text-[#1a1a18] shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <Download className="h-4 w-4" /> Download Application Form
                </a>
              </div>
            </Reveal>

            <Reveal direction="left">
              <ul className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur">
                <li className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-gold)] text-[#1a1a18]">
                    <Phone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                      Phone / WhatsApp
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold">
                      <a href="tel:+255734036010" className="hover:text-[var(--color-gold)]">
                        0734 036 010
                      </a>
                    </p>
                    <p className="text-sm text-white/75">
                      Admissions also:{" "}
                      <a href="tel:+255756299302" className="hover:text-[var(--color-gold)]">
                        0756 299 302
                      </a>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-gold)] text-[#1a1a18]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                      Email
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold">
                      <a
                        href="mailto:alphaschoolsdsm@gmail.com"
                        className="hover:text-[var(--color-gold)]"
                      >
                        alphaschoolsdsm@gmail.com
                      </a>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-gold)] text-[#1a1a18]">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                      Address
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold">
                      Kunduchi, Dar es Salaam
                    </p>
                  </div>
                </li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8. CTA banner */}
      <section className="bg-[var(--color-gold)] text-[#1a1a18]">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-14 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Ready to take the first step?
            </h2>
            <p className="mt-2 max-w-2xl text-[#1a1a18]/85">
              Visit a campus, meet our team, and see Alpha for yourself.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-deep-blue)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            Book a Visit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
