import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSchoolBundle, type SchoolBundle } from "@/lib/alpha-content.functions";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import graduate from "@/assets/alpha-high-graduate.png.asset.json";
import campusAerial from "@/assets/alpha-high-campus-aerial.jpg.asset.json";
import campusHigh from "@/assets/campus-high.jpg.asset.json";
import campusGirls from "@/assets/campus-girls.jpg.asset.json";
import campusNursery from "@/assets/campus-nursery.jpg.asset.json";
import aviation from "@/assets/aviation-uniform.jpg.asset.json";
import clubAviation from "@/assets/club-aviation.jpg.asset.json";
import clubDrama from "@/assets/club-drama.jpg.asset.json";
import clubMusic from "@/assets/club-music-dance.jpg.asset.json";
import clubDebate from "@/assets/club-debate.jpg.asset.json";
import clubArt from "@/assets/club-art.jpg.asset.json";
import clubCookery from "@/assets/club-cookery.jpg.asset.json";
import clubScout from "@/assets/club-scout.jpg.asset.json";
import clubSpeaking from "@/assets/club-public-speaking.jpg.asset.json";
import clubUn from "@/assets/club-un.jpg.asset.json";
import clubEnvironment from "@/assets/club-environment.jpg.asset.json";

const slug = "alpha-high" as const;
const ACCENT = "#0C447C";
const GOLD = "#E8A020";

const bundleQuery = queryOptions({
  queryKey: ["school-bundle", slug],
  queryFn: () => getSchoolBundle({ data: { slug } }),
});

