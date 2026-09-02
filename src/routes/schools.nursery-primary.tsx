import { SchoolFacilitiesSection } from "@/components/school/facilities-section";
import { SchoolSubNav } from "@/components/school/school-sub-nav";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  getTestimonials,
  submitContactMessage,
  type TestimonialItem,
} from "@/lib/alpha-content.functions";
import {
  BookOpen, FlaskConical, Calculator, Leaf, Puzzle, Globe2, Wrench, Languages, Plane,
  Trophy, Waves, Music, Laptop, Tent, Disc3, ChefHat, Mic,
} from "lucide-react";
import girlCutout from "@/assets/alpha-girl-uniform.png.asset.json";
import photoDance from "@/assets/np-traditional-dance.jpg.asset.json";
import photoMusicalChairs from "@/assets/np-musical-chairs.jpg.asset.json";
import photoBallPit from "@/assets/np-ball-pit.jpg.asset.json";
import photoTelescope from "@/assets/np-telescope.jpg.asset.json";
import photoTeacher from "@/assets/np-teacher-pupils.jpg.asset.json";
import photoTeam from "@/assets/np-team-thumbs.jpg.asset.json";
import photoGirlPortrait from "@/assets/np-girl-portrait.jpg.asset.json";
import photoHippoRide from "@/assets/np-hippo-ride.jpg.asset.json";
import photoSpeakersGroup from "@/assets/np-junior-speakers-group.jpg.asset.json";
import photoSpeakersTeam from "@/assets/np-junior-speakers-team.jpg.asset.json";
import photoPlayground from "@/assets/np-playground.jpg.asset.json";
import photoShapesClass from "@/assets/np-shapes-class.jpg.asset.json";
import photoToyCar from "@/assets/np-toy-car.jpg.asset.json";

const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: () => getTestimonials(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/schools/nursery-primary")({
  head: () => ({
    meta: [
      { title: "Nursery & Primary · Alpha Schools" },
      {
        name: "description",
        content:
          "Play-led early years that grow into a warm, structured primary — the joyful first chapter of your child's Alpha journey.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(testimonialsQuery),
  component: NurseryPrimaryPage,
});

/**
 * Page-local decorative colours for Nursery & Primary: pastel card tints,
 * section washes, and the saturated blues used by StripePanel and the
 * early-years blob. Deliberately NOT in styles.css -- these are specific to
 * this page and not part of the Alpha brand palette.
 *
 * The stripe blues sit near the brand blues but match none of them exactly,
 * so they stay literal rather than becoming tokens.
 */
const PAGE_TINTS = {
  blue: "#e0ecfb",
  sky: "#dbeafe",
  violet: "#e7e3f7",
  mint: "#dff3e4",
  sand: "#fbeed1",
  peach: "#fbe1d4",
  pink: "#f6e4f1",
  lilac: "#cdb8e6",
  ice: "#e6f1fb",
  wash: "#e8f1fb",
  stripeBlue: "#2f8fcd",
  stripeBlueDark: "#0e4977",
  stripeBlueLight: "#6fb4e0",
} as const;

/** Section anchors for the shared sub-nav. */
const SUB_NAV = [
  { label: "Our days", href: "#our-days" },
  { label: "Early years", href: "#early-years" },
  { label: "Primary", href: "#primary" },
  { label: "Extracurriculum", href: "#extracurriculum" },
  { label: "Admission", href: "#admission" },
] as const;

/** Type roles bound to the design system. Same pattern as src/routes/index.tsx. */
const T: Record<string, React.CSSProperties> = {
  section: { fontSize: "var(--text-section)", lineHeight: "var(--leading-section)", fontWeight: "var(--weight-section)" },
  cardTitle: { fontSize: "var(--text-card-title)", lineHeight: "var(--leading-card-title)", fontWeight: "var(--weight-card-title)" },
  body: { fontSize: "var(--text-body)", lineHeight: "var(--leading-body)", fontWeight: "var(--weight-body)" },
  label: {
    fontSize: "var(--text-label)", lineHeight: "var(--leading-label)",
    fontWeight: "var(--weight-label)", letterSpacing: "var(--tracking-label)",
    textTransform: "uppercase",
  },
  stat: { fontSize: "var(--text-stat)", lineHeight: "var(--leading-stat)", fontWeight: "var(--weight-stat)" },
};

// ---------- Reusable bits ----------

function StripePanel({
  tone,
  label,
  className = "",
}: {
  tone: "blue" | "blue-dark" | "blue-light" | "gold";
  label: string;
  className?: string;
}) {
  const palette = {
    blue: { bg: PAGE_TINTS.stripeBlue, stripe: "rgba(255,255,255,0.16)" },
    "blue-dark": { bg: PAGE_TINTS.stripeBlueDark, stripe: "rgba(255,255,255,0.12)" },
    "blue-light": { bg: PAGE_TINTS.stripeBlueLight, stripe: "rgba(255,255,255,0.22)" },
    gold: { bg: "var(--color-gold)", stripe: "rgba(255,255,255,0.22)" },
  }[tone];
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: `repeating-linear-gradient(135deg, ${palette.bg} 0 18px, ${palette.stripe} 18px 36px)`,
      }}
    >
      <span className="absolute left-4 top-3 font-mono text-[10px] tracking-[0.18em] text-white/85">
        {label}
      </span>
    </div>
  );
}

