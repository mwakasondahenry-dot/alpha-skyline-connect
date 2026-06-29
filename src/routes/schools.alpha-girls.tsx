import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSchoolBundle, type SchoolBundle } from "@/lib/alpha-content.functions";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import girlsHero from "@/assets/school-alpha-girls.jpg.asset.json";
import girlUniform from "@/assets/alpha-girl-uniform.png.asset.json";
import campusGirls from "@/assets/campus-girls.jpg.asset.json";
import campusHigh from "@/assets/campus-high.jpg.asset.json";
import campusNursery from "@/assets/campus-nursery.jpg.asset.json";
import aviation from "@/assets/aviation-uniform.jpg.asset.json";

const slug = "alpha-girls" as const;
const ACCENT = "#3C3489";
const GOLD = "#E8A020";
const SOFT = "#F4F2FB";

const bundleQuery = queryOptions({
  queryKey: ["school-bundle", slug],
  queryFn: () => getSchoolBundle({ data: { slug } }),
});

export const Route = createFileRoute("/schools/alpha-girls")({
  head: () => ({
    meta: [
      { title: "Alpha Girls · Alpha Schools" },
      {
        name: "description",
        content:
          "Alpha Girls High School, Kunduchi — Form 1–6 for girls. The same rigour, aviation and coding as the flagship, on a campus built for girls to lead.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(bundleQuery),
  component: AlphaGirlsRoute,
});

function AlphaGirlsRoute() {
  const { data } = useSuspenseQuery(bundleQuery);
  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <SiteHeader />
      <Hero />
      <About />
      <Academics />
      <Distinctive />
      <BeyondClassroom />
      <LifeAtKunduchi />
      <Staff staff={data.staff} />
      <ApplyBanner />
      <GirlsFooter />
      <MotionStyles />
    </div>
  );
}

/* ----------------- Hero ----------------- */

function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden ag-hero"
      style={{
        background: `linear-gradient(135deg, ${SOFT} 0%, #E8E3F7 45%, #D7CEF0 100%)`,
      }}
    >
      {/* drifting violet/gold blooms */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full opacity-40 blur-3xl ag-bloom-a"
        style={{ background: ACCENT }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-[22rem] w-[22rem] rounded-full opacity-30 blur-3xl ag-bloom-b"
        style={{ background: GOLD }}
      />

      <div className="relative mx-auto grid max-w-7xl items-end gap-10 px-6 pt-14 pb-0 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:px-10 lg:pt-24">
        <Reveal direction="up" className="max-w-2xl pb-12 lg:pb-20">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur"
            style={{ borderColor: `${ACCENT}33`, background: "#ffffffaa", color: ACCENT }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />
            Girls Only · Form 1–6 · Kunduchi Campus
          </span>
          <h1
            className="mt-6 font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: ACCENT }}
          >
            Built for girls who <span style={{ color: GOLD }}>mean to lead.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-ink)]/80 sm:text-lg">
            The same rigour, the same aviation and coding, the same path to top results — on a campus designed for girls to take up every inch of space.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/admission"
              className="inline-flex items-center rounded-md px-5 py-3 text-sm font-semibold text-[#1a1a18] shadow-md transition-transform hover:scale-[1.03]"
              style={{ background: GOLD }}
            >
              Enroll Now →
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md border-2 px-5 py-3 text-sm font-semibold transition hover:bg-white"
              style={{ borderColor: ACCENT, color: ACCENT, background: "#ffffffaa" }}
            >
              Book a Visit
            </Link>
          </div>
        </Reveal>

        <Reveal
          direction="right"
          className="relative mx-auto flex w-full max-w-md items-end justify-center self-end lg:max-w-none"
        >
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at center, rgba(60,52,137,0.55), rgba(60,52,137,0.12) 55%, transparent 75%)",
            }}
          />
          <img
            src={girlsHero.url}
            alt="Alpha Girls students on campus"
            className="relative z-10 h-auto w-full max-w-[28rem] rounded-t-[3rem] object-cover shadow-2xl"
            style={{ aspectRatio: "4/5", objectFit: "cover" }}
            loading="eager"
            decoding="async"
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------- About ----------------- */

function About() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-[1.3fr_1fr]">
          <Reveal direction="left">
            <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
              About Alpha Girls
            </p>
            <h2
              className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl"
              style={{ color: ACCENT }}
            >
              Excellence, <span style={{ color: GOLD }}>no exceptions.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--color-ink)]/80">
              Alpha Girls High School (Kunduchi) gives girls the same ambitious education as the flagship — academic rigour, aviation, coding, and leadership — in an environment built for them to thrive and lead.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-ink)]/80">
              Founded on the same Alpha vision: enabling students to achieve their best intellectually and physically, and become responsible, self-directed citizens of a dynamic society.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-5">
              <Stat value="Form 1–6" label="O & A-Level" />
              <Stat value="11" label="A-Level combos" />
              <Stat value="100%" label="Girls leadership" />
            </div>
          </Reveal>

          <Reveal direction="right">
            <div
              className="relative overflow-hidden rounded-2xl p-7 text-white shadow-xl"
              style={{ background: ACCENT }}
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-2xl"
                style={{ background: GOLD }}
              />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
                Our Promise
              </p>
              <h3 className="mt-2 font-display text-xl font-bold">
                Every seat at the table is theirs.
              </h3>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/90">
                {[
                  "Same syllabus, same labs, same expectations as Alpha High.",
                  "Aviation and coding built into the timetable — not optional extras.",
                  "Leadership practised daily — house, prefect and club roles led by girls.",
                  "A campus where every voice is the loudest one in the room.",
                ].map((m) => (
                  <li key={m} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: GOLD }}
                    />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-[var(--color-off-white)] p-4 ring-1 ring-black/5">
      <div
        className="font-display text-2xl font-black leading-none"
        style={{ color: ACCENT }}
      >
        {value}
      </div>
      <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink)]/60">
        {label}
      </div>
    </div>
  );
}