export const Route = createFileRoute("/schools/alpha-high")({
  head: () => ({
    meta: [
      { title: "Alpha High · Alpha Schools" },
      {
        name: "description",
        content:
          "Alpha High School, Mikocheni — mixed secondary, Form 1–6. The flagship: NECTA rigour with aviation and coding that exist nowhere else in Tanzania.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(bundleQuery),
  component: AlphaHighRoute,
});

function AlphaHighRoute() {
  const { data } = useSuspenseQuery(bundleQuery);
  return <AlphaHighPage bundle={data} />;
}

// ---------- Page ----------

function AlphaHighPage({ bundle }: { bundle: SchoolBundle }) {
  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <SiteHeader />
      <Hero />
      <About />
      <Academics />
      <Distinctive />
      <BeyondClassroom />
      <LifeAtMikocheni />
      <Staff staff={bundle.staff} />
      <ApplyBanner />
      <AlphaHighFooter />
    </div>
  );
}

// ---------- Hero ----------

function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ background: ACCENT }}
    >
      {/* Aerial campus background */}
      <img
        src={campusAerial.url}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-55"
        loading="eager"
        decoding="async"
      />
      {/* Blue fade overlays */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(12,68,124,0.92) 0%, rgba(12,68,124,0.78) 40%, rgba(12,68,124,0.55) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(8,40,80,0.85) 0%, rgba(8,40,80,0) 60%)",
        }}
      />
      {/* decorative blurs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "#1e7fc2" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-[24rem] w-[24rem] rounded-full opacity-25 blur-3xl"
        style={{ background: GOLD }}
      />

      <div className="relative mx-auto grid max-w-7xl items-end gap-10 px-6 pt-14 pb-0 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:px-10 lg:pt-24 lg:pb-0">
        <Reveal direction="up" className="max-w-2xl pb-12 text-white lg:pb-20">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />
            Mixed Secondary · Form 1–6 · Mikocheni Campus
          </span>
          <h1 className="mt-6 font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            The flagship.{" "}
            <span style={{ color: GOLD }}>Built for the long climb.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Dual rigour in academics and aviation, taught hard and taught well — with flying and coding that exist nowhere else in Tanzania.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/admission"
              className="inline-flex items-center rounded-md px-5 py-3 text-sm font-semibold text-[#1a1a18] shadow-md transition-transform hover:scale-[1.03]"
              style={{ background: GOLD }}
            >
              Apply Now →
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Book a Visit
            </Link>
          </div>
        </Reveal>

        <Reveal direction="right" className="relative mx-auto flex w-full max-w-md items-end justify-center self-end lg:max-w-none">
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle at center, rgba(232,160,32,0.65), rgba(232,160,32,0.15) 55%, transparent 75%)",
            }}
          />
          <img
            src={graduate.url}
            alt="Alpha High School Form Four graduate in cap and gown"
            className="relative z-10 mx-auto block h-auto w-full max-w-[28rem] drop-shadow-[0_25px_45px_rgba(232,160,32,0.55)]"
            style={{ filter: "drop-shadow(0 0 60px rgba(232,160,32,0.55)) drop-shadow(0 30px 40px rgba(0,0,0,0.45))" }}
            loading="eager"
            decoding="async"
          />
        </Reveal>

      </div>
    </section>
  );
}

// ---------- About ----------

function About() {
  return (
    <section className="bg-[var(--color-off-white)]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-[1.3fr_1fr]">
          <Reveal direction="left">
            <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
              About Alpha High
            </p>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl" style={{ color: ACCENT }}>
              Excellence through challenge — <span style={{ color: GOLD }}>since 2007.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--color-ink)]/80">
              Established <strong>19 March 2007</strong>, Alpha High was founded to enable students to achieve academic excellence through intellectual and physical challenge, and to become responsible citizens of a dynamic society.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-ink)]/80">
              A nurturing ground for accomplished professionals and leaders — locally and globally.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-5">
              <Stat value="2007" label="Founded" />
              <Stat value="Form 1–6" label="O & A-Level" />
              <Stat value="11" label="A-Level combos" />
            </div>
          </Reveal>

          <Reveal direction="right">
            <div
              className="relative overflow-hidden rounded-2xl p-7 text-white shadow-xl"
              style={{ background: ACCENT }}
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-25 blur-2xl"
                style={{ background: GOLD }}
              />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
                Our Mission
              </p>
              <h3 className="mt-2 font-display text-xl font-bold">
                Education that grows the whole student.
              </h3>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/90">
                {[
                  "A source of intellectual, spiritual and cultural growth.",
                  "Knowledge that meets individual needs.",
                  "Critical and divergent thinking.",
                  "All-rounded students.",
                  "Attitudes that make students social, mobile, interactive, ambitious and self-directed.",
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
    <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
      <div className="font-display text-2xl font-black leading-none" style={{ color: ACCENT }}>
        {value}
      </div>
      <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink)]/60">
        {label}
      </div>
    </div>
  );
}

// ---------- Academics ----------

const O_LEVEL = [
  { name: "Science", items: "Physics, Chemistry, Biology, Basic Maths" },
  { name: "Arts", items: "History, Geography, English, Civics, Kiswahili" },
  { name: "Business", items: "Book-Keeping, Commerce" },
  { name: "Optional", items: "Additional Maths, Literature in English, French, ICS" },
];

const A_COMBOS = ["PCM", "PCB", "PGM", "PMC", "CBG", "HGL", "HKL", "KLF", "EGM", "ECA", "HGE"];

function Academics() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal direction="up" className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
            Academics
          </p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl" style={{ color: ACCENT }}>
            The full national curriculum, taught deep.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--color-ink)]/75">
            Modern science labs, computer literacy for every student, and computer studies as an examined subject. The national curriculum, taken all the way to <strong>CSEE</strong> (O-Level) and <strong>ACSEE</strong> (A-Level).
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Reveal direction="left">
            <div className="rounded-2xl border border-black/5 bg-[var(--color-off-white)] p-7">
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
                    className="rounded-xl bg-white p-4 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: GOLD }}>
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
              className="h-full rounded-2xl p-7 text-white shadow-xl"
              style={{ background: ACCENT }}
            >
              <div className="flex items-baseline gap-3">
                <h3 className="font-display text-xl font-bold">A-Level combinations</h3>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/65">
                  Form 5–6 · ACSEE
                </span>
              </div>
              <p className="mt-3 text-sm text-white/80">All 11 combinations on offer:</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {A_COMBOS.map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-white/10 px-3 py-1.5 font-mono text-sm font-bold tracking-wider ring-1 ring-white/20 transition hover:bg-white/20"
                    style={{ color: GOLD }}
                  >
                    {c}
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

// ---------- Distinctive (signpost cards) ----------

function Distinctive() {
  return (
    <section className="bg-[var(--color-off-white)]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <Reveal direction="up" className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
            Distinctive at Alpha High
          </p>
          <h2 className="mt-2 font-display text-2xl font-black sm:text-3xl" style={{ color: ACCENT }}>
            Two things you'll only find here.
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <SignpostCard
            eyebrow="Aviation"
            title="The first school in Tanzania to teach flying."
            body="Ground school, PPL pathway and simulator training — built into the timetable, not bolted on."
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
      <article
        className="group relative h-full overflow-hidden rounded-2xl bg-white p-7 ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
      >
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

// ---------- Beyond the classroom ----------

const CLUBS = [
  { name: "Aviation", photo: clubAviation.url },
  { name: "Drama", photo: clubDrama.url },
  { name: "Music & Dance", photo: clubMusic.url },
  { name: "Debate", photo: clubDebate.url },
  { name: "Art & Drawing", photo: clubArt.url },
  { name: "Cookery", photo: clubCookery.url },
  { name: "Scout", photo: clubScout.url },
  { name: "Public Speaking", photo: clubSpeaking.url },
  { name: "Model UN", photo: clubUn.url },
  { name: "Environment", photo: clubEnvironment.url },
];
const SPORTS = ["Football", "Basketball", "Volleyball", "Netball", "Athletics"];

function ClubsRibbon() {
  // Duplicate the list so the marquee loops seamlessly.
  const loop = [...CLUBS, ...CLUBS];
  return (
    <Reveal direction="up" className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <h3 className="font-display text-2xl font-black" style={{ color: ACCENT }}>
          Clubs & societies
        </h3>
        <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: GOLD }}>
          {CLUBS.length}+ student-led clubs
        </span>
      </div>

      <div
        className="group relative mt-5 overflow-hidden rounded-2xl border border-black/5 bg-[var(--color-off-white)] py-6"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex w-max gap-5 px-5 animate-[clubsMarquee_38s_linear_infinite] group-hover:[animation-play-state:paused]">
          {loop.map((c, i) => (
            <figure
              key={`${c.name}-${i}`}
              className="relative h-56 w-72 shrink-0 overflow-hidden rounded-xl shadow-md ring-1 ring-black/10 transition-transform duration-500 hover:scale-[1.03] hover:shadow-xl"
            >
              <img
                src={c.photo}
                alt={`${c.name} club at Alpha High`}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                loading="lazy"
                decoding="async"
                width={800}
                height={1024}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(12,68,124,0.85) 0%, rgba(12,68,124,0.15) 45%, transparent 65%)",
                }}
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-4 pb-3 text-white">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />
                <span className="font-display text-sm font-bold tracking-wide">{c.name}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes clubsMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </Reveal>
  );
}

function BeyondClassroom() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal direction="up" className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
            Beyond the classroom
          </p>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl" style={{ color: ACCENT }}>
            The other half of an Alpha education.
          </h2>
        </Reveal>

        <ClubsRibbon />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">


          <Reveal direction="up" delay={80}>
            <div className="h-full rounded-2xl border border-black/5 bg-[var(--color-off-white)] p-6">
              <h3 className="font-display text-lg font-bold" style={{ color: ACCENT }}>Sports</h3>
              <ul className="mt-4 space-y-2">
                {SPORTS.map((s) => (
                  <li
                    key={s}
                    className="flex items-center gap-3 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-black/5"
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
            <div className="relative h-full overflow-hidden rounded-2xl p-7 text-white shadow-xl" style={{ background: ACCENT }}>
              <div aria-hidden className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full opacity-25 blur-2xl" style={{ background: GOLD }} />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
                Counselling
              </p>
              <h3 className="mt-2 font-display text-xl font-bold">A confidential ear, always available.</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/85">
                Alpha High runs a school counselling department, accessible to every student — confidential, professional, and built into school life.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ---------- Life at Mikocheni ----------

const FACILITIES = [
  { label: "Science labs", img: campusHigh.url },
  { label: "Library", img: campusNursery.url },
  { label: "Sports field", img: campusGirls.url },
  { label: "Boarding", img: aviation.url },
];

function LifeAtMikocheni() {
  return (
    <section className="bg-[var(--color-off-white)]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal direction="up" className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
              Campus
            </p>
            <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl" style={{ color: ACCENT }}>
              Life at Mikocheni.
            </h2>
          </div>
          <Link to="/facilities" className="text-sm font-bold hover:underline" style={{ color: ACCENT }}>
            See facilities →
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FACILITIES.map((f, i) => (
            <Reveal key={f.label} direction="up" delay={i * 70}>
              <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
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

// ---------- Staff ----------

function Staff({ staff }: { staff: SchoolBundle["staff"] }) {
  // seed Head Teacher if backend hasn't supplied anyone yet
  const list = staff.length > 0 ? staff : [
    { id: "seed-head", name: "Richard Gatere Maina", title: "Head Teacher", photo_url: null },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal direction="up" className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
            Leadership & teaching
          </p>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl" style={{ color: ACCENT }}>
            The people behind the climb.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <Reveal key={p.id} direction="up">
              <article className="group h-full overflow-hidden rounded-2xl bg-[var(--color-off-white)] ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
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
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, #1e7fc2)` }}
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

// ---------- Apply CTA banner ----------

function ApplyBanner() {
  return (
    <section style={{ background: GOLD }}>
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-6 py-12 sm:flex-row sm:items-center lg:px-10">
        <Reveal direction="left">
          <h2 className="font-display text-2xl font-black sm:text-3xl" style={{ color: ACCENT }}>
            Applications for the next intake are open.
          </h2>
          <p className="mt-2 max-w-xl text-sm font-semibold text-[#1a1a18]/80">
            Visit Mikocheni, sit the assessment, join the climb.
          </p>
        </Reveal>
        <Reveal direction="right" className="flex flex-wrap gap-3">
          <Link
            to="/admission"
            className="inline-flex items-center rounded-md px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.03]"
            style={{ background: ACCENT }}
          >
            Apply Now →
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

// ---------- Footer ----------

function AlphaHighFooter() {
  return (
    <>
      <div className="bg-[var(--color-deep-blue)] py-5 text-center text-xs font-bold uppercase tracking-[0.22em] text-white/80">
        ALPHA SCHOOLS · <span style={{ color: GOLD }}>Alpha High</span>
        <div className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-white/55">
          Mikocheni campus · Dar es Salaam · part of Alpha Education Centre Limited
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