// ---------- Page ----------

function NurseryPrimaryPage() {
  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />
      <SchoolSubNav items={SUB_NAV} />
      <Hero />
      <WhatWeOffer />
      <AlphaChild />
      <WhatTheyExplore />
      <OutstandingExtracurriculum />
      <LetsGetStarted />
      <WhatParentsSay />
      <PeekInside />
      <ComeMeetUs />
      <EntryRequirements />
      <SchoolFacilitiesSection slug="nursery-primary" accent="var(--color-bright-blue)" />
      <SiteFooter />
    </div>
  );
}

// ---------- Hero ----------

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-8 lg:px-10 lg:py-24">
        {/* Left: copy */}
        <div className="relative">
          <h1 className="font-display text-5xl font-black leading-[1.02] tracking-tight text-[var(--color-deep-blue)] sm:text-6xl lg:text-[64px]">
            Unlock your<br />Child's<br />Potential
          </h1>
          <p className="mt-6 max-w-md text-[var(--color-ink)]/75" style={T.body}>
            Play-led early years that grow into a warm, structured primary — the
            joyful first chapter of your child's Alpha journey.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/admission"
              className="inline-flex min-h-[var(--btn-primary-min-h)] items-center rounded-[var(--radius-pill)] bg-[var(--color-bright-blue)] px-7 text-white shadow-md transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] motion-reduce:transition-none" style={{ ...T.body, fontWeight: "var(--btn-primary-weight)" }}
            >
              Enroll Now
            </Link>
            <Link
              to="/contact"
              className="inline-flex min-h-[var(--btn-primary-min-h)] items-center rounded-[var(--radius-pill)] border-2 border-[var(--color-gold)] bg-[var(--color-surface)] px-7 text-[var(--color-deep-blue)] transition-colors duration-150 hover:bg-[var(--color-gold)]/5 active:scale-[0.97] motion-reduce:transition-none" style={{ ...T.body, fontWeight: "var(--btn-primary-weight)" }}
            >
              Book a Visit
            </Link>
          </div>
          <p className="mt-10 font-display text-[var(--color-deep-blue)]" style={T.stat}>
            From 2 - 12 Years old
          </p>
        </div>

        {/* Right: scattered photo cards */}
        <div className="relative h-[460px] sm:h-[520px]">
          {/* Decorative bits */}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="absolute -top-2 left-10 h-7 w-7 text-[var(--color-gold)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="12,2 15,9 22,9 16.5,13.5 18.5,21 12,16.5 5.5,21 7.5,13.5 2,9 9,9" />
          </svg>
          <span className="absolute left-2 top-1/2 h-3 w-3 rounded-full bg-[var(--color-bright-blue)]" />
          <svg
            aria-hidden
            viewBox="0 0 80 24"
            className="absolute -right-2 top-24 h-6 w-24 text-[var(--color-bright-blue)]/70"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M2 12 Q 12 2, 22 12 T 42 12 T 62 12 T 78 12" />
          </svg>
          <span className="absolute right-16 top-2 h-3 w-3 rounded-full bg-[var(--color-gold)]" />

          {/* Card 1 — top right group (chef-hat kids) */}
          <div
            className="absolute right-2 top-2 w-[64%] rotate-[2deg] rounded-2xl p-2 shadow-xl"
            style={{ backgroundColor: PAGE_TINTS.lilac }}
          >
            <div className="overflow-hidden rounded-xl">
              <img
                src={photoHippoRide.url}
                alt="Pupil on a play hippo in the courtyard"
                className="h-56 w-full object-cover"
                loading="eager"
              />
            </div>
          </div>

          {/* Card 2 — left, big tilted gold-frame portrait */}
          <div className="absolute -left-2 top-36 w-[55%] -rotate-[6deg] rounded-2xl bg-[var(--color-gold)] p-2 shadow-2xl">
            <div className="overflow-hidden rounded-xl">
              <img
                src={photoGirlPortrait.url}
                alt="Smiling Alpha primary pupil in uniform"
                className="h-72 w-full object-cover"
                loading="eager"
              />
            </div>
          </div>

          {/* Card 3 — bottom right, dark blue frame */}
          <div className="absolute bottom-0 right-0 w-[58%] rotate-[3deg] rounded-2xl bg-[var(--color-deep-blue)] p-2 shadow-2xl">
            <div className="overflow-hidden rounded-xl">
              <img
                src={photoTeacher.url}
                alt="Teacher working with two pupils"
                className="h-52 w-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Soft cream wave divider */}
      <svg
        viewBox="0 0 1440 60"
        className="block h-10 w-full text-[var(--color-off-white)]"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 30 Q 360 0 720 30 T 1440 30 V60 H0 Z" fill="currentColor" />
      </svg>
    </section>
  );
}