/* ----------------- Academics ----------------- */

const O_LEVEL = [
  { name: "Science", items: "Physics, Chemistry, Biology, Basic Maths" },
  { name: "Arts", items: "History, Geography, English, Civics, Kiswahili" },
  { name: "Business", items: "Book-Keeping, Commerce" },
  { name: "Optional", items: "Additional Maths, Literature in English, French, ICS" },
];

const A_COMBOS = [
  { code: "PCM", subjects: "Physics · Chemistry · Mathematics" },
  { code: "PCB", subjects: "Physics · Chemistry · Biology" },
  { code: "PGM", subjects: "Physics · Geography · Mathematics" },
  { code: "PMC", subjects: "Physics · Mathematics · Computer Science" },
  { code: "CBG", subjects: "Chemistry · Biology · Geography" },
  { code: "HGL", subjects: "History · Geography · Language" },
  { code: "HKL", subjects: "History · Kiswahili · Language" },
  { code: "KLF", subjects: "Kiswahili · Language · French" },
  { code: "EGM", subjects: "Economics · Geography · Mathematics" },
  { code: "ECA", subjects: "Economics · Commerce · Accountancy" },
  { code: "HGE", subjects: "History · Geography · Economics" },
];

function Academics() {
  return (
    <section style={{ background: SOFT }}>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal direction="up" className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
            Academics
          </p>
          <h2
            className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl"
            style={{ color: ACCENT }}
          >
            The full national curriculum, taught deep.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--color-ink)]/75">
            Modern science labs, computer literacy for every student, and computer studies as an examined subject. The national curriculum, taken all the way to <strong>CSEE</strong> (O-Level) and <strong>ACSEE</strong> (A-Level).
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Reveal direction="left">
            <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
              <div className="flex items-baseline gap-3">
                <h3 className="font-display text-xl font-bold" style={{ color: ACCENT }}>
                  O-Level subjects
                </h3>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink)]/55">
                  Form 1–4 · CSEE
                </span>
              </div>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {O_LEVEL.map((g) => (
                  <li
                    key={g.name}
                    className="rounded-xl bg-[var(--color-off-white)] p-4 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: GOLD }}
                    >
                      {g.name}
                    </div>
                    <div className="mt-1.5 text-sm text-[var(--color-ink)]/80">{g.items}</div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal direction="right">
            <div
              className="group relative h-full overflow-hidden rounded-2xl p-7 text-white shadow-xl"
              style={{ background: ACCENT }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-3xl transition-opacity duration-700 group-hover:opacity-60"
                style={{ background: GOLD }}
              />
              <div className="relative flex items-baseline gap-3">
                <h3 className="font-display text-xl font-bold text-white">A-Level combinations</h3>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                  Form 5–6 · ACSEE
                </span>
              </div>
              <p className="relative mt-3 text-sm text-white/90">
                All <span className="font-bold text-white">11</span> combinations on offer — hover a code to see its subjects.
              </p>
              <div className="relative mt-5 flex flex-wrap gap-2.5">
                {A_COMBOS.map((c, i) => (
                  <span
                    key={c.code}
                    title={c.subjects}
                    style={{
                      animation: `agComboIn 480ms ${i * 55}ms cubic-bezier(.2,.8,.2,1) both`,
                    }}
                    className="group/chip relative cursor-default rounded-lg border border-white/25 bg-white/10 px-3.5 py-1.5 font-mono text-sm font-bold tracking-wider text-white shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:border-[var(--ag-gold)] hover:bg-white hover:text-[#3C3489] hover:shadow-[0_8px_20px_-6px_rgba(232,160,32,0.7)]"
                  >
                    {c.code}
                    <span className="pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-[var(--ag-gold)] transition-all duration-300 group-hover/chip:w-3/4" />
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ----------------- Distinctive ----------------- */

function Distinctive() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <Reveal direction="up" className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
            Distinctive at Alpha Girls
          </p>
          <h2 className="mt-2 font-display text-2xl font-black sm:text-3xl" style={{ color: ACCENT }}>
            Two programmes that change the trajectory.
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <SignpostCard
            eyebrow="Aviation"
            title="Yes, girls fly here."
            body="The first school in Tanzania to teach flying — girls train toward a PPL alongside everyone else."
            href="/aviation"
            cta="Inside the aviation programme"
          />
          <SignpostCard
            eyebrow="Coding & digital skills"
            title="Real programming, from the classroom."
            body="Computer literacy for every student, with coding pathways that take serious learners much further."
            href="/coding"
            cta="See the curriculum"
          />
        </div>
      </div>
    </section>
  );
}

function SignpostCard({
  eyebrow,
  title,
  body,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: "/aviation" | "/coding";
  cta: string;
}) {
  return (
    <Reveal direction="up">
      <article className="group relative h-full overflow-hidden rounded-2xl bg-[var(--color-off-white)] p-7 ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
        <div
          aria-hidden
          className="absolute right-0 top-0 h-1 w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
          style={{ background: GOLD }}
        />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
          {eyebrow}
        </p>
        <h3 className="mt-2 font-display text-xl font-bold" style={{ color: ACCENT }}>
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]/75">{body}</p>
        <Link
          to={href}
          className="mt-5 inline-flex items-center gap-1 text-sm font-bold transition-transform group-hover:translate-x-1"
          style={{ color: ACCENT }}
        >
          {cta} →
        </Link>
      </article>
    </Reveal>
  );
}

/* ----------------- Beyond classroom ----------------- */

const CLUBS = [
  "News Bulletin",
  "Aviation",
  "Art & Drawing",
  "UN",
  "Drama",
  "Music & Dance",
  "Music & Singing",
  "Debate",
  "Modeling",
  "Cookery",
  "Environment",
  "Scout",
  "Public Speaking",
];
const SPORTS = ["Football", "Basketball", "Volleyball", "Netball", "Athletics"];

function BeyondClassroom() {
  return (
    <section style={{ background: SOFT }}>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal direction="up" className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
            Beyond the classroom
          </p>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl" style={{ color: ACCENT }}>
            The other half of an Alpha education.
          </h2>
        </Reveal>

        <Reveal direction="up" className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h3 className="font-display text-xl font-black" style={{ color: ACCENT }}>
              Clubs & societies
            </h3>
            <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: GOLD }}>
              {CLUBS.length} student-led clubs
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {CLUBS.map((c, i) => (
              <span
                key={c}
                style={{ animation: `agComboIn 480ms ${i * 40}ms cubic-bezier(.2,.8,.2,1) both` }}
                className="rounded-full border bg-white px-3.5 py-1.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  aria-hidden
                  className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                  style={{ background: GOLD }}
                />
                <span style={{ color: ACCENT }}>{c}</span>
              </span>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal direction="up" delay={80}>
            <div className="h-full rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold" style={{ color: ACCENT }}>
                Sports
              </h3>
              <ul className="mt-4 space-y-2">
                {SPORTS.map((s) => (
                  <li
                    key={s}
                    className="flex items-center gap-3 rounded-lg bg-[var(--color-off-white)] px-4 py-2.5 text-sm font-semibold ring-1 ring-black/5"
                    style={{ color: ACCENT }}
                  >
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: GOLD }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal direction="up" delay={160}>
            <div
              className="relative h-full overflow-hidden rounded-2xl p-7 text-white shadow-xl"
              style={{ background: ACCENT }}
            >
              <div
                aria-hidden
                className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full opacity-30 blur-2xl"
                style={{ background: GOLD }}
              />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
                Counselling
              </p>
              <h3 className="mt-2 font-display text-xl font-bold">
                A confidential ear, always available.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/85">
                Alpha Girls runs a confidential counselling department, accessible to every student — professional, private, and built into school life.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ----------------- Life at Kunduchi ----------------- */

const FACILITIES = [
  { label: "Science labs", img: campusHigh.url },
  { label: "Library", img: campusNursery.url },
  { label: "Sports field", img: campusGirls.url },
  { label: "Boarding", img: aviation.url },
];

function LifeAtKunduchi() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal direction="up" className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
              Campus
            </p>
            <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl" style={{ color: ACCENT }}>
              Life at Kunduchi.
            </h2>
          </div>
          <Link to="/facilities" className="text-sm font-bold hover:underline" style={{ color: ACCENT }}>
            See facilities →
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FACILITIES.map((f, i) => (
            <Reveal key={f.label} direction="up" delay={i * 70}>
              <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                <img
                  src={f.img}
                  alt={f.label}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
                    Facility
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-white">{f.label}</h3>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------- Staff ----------------- */

function Staff({ staff }: { staff: SchoolBundle["staff"] }) {
  if (staff.length === 0) return null;
  return (
    <section style={{ background: SOFT }}>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal direction="up" className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
            Leadership & teaching
          </p>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl" style={{ color: ACCENT }}>
            The women and men behind the climb.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {staff.map((p) => (
            <Reveal key={p.id} direction="up">
              <article className="group h-full overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden">
                  {p.photo_url ? (
                    <img
                      src={p.photo_url}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="absolute inset-0 grid place-items-center"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, #6549C8)` }}
                    >
                      <span className="font-display text-6xl font-black text-white/30">
                        {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: GOLD }} />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-bold" style={{ color: ACCENT }}>
                    {p.name}
                  </h3>
                  {p.title && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]/60">
                      {p.title}
                    </p>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------- Apply banner ----------------- */

function ApplyBanner() {
  return (
    <section style={{ background: GOLD }}>
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-6 py-12 sm:flex-row sm:items-center lg:px-10">
        <Reveal direction="left">
          <h2 className="font-display text-2xl font-black sm:text-3xl" style={{ color: ACCENT }}>
            Applications for the next intake are open.
          </h2>
          <p className="mt-2 max-w-xl text-sm font-semibold text-[#1a1a18]/80">
            Visit Kunduchi, sit the assessment, claim your place.
          </p>
        </Reveal>
        <Reveal direction="right" className="flex flex-wrap gap-3">
          <Link
            to="/admission"
            className="inline-flex items-center rounded-md px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.03]"
            style={{ background: ACCENT }}
          >
            Enroll Now →
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center rounded-md border-2 px-6 py-3 text-sm font-bold transition hover:bg-white/40"
            style={{ borderColor: ACCENT, color: ACCENT }}
          >
            Book a Visit
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------- Footer ----------------- */

function GirlsFooter() {
  return (
    <>
      <div
        className="py-5 text-center text-xs font-bold uppercase tracking-[0.22em] text-white/85"
        style={{ background: ACCENT }}
      >
        ALPHA SCHOOLS · <span style={{ color: GOLD }}>Alpha Girls</span>
        <div className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-white/60">
          Kunduchi campus · Dar es Salaam · part of Alpha Education Centre Limited
        </div>
      </div>
      <SchoolFacilitiesSection slug="alpha-girls" accent="#3C3489" />
      <SiteFooter />
    </>
  );
}

/* ----------------- Motion styles ----------------- */

function MotionStyles() {
  return (
    <style>{`
      :root { --ag-gold: ${GOLD}; }
      @keyframes agComboIn {
        0% { opacity: 0; transform: translateY(8px) scale(.92); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @media (prefers-reduced-motion: no-preference) {
        @keyframes agDriftA {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(20px, -10px, 0) scale(1.05); }
        }
        @keyframes agDriftB {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-25px, 12px, 0) scale(1.08); }
        }
        .ag-bloom-a { animation: agDriftA 14s ease-in-out infinite; }
        .ag-bloom-b { animation: agDriftB 18s ease-in-out infinite; }
        .ag-hero { background-size: 200% 200%; animation: agHeroShift 22s ease-in-out infinite; }
        @keyframes agHeroShift {
          0%,100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
      }
    `}</style>
  );
}
