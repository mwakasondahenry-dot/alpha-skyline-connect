import { SchoolFacilitiesSection } from "@/components/school/facilities-section";
import { SchoolSubNav } from "@/components/school/school-sub-nav";
import { CinematicHero, HeroCredentials, GoldButton, GhostButton, SectionHead, FeatureCard, StatBar, SHELL } from "@/components/alpha-ui";
import { CombinationList, SubjectPillList, FormOptionsList, type CombinationGroup } from "@/components/school/subject-lists";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSchoolBundle, type SchoolBundle } from "@/lib/alpha-content.functions";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { TornEdge } from "@/components/torn-edge";
import { Reveal } from "@/components/reveal";
import { ArrowRight, Users, GraduationCap, Plane, Compass, Trophy, MapPin, Award } from "lucide-react";
import graduate from "@/assets/alpha-high-graduate.webp";
import campusAerial from "@/assets/alpha-high-campus-aerial.webp";
import campusHigh from "@/assets/campus-high.webp";
import campusGirls from "@/assets/campus-girls.webp";
import campusNursery from "@/assets/campus-nursery.webp";
import aviation from "@/assets/aviation-uniform.webp";
import clubAviation from "@/assets/club-aviation.webp";
import clubDrama from "@/assets/club-drama.webp";
import clubMusic from "@/assets/club-music-dance.webp";
import clubDebate from "@/assets/club-debate.webp";
import clubArt from "@/assets/club-art.webp";
import clubCookery from "@/assets/club-cookery.webp";
import clubScout from "@/assets/club-scout.webp";
import clubSpeaking from "@/assets/club-public-speaking.webp";
import clubUn from "@/assets/club-un.webp";
import clubEnvironment from "@/assets/club-environment.webp";

import { T } from "@/components/type-roles";

const slug = "alpha-high" as const;
const ACCENT = "var(--color-deep-blue)";
const GOLD = "var(--color-gold)";

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
          "Alpha High School, Mikocheni — co-education secondary, Form 1–6. The flagship: NECTA rigour with aviation and coding that exist nowhere else in Tanzania.",
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
      <SiteHeader overlay />
      <Hero />
      <SchoolSubNav items={SUB_NAV} />
      <AtAGlance />
      <About />
      <Academics />
      <AdmissionProcess />
      <LifeAtMikocheni />
      <BeyondClassroom />
      <Distinctive />
      <ApplyBanner />
      <AlphaHighFooter />
    </div>
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
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-[var(--color-deep-blue)] sm:text-4xl">
          Requirements
        </h2>
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-gold)]/70 bg-[var(--color-off-white)] p-7">
          <p className="font-display text-base font-semibold text-[var(--color-deep-blue)]">
            [Entry requirements — to be confirmed with academic offices]
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]/70">
            Placeholder — the confirmed entry requirements for this school will be published here.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------- Hero ----------

/**
 * The opening screen. Where ShapedHero put the first viewport inside a
 * rounded card on a white page, this fills the screen with the campus
 * itself and stages the copy over it.
 *
 * The photographs that were pinned to the old mosaic become the slides,
 * on the `alpha-high` hero_slides key the schema already reserves — so
 * the school can change this hero from the admin tool exactly as it can
 * change the homepage's.
 */
function Hero() {
  return (
    <CinematicHero
      eyebrow="Mikocheni · Form 1–6 · Co-education"
      lineOne="Excellence through challenge."
      lineTwo="Built for the long climb."
      blurb="Our flagship secondary in Mikocheni. NECTA rigour, with aviation and coding at the core."
      media={
        <HeroSlideshow
          pageKey="alpha-high"
          fallback={[
            { src: campusAerial, alt: "The Mikocheni campus from the air" },
            { src: graduate, alt: "An Alpha High graduate in cap and gown" },
            { src: clubAviation, alt: "Alpha High aviation club students" },
          ]}
        />
      }
      actions={
        <>
          <GoldButton href="#academics">
            Explore our school
            <ArrowRight className="h-4 w-4" aria-hidden />
          </GoldButton>
          <GhostButton to="/contact" onNavy>
            Book a school tour
          </GhostButton>
        </>
      }
      foot={
        <HeroCredentials
          items={[
            { label: "Co-education", sub: "Boys and girls, Form 1–6", icon: <Users className="h-5 w-5" /> },
            { label: "NECTA curriculum", sub: "CSEE and ACSEE", icon: <GraduationCap className="h-5 w-5" /> },
            { label: "Aviation programme", sub: "Ground school to PPL", icon: <Plane className="h-5 w-5" /> },
          ]}
        />
      }
    />
  );
}

