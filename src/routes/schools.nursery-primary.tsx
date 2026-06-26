import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import alphaLogo from "@/assets/alpha-logo.png.asset.json";
import girlCutout from "@/assets/alpha-girl-uniform.png.asset.json";
import photoDance from "@/assets/np-traditional-dance.jpg.asset.json";
import photoMusicalChairs from "@/assets/np-musical-chairs.jpg.asset.json";
import photoBallPit from "@/assets/np-ball-pit.jpg.asset.json";
import photoTelescope from "@/assets/np-telescope.jpg.asset.json";
import photoTeacher from "@/assets/np-teacher-pupils.jpg.asset.json";
import photoTeam from "@/assets/np-team-thumbs.jpg.asset.json";
import photoGirlPortrait from "@/assets/np-girl-portrait.jpg.asset.json";
import photoHippoRide from "@/assets/np-hippo-ride.jpg.asset.json";

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
  component: NurseryPrimaryPage,
});

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
    blue: { bg: "#2f8fcd", stripe: "rgba(255,255,255,0.16)" },
    "blue-dark": { bg: "#0e4977", stripe: "rgba(255,255,255,0.12)" },
    "blue-light": { bg: "#6fb4e0", stripe: "rgba(255,255,255,0.22)" },
    gold: { bg: "#e8a020", stripe: "rgba(255,255,255,0.22)" },
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
    <div className="min-h-screen bg-[#f7f5ef] text-[var(--color-ink)]">
      <NurseryHeader />
      <Hero />
      <WhatWeOffer />
      <AlphaChild />
      <WhatTheyExplore />
      <LetsGetStarted />
      <WhatParentsSay />
      <PeekInside />
      <ComeMeetUs />
      <NurseryFooter />
    </div>
  );
}

// ---------- Header (light, school-specific) ----------

function NurseryHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-10">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90">
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <img src={alphaLogo.url} alt="Alpha Schools" className="h-10 w-10 object-contain" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-extrabold tracking-wide text-[var(--color-deep-blue)]">
              ALPHA <span className="font-medium text-[var(--color-deep-blue)]/55">SCHOOLS</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-bright-blue)]">
              Nursery &amp; Primary
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {[
            { label: "Our days", href: "#our-days" },
            { label: "Early years", href: "#early-years" },
            { label: "Primary", href: "#primary" },
            { label: "Admission", href: "#admission" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[var(--color-deep-blue)]/80 hover:text-[var(--color-deep-blue)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <Link
          to="/admission"
          className="rounded-full bg-[var(--color-bright-blue)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          Enroll Now
        </Link>
      </div>
    </header>
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
          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-ink)]/75">
            Play-led early years that grow into a warm, structured primary — the
            joyful first chapter of your child's Alpha journey.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/admission"
              className="rounded-full bg-[var(--color-bright-blue)] px-7 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02]"
            >
              Enroll Now
            </Link>
            <Link
              to="/contact"
              className="rounded-full border-2 border-[var(--color-gold)] bg-white px-7 py-3 text-sm font-semibold text-[var(--color-gold)] hover:bg-[var(--color-gold)]/5"
            >
              Book a Visit
            </Link>
          </div>
          <p className="mt-10 font-display text-2xl font-extrabold text-[var(--color-deep-blue)]">
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
            className="absolute right-2 top-2 w-[64%] rotate-[2deg] rounded-2xl bg-[#cdb8e6] p-2 shadow-xl"
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
                src={photoTeam.url}
                alt="Pupils waving"
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
        className="block h-10 w-full text-[#f7f5ef]"
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
      age: "AGE 2 – 5 · EARLY YEARS",
      title: "Nursery",
      body:
        "Learning through play, songs and stories — building confidence, language and friendships in a calm, joyful space.",
      bg: "white",
      ageColor: "var(--color-gold)",
      titleColor: "var(--color-deep-blue)",
      bodyColor: "var(--color-ink)",
      arrowBg: "#e6f1fb",
      arrowColor: "var(--color-bright-blue)",
    },
    {
      tone: "blue-dark" as const,
      label: "IMG · PRIMARY CLASS",
      age: "AGE 6 – 12 · PRIMARY",
      title: "Primary School",
      body:
        "A structured, ambitious curriculum — strong literacy and numeracy, plus coding from the very start and a head full of questions.",
      bg: "var(--color-brand-blue)",
      ageColor: "rgba(255,255,255,0.85)",
      titleColor: "#ffffff",
      bodyColor: "rgba(255,255,255,0.9)",
      arrowBg: "var(--color-gold)",
      arrowColor: "var(--color-deep-blue)",
    },
    {
      tone: "gold" as const,
      label: "IMG · CLUBS & SPORT",
      age: "EVERY AFTERNOON · ENRICHMENT",
      title: "Clubs & Enrichment",
      body:
        "Coding club, art, music and sport — room to discover what they love and the confidence to try something new.",
      bg: "white",
      ageColor: "var(--color-gold)",
      titleColor: "var(--color-deep-blue)",
      bodyColor: "var(--color-ink)",
      arrowBg: "#fbeed1",
      arrowColor: "var(--color-gold)",
    },
  ];

  return (
    <section id="our-days" className="bg-[#f7f5ef] pb-20 pt-6">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-bright-blue)]">
          From first steps to big school
        </p>
        <h2 className="mt-2 text-center font-display text-4xl font-black tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
          What we <span className="text-[var(--color-gold)]">offer</span>
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.title}
              className="overflow-hidden rounded-3xl p-4 shadow-[0_10px_30px_-12px_rgba(12,68,124,0.18)] transition-transform duration-500 hover:-translate-y-1"
              style={{ background: c.bg }}
            >
              <StripePanel tone={c.tone} label={c.label} className="h-40 sm:h-48" />
              <div className="px-3 pb-4 pt-6">
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
    { icon: "?", color: "#dc2626", title: "Curious & full of questions", body: "Wondering out loud is encouraged." },
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
        <p className="mt-1 text-sm text-[var(--color-ink)]/70">{body}</p>
      </div>
    </div>
  );

  return (
    <section id="early-years" className="relative overflow-hidden bg-[#e8f1fb] py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-bright-blue)]">
          The Alpha child
        </p>
        <h2 className="mt-2 text-center font-display text-4xl font-black tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
          What makes a young Alpha{" "}
          <span className="text-[var(--color-gold)]">learner?</span>
        </h2>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-8">
            {left.map((i) => (
              <Item key={i.title} {...i} align="right" />
            ))}
          </div>

          {/* Center portrait with striped circle backdrop + gold ground bar */}
          <div className="relative mx-auto">
            <StripePanel tone="blue" label="" className="h-72 w-72 rounded-full" />
            <img
              src={girlCutout.url}
              alt="Alpha pupil"
              className="absolute inset-0 mx-auto h-[22rem] w-auto -translate-y-6 object-contain"
              style={{ left: "50%", transform: "translate(-50%, -1.5rem)" }}
            />
            <div className="absolute -bottom-4 left-1/2 h-5 w-56 -translate-x-1/2 rounded-full bg-[var(--color-gold)] shadow-md" />
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
    { name: "Reading", bg: "#e0ecfb", icon: "📖" },
    { name: "Writing", bg: "#fbeed1", icon: "✏️" },
    { name: "Numeracy", bg: "#dbeafe", icon: "🔢" },
    { name: "Science", bg: "#e7e3f7", icon: "🔬" },
    { name: "Coding", bg: "#e7e3f7", icon: "💻" },
    { name: "Music", bg: "#fbeed1", icon: "🎵" },
    { name: "Art & craft", bg: "#fbe1d4", icon: "🎨" },
    { name: "Play & sport", bg: "#e0ecfb", icon: "⚽" },
  ];

  return (
    <section id="primary" className="bg-[#f7f5ef] py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-bright-blue)]">
          A rich, busy week
        </p>
        <h2 className="mt-2 text-center font-display text-4xl font-black tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
          What they'll <span className="text-[var(--color-gold)]">explore</span>
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
          {subjects.map((s) => (
            <div
              key={s.name}
              className="group flex flex-col items-center justify-center rounded-2xl px-6 py-8 transition-transform duration-300 hover:-translate-y-1"
              style={{ background: s.bg }}
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-sm">
                {s.icon}
              </div>
              <p className="mt-5 font-display text-base font-extrabold text-[var(--color-deep-blue)]">
                {s.name}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/about"
            className="rounded-full bg-[var(--color-bright-blue)] px-7 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02]"
          >
            View the full curriculum →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------- Let's get started ----------

function LetsGetStarted() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <section id="admission" className="relative bg-[var(--color-bright-blue)] py-20">
      {/* top wave */}
      <svg
        viewBox="0 0 1440 60"
        className="absolute -top-px left-0 right-0 h-10 w-full text-[#f7f5ef]"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 0 H1440 V30 Q 1080 60 720 30 T 0 30 Z" fill="currentColor" />
      </svg>

      <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
        <h2 className="font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
          Let's <span className="text-[var(--color-gold)]">get</span> started
        </h2>
        <p className="mt-3 text-white/85">
          Tell us a little about your child and we'll arrange a visit to the campus.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="mt-10 rounded-3xl bg-white p-6 text-left shadow-2xl sm:p-8"
        >
          {submitted ? (
            <p className="py-10 text-center font-display text-xl font-extrabold text-[var(--color-deep-blue)]">
              Thank you — we'll be in touch within one working day. ✨
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Parent name" placeholder="Your full name" />
                <Field label="Email" type="email" placeholder="you@example.com" />
                <Field label="Phone" placeholder="+255 ..." />
                <Field label="Child's age" placeholder="e.g. 4" />
              </div>
              <div className="mt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-deep-blue)]">
                  A note for us (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Anything you'd like us to know"
                  className="mt-2 w-full rounded-xl border border-[var(--color-deep-blue)]/15 bg-[#f7f5ef] px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-bright-blue)] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="mt-6 w-full rounded-full bg-[var(--color-bright-blue)] py-4 font-display text-sm font-extrabold uppercase tracking-wider text-white shadow-md transition-transform hover:scale-[1.01]"
              >
                Request a visit →
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

function Field({ label, type = "text", placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-deep-blue)]">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[var(--color-deep-blue)]/15 bg-[#f7f5ef] px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-bright-blue)] focus:outline-none"
      />
    </label>
  );
}

// ---------- What parents say ----------

function WhatParentsSay() {
  const quotes = [
    {
      q: "She runs to the gate every morning. She's reading already and so proud of herself — we couldn't have asked for a warmer start.",
      name: "Neema P.",
      role: "Parent · Year 1",
      avatarTone: "blue" as const,
    },
    {
      q: "The teachers actually know my son. He's curious, confident and never stops talking about the coding club.",
      name: "Hamisi M.",
      role: "Parent · Nursery",
      avatarTone: "gold" as const,
    },
    {
      q: "One calm, warm campus from nursery up. We never had to worry about the jump to primary — it just happened.",
      name: "Sarah K.",
      role: "Parent of two",
      avatarTone: "blue" as const,
    },
  ];

  return (
    <section className="relative bg-[#f7f5ef] pt-20">
      {/* top wave coming out of blue section */}
      <svg
        viewBox="0 0 1440 60"
        className="absolute -top-px left-0 right-0 h-10 w-full text-[var(--color-bright-blue)]"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 30 Q 360 0 720 30 T 1440 30 V0 H0 Z" fill="currentColor" />
      </svg>

      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-bright-blue)]">
          From our families
        </p>
        <h2 className="mt-2 text-center font-display text-4xl font-black tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
          What <span className="text-[var(--color-gold)]">parents</span> say
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {quotes.map((q) => (
            <article
              key={q.name}
              className="rounded-3xl bg-white p-7 shadow-[0_10px_30px_-12px_rgba(12,68,124,0.15)]"
            >
              <span className="font-display text-3xl leading-none text-[var(--color-bright-blue)]">“</span>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink)]/85">{q.q}</p>
              <div className="mt-6 flex items-center gap-3">
                <StripePanel tone={q.avatarTone === "gold" ? "gold" : "blue"} label="" className="h-11 w-11 rounded-full" />
                <div>
                  <p className="font-display text-sm font-extrabold text-[var(--color-deep-blue)]">{q.name}</p>
                  <p className="text-xs text-[var(--color-ink)]/65">{q.role}</p>
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
    <section className="bg-[#f7f5ef] py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-bright-blue)]">
              Around the campus
            </p>
            <h2 className="mt-2 font-display text-4xl font-black tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
              A peek <span className="text-[var(--color-gold)]">inside</span>
            </h2>
          </div>
          <Link
            to="/gallery"
            className="rounded-full border border-[var(--color-deep-blue)]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-bright-blue)] shadow-sm hover:bg-[var(--color-bright-blue)]/5"
          >
            See the full gallery →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3 md:grid-rows-2">
          <GalleryTile src={photoBallPit.url} caption="Play & discovery" className="md:col-span-1 md:row-span-2 h-72 md:h-full" />
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
            <p className="mt-2 text-sm text-[var(--color-deep-blue)]/85">
              Tours run most mornings — bring your little one along.
            </p>
          </div>
          <Link
            to="/contact"
            className="rounded-full bg-[var(--color-deep-blue)] px-7 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02]"
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
      <img src={src} alt={caption} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 text-xs font-semibold uppercase tracking-wider text-white">
        {caption}
      </figcaption>
    </figure>
  );
}

// ---------- Footer ----------

function NurseryFooter() {
  return (
    <footer className="relative bg-[var(--color-deep-blue)] text-white/85">
      <svg
        viewBox="0 0 1440 60"
        className="absolute -top-px left-0 right-0 h-10 w-full text-[#f7f5ef]"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 0 H1440 V30 Q 1080 60 720 30 T 0 30 Z" fill="currentColor" />
      </svg>
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 pt-16 sm:flex-row sm:items-center lg:px-10">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white">
            <img src={alphaLogo.url} alt="Alpha Schools" className="h-10 w-10 object-contain" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-extrabold tracking-wide text-white">
              ALPHA <span className="font-medium text-white/70">SCHOOLS</span>
              <span className="px-2 text-white/40">·</span>
              <span className="font-extrabold text-[var(--color-gold)]">Nursery &amp; Primary</span>
            </span>
          </span>
        </Link>
        <p className="text-sm text-white/70">
          Combined campus · Dar es Salaam · part of Alpha Education Centre Limited
        </p>
      </div>
    </footer>
  );
}