// ---------- What we offer ----------

function WhatWeOffer() {
  const cards = [
    {
      tone: "blue" as const,
      label: "IMG · NURSERY ROOM",
      age: "EARLY YEARS",
      title: "Nursery",
      body:
        "Day Care, Baby Class, Middle Class and Pre-Unit — learning through play, songs and stories, building confidence, language and friendships in a calm, joyful space.",
      bg: "white",
      ageColor: "var(--color-deep-blue)",
      titleColor: "var(--color-deep-blue)",
      bodyColor: "var(--color-ink)",
      arrowBg: PAGE_TINTS.ice,
      arrowColor: "var(--color-bright-blue)",
    },
    {
      tone: "blue-dark" as const,
      label: "IMG · PRIMARY CLASS",
      age: "AGES 6 – 12 · PRIMARY",
      title: "Primary School",
      body:
        "A structured, ambitious curriculum — strong literacy and numeracy, plus coding from the very start and a head full of questions.",
      bg: "var(--color-brand-blue)",
      ageColor: "rgba(255,255,255,0.85)",
      titleColor: "var(--color-surface)",
      bodyColor: "rgba(255,255,255,0.9)",
      arrowBg: "var(--color-gold)",
      arrowColor: "var(--color-deep-blue)",
    },
  ];

  return (
    <section id="our-days" className="bg-[var(--color-off-white)] pb-[var(--space-section-y)] pt-6">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]">
        <p className="text-center text-[var(--color-bright-blue)]" style={T.label}>
          From first steps to big school
        </p>
        <h2 className="mt-2 text-center font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
          What we <span className="text-[var(--color-bright-blue)]">offer</span>
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {cards.map((c) => (
            <article
              key={c.title}
              className="overflow-hidden rounded-3xl p-6 shadow-[0_10px_30px_-12px_rgba(12,68,124,0.18)] transition-transform duration-150 hover:-translate-y-1 active:translate-y-0"
              style={{ background: c.bg }}
            >
              <div className="px-1 pb-2 pt-2">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: c.ageColor }}
                >
                  {c.age}
                </p>
                <h3
                  className="mt-2 font-display text-2xl font-extrabold"
                  style={{ color: c.titleColor }}
                >
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: c.bodyColor }}>
                  {c.body}
                </p>
                <div
                  className="mt-6 grid h-10 w-10 place-items-center rounded-full"
                  style={{ background: c.arrowBg, color: c.arrowColor }}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17 L17 7" />
                    <path d="M9 7 H17 V15" />
                  </svg>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- The Alpha Child ----------

