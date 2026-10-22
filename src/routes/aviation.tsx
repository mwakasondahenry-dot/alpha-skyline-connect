import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "@/components/photo";
import type { ReactNode } from "react";
import { seo } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/structured-data";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { CinematicHero, GoldButton, GhostButton, Marked } from "@/components/alpha-ui";
import { ChapterRail, RAIL_H, type Chapter } from "@/components/aviation/chapter-rail";
import { Reveal } from "@/components/reveal";
import { T, SHELL } from "@/components/type-roles";
import { Phone, ArrowRight } from "lucide-react";
import avCockpitYoke from "@/assets/av-cockpit-yoke.webp";
import avCockpitPair from "@/assets/av-cockpit-pair.webp";
import avTalkModelPlane from "@/assets/av-talk-model-plane.webp";
import avHangarAirWing from "@/assets/av-hangar-air-wing.webp";
import avCockpitCaptain from "@/assets/av-cockpit-captain.webp";
import avGirlsCessna from "@/assets/av-girls-cessna.webp";
import avCockpitInstruments from "@/assets/av-cockpit-instruments.webp";
import avApronCadet from "@/assets/av-apron-cadet.webp";
import avBoysCessna from "@/assets/av-boys-cessna.webp";
import avApronCessna from "@/assets/av-apron-cessna.webp";
import avCockpitHeadset from "@/assets/av-cockpit-headset.webp";
import avAssemblyStudents from "@/assets/av-assembly-students.webp";
import avFlightline from "@/assets/av-flightline-group.webp";
import avTailInspection from "@/assets/av-tail-inspection.webp";

/* All programme copy on this page is the school's own, from AVIATION IN
   ALPHA SCHOOLS (October 2026), set in the site's British spelling. The
   pioneer sentence and the coordinator's number were approved for
   publication on 2026-10-21. Nothing here is paraphrased into a new claim. */

/* The coordinator is named by role only, at the site owner's instruction
   (2026-10-22). */
const COORDINATOR = {
  name: "Programme coordinator",
  display: "0717 742 248",
  tel: "tel:+255717742248",
};

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
  "Air Conditioning and Pressurisation",
  "Fuel Systems",
  "Aircraft Pneumatic Systems and Maintenance",
] as const;

const CHAPTERS: ReadonlyArray<Chapter> = [
  { id: "classroom", place: "Classroom" },
  { id: "hangar", place: "Hangar" },
  { id: "cockpit", place: "Cockpit" },
];

/* Real Alpha aviation students: airfield and cockpit visits, and the KSOF
   holiday programme. Names stay withheld until written media-release consent
   is on file for each student. */
const GALLERY = [
  { src: avGirlsCessna, w: 1200, h: 800, caption: "Alpha Girls aviation students beside a Cessna on the apron" },
  { src: avCockpitInstruments, w: 1000, h: 667, caption: "Learning the instrument panel" },
  { src: avApronCadet, w: 1000, h: 667, caption: "On the apron in aviation uniform" },
  { src: avBoysCessna, w: 1000, h: 667, caption: "Alpha aviation students with a training aircraft" },
  { src: avCockpitHeadset, w: 1000, h: 667, caption: "Headsets on in the cockpit" },
  { src: avApronCessna, w: 1000, h: 667, caption: "A walk-round of a Cessna on the airfield" },
  { src: avAssemblyStudents, w: 1000, h: 667, caption: "Students at an aviation talk at school" },
  { src: avFlightline, w: 853, h: 568, caption: "Pre-flight briefing on the flightline, KSOF Nairobi" },
  { src: avTailInspection, w: 720, h: 480, caption: "Control-surface inspection at KSOF" },
] as const;

const JOIN_STEPS = [
  {
    t: "Enrol at Alpha High or Alpha Girls",
    b: "Aviation is open to secondary students at both campuses. Complete the standard Alpha admission first.",
  },
  {
    t: "Register interest in the aviation programme",
    b: "Tell admissions you'd like to join. They'll add your child to the aviation roster and the KSOF intake list.",
  },
  {
    t: "Ground school and simulator hours during term",
    b: "Ground school is taught alongside the NECTA curriculum, with simulator practice scheduled into the academic week.",
  },
  {
    t: "Holiday flying at KSOF, Nairobi",
    b: "Students travel to the Kenya School of Flying during school holidays to build their 40+ flying hours.",
  },
  {
    t: "PPL on completion",
    b: "After Form Four, or Form Six for A-Level joiners, and the required hours, students sit the PPL.",
  },
] as const;

