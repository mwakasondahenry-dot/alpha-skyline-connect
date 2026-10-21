import { SchoolFacilitiesSection } from "@/components/school/facilities-section";
import { SchoolSubNav } from "@/components/school/school-sub-nav";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { schoolLd, breadcrumbLd } from "@/lib/structured-data";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, type FormEvent, type ReactNode } from "react";
import { submitContactMessage } from "@/lib/alpha-content.functions";
import {
  BookOpen,
  FlaskConical,
  Calculator,
  Leaf,
  Puzzle,
  Globe2,
  Wrench,
  Languages,
  Plane,
  Trophy,
  Waves,
  Music,
  Laptop,
  Tent,
  Disc3,
  ChefHat,
  Mic,
  Search,
  ThumbsUp,
  HeartHandshake,
  Shapes,
  Backpack,
  Bus,
  Baby,
  School,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { getSchoolPhotos } from "@/lib/alpha-content.functions";
import { slotPhoto } from "@/lib/photo-slots";
import { ParentVoices } from "@/components/school/parent-voices";
import { testimonialsQuery } from "@/lib/testimonials-query";
import { T, heroStep } from "@/components/type-roles";
import { Marked, Sticker, Doodle, Backdrop } from "@/components/alpha-ui";
import { Reveal } from "@/components/reveal";
import {
  HeightChart,
  GrowthRuler,
  MobileRuler,
  NURSERY_RUNGS,
  PRIMARY_RUNGS,
} from "@/components/school/growth-ruler";
import daycareTeacher from "@/assets/np-daycare-teacher-toddler.webp";
import toddlersPlayroom from "@/assets/np-toddlers-playroom.webp";
import ballPitCircle from "@/assets/np-ball-pit-circle.webp";
import preUnitGraduation from "@/assets/np-preunit-graduation.webp";
import pupilDeskBoy from "@/assets/np-pupil-desk-boy.webp";
import footballMatch from "@/assets/np-football-match.webp";
import taekwondo from "@/assets/np-taekwondo.webp";
import paddlingPool from "@/assets/np-paddling-pool.webp";
import schoolBus from "@/assets/np-school-bus.webp";
import graduationCaps from "@/assets/np-graduation-caps.webp";
import graduatePortrait from "@/assets/np-graduate-portrait.webp";

const photosQuery = queryOptions({
  queryKey: ["school-photos", "nursery-primary"],
  queryFn: () => getSchoolPhotos({ data: { slug: "nursery-primary" as const } }),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/schools/nursery-primary")({
  head: () => ({
    ...seo({
      title: "Alpha Nursery & Primary: Nursery and Primary School in Kunduchi, Dar es Salaam",
      description:
        "A nursery and primary school in Kunduchi, Dar es Salaam: Day Care and Nursery from age 2, then Grade 1 to 7, with coding from primary and door-to-door school transport.",
      path: "/schools/nursery-primary",
      ld: [
        schoolLd(
          "nursery-primary",
          "A nursery and primary school in Kunduchi, Dar es Salaam, for children from age 2 to age 12.",
        ),
        breadcrumbLd([{ name: "Nursery & Primary", path: "/schools/nursery-primary" }]),
      ],
    }),
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(testimonialsQuery),
      context.queryClient.ensureQueryData(photosQuery),
    ]),
  component: NurseryPrimaryPage,
});

/** Section anchors for the shared sub-nav. */
const SUB_NAV = [
  { label: "Nursery", href: "#early-years" },
  { label: "Primary", href: "#primary" },
  { label: "Activities", href: "#extracurriculum" },
  { label: "Book a visit", href: "#admission" },
  { label: "Requirements", href: "#requirements" },
] as const;

/** Clears the header and the sticky sub-nav when jumping to an anchor. */
const ANCHOR_OFFSET = "calc(var(--header-h) + 3.75rem)";

function NurseryPrimaryPage() {
  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <SiteHeader />
      <Hero />
      <SchoolSubNav items={SUB_NAV} />
      <OneCampus />
      <Ladder />
      <Activities />
      <SchoolFacilitiesSection slug="nursery-primary" accent="var(--color-bright-blue)" />
      <ParentVoices school="nursery-primary" accent="var(--color-bright-blue)" />
      <PeekInside />
      <EntryRequirements />
      <LetsGetStarted />
      <SiteFooter />
    </div>
  );
}

// ---------- Shared bits ----------

const BTN =
  "inline-flex min-h-[var(--btn-primary-min-h)] items-center gap-2 rounded-[var(--radius-pill)] px-7 transition-transform duration-150 hover:-translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-bright-blue)]";