function AlphaChild() {
  const left = [
    { icon: "?", color: "var(--color-danger)", title: "Curious & full of questions", body: "Wondering out loud is encouraged." },
    { icon: "💪", color: "", title: "Confident to try", body: "Mistakes are part of learning." },
    { icon: "🤝", color: "", title: "Kind to one another", body: "Caring for friends comes first." },
  ];
  const right = [
    { icon: "📖", color: "", title: "Loves stories & books", body: "Reading happens every single day." },
    { icon: "🔢", color: "", title: "Counts, sorts & solves", body: "Early maths through play." },
    { icon: "🎒", color: "", title: "Ready for big school", body: "Confident, prepared, excited." },
  ];

  const Item = ({ icon, color, title, body, align }: { icon: string; color?: string; title: string; body: string; align: "right" | "left" }) => (
    <div className={`flex items-start gap-4 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-md ring-1 ring-black/5" style={color ? { color } : undefined}>
        {icon}
      </div>
      <div>
        <h4 className="font-display text-base font-extrabold text-[var(--color-deep-blue)]">{title}</h4>
        <p className="mt-1 text-[var(--color-ink)]/70" style={T.body}>{body}</p>
      </div>
    </div>
  );

  return (
    <section
      id="early-years"
      className="relative overflow-hidden py-[var(--space-section-y)]"
      style={{ backgroundColor: PAGE_TINTS.wash }}
    >
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]">
        <p className="text-center text-[var(--color-bright-blue)]" style={T.label}>
          The Alpha child
        </p>
        <h2 className="mt-2 text-center font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
          What makes a young Alpha{" "}
          <span className="text-[var(--color-bright-blue)]">learner?</span>
        </h2>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-8">
            {left.map((i) => (
              <Item key={i.title} {...i} align="right" />
            ))}
          </div>

          {/* Center portrait with blue oval gradient backdrop + gold ground bar */}
          <div className="relative mx-auto h-[24rem] w-[22rem]">
            {/* Soft outer glow */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[26rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-3xl opacity-60"
              style={{ background: "radial-gradient(ellipse at center, rgba(47,143,205,0.55), rgba(47,143,205,0) 70%)" }}
            />
            {/* Main oval */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[22rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-[50%] shadow-[0_25px_60px_-20px_rgba(12,68,124,0.45)]"
              style={{
                background:
                  `radial-gradient(ellipse at 30% 25%, ${PAGE_TINTS.stripeBlueLight} 0%, ${PAGE_TINTS.stripeBlue} 45%, ${PAGE_TINTS.stripeBlueDark} 100%)`,
              }}
            />
            {/* Subtle highlight */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[8rem] w-[10rem] -translate-x-[120%] -translate-y-[140%] rounded-[50%] opacity-40 blur-2xl"
              style={{ background: "rgba(255,255,255,0.55)" }}
            />
            <img
              src={girlCutout.url}
              alt="Alpha pupil"
              className="absolute left-1/2 top-1/2 h-[22rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-[50%] object-cover object-top drop-shadow-[0_18px_18px_rgba(12,68,124,0.35)]"
            />
            
          </div>

          <div className="space-y-8">
            {right.map((i) => (
              <Item key={i.title} {...i} align="left" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- What they'll explore ----------

function WhatTheyExplore() {
  const subjects = [
    { name: "Reading & Writing", bg: PAGE_TINTS.blue, Icon: BookOpen },
    { name: "Science & Technology", bg: PAGE_TINTS.violet, Icon: FlaskConical },
    { name: "Arithmetic", bg: PAGE_TINTS.sky, Icon: Calculator },
    { name: "Environmental Care", bg: PAGE_TINTS.mint, Icon: Leaf },
    { name: "Life Skills", bg: PAGE_TINTS.sand, Icon: Puzzle },
    { name: "Social Studies", bg: PAGE_TINTS.peach, Icon: Globe2 },
    { name: "Vocational Skills", bg: PAGE_TINTS.pink, Icon: Wrench },
    { name: "Foreign Languages", bg: PAGE_TINTS.blue, Icon: Languages },
    { name: "Introduction to Aviation", bg: PAGE_TINTS.violet, Icon: Plane },
  ];



  return (
    <section id="primary" className="bg-[var(--color-off-white)] py-[var(--space-section-y)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]">
        <p className="text-center text-[var(--color-bright-blue)]" style={T.label}>
          A rich, busy week
        </p>
        <h2 className="mt-2 text-center font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
          What they'll <span className="text-[var(--color-bright-blue)]">explore</span>
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3">
          {subjects.map((s) => (
            <div
              key={s.name}
              className="group flex flex-col items-center justify-center rounded-2xl px-6 py-8 transition-transform duration-300 hover:-translate-y-1 active:translate-y-0"
              style={{ background: s.bg }}
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm">
                <s.Icon className="h-7 w-7 text-[var(--color-bright-blue)]" aria-hidden />
              </div>
              <p className="mt-5 font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
                {s.name}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/about"
            className="inline-flex min-h-[var(--btn-primary-min-h)] items-center rounded-[var(--radius-pill)] bg-[var(--color-bright-blue)] px-7 text-white shadow-md transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] motion-reduce:transition-none" style={{ ...T.body, fontWeight: "var(--btn-primary-weight)" }}
          >
            View the full curriculum →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------- Entry requirements ----------

function EntryRequirements() {
  return (
    <section id="requirements" className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <p className="text-[var(--color-bright-blue)]" style={T.label}>
          Admissions
        </p>
        <h2 className="mt-2 font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
          Requirements
        </h2>
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-gold)]/70 bg-[var(--color-off-white)] p-7">
          <p className="font-display text-base font-semibold text-[var(--color-deep-blue)]">
            [Entry requirements — to be confirmed with academic offices]
          </p>
          <p className="mt-2 text-[var(--color-ink)]/70" style={T.body}>
            Placeholder — the confirmed entry requirements for this school will be published here.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------- Outstanding Extracurriculum ----------

const EXTRACURRICULUM = [
  { name: "Sports & Games", Icon: Trophy, bg: PAGE_TINTS.blue },
  { name: "Swimming", Icon: Waves, bg: PAGE_TINTS.sky },
  { name: "Music", Icon: Music, bg: PAGE_TINTS.sand },
  { name: "Coding & Digital Skills", Icon: Laptop, bg: PAGE_TINTS.violet },
  { name: "Scouts", Icon: Tent, bg: PAGE_TINTS.mint },
  { name: "DJ", Icon: Disc3, bg: PAGE_TINTS.pink },
  { name: "Cookery", Icon: ChefHat, bg: PAGE_TINTS.peach },
  { name: "Debate & Public Speaking", Icon: Mic, bg: PAGE_TINTS.blue },
];

function OutstandingExtracurriculum() {
  return (
    <section id="extracurriculum" className="bg-white py-[var(--space-section-y)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]">
        <p className="text-center text-[var(--color-bright-blue)]" style={T.label}>
          Beyond the classroom
        </p>
        <h2 className="mt-2 text-center font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
          Outstanding <span className="text-[var(--color-bright-blue)]">Extracurriculum</span>
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
          {EXTRACURRICULUM.map((a) => (
            <div
              key={a.name}
              className="group flex flex-col items-center justify-center rounded-2xl px-5 py-8 text-center transition-transform duration-300 hover:-translate-y-1 active:translate-y-0"
              style={{ background: a.bg }}
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm">
                <a.Icon className="h-7 w-7 text-[var(--color-bright-blue)]" aria-hidden />
              </div>
              <p className="mt-5 font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
                {a.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Let's get started ----------

function LetsGetStarted() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", childAge: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await submitContactMessage({
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          school_slug: "nursery-primary",
          subject: "Nursery & Primary — visit request",
          message: [
            form.childAge ? `Child's age: ${form.childAge}` : "Child's age: not given",
            form.note || "Requested a campus visit from the Nursery & Primary page.",
          ].join("\n\n"),
        },
      });
      setDone(true);
      setForm({ name: "", email: "", phone: "", childAge: "", note: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your request. Please call us instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="admission" className="relative bg-[var(--color-bright-blue)] py-[var(--space-section-y)]">
      {/* top wave */}
      <svg
        viewBox="0 0 1440 60"
        className="absolute -top-px left-0 right-0 h-10 w-full text-[var(--color-off-white)]"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 0 H1440 V30 Q 1080 60 720 30 T 0 30 Z" fill="currentColor" />
      </svg>

      <div className="mx-auto w-full max-w-3xl px-[var(--container-gutter)] text-center">
        <h2 className="font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
          Let's <span className="text-[var(--color-bright-blue)]">get</span> started
        </h2>
        <p className="mt-3 text-white/85">
          Tell us a little about your child and we'll arrange a visit to the campus.
        </p>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-10 rounded-3xl bg-white p-6 text-left shadow-2xl sm:p-8"
        >
          {done ? (
            <div className="py-10 text-center">
              <p className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
                Thank you — we'll be in touch within one working day.
              </p>
              <p className="mt-3 text-[var(--color-ink)]/70" style={T.body}>
                If it's urgent, call us on{" "}
                <a href="tel:+255222775046" className="font-semibold text-[var(--color-bright-blue)] underline">
                  +255 22 277 5046
                </a>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Parent name" required value={form.name} onChange={(v) => update("name", v)} placeholder="Your full name" autoComplete="name" />
                <Field label="Email" required type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="you@example.com" autoComplete="email" />
                <Field label="Phone" type="tel" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+255 ..." autoComplete="tel" />
                <Field label="Child's age" value={form.childAge} onChange={(v) => update("childAge", v)} placeholder="e.g. 4" />
              </div>
              <div className="mt-4">
                <label className="text-[var(--color-deep-blue)]" style={T.label} htmlFor="np-note">
                  A note for us (optional)
                </label>
                <textarea
                  id="np-note"
                  rows={3}
                  value={form.note}
                  onChange={(e) => update("note", e.target.value)}
                  placeholder="Anything you'd like us to know"
                  className="mt-2 w-full rounded-xl border border-[var(--color-deep-blue)]/15 bg-[var(--color-off-white)] px-4 py-3 text-[var(--color-ink)] focus:border-[var(--color-bright-blue)] focus:outline-none" style={T.body}
                />
              </div>

              {error && (
                <p role="alert" className="mt-4 rounded-[var(--radius-btn)] bg-[var(--color-danger)]/10 px-4 py-3 font-medium text-[var(--color-danger)]" style={T.body}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-6 w-full rounded-full bg-[var(--color-bright-blue)] py-4 font-display text-sm font-extrabold uppercase tracking-wider text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
              >
                {busy ? "Sending…" : "Request a visit →"}
              </button>
            </>
          )}
        </form>
      </div>

      {/* bottom wave — lives here so the blue section closes itself even when
          the testimonials section below renders nothing. */}
      <svg
        viewBox="0 0 1440 60"
        className="absolute -bottom-px left-0 right-0 h-10 w-full rotate-180 text-[var(--color-off-white)]"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 0 H1440 V30 Q 1080 60 720 30 T 0 30 Z" fill="currentColor" />
      </svg>
    </section>
  );
}

function Field({
  label, type = "text", placeholder, value, onChange, required = false, autoComplete,
}: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; required?: boolean; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[var(--color-deep-blue)]" style={T.label}>
        {label}{required && <span aria-hidden className="text-[var(--color-danger)]"> *</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[var(--color-deep-blue)]/15 bg-[var(--color-off-white)] px-4 py-3 text-[var(--color-ink)] focus:border-[var(--color-bright-blue)] focus:outline-none" style={T.body}
      />
    </label>
  );
}

// ---------- What parents say ----------

function WhatParentsSay() {
  const { data: testimonials } = useSuspenseQuery(testimonialsQuery);

  // design/README.md + AGENTS.md: never render invented or placeholder quotes.
  // Real published rows for this school only, and nothing at all when there
  // are none. The blue section above closes itself with its own bottom wave,
  // so this section can disappear without leaving a seam.
  const quotes: TestimonialItem[] = testimonials.filter(
    (t) => t.school_slug === "nursery-primary" || t.school_slug === null,
  );
  if (quotes.length === 0) return null;

  return (
    <section className="relative bg-[var(--color-off-white)] pt-20">
      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10">
        <p className="text-center text-[var(--color-bright-blue)]" style={T.label}>
          From our families
        </p>
        <h2 className="mt-2 text-center font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
          What <span className="text-[var(--color-bright-blue)]">parents</span> say
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {quotes.map((q, i) => (
            <article
              key={q.id}
              className="rounded-3xl bg-white p-7 shadow-[0_10px_30px_-12px_rgba(12,68,124,0.15)]"
            >
              <span className="font-display text-3xl leading-none text-[var(--color-bright-blue)]">&ldquo;</span>
              <p className="mt-4 text-[var(--color-ink)]/85" style={T.body}>{q.quote}</p>
              <div className="mt-6 flex items-center gap-3">
                {q.photo_url ? (
                  <img
                    src={q.photo_url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <StripePanel tone={i % 2 === 1 ? "gold" : "blue"} label="" className="h-11 w-11 rounded-full" />
                )}
                <div>
                  <p className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>{q.author_name}</p>
                  {q.relationship && (
                    <p className="text-[var(--color-ink)]/65" style={T.label}>{q.relationship}</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- A peek inside (gallery) ----------

function PeekInside() {
  return (
    <section className="bg-[var(--color-off-white)] py-[var(--space-section-y)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[var(--color-bright-blue)]" style={T.label}>
              Around the campus
            </p>
            <h2 className="mt-2 font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
              A peek <span className="text-[var(--color-bright-blue)]">inside</span>
            </h2>
          </div>
          <Link
            to="/gallery"
            className="inline-flex min-h-[var(--btn-primary-min-h)] items-center rounded-[var(--radius-pill)] border border-[var(--color-deep-blue)]/15 bg-[var(--color-surface)] px-5 text-[var(--color-bright-blue)] shadow-sm transition-colors duration-150 hover:bg-[var(--color-bright-blue)]/5 active:scale-[0.97] motion-reduce:transition-none" style={{ ...T.body, fontWeight: "var(--btn-primary-weight)" }}
          >
            See the full gallery →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3 md:grid-rows-2">
          <GalleryTile src={photoBallPit.url} caption="Play & discovery" className="md:col-span-1 md:row-span-2 h-72 md:h-full" />
          <GalleryTile src={photoShapesClass.url} caption="Learning shapes" className="h-44" />
          <GalleryTile src={photoToyCar.url} caption="Little drivers" className="h-44" />
          <GalleryTile src={photoPlayground.url} caption="Outdoor adventures" className="md:col-span-2 h-44" />
          <GalleryTile src={photoSpeakersTeam.url} caption="Junior Speakers team" className="h-40" />
          <GalleryTile src={photoSpeakersGroup.url} caption="Speakers Challenge 2025" className="h-40" />
          <GalleryTile src={photoTeacher.url} caption="One-on-one learning" className="h-44" />
          <GalleryTile src={photoTelescope.url} caption="Curious minds" className="h-44" />
          <GalleryTile src={photoTeam.url} caption="Sports & teamwork" className="md:col-span-2 h-44" />
          <GalleryTile src={photoMusicalChairs.url} caption="Active play" className="h-40" />
          <GalleryTile src={photoDance.url} caption="Culture & dance" className="h-40" />
        </div>

        {/* Come and meet us ribbon */}
        <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-3xl bg-[var(--color-gold)] px-8 py-8 sm:flex-row sm:items-center sm:px-10">
          <div>
            <h3 className="font-display text-3xl font-extrabold text-[var(--color-deep-blue)]">
              Come and meet us.
            </h3>
            <p className="mt-2 text-[var(--color-deep-blue)]/85" style={T.body}>
              Tours run most mornings — bring your little one along.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex min-h-[var(--btn-primary-min-h)] items-center rounded-[var(--radius-pill)] bg-[var(--color-deep-blue)] px-7 text-white shadow-md transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] motion-reduce:transition-none" style={{ ...T.body, fontWeight: "var(--btn-primary-weight)" }}
          >
            Book a tour →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ComeMeetUs() {
  return null;
}

function GalleryTile({ src, caption, className = "" }: { src: string; caption: string; className?: string }) {
  return (
    <figure className={`group relative overflow-hidden rounded-2xl shadow-md ring-1 ring-[var(--color-deep-blue)]/10 ${className}`}>
      <img src={src} alt={caption} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 text-xs font-semibold uppercase tracking-wider text-white">
        {caption}
      </figcaption>
    </figure>
  );
}