export const Route = createFileRoute("/aviation")({
  head: () => ({
    ...seo({
      title: "Aviation Programme for Secondary Students in Tanzania | Alpha Schools",
      description:
        "Alpha Schools are the pioneer institutions in Tanzania to introduce aviation and flying as an extracurricular activity: ground school, aircraft engineering and flying for secondary students in Dar es Salaam, to a Private Pilot Licence.",
      path: "/aviation",
      ld: [breadcrumbLd([{ name: "Aviation", path: "/aviation" }])],
    }),
  }),
  component: AviationPage,
});

/** Offset that clears the header and the chapter rail. */
const BELOW_RAIL = `calc(var(--header-h) + ${RAIL_H})`;

/**
 * One of the three places. On desktop the photograph bleeds to the viewport
 * edge and holds still while the chapter's text scrolls past it; on a phone
 * it sits above the text.
 */
function PlaceChapter({
  index,
  chapter,
  photo,
  navy = false,
  photoSide = "left",
  title,
  children,
}: {
  index: number;
  chapter: Chapter;
  photo: { src: string; w: number; h: number; alt: string; caption: string };
  navy?: boolean;
  photoSide?: "left" | "right";
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={chapter.id}
      aria-labelledby={`${chapter.id}-title`}
      className={navy ? "bg-[var(--color-deep-blue)] text-white" : "bg-[var(--color-off-white)] text-[var(--color-ink)]"}
      style={{ scrollMarginTop: BELOW_RAIL }}
    >
      <div className="grid lg:grid-cols-2">
        <figure
          className={`relative lg:sticky lg:top-[calc(var(--header-h)+3.5rem)] lg:self-start ${photoSide === "right" ? "lg:order-2" : ""}`}
        >
          <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-[min(calc(100svh-var(--header-h)-3.5rem),46rem)]">
            <Photo
              src={photo.src}
              sizes="(min-width: 1024px) 50vw, 100vw"
              width={photo.w}
              height={photo.h}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(0,26,60,0.82)] to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5 sm:p-8">
              <span
                aria-hidden
                className="font-display leading-none text-[var(--color-gold)] tabular-nums"
                style={{ fontSize: "clamp(4rem, 3rem + 5vw, 7.5rem)", fontWeight: 900 }}
              >
                {index + 1}
              </span>
              <figcaption className="pb-2 text-white/90 sm:pb-3" style={T.body}>
                {photo.caption}
              </figcaption>
            </div>
          </div>
        </figure>

        <div
          className={`px-[var(--container-gutter)] py-[var(--space-section-y)] lg:py-[clamp(4rem,2rem+5vw,7rem)] ${
            photoSide === "right"
              ? "lg:pl-[calc(max(0px,(100vw-var(--container-max))/2)+var(--container-gutter))] lg:pr-[clamp(2rem,0.5rem+2vw,3.5rem)]"
              : "lg:pl-[clamp(2rem,0.5rem+2vw,3.5rem)] lg:pr-[calc(max(0px,(100vw-var(--container-max))/2)+var(--container-gutter))]"
          }`}
        >
          <div className="max-w-[36rem]">
            <h2
              id={`${chapter.id}-title`}
              className={`font-display tracking-tight text-balance ${navy ? "text-white" : "text-[var(--color-deep-blue)]"}`}
              style={{ ...T.hero, fontSize: "clamp(2.25rem, 1.5rem + 3vw, 3.5rem)" }}
            >
              {title}
            </h2>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/** A module list as ruled rows: the subjects are the content, not cards. */
function ModuleList({
  heading,
  lead,
  items,
  navy = false,
}: {
  heading: string;
  lead: string;
  items: ReadonlyArray<string>;
  navy?: boolean;
}) {
  const rule = navy ? "border-white/15" : "border-[var(--color-deep-blue)]/12";
  return (
    <div className="mt-12">
      <h3
        className={`font-display ${navy ? "text-[var(--color-gold)]" : "text-[var(--color-deep-blue)]"}`}
        style={T.cardTitle}
      >
        {heading}
      </h3>
      <p className={`mt-2 ${navy ? "text-white/75" : "text-[var(--color-ink-soft)]"}`} style={T.body}>
        {lead}
      </p>
      <ul className={`mt-5 border-t ${rule}`}>
        {items.map((m) => (
          <li
            key={m}
            className={`flex items-baseline gap-4 border-b py-3.5 ${rule} ${navy ? "text-white" : "text-[var(--color-ink)]"}`}
            style={{ ...T.body, fontWeight: 600 }}
          >
            <span aria-hidden className="h-[2px] w-4 shrink-0 translate-y-[-0.3em] bg-[var(--color-gold)]" />
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AviationPage() {
  return (
    <div className="min-h-screen bg-[var(--color-off-white)]">
      <SiteHeader overlay />

      <CinematicHero
        srLead="The Alpha Schools aviation programme, Dar es Salaam, Tanzania:"
        lineOne="Learning that"
        lineTwo="takes off."
        blurb="Alpha Schools proudly stand as the pioneer institutions in Tanzania to introduce aviation and flying as part of our extracurricular activities."
        overlays={
          // The cockpit photographs are bright behind the headline: the
          // instrument panel sits exactly where the copy does on desktop.
          <div
            aria-hidden
            className="absolute inset-0 -z-10 hidden lg:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,26,60,0.7) 0%, rgba(0,26,60,0.5) 46%, rgba(0,26,60,0) 76%)",
            }}
          />
        }
        media={
          <HeroSlideshow
            pageKey="aviation"
            fallback={[
              { src: avCockpitYoke, alt: "An Alpha student at the controls of a Cessna" },
              { src: avCockpitPair, alt: "Two Alpha student pilots in the cockpit of a Cessna" },
            ]}
          />
        }
        actions={
          <>
            <GoldButton href="#join">How to join</GoldButton>
            <GhostButton href={COORDINATOR.tel} onNavy>
              <Phone className="h-4 w-4" aria-hidden />
              Call the programme coordinator
            </GhostButton>
          </>
        }
      />

      {/* The rail sticks only inside this wrapper, so it leaves with the
          third chapter instead of following the reader to the footer. */}
      <div>
        <ChapterRail chapters={CHAPTERS} />

        <section className="bg-white py-[var(--space-section-y)]">
          <div className={SHELL}>
            <Reveal>
              <p
                className="max-w-[48rem] font-display text-[var(--color-deep-blue)] text-balance"
                style={{ fontSize: "clamp(1.375rem, 1.05rem + 1.4vw, 2.125rem)", lineHeight: 1.3, fontWeight: 700 }}
              >
                Our aim is to expose students to various fields of interest, foster growth in aviation
                technology, enhance self-confidence, and improve career skills.
              </p>
              <p className="mt-6 max-w-[40rem] text-[var(--color-ink-soft)]" style={T.body}>
                We prioritise providing a high-quality academic experience that transforms students into
                valuable resources for our community and the world.
              </p>
            </Reveal>
          </div>
        </section>

        <PlaceChapter
          index={0}
          chapter={CHAPTERS[0]}
          title={
            <>
              Aviation Technology at{" "}
              <Marked kind="sweep" color="var(--color-gold)">
                Alpha Schools
              </Marked>
            </>
          }
          photo={{
            src: avTalkModelPlane,
            w: 1400,
            h: 933,
            alt: "A pilot uses a model aircraft to explain flight to Alpha students",
            caption: "The classroom: learning how aircraft fly",
          }}
        >
          <p className="mt-6 text-[var(--color-ink)]/85" style={T.body}>
            Our secondary school students are provided with a foundational understanding of
            aeronautics, covering essential topics such as regulations, safety, meteorology, and flight
            operations. Through our innovative aviation programme, students learn how weather and
            various factors influence flying and flight operations. The curriculum guides students in
            understanding aircraft engines, electrical systems, and structural components.
          </p>
          <ModuleList
            heading="Modules and lessons in ground school"
            lead="Students will primarily focus on the following areas of specialisation in ground school:"
            items={GROUND_SCHOOL_MODULES}
          />
          <p className="mt-6 text-[var(--color-ink-soft)]" style={T.body}>
            Where ground school is taught: [To be confirmed]
          </p>
        </PlaceChapter>

        <PlaceChapter
          index={1}
          chapter={CHAPTERS[1]}
          navy
          photoSide="right"
          title="Hands-on in the hangar."
          photo={{
            src: avHangarAirWing,
            w: 1200,
            h: 800,
            alt: "Alpha aviation students inside the Police Air Wing hangar beside its aircraft",
            caption: "The hangar: a visit to the Police Air Wing",
          }}
        >
          <p className="mt-6 text-white/85" style={T.body}>
            Students gain practical experience through hands-on activities in hangars, where they learn
            to operate aircraft under the guidance of qualified instructors.
          </p>
          <ModuleList
            navy
            heading="Aircraft engineering"
            lead="In addition, students studying Aircraft Engineering will cover the fundamentals of aviation technology, focusing on:"
            items={ENGINEERING_MODULES}
          />
        </PlaceChapter>

        <PlaceChapter
          index={2}
          chapter={CHAPTERS[2]}
          title="Solo flights and a pilot licence."
          photo={{
            src: avCockpitCaptain,
            w: 1400,
            h: 933,
            alt: "Alpha student pilots at the controls of a Cessna",
            caption: "The cockpit: at the controls",
          }}
        >
          <p className="mt-6 text-[var(--color-ink)]/85" style={T.body}>
            As students progress, they ultimately achieve solo flights and can acquire Private Pilot
            Licence (PPL) certifications.
          </p>
          <dl className="mt-10 border-t border-[var(--color-deep-blue)]/12">
            {[
              ["Training partner", "Kenya School of Flying (KSOF), Nairobi, runs the pilot courses."],
              ["Qualification", "A Private Pilot Licence, offered to Form Four and Form Six leavers who complete the programme."],
              ["Flying hours", "A minimum of 40, built up through holiday flying at KSOF."],
              ["Simulator", "Full-flight training on the CAE 7000XR Series Level D."],
              ["Two ways in", "O-Level students start at Form One. A-Level students joining at Form Five follow an accelerated programme with more flying and ground school."],
            ].map(([k, v]) => (
              <div
                key={k}
                className="grid gap-1 border-b border-[var(--color-deep-blue)]/12 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6"
              >
                <dt className="font-display text-[var(--color-deep-blue)]" style={{ ...T.body, fontWeight: 800 }}>
                  {k}
                </dt>
                <dd className="text-[var(--color-ink)]/85" style={T.body}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </PlaceChapter>
      </div>

      {/* The club, in the school's words. The students are unnamed and this
          is the school's prose, not a quoted testimonial. Hunt is attributed. */}
      <section className="bg-[var(--color-deep-blue-dark)] py-[var(--space-section-y)] text-white">
        <div className={`${SHELL} grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20`}>
          <Reveal>
            <h2 className="font-display tracking-tight" style={T.section}>
              Students&rsquo; passion to{" "}
              <Marked kind="ring" color="var(--color-gold)">
                fly.
              </Marked>
            </h2>
            <p className="mt-6 text-white/80" style={T.body}>
              Speaking to members of the Alpha Aviation Club, students express how fulfilling it is to
              pursue their dreams through flying. They find joy and fulfilment in taking flight, all while
              advancing their careers from an early age.
            </p>
            <p className="mt-5 text-white/80" style={T.body}>
              The aviation programme at Alpha nurtures students&rsquo; aspirations, allowing them to reach
              their dreams of defying gravity. We offer opportunities for students who are passionate
              about aviation technology and aspire to fly.
            </p>
          </Reveal>
          <Reveal direction="left">
            <figure>
              <span aria-hidden className="mb-6 block h-[3px] w-12 rounded-full bg-[var(--color-gold)]" />
              <blockquote
                className="font-display text-balance"
                style={{ fontSize: "clamp(1.625rem, 1.1rem + 2.2vw, 2.75rem)", lineHeight: 1.18, fontWeight: 800 }}
              >
                &ldquo;For most people, the sky is the limit. For those who love aviation, the sky is
                home.&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-[var(--color-gold)]" style={T.body}>
                Jack R. Hunt, naval aviator
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Photo gallery. */}
      <section className="bg-[var(--color-off-white)] py-[var(--space-section-y)]">
        <div className={SHELL}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
              Photo gallery
            </h2>
            <p className="max-w-md text-[var(--color-ink-soft)]" style={T.body}>
              Alpha aviation students on the airfield, in the cockpit and at the Kenya School of Flying.
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {GALLERY.map((g, i) => (
              <li
                key={g.caption}
                className={`group relative overflow-hidden rounded-[var(--radius-card,1rem)] bg-[var(--color-deep-blue)]/5 ${
                  i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-[4/5]"
                }`}
              >
                <figure className="h-full">
                  <Photo
                    src={g.src}
                    sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                    width={g.w}
                    height={g.h}
                    alt={g.caption}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
                  />
                  <figcaption
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(0,26,60,0.85)] to-transparent p-3 pt-10 text-white sm:p-4 sm:pt-12"
                    style={{ fontSize: "0.8125rem", lineHeight: 1.35, fontWeight: 600 }}
                  >
                    {g.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[var(--color-ink-soft)]" style={T.body}>
            [Programme videos — to be provided by school]
          </p>
        </div>
      </section>

      {/* How to join, and the person to call. */}
      <section id="join" className="bg-white py-[var(--space-section-y)]" style={{ scrollMarginTop: "var(--header-h)" }}>
        <div className={`${SHELL} grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16`}>
          <div>
            <h2 className="font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
              Joining the aviation programme.
            </h2>
            <ol className="mt-8">
              {JOIN_STEPS.map((s, i) => (
                <li key={s.t} className="grid grid-cols-[2.75rem_1fr] gap-4 border-t border-[var(--color-deep-blue)]/12 py-5">
                  <span
                    aria-hidden
                    className="font-display leading-none text-[var(--color-deep-blue)] tabular-nums"
                    style={{ fontSize: "2rem", fontWeight: 900 }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
                      {s.t}
                    </h3>
                    <p className="mt-1 text-[var(--color-ink-soft)]" style={T.body}>
                      {s.b}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside
            aria-labelledby="coordinator-title"
            className="self-start rounded-[var(--radius-card,1rem)] bg-[var(--color-deep-blue)] p-7 text-white shadow-[0_18px_40px_-18px_rgba(0,26,60,0.55)] sm:p-9 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]"
          >
            <p className="text-white/75" style={T.body}>
              For further information, please contact our
            </p>
            <h3 id="coordinator-title" className="mt-3 font-display" style={T.section}>
              {COORDINATOR.name}
            </h3>
            <a
              href={COORDINATOR.tel}
              className="mt-6 flex items-center justify-between gap-4 rounded-[var(--radius-pill,999px)] bg-[var(--color-gold)] px-6 py-4 font-display text-[var(--color-accent-foreground)] transition-transform duration-200 hover:-translate-y-[2px] active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              style={{ fontSize: "1.25rem", fontWeight: 800 }}
            >
              <span className="tabular-nums">{COORDINATOR.display}</span>
              <Phone className="h-5 w-5" aria-hidden />
            </a>
            <div className="mt-8 border-t border-white/15 pt-6">
              <p className="text-white/75" style={T.body}>
                Ready to apply? Every aviation student starts with the standard Alpha admission.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <GhostButton to="/admission" onNavy>
                  Application forms
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </GhostButton>
                <GhostButton to="/contact" onNavy>
                  Book a visit
                </GhostButton>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* The school's closing line. */}
      <section className="border-t border-[var(--color-deep-blue)]/10 bg-[var(--color-off-white)] py-[var(--space-section-y)]">
        <div className={SHELL}>
          <p
            className="mx-auto max-w-[44rem] text-center font-display text-[var(--color-deep-blue)] text-balance"
            style={{ fontSize: "clamp(1.375rem, 1.05rem + 1.4vw, 2.125rem)", lineHeight: 1.3, fontWeight: 800 }}
          >
            We look forward to helping shape the future of aviation through our dedicated programmes at
            Alpha Schools.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/admission"
              className="inline-flex items-center gap-2 font-display text-[var(--color-deep-blue)] underline decoration-[var(--color-gold)] decoration-2 underline-offset-[6px] transition-colors hover:text-[var(--color-brand-blue)]"
              style={{ ...T.body, fontWeight: 800 }}
            >
              Get the application form
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