/** What a block of content sits on. Sets text, rules and icons to match. */
type Ground = "light" | "blue" | "gold";

const ON: Record<Ground, { head: string; body: string; rule: string; icon: string; caption: string }> = {
  light: {
    head: "var(--color-deep-blue)",
    body: "var(--color-ink-soft)",
    rule: "color-mix(in srgb, var(--color-deep-blue) 12%, transparent)",
    icon: "var(--color-bright-blue)",
    caption: "var(--color-ink-soft)",
  },
  blue: {
    head: "#ffffff",
    body: "rgba(255,255,255,0.92)",
    rule: "rgba(255,255,255,0.28)",
    icon: "var(--color-gold)",
    caption: "rgba(255,255,255,0.92)",
  },
  gold: {
    head: "var(--color-deep-blue)",
    body: "var(--color-deep-blue)",
    rule: "color-mix(in srgb, var(--color-deep-blue) 22%, transparent)",
    icon: "var(--color-deep-blue)",
    caption: "var(--color-deep-blue)",
  },
};

/** A rounded campus photograph, with an optional sticker and caption. */
function Photo({
  src,
  alt,
  w,
  h,
  caption,
  sticker,
  ground = "light",
  className = "",
  imgClassName = "",
  eager = false,
}: {
  src: string;
  alt: string;
  w: number;
  h: number;
  caption?: string;
  sticker?: { text: string; tone: "gold" | "navy" | "sky"; tilt: number };
  ground?: Ground;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  return (
    <figure className={`relative ${className}`}>
      {/* A captioned photo keeps its own height so the caption stays inside
          its tile; an uncaptioned one stretches to fill a mosaic cell. */}
      <div className={`${caption ? "" : "h-full"} overflow-hidden rounded-[1.75rem] bg-[var(--color-deep-blue)]/5`}>
        <img
          src={src}
          alt={alt}
          width={w}
          height={h}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      </div>
      {sticker && (
        <Sticker tone={sticker.tone} tilt={sticker.tilt} className="absolute -top-3 right-4">
          {sticker.text}
        </Sticker>
      )}
      {caption && (
        <figcaption className="mt-2.5" style={{ ...T.body, color: ON[ground].caption }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** A list set as hairline-ruled rows, each with an icon in a round disc. */
function RuledList({
  items,
  columns = 1,
  ground = "light",
}: {
  items: ReadonlyArray<{ title: string; body?: string; Icon: LucideIcon }>;
  columns?: 1 | 2;
  ground?: Ground;
}) {
  const c = ON[ground];
  // On the light ground the discs take turns through the page's colours.
  const DISCS = ["var(--color-bright-blue)", "var(--color-gold)", "var(--color-deep-blue)"];
  return (
    <ul
      className={columns === 2 ? "sm:grid sm:grid-cols-2 sm:gap-x-10" : ""}
      style={{ borderTop: `1px solid ${c.rule}` }}
    >
      {items.map(({ title, body, Icon }, i) => {
        const disc = ground === "light" ? DISCS[i % 3] : ground === "blue" ? "#ffffff" : "var(--color-deep-blue)";
        const glyph =
          ground === "light"
            ? disc === "var(--color-gold)"
              ? "var(--color-deep-blue)"
              : "#ffffff"
            : ground === "blue"
              ? "var(--color-bright-blue)"
              : "var(--color-gold)";
        return (
          <li key={title} className="flex items-center gap-4 py-3.5" style={{ borderBottom: `1px solid ${c.rule}` }}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: disc }}>
              <Icon className="h-[1.1rem] w-[1.1rem]" style={{ color: glyph }} aria-hidden strokeWidth={2.25} />
            </span>
            <div>
              <p className="font-display" style={{ ...T.body, fontWeight: 800, color: c.head }}>
                {title}
              </p>
              {body && (
                <p className="mt-0.5" style={{ ...T.body, color: c.body }}>
                  {body}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** The class names of one stage, as chunky pills. */
function RungRow({ rungs, ground }: { rungs: ReadonlyArray<{ label: string }>; ground: "blue" | "gold" }) {
  const text = ground === "blue" ? "var(--color-bright-blue)" : "var(--color-deep-blue)";
  return (
    <ol className="mt-5 flex flex-wrap gap-2" aria-label="Classes">
      {rungs.map((r) => (
        <li
          key={r.label}
          className="rounded-[var(--radius-pill)] bg-white px-3.5 py-1 font-display shadow-[0_6px_14px_-10px_rgba(0,46,106,0.6)]"
          style={{ ...T.body, fontWeight: 800, color: text }}
        >
          {r.label}
        </li>
      ))}
    </ol>
  );
}

/** A soft wave that carries one colour band into the next. */
function Wave({ color, flip = false }: { color: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      className={`absolute inset-x-0 h-6 w-full sm:h-10 ${flip ? "-bottom-px" : "-top-6 sm:-top-10"}`}
      style={{ color }}
    >
      <path d="M0 48V24C120 6 240 0 360 10s240 30 360 26 240-28 360-30 240 14 360 22v20Z" fill="currentColor" />
    </svg>
  );
}

// ---------- Hero ----------

/**
 * The opening screen stays light so the youngest school opens bright, not on
 * a navy plate; the header stays in flow above it. A big campus photo
 * layered over a bright-blue block, stickers and doodles, and the 2-to-12
 * height chart that springs up and that the rest of the page climbs.
 */
function Hero() {
  const photos = useSuspenseQuery(photosQuery).data;
  const main = slotPhoto(photos, "nursery-primary.days.hippo-ride")!;
  const inset = slotPhoto(photos, "nursery-primary.days.girl-portrait")!;
  return (
    <section className="hero-viewport-inset relative flex flex-col overflow-hidden bg-white">
      <Backdrop kind="scribble" className="left-[3%] top-6 hidden text-[var(--color-gold)] sm:block" width="6rem" rotate={-8} />
      <div className="mx-auto grid w-full max-w-[var(--container-max)] flex-1 items-center gap-10 px-[var(--container-gutter)] pt-8 lg:grid-cols-[1fr_1.35fr] lg:gap-12 lg:pt-10">
        <div className="relative">
          <h1
            className="font-display tracking-tight text-balance text-[var(--color-deep-blue)]"
            style={{ ...T.hero, lineHeight: 1.02 }}
          >
            <span className="sr-only">Alpha Nursery &amp; Primary School, Kunduchi, Dar es Salaam: </span>
            <span className="hero-rise block" style={heroStep("var(--hero-t-line-1)", "420ms")}>
              Unlock your child&rsquo;s
            </span>
            <span
              className="hero-rise block text-[var(--color-bright-blue)]"
              style={heroStep("var(--hero-t-line-2)", "420ms")}
            >
              <Marked kind="underline" color="var(--color-gold)" delay={700}>
                potential.
              </Marked>
            </span>
          </h1>
          <Doodle kind="star" className="absolute -top-6 right-[12%] hidden sm:block" color="var(--color-gold)" delay={900} />
          <p
            className="hero-rise mt-5 max-w-md text-[var(--color-ink)]/80"
            style={{ ...T.body, ...heroStep("var(--hero-t-blurb)") }}
          >
            Play-led early years at our Kunduchi campus in Dar es Salaam, growing into a warm,
            structured primary from Grade 1 to 7.
          </p>
          <div className="hero-rise mt-7 flex flex-wrap gap-3" style={heroStep("var(--hero-t-cta)")}>
            <Link
              to="/admission"
              className={`${BTN} bg-[var(--color-bright-blue)] text-white shadow-[0_10px_24px_-12px_rgba(4,112,204,0.8)]`}
              style={{ ...T.body, fontWeight: 800 }}
            >
              Enroll Now
            </Link>
            <a
              href="#admission"
              className={`${BTN} border-2 border-[var(--color-gold)] bg-white text-[var(--color-deep-blue)]`}
              style={{ ...T.body, fontWeight: 800 }}
            >
              Book a Visit
            </a>
          </div>
        </div>

        <div className="hero-rise relative pb-10 pr-3 sm:pb-14 sm:pr-5" style={heroStep("var(--hero-t-tail)", "420ms")}>
          {/* A bright-blue block behind the photo, offset like a pasted print. */}
          <div aria-hidden className="absolute inset-y-4 left-6 right-0 rotate-[2.5deg] rounded-[2rem] bg-[var(--color-bright-blue)] sm:left-10" />
          <div aria-hidden className="absolute -right-2 -top-3 h-14 w-14 rounded-full bg-[var(--color-gold)] sm:h-20 sm:w-20" />
          <Photo
            src={main.src}
            alt={photos["nursery-primary.days.hippo-ride"]?.alt_text ?? "A smiling nursery pupil on a play hippo in the courtyard"}
            w={1600}
            h={1067}
            eager
            className="relative aspect-[4/3] w-full sm:aspect-[3/2] lg:aspect-[4/3]"
          />
          <Sticker tone="gold" tilt={-6} delay={900} className="absolute right-6 top-4 sm:right-10 sm:top-6">
            Ages 2 – 12
          </Sticker>
          <div className="absolute bottom-0 left-[-0.5rem] w-[42%] -rotate-[4deg] rounded-[1.6rem] bg-[var(--color-gold)] p-1.5 shadow-[0_18px_36px_-18px_rgba(0,46,106,0.55)] sm:left-[-1.5rem]">
            <img
              src={inset.src}
              alt={photos["nursery-primary.days.girl-portrait"]?.alt_text ?? "A smiling primary pupil at her desk"}
              width={1000}
              height={667}
              loading="eager"
              className="aspect-[3/2] w-full rounded-[1.3rem] object-cover"
            />
          </div>
        </div>
      </div>

      {/* The page's thesis, at the hero's foot: the 2-to-12 height chart. */}
      <div
        className="hero-rise mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] pb-8 pt-6 lg:pb-10"
        style={heroStep("var(--hero-t-tail)", "320ms")}
      >
        <HeightChart />
      </div>
    </section>
  );
}

// ---------- One campus ----------

function OneCampus() {
  const facts = [
    { title: "Day Care & Nursery", body: "Day Care, Baby Class, Middle Class and Pre-Unit.", Icon: Baby },
    { title: "Primary, Grade 1 to 7", body: "A structured, ambitious curriculum through to Grade 7.", Icon: School },
    { title: "Door-to-door school transport", body: "Our school buses collect and return pupils.", Icon: Bus },
  ];
  return (
    <section
      id="our-days"
      className="bg-white py-[var(--space-section-y)]"
      style={{ scrollMarginTop: ANCHOR_OFFSET }}
    >
      <div className="mx-auto grid w-full max-w-[var(--container-max)] gap-10 px-[var(--container-gutter)] lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
        <Reveal>
          <h2 className="font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
            Two stages, one{" "}
            <Marked kind="underline" color="var(--color-gold)">
              <span className="text-[var(--color-bright-blue)]">Kunduchi campus</span>
            </Marked>
            .
          </h2>
          <p className="mt-4 max-w-lg text-[var(--color-ink-soft)]" style={T.body}>
            Your child can start with us at two and stay until they are ready for secondary school.
          </p>
          <div className="mt-8">
            <RuledList items={facts} />
          </div>
        </Reveal>
        <Reveal direction="left">
          <Photo
            src={schoolBus}
            alt="Nursery pupils in green uniform lined up in front of an Alpha Nursery & Primary school van"
            w={1400}
            h={933}
            caption="Ready for the ride home."
            className="w-full"
            imgClassName="aspect-[3/2]"
          />
        </Reveal>
      </div>
    </section>
  );
}

// ---------- The ladder ----------

const ALPHA_CHILD = [
  { title: "Curious & full of questions", body: "Wondering out loud is encouraged.", Icon: Search },
  { title: "Confident to try", body: "Mistakes are part of learning.", Icon: ThumbsUp },
  { title: "Kind to one another", body: "Caring for friends comes first.", Icon: HeartHandshake },
  { title: "Loves stories & books", body: "Reading happens every single day.", Icon: BookOpen },
  { title: "Counts, sorts & solves", body: "Early maths through play.", Icon: Shapes },
  { title: "Ready for big school", body: "Confident, prepared, excited.", Icon: Backpack },
];

const SUBJECTS = [
  { title: "Reading & Writing", Icon: BookOpen },
  { title: "Science & Technology", Icon: FlaskConical },
  { title: "Arithmetic", Icon: Calculator },
  { title: "Environmental Care", Icon: Leaf },
  { title: "Life Skills", Icon: Puzzle },
  { title: "Social Studies", Icon: Globe2 },
  { title: "Vocational Skills", Icon: Wrench },
  { title: "Foreign Languages", Icon: Languages },
  { title: "Introduction to Aviation", Icon: Plane },
];

/** Width of the column the sticky ruler occupies on wide screens. */
const RULER_COL = "lg:grid-cols-[13.5rem_1fr]";

/**
 * Nursery then Primary, read down the page as a child climbs from age 2 to
 * 12: a bright-blue band, then a sunny gold one. On wide screens the height
 * chart rides beside both bands; on phones a strip pins under the sub-nav.
 * Either way a climber hops up the chart as the reader scrolls.
 */
function Ladder() {
  const photos = useSuspenseQuery(photosQuery).data;
  const teacher = slotPhoto(photos, "nursery-primary.days.teacher")!;
  const pupils = slotPhoto(photos, "nursery-primary.primary.pupil-portrait")!;
  return (
    <div id="ladder" className="relative mt-10 sm:mt-14">
      {/* Phones: the strip, zero-height so it never pushes content down. */}
      <div className="sticky z-30 h-0 lg:hidden" style={{ top: "calc(var(--header-h) + 3.5rem)" }}>
        <MobileRuler nurseryId="early-years" primaryId="primary" />
      </div>

      {/* Wide screens: the chart, sticky across both bands. */}
      <div aria-hidden={false} className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
        <div className="mx-auto h-full w-full max-w-[var(--container-max)] px-[var(--container-gutter)]">
          <div className="h-full w-[13.5rem] pt-[var(--space-section-y)]">
            <div className="pointer-events-auto sticky" style={{ top: "calc(var(--header-h) + 4.5rem)" }}>
              <GrowthRuler nurseryId="early-years" primaryId="primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Nursery: the bright-blue band. */}
      <section
        id="early-years"
        aria-labelledby="nursery-title"
        className="relative overflow-x-clip bg-[var(--color-bright-blue)] py-[var(--space-section-y)] text-white"
        style={{ scrollMarginTop: ANCHOR_OFFSET }}
      >
        <Wave color="var(--color-bright-blue)" />
        <Backdrop kind="star" onDark className="right-[6%] top-10" width="2.75rem" rotate={12} />
        <Backdrop kind="scribble" onDark className="bottom-16 right-[3%] hidden md:block" width="6rem" rotate={-6} />
        <div className={`mx-auto grid w-full max-w-[var(--container-max)] gap-12 px-[var(--container-gutter)] ${RULER_COL}`}>
          <div aria-hidden className="hidden lg:block" />
          <div>
            <Reveal>
              <h2 id="nursery-title" className="font-display tracking-tight" style={T.hero}>
                Nursery.{" "}
                <Marked kind="underline" color="var(--color-gold)">
                  Learning through play.
                </Marked>
              </h2>
              <RungRow rungs={NURSERY_RUNGS} ground="blue" />
              <p className="mt-5 max-w-2xl" style={{ ...T.body, color: ON.blue.body }}>
                Day Care, Baby Class, Middle Class and Pre-Unit — learning through play, songs and
                stories, building confidence, language and friendships in a calm, joyful space.
              </p>
            </Reveal>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-[1fr_1.4fr_1.4fr] md:grid-rows-2">
              <Photo
                src={daycareTeacher}
                alt="A teacher helping a toddler at a small table in a bright classroom"
                w={1000}
                h={1500}
                sticker={{ text: "Day Care", tone: "gold", tilt: -6 }}
                className="row-span-2 h-full min-h-[18rem]"
              />
              <Photo
                src={toddlersPlayroom}
                alt="Two toddlers playing with toys in the nursery playroom"
                w={1200}
                h={800}
                className="h-full"
                imgClassName="aspect-[3/2] md:aspect-auto"
              />
              <Photo
                src={ballPitCircle}
                alt="Nursery pupils and teachers sitting in a circle around coloured balls"
                w={1100}
                h={733}
                className="h-full"
                imgClassName="aspect-[3/2] md:aspect-auto"
              />
              <Photo
                src={preUnitGraduation}
                alt="A Pre-Unit pupil speaking into a microphone at the graduation"
                w={1200}
                h={800}
                caption="Pre-Unit graduation day."
                ground="blue"
                sticker={{ text: "Pre-Unit", tone: "gold", tilt: 5 }}
                className="col-span-2 md:col-span-2"
                imgClassName="aspect-[2/1] md:aspect-[5/2]"
              />
            </div>

            <div className="mt-14">
              <h3 className="font-display" style={{ ...T.cardTitle, color: "#ffffff" }}>
                What makes a young Alpha learner?
              </h3>
              <div className="mt-5">
                <RuledList items={ALPHA_CHILD} columns={2} ground="blue" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary: the gold band. */}
      <section
        id="primary"
        aria-labelledby="primary-title"
        className="relative overflow-x-clip bg-[var(--color-gold)] py-[var(--space-section-y)] text-[var(--color-deep-blue)]"
        style={{ scrollMarginTop: ANCHOR_OFFSET }}
      >
        <Wave color="var(--color-gold)" />
        <Backdrop kind="star" className="right-[8%] top-12 text-white" width="2.5rem" rotate={-14} />
        <div className={`mx-auto grid w-full max-w-[var(--container-max)] gap-12 px-[var(--container-gutter)] ${RULER_COL}`}>
          <div aria-hidden className="hidden lg:block" />
          <div>
            <Reveal>
              <h2 id="primary-title" className="font-display tracking-tight" style={T.hero}>
                Primary.{" "}
                <Marked kind="underline" color="#ffffff">
                  Grade 1 to 7.
                </Marked>
              </h2>
              <RungRow rungs={PRIMARY_RUNGS} ground="gold" />
              <p className="mt-5 max-w-2xl" style={{ ...T.body, color: ON.gold.body }}>
                A structured, ambitious curriculum — strong literacy and numeracy, plus coding from the
                very start and a head full of questions.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-[1.5fr_1fr]">
              <Photo
                src={teacher.src}
                alt={photos["nursery-primary.days.teacher"]?.alt_text ?? "A teacher helping a pupil with his work in a primary classroom"}
                w={1200}
                h={800}
                sticker={{ text: "Grade 1 to 7", tone: "navy", tilt: -5 }}
                className="h-full"
                imgClassName="aspect-[3/2] md:aspect-auto md:min-h-[22rem]"
              />
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-1">
                <Photo
                  src={pupils.src}
                  alt={photos["nursery-primary.primary.pupil-portrait"]?.alt_text ?? "Two primary pupils in uniform smiling in the school garden"}
                  w={1200}
                  h={800}
                  imgClassName="aspect-[3/2]"
                />
                <Photo
                  src={pupilDeskBoy}
                  alt="A primary pupil smiling at his desk in a bright classroom"
                  w={1200}
                  h={800}
                  imgClassName="aspect-[3/2]"
                />
              </div>
            </div>

            <div className="mt-14">
              <h3 className="font-display" style={{ ...T.cardTitle, color: ON.gold.head }}>
                What they&rsquo;ll explore
              </h3>
              <div className="mt-5">
                <RuledList items={SUBJECTS} columns={2} ground="gold" />
              </div>
              <Link
                to="/about"
                className="mt-8 inline-flex items-center gap-2 font-display text-[var(--color-deep-blue)] underline decoration-white decoration-2 underline-offset-[6px]"
                style={{ ...T.body, fontWeight: 800 }}
              >
                View the full curriculum
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            {/* The top rung: Grade 7 done, ready for secondary school. */}
            <div className="mt-16 grid gap-3 sm:gap-4 md:grid-cols-[1fr_2.2fr] md:items-end">
              <div className="order-2 md:order-1">
                <h3 className="font-display tracking-tight" style={{ ...T.section, color: ON.gold.head }}>
                  Ready for{" "}
                  <Marked kind="ring" color="#ffffff">
                    big school.
                  </Marked>
                </h3>
                <p className="mt-3" style={{ ...T.body, color: ON.gold.body }}>
                  Confident, prepared, excited — and in a cap and gown on graduation day.
                </p>
                <Photo
                  src={graduatePortrait}
                  alt="A smiling primary graduate in a blue and gold gown and cap"
                  w={800}
                  h={1192}
                  className="mt-6 hidden w-2/3 md:block"
                  imgClassName="aspect-[3/4]"
                />
              </div>
              <Photo
                src={graduationCaps}
                alt="Primary graduates in blue and gold gowns throwing their caps in the air"
                w={1400}
                h={1083}
                caption="Primary graduation day."
                ground="gold"
                sticker={{ text: "Grade 7", tone: "navy", tilt: 6 }}
                className="order-1 md:order-2"
                imgClassName="aspect-[4/3]"
              />
            </div>
          </div>
        </div>
        <Wave color="#ffffff" flip />
      </section>
    </div>
  );
}

// ---------- Activities ----------

const EXTRACURRICULUM = [
  { title: "Sports & Games", Icon: Trophy },
  { title: "Swimming", Icon: Waves },
  { title: "Music", Icon: Music },
  { title: "Coding & Digital Skills", Icon: Laptop },
  { title: "Scouts", Icon: Tent },
  { title: "DJ", Icon: Disc3 },
  { title: "Cookery", Icon: ChefHat },
  { title: "Debate & Public Speaking", Icon: Mic },
];

function Activities() {
  return (
    <section
      id="extracurriculum"
      className="relative overflow-x-clip bg-white py-[var(--space-section-y)]"
      style={{ scrollMarginTop: ANCHOR_OFFSET }}
    >
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <Reveal>
            <h2 className="font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
              Outstanding{" "}
              <Marked kind="underline" color="var(--color-gold)">
                <span className="text-[var(--color-bright-blue)]">extracurriculum</span>
              </Marked>
            </h2>
            <p className="mt-4 text-[var(--color-ink-soft)]" style={T.body}>
              Beyond the classroom, every week.
            </p>
            <div className="mt-8">
              <RuledList items={EXTRACURRICULUM} />
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Photo
              src={footballMatch}
              alt="Primary pupils in bibs running after the ball on the school field"
              w={1100}
              h={733}
              caption="Football on the field."
              sticker={{ text: "Every week", tone: "sky", tilt: -5 }}
              className="col-span-2"
              imgClassName="aspect-[2/1]"
            />
            <Photo
              src={taekwondo}
              alt="A primary pupil in a white taekwondo uniform practising a stance"
              w={900}
              h={1350}
              caption="Taekwondo."
              className="sm:-rotate-2"
              imgClassName="aspect-[3/4]"
            />
            <Photo
              src={paddlingPool}
              alt="Nursery children climbing on an inflatable in a paddling pool"
              w={1200}
              h={800}
              caption="Water play."
              className="sm:rotate-2"
              imgClassName="aspect-[3/4]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Entry requirements ----------

function EntryRequirements() {
  return (
    <section
      id="requirements"
      className="bg-white py-16"
      style={{ scrollMarginTop: ANCHOR_OFFSET }}
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-gutter)]">
        <h2 className="font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
          Entry requirements
        </h2>
        <div className="mt-6 max-w-3xl rounded-[1.25rem] border border-dashed border-[var(--color-gold)] bg-[var(--color-off-white)] p-7">
          <p className="font-display text-[var(--color-deep-blue)]" style={{ ...T.body, fontWeight: 700 }}>
            [Entry requirements — to be confirmed with academic offices]
          </p>
          <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
            Placeholder — the confirmed entry requirements for this school will be published here.
          </p>
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
      setError(
        err instanceof Error ? err.message : "Could not send your request. Please call us instead.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      id="admission"
      className="bg-[var(--color-bright-blue)] py-[var(--space-section-y)]"
      style={{ scrollMarginTop: ANCHOR_OFFSET }}
    >
      <div className="mx-auto grid w-full max-w-[var(--container-max)] gap-10 px-[var(--container-gutter)] lg:grid-cols-[1fr_1.25fr] lg:items-center lg:gap-16">
        <div className="text-white">
          <h2
            className="font-display tracking-tight"
            style={T.hero}
          >
            Come and meet us.
          </h2>
          <p className="mt-4 max-w-md text-white/90" style={T.body}>
            Tours run most mornings — bring your little one along. Tell us a little about your child
            and we&rsquo;ll arrange a visit to the campus.
          </p>
          <Link
            to="/admission"
            className={`${BTN} mt-7 border-2 border-white text-white`}
            style={{ ...T.body, fontWeight: 800 }}
          >
            Ready to apply? Get the application form
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <p className="mt-6 text-white/90" style={T.body}>
            Rather talk now? Call{" "}
            <a href="tel:+255222775046" className="font-bold text-white underline underline-offset-4">
              +255 22 277 5046
            </a>
            .
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="rounded-[1.75rem] bg-white p-6 text-left shadow-[0_24px_48px_-24px_rgba(0,46,106,0.6)] sm:p-8"
        >
          {done ? (
            <div className="py-10 text-center" role="status">
              <p className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
                Thank you — we&rsquo;ll be in touch within one working day.
              </p>
              <p className="mt-3 text-[var(--color-ink-soft)]" style={T.body}>
                If it&rsquo;s urgent, call us on{" "}
                <a href="tel:+255222775046" className="font-semibold text-[var(--color-bright-blue)] underline">
                  +255 22 277 5046
                </a>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Parent name"
                  required
                  value={form.name}
                  onChange={(v) => update("name", v)}
                  placeholder="Your full name"
                  autoComplete="name"
                />
                <Field
                  label="Email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(v) => update("email", v)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <Field
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => update("phone", v)}
                  placeholder="+255 ..."
                  autoComplete="tel"
                />
                <Field
                  label="Child's age"
                  value={form.childAge}
                  onChange={(v) => update("childAge", v)}
                  placeholder="e.g. 4"
                />
              </div>
              <div className="mt-4">
                <label className="block font-display text-[var(--color-deep-blue)]" style={{ ...T.body, fontWeight: 700 }} htmlFor="np-note">
                  A note for us (optional)
                </label>
                <textarea
                  id="np-note"
                  rows={3}
                  value={form.note}
                  onChange={(e) => update("note", e.target.value)}
                  placeholder="Anything you'd like us to know"
                  className="mt-2 w-full rounded-xl border border-[var(--color-deep-blue)]/15 bg-[var(--color-off-white)] px-4 py-3 text-[var(--color-ink)] focus:border-[var(--color-bright-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-bright-blue)]/25"
                  style={T.body}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-[var(--radius-btn)] bg-[var(--color-danger)]/10 px-4 py-3 font-medium text-[var(--color-danger)]"
                  style={T.body}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className={`${BTN} mt-6 w-full justify-center bg-[var(--color-gold)] text-[var(--color-accent-foreground)] disabled:cursor-not-allowed disabled:opacity-60`}
                style={{ ...T.body, fontWeight: 800 }}
              >
                {busy ? "Sending…" : "Request a visit"}
                {!busy && <ArrowRight className="h-4 w-4" aria-hidden />}
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="font-display text-[var(--color-deep-blue)]" style={{ ...T.body, fontWeight: 700 }}>
        {label}
        {required && (
          <span aria-hidden className="text-[var(--color-danger)]">
            {" "}
            *
          </span>
        )}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[var(--color-deep-blue)]/15 bg-[var(--color-off-white)] px-4 py-3 text-[var(--color-ink)] focus:border-[var(--color-bright-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-bright-blue)]/25"
        style={T.body}
      />
    </label>
  );
}

// ---------- A peek inside (gallery) ----------

function PeekInside() {
  const photos = useSuspenseQuery(photosQuery).data;
  // An uploaded photo brings its own description, which then also captions it,
  // so a staff replacement is never mislabelled by the default caption.
  const tile = (key: string, caption: string) => {
    const p = slotPhoto(photos, key)!;
    const uploaded = photos[key]?.alt_text;
    return { src: p.src, alt: uploaded ?? caption, caption: uploaded ?? caption };
  };
  return (
    <section id="gallery" style={{ scrollMarginTop: ANCHOR_OFFSET }} className="relative overflow-x-clip bg-[color-mix(in_srgb,var(--color-bright-blue)_8%,white)] py-[var(--space-section-y)]">
      <Backdrop kind="star" className="left-[4%] top-8 text-[var(--color-gold)]" width="2.5rem" rotate={10} />
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
            A peek <span className="text-[var(--color-bright-blue)]">inside</span>
          </h2>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 font-display text-[var(--color-deep-blue)] underline decoration-[var(--color-gold)] decoration-2 underline-offset-[6px] hover:text-[var(--color-bright-blue)]"
            style={{ ...T.body, fontWeight: 800 }}
          >
            See the full gallery
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <GalleryTile {...tile("nursery-primary.gallery.play-discovery", "Down the slide")} className="row-span-2 md:min-h-[20rem]" />
          <GalleryTile {...tile("nursery-primary.gallery.playground", "The playground")} className="col-span-1 aspect-[4/3] md:col-span-2 md:aspect-auto" />
          <GalleryTile {...tile("nursery-primary.gallery.shapes", "Our nursery classroom")} className="aspect-[4/3]" />
          <GalleryTile {...tile("nursery-primary.gallery.toy-car", "Little drivers")} className="aspect-[4/3]" />
          <GalleryTile {...tile("nursery-primary.gallery.telescope", "Painting together")} className="aspect-[4/3]" />
          <GalleryTile {...tile("nursery-primary.gallery.one-to-one", "One-on-one help")} className="col-span-2 aspect-[2/1] md:col-span-1 md:aspect-[4/3]" />
          <GalleryTile {...tile("nursery-primary.gallery.sports-teamwork", "Games on the field")} className="col-span-2 aspect-[2/1]" />
          <GalleryTile {...tile("nursery-primary.gallery.dance", "Traditional dance")} className="aspect-[4/3] md:aspect-auto" />
          <GalleryTile {...tile("nursery-primary.gallery.speakers-team", "Culture day")} className="aspect-[4/3] md:aspect-auto" />
          <GalleryTile {...tile("nursery-primary.gallery.speakers-challenge", "Graduation performance")} className="col-span-2 aspect-[2/1]" />
          <GalleryTile {...tile("nursery-primary.gallery.musical-chairs", "Outdoor play")} className="col-span-2 aspect-[2/1]" />
        </div>
      </div>
    </section>
  );
}

function GalleryTile({
  src,
  alt,
  caption,
  className = "",
}: {
  src: string;
  alt: string;
  caption: string;
  className?: string;
}): ReactNode {
  return (
    <figure className={`group relative overflow-hidden rounded-[1.25rem] bg-[var(--color-deep-blue)]/5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-10 hover:-rotate-1 hover:scale-[1.02] motion-reduce:transition-none ${className}`}>
      <img
        width={1200}
        height={800}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
      />
      <figcaption
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(0,26,60,0.8)] to-transparent p-3 pt-8 text-white"
        style={{ ...T.body, fontWeight: 700 }}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