function About() {
  return (
    <section id="about" className="bg-[var(--color-off-white)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <div className="grid items-start gap-12 lg:grid-cols-[1.3fr_1fr]">
          <Reveal direction="left">
            <p style={{ ...T.label, color: ACCENT  }}>
              About Alpha High
            </p>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl" style={{ color: ACCENT }}>
              Excellence through challenge — <span style={{ color: "var(--color-bright-blue)" }}>since 2007.</span>
            </h2>
            <p className="mt-6 text-[var(--color-ink)]/80" style={T.body}>
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
              <h3 className="mt-2 font-display" style={T.cardTitle}>
                Education that grows the whole student.
              </h3>
              <ul className="mt-5 space-y-3 text-white/90" style={T.body}>
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


/** Section anchors for the shared sub-nav. Alpha High's own order. */
const SUB_NAV = [
  { label: "About", href: "#about" },
  { label: "Academics", href: "#academics" },
  { label: "Admission", href: "#admission" },
  { label: "Life at Mikocheni", href: "#life" },
  { label: "Clubs & sport", href: "#clubs" },
] as const;

/* ------------------------------------------------------------------ *
 * ACADEMIC DATA — confirmed by the school 2026-09-02.
 * See design/CONTENT-FROM-SCHOOL.md. Data lives here, not in a shared
 * module, so Alpha High and Alpha Girls can diverge without a refactor.
 *
 * Removed as fabrications at the same time: A-Level codes KLF and ECA
 * (in no school document), the typo PMC (correct code is PMCs), and the
 * invented "Science / Arts / Business / Optional" O-Level grouping.
 * ------------------------------------------------------------------ */

/** All 17 examinable subjects offered at O-Level. */
const O_LEVEL_SUBJECTS = [
  "Historia ya Tanzania na Maadili", "Civics", "History", "Geography",
  "Kiswahili", "English Language", "Business Studies", "Book Keeping",
  "Computer Science", "Physics", "Chemistry", "Biology", "Chinese",
  "French", "Literature in English", "ICS", "Additional Mathematics",
] as const;

/* ⚠ SOURCE FLAG — FOR REVIEW, NOT FOR PARENTS ⚠
 * The school's document lists Form Three and Form Four option subjects as
 * IDENTICAL, and its numbering SKIPS (ix) in both, so nine items are
 * numbered to ten. A genuine duplication and a copy-paste error look the
 * same in a Word table.
 * ASK THE SCHOOL before publishing Form Three and Form Four as identical.
 */
const FORM_OPTIONS = [
  {
    form: "Form One",
    note: "Seven option subjects",
    items: ["Chinese", "French", "Computer Science", "History", "Biology", "Physics", "Chemistry"],
  },
  {
    form: "Form Two",
    note: "The same seven, plus Book Keeping",
    items: ["Chinese", "French", "Computer Science", "History", "Biology", "Physics", "Chemistry", "Book Keeping"],
  },
  {
    form: "Form Three",
    note: "Nine option subjects",
    items: ["Chinese", "French", "ICS", "Literature in English", "Commerce", "Book Keeping", "Physics", "Chemistry", "Additional Mathematics"],
  },
  {
    form: "Form Four",
    note: "Nine option subjects",
    items: ["Chinese", "French", "ICS", "Literature in English", "Commerce", "Book Keeping", "Physics", "Chemistry", "Additional Mathematics"],
  },
] as const;

/** The 12 A-Level combinations. Confirmed identical at both schools. */
const A_COMBOS: ReadonlyArray<CombinationGroup> = [
  {
    group: "Arts",
    items: [
      { code: "HGL", subjects: "History · Geography · English Language" },
      { code: "HKL", subjects: "History · Kiswahili · English Language" },
    ],
  },
  {
    group: "Business",
    items: [
      { code: "EBuAC", subjects: "Economics · Business Studies · Accountancy" },
      { code: "BUAcM", subjects: "Business Studies · Accountancy · Advanced Mathematics" },
      { code: "ECsM", subjects: "Economics · Computer Studies · Advanced Mathematics" },
      { code: "HGE", subjects: "History · Geography · Economics" },
      { code: "EGM", subjects: "Economics · Geography · Advanced Mathematics" },
    ],
  },
  {
    group: "Science",
    items: [
      { code: "PCM", subjects: "Physics · Chemistry · Advanced Mathematics" },
      { code: "PCB", subjects: "Physics · Chemistry · Biology" },
      { code: "PMCs", subjects: "Physics · Advanced Mathematics · Computer Studies" },
      { code: "PGM", subjects: "Physics · Geography · Advanced Mathematics" },
      { code: "CBG", subjects: "Chemistry · Biology · Geography" },
    ],
  },
];

/** The documented admission process. NOT a fee structure — see below. */
const ADMISSION_STEPS = [
  "Pay the application fee of TSh 35,000",
  "Sit the entrance examination",
  "Pass at the school average of 55%",
  "Receive joining instructions after paying TSh 500,000 as part of the first tuition instalment",
] as const;

/* design/README.md: the years figure is calculated from the 2007 founding
   date and must never be hardcoded. Every figure below is derivable from
   confirmed data — the subject and combination counts come from the lists
   on this page. No invented statistics. */
const FOUNDED = 2007;

function AtAGlance() {
  const years = new Date().getFullYear() - FOUNDED;
  return (
    <section className={`${SHELL} pb-[var(--space-section-y)]`}>
      <StatBar
        items={[
          { figure: `${years}+`, label: "Years since 2007", icon: <Award className="h-5 w-5" /> },
          { figure: String(O_LEVEL_SUBJECTS.length), label: "O-Level subjects", icon: <GraduationCap className="h-5 w-5" /> },
          { figure: String(A_COMBOS.reduce((n, g) => n + g.items.length, 0)), label: "A-Level combinations", icon: <Compass className="h-5 w-5" /> },
          { figure: "1", label: "Aviation programme", icon: <Plane className="h-5 w-5" /> },
        ]}
      />
    </section>
  );
}

function Academics() {
  return (
    <section id="academics" className="bg-[var(--color-surface)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <p className="text-[var(--color-deep-blue)]" style={T.label}>
          Academics
        </p>
        <h2
          className="mt-2 max-w-3xl font-display tracking-tight text-[var(--color-ink)]"
          style={T.section}
        >
          Seventeen subjects at O-Level, twelve combinations at A-Level.
        </h2>
        <span
          aria-hidden
          className="mt-[var(--heading-rule-gap)] block"
          style={{
            width: "var(--heading-rule-w)",
            height: "var(--heading-rule-h)",
            background: "var(--heading-rule-color)",
            borderRadius: "var(--heading-rule-radius)",
          }}
        />

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
            Subjects offered
          </h3>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            Every subject examinable at O-Level across Forms One to Four.
          </p>
          <div className="mt-5">
            <SubjectPillList items={O_LEVEL_SUBJECTS} />
          </div>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
            Option subjects by form
          </h3>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            What a pupil in each form may choose between — a different thing
            from the full subject list above.
          </p>
          <div className="mt-5">
            <FormOptionsList forms={FORM_OPTIONS} />
          </div>
        </div>

        <div className="mt-[var(--space-block-y)]">
          <h3 className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
            A-Level combinations
          </h3>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            All twelve, with their subjects written out. Form 5&ndash;6, ACSEE.
          </p>
          <div className="mt-5">
            <CombinationList groups={A_COMBOS} accent="var(--color-deep-blue)" />
          </div>
        </div>
      </div>
    </section>
  );
}

function AdmissionProcess() {
  return (
    <section id="admission" className="bg-[var(--color-off-white)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <p className="text-[var(--color-deep-blue)]" style={T.label}>
          Admission
        </p>
        <h2
          className="mt-2 max-w-3xl font-display tracking-tight text-[var(--color-ink)]"
          style={T.section}
        >
          How a place at Alpha High is offered.
        </h2>
        <span
          aria-hidden
          className="mt-[var(--heading-rule-gap)] block"
          style={{
            width: "var(--heading-rule-w)",
            height: "var(--heading-rule-h)",
            background: "var(--heading-rule-color)",
            borderRadius: "var(--heading-rule-radius)",
          }}
        />

        <ol className="mt-[var(--space-block-y)] grid gap-[var(--space-card-gap)] sm:grid-cols-2 lg:grid-cols-4">
          {ADMISSION_STEPS.map((step, i) => (
            <li
              key={step}
              className="rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] shadow-[var(--card-shadow)]"
            >
              <span
                className="font-display text-[var(--color-deep-blue)]"
                style={T.stat}
              >
                {i + 1}
              </span>
              <p className="mt-2 text-[var(--color-ink)]" style={T.body}>
                {step}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-6 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
          These two figures are part of the admission process, not the cost of
          attending. [Fee structure per school &mdash; to be provided]
        </p>
      </div>
    </section>
  );
}

function Distinctive() {
  return (
    <section className="bg-[var(--color-off-white)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">

        <Reveal direction="up" className="max-w-2xl">
          <p style={{ ...T.label, color: ACCENT  }}>
            Distinctive at Alpha High
          </p>
          <h2 className="mt-2 font-display text-2xl font-black sm:text-3xl" style={{ color: ACCENT }}>
            Two things you'll only find here.
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <SignpostCard
            eyebrow="Aviation"
            title="Aviation Program in Alpha Schools"
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
        className="group relative h-full overflow-hidden rounded-2xl bg-white p-7 ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1 active:translate-y-0 hover:shadow-xl"
      >
        <div
          aria-hidden
          className="absolute right-0 top-0 h-1 w-full origin-left scale-x-0 transition-transform duration-150 group-hover:scale-x-100"
          style={{ background: GOLD }}
        />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
          {eyebrow}
        </p>
        <h3 className="mt-2 font-display" style={{ ...T.cardTitle, color: ACCENT  }}>
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
  { name: "Aviation", photo: clubAviation },
  { name: "Drama", photo: clubDrama },
  { name: "Music & Dance", photo: clubMusic },
  { name: "Debate", photo: clubDebate },
  { name: "Art & Drawing", photo: clubArt },
  { name: "Cookery", photo: clubCookery },
  { name: "Scout", photo: clubScout },
  { name: "Public Speaking", photo: clubSpeaking },
  { name: "Model UN", photo: clubUn },
  { name: "Environment", photo: clubEnvironment },
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
        <span style={{ ...T.label, color: ACCENT  }}>
          {CLUBS.length}+ student-led clubs
        </span>
      </div>

      <div
        className="group relative mt-5 overflow-x-auto overflow-y-hidden rounded-2xl border border-black/5 bg-[var(--color-off-white)] py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex w-max gap-5 px-5 animate-[clubsMarquee_38s_linear_infinite] [animation-play-state:paused] motion-safe:[animation-play-state:running] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
          {loop.map((c, i) => (
            <figure
              key={`${c.name}-${i}`}
              className="relative h-56 w-72 shrink-0 overflow-hidden rounded-xl shadow-md ring-1 ring-black/10 transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] hover:shadow-xl"
            >
              <img
                src={c.photo}
                alt={`${c.name} club at Alpha High`}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
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
        @media (prefers-reduced-motion: no-preference) {
          @keyframes clubsMarquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        }
      `}</style>
    </Reveal>
  );
}

function BeyondClassroom() {
  return (
    <section id="clubs" className="bg-white">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="max-w-2xl">
          <p style={{ ...T.label, color: ACCENT  }}>
            Beyond the classroom
          </p>
          <h2 className="mt-2 font-display" style={{ ...T.section, color: ACCENT  }}>
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
              <h3 className="mt-2 font-display" style={T.cardTitle}>A confidential ear, always available.</h3>
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
  { label: "Science labs", img: campusHigh },
  { label: "Library", img: campusNursery },
  { label: "Sports field", img: campusGirls },
  { label: "Boarding", img: aviation },
];

function LifeAtMikocheni() {
  return (
    <section id="life" className="bg-[var(--color-off-white)]">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p style={{ ...T.label, color: ACCENT  }}>
              Campus
            </p>
            <h2 className="mt-2 font-display" style={{ ...T.section, color: ACCENT  }}>
              Life at Mikocheni.
            </h2>
          </div>
          <Link to="/facilities" className="font-bold hover:underline" style={{ ...T.body, color: ACCENT  }}>
            See facilities →
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FACILITIES.map((f, i) => (
            <Reveal key={f.label} direction="up" delay={i * 70}>
              <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-sm transition hover:-translate-y-1 active:translate-y-0 hover:shadow-xl">
                <img
                  src={f.img}
                  alt={f.label}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] py-[var(--space-section-y)]">
        <Reveal direction="up" className="max-w-2xl">
          <p style={{ ...T.label, color: ACCENT  }}>
            Leadership & teaching
          </p>
          <h2 className="mt-2 font-display" style={{ ...T.section, color: ACCENT  }}>
            The people behind the climb.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <Reveal key={p.id} direction="up">
              <article className="group h-full overflow-hidden rounded-2xl bg-[var(--color-off-white)] ring-1 ring-black/5 transition hover:-translate-y-1 active:translate-y-0 hover:shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden">
                  {p.photo_url ? (
                    <img
                      src={p.photo_url}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="absolute inset-0 grid place-items-center"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, var(--color-bright-blue))` }}
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
          <p className="mt-2 max-w-xl text-sm font-semibold text-[var(--color-accent-foreground)]/80">
            Visit Mikocheni, sit the assessment, join the climb.
          </p>
        </Reveal>
        <Reveal direction="right" className="flex flex-wrap gap-3">
          <Link
            to="/admission"
            className="inline-flex items-center rounded-md px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.03] active:scale-[0.97]"
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

// ---------- Footer ----------

function AlphaHighFooter() {
  return (
    <>
      <div className="bg-[var(--color-deep-blue)] py-5 text-center text-xs font-bold uppercase tracking-[0.22em] text-white/80">
        ALPHA SCHOOLS · <span style={{ color: GOLD }}>Alpha High</span>
        <div className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-white/55">
          Mikocheni campus · Dar es Salaam · part of ALFA EDUCATION CENTRE
        </div>
      </div>
      <SchoolFacilitiesSection slug="alpha-high" accent="var(--color-deep-blue)" />
      <SiteFooter />
    </>
  );
}
