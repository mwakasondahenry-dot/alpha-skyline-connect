import { SchoolFacilitiesSection } from "@/components/school/facilities-section";
import { SchoolSubNav } from "@/components/school/school-sub-nav";
import { CinematicHero, GoldButton, GhostButton } from "@/components/alpha-ui";
import { SubjectExplorer } from "@/components/school/subject-explorer";
import type { CombinationGroup } from "@/components/school/subject-lists";
import { UnconfirmedNote } from "@/components/school/unconfirmed-note";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { schoolLd, breadcrumbLd } from "@/lib/structured-data";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSchoolBundle, getSchoolPhotos, type SchoolBundle } from "@/lib/alpha-content.functions";
import { ParentVoices } from "@/components/school/parent-voices";
import { testimonialsQuery } from "@/lib/testimonials-query";
import { slotPhoto } from "@/lib/photo-slots";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import { T, SHELL } from "@/components/type-roles";
import { ArrowRight, Pin, Plane, Laptop, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import labPractical from "@/assets/ah-lab-practical.webp";
import libraryShelves from "@/assets/ah-library-shelves.webp";
import libraryBoy from "@/assets/ah-library-boy.webp";
import libraryGirl from "@/assets/ah-library-girl.webp";
import classroom from "@/assets/ah-classroom.webp";
import gradPortrait1 from "@/assets/ah-grad-portrait-1.webp";
import gradPortrait2 from "@/assets/ah-grad-portrait-2.webp";
import gradPortrait3 from "@/assets/ah-grad-portrait-3.webp";
import gradsTree from "@/assets/ah-grads-tree.webp";
import gradSashBoy from "@/assets/ah-grad-sash-boy.webp";
import gradSashGirl from "@/assets/ah-grad-sash-girl.webp";
import f4GradStage from "@/assets/ah-f4-grad-stage.webp";
import f4GradTrio from "@/assets/ah-f4-grad-trio.webp";
import f4GradBoys from "@/assets/ah-f4-grad-boys.webp";
import f4GradGirl1 from "@/assets/ah-f4-grad-girl-1.webp";
import charityVisit from "@/assets/ah-charity-visit.webp";
import beachCleanup1 from "@/assets/ah-beach-cleanup-1.webp";
import beachCleanup2 from "@/assets/ah-beach-cleanup-2.webp";
import taweceTeam from "@/assets/ah-tawece-team.webp";
import taweceDemo from "@/assets/ah-tawece-demo.webp";
import taweceAward from "@/assets/ah-tawece-award.webp";
import taweceTrophy from "@/assets/ah-tawece-trophy.webp";
import tbcDesk from "@/assets/ah-tbc-desk.webp";
import tbcCamera from "@/assets/ah-tbc-camera.webp";
import tbcControl from "@/assets/ah-tbc-control.webp";
import tbcOutside from "@/assets/ah-tbc-outside.webp";
import timexpoStand from "@/assets/ah-timexpo-stand.webp";
import timexpoTeam from "@/assets/ah-timexpo-team.webp";
import tablets from "@/assets/ah-tablets.webp";
import chemBeakers from "@/assets/ah-chem-beakers.webp";
import chemLab from "@/assets/ah-chem-lab.webp";
import studyGirl from "@/assets/ah-study-girl.webp";
import studyClass from "@/assets/ah-study-class.webp";
import djClub1 from "@/assets/ah-dj-club-1.webp";
import djClub2 from "@/assets/ah-dj-club-2.webp";
import foodServing from "@/assets/ah-food-serving.webp";
import foodTray from "@/assets/ah-food-tray.webp";
import foodFruit from "@/assets/ah-food-fruit.webp";
import foodLunch from "@/assets/ah-food-lunch.webp";
import debatePlaque from "@/assets/ah-debate-plaque.webp";
import debateTrophy from "@/assets/ah-debate-trophy.webp";
import debateTeam from "@/assets/ah-debate-team.webp";
import debateAward from "@/assets/ah-debate-award.webp";
import debateSpeaker from "@/assets/ah-debate-speaker.webp";
import debateBoy from "@/assets/ah-debate-boy.webp";
import debateGirl from "@/assets/ah-debate-girl.webp";

const slug = "alpha-high" as const;
const ACCENT = "var(--color-deep-blue)";
const GOLD = "var(--color-gold)";

const photosQuery = queryOptions({
  queryKey: ["school-photos", "alpha-high"],
  queryFn: () => getSchoolPhotos({ data: { slug: "alpha-high" as const } }),
  staleTime: 5 * 60 * 1000,
});

const bundleQuery = queryOptions({
  queryKey: ["school-bundle", slug],
  queryFn: () => getSchoolBundle({ data: { slug } }),
});

export const Route = createFileRoute("/schools/alpha-high")({
  head: () => ({
    ...seo({
      title: "Alpha High, Mikocheni — Alpha Schools, Dar es Salaam",
      description:
        "Alpha High School in Mikocheni, Dar es Salaam: a co-education secondary teaching Form 1 to Form 6, with 17 O-Level subjects and 12 A-Level combinations.",
      path: "/schools/alpha-high",
      ld: [
        schoolLd(
          "alpha-high",
          "A co-education secondary school in Mikocheni, Dar es Salaam, teaching Form 1 to Form 6.",
        ),
        breadcrumbLd([{ name: "Alpha High", path: "/schools/alpha-high" }]),
      ],
    }),
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(bundleQuery),
      context.queryClient.ensureQueryData(photosQuery),
      context.queryClient.ensureQueryData(testimonialsQuery),
    ]),
  component: AlphaHighRoute,
});

function AlphaHighRoute() {
  const { data } = useSuspenseQuery(bundleQuery);
  return <AlphaHighPage bundle={data} />;
}

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
  "Historia ya Tanzania na Maadili",
  "Civics",
  "History",
  "Geography",
  "Kiswahili",
  "English Language",
  "Business Studies",
  "Book Keeping",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Chinese",
  "French",
  "Literature in English",
  "ICS",
  "Additional Mathematics",
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
    items: [
      "Chinese",
      "French",
      "Computer Science",
      "History",
      "Biology",
      "Physics",
      "Chemistry",
      "Book Keeping",
    ],
  },
  {
    form: "Form Three",
    note: "Nine option subjects",
    items: [
      "Chinese",
      "French",
      "ICS",
      "Literature in English",
      "Commerce",
      "Book Keeping",
      "Physics",
      "Chemistry",
      "Additional Mathematics",
    ],
  },
  {
    form: "Form Four",
    note: "Nine option subjects",
    items: [
      "Chinese",
      "French",
      "ICS",
      "Literature in English",
      "Commerce",
      "Book Keeping",
      "Physics",
      "Chemistry",
      "Additional Mathematics",
    ],
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

const CLUBS = [
  { name: "Aviation", key: "alpha-high.clubs.aviation" },
  { name: "Drama", key: "alpha-high.clubs.drama" },
  { name: "Music & Dance", key: "alpha-high.clubs.music" },
  { name: "Debate", key: "alpha-high.clubs.debate" },
  { name: "Art & Drawing", key: "alpha-high.clubs.art" },
  { name: "Cookery", key: "alpha-high.clubs.cookery" },
  { name: "Scout", key: "alpha-high.clubs.scout" },
  { name: "Public Speaking", key: "alpha-high.clubs.speaking" },
  { name: "Model UN", key: "alpha-high.clubs.model-un" },
  { name: "Environment", key: "alpha-high.clubs.environment" },
];
const SPORTS = ["Football", "Basketball", "Volleyball", "Netball", "Athletics"] as const;

/** Section anchors for the shared sub-nav, in the order the reader meets them. */
const SUB_NAV = [
  { label: "Subjects", href: "#academics" },
  { label: "Moments", href: "#feed" },
  { label: "Clubs & sport", href: "#clubs" },
  { label: "Admission", href: "#admission" },
] as const;

const ANCHOR = { scrollMarginTop: "calc(var(--header-h) + 3.75rem)" };

/* ------------------------------------------------------------------ *
 * The feed
 *
 * Every photograph is the school's own: the Alpha High folder supplied for
 * this page, and the school's Instagram (@alphaschoolstz), whose captions
 * are the source for every fact in a card. Nothing is described that the
 * photograph or the caption does not show. Students are unnamed.
 * ------------------------------------------------------------------ */

type Photo = { src: string; alt: string; w: number; h: number };

const HIGHLIGHTS: ReadonlyArray<{ label: string; href: string; src: string }> = [
  { label: "Lab", href: "#lab", src: chemBeakers },
  { label: "TBC", href: "#tbc", src: tbcCamera },
  { label: "Engineers", href: "#tawece", src: taweceTrophy },
  { label: "Debate", href: "#debate", src: debateTrophy },
  { label: "Library", href: "#library", src: libraryShelves },
  { label: "Graduation", href: "#graduation", src: f4GradStage },
];

function AlphaHighPage({ bundle }: { bundle: SchoolBundle }) {
  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <SiteHeader overlay />
      <Hero />
      <SchoolSubNav items={SUB_NAV} />

      <div
        className={`${SHELL} grid gap-10 py-[var(--space-section-y)] lg:grid-cols-[minmax(0,44rem)_1fr] lg:gap-16`}
      >
        <main id="feed" className="min-w-0 space-y-8 sm:space-y-10" style={ANCHOR}>
          <AcademicsPost />

          <Moment
            id="lab"
            title="Where curiosity meets chemistry."
            body="The school's laboratories are where its young scientists explore, experiment and find what they love. Practicals run across Physics, Chemistry and Biology."
            source="Alpha Schools on Instagram, August 2023"
            photos={[
              {
                src: labPractical,
                alt: "Three Alpha High students in green uniform running a practical at a laboratory bench",
                w: 1800,
                h: 1200,
              },
              {
                src: chemBeakers,
                alt: "Two beakers of blue and yellow solutions labelled S1 and S4 on a laboratory bench",
                w: 1200,
                h: 1200,
              },
              {
                src: chemLab,
                alt: "Alpha High students in blue tracksuits at work during a laboratory practical",
                w: 1200,
                h: 1200,
              },
            ]}
          />

          <MissionPost />

          <Moment
            id="tawece"
            title="2nd overall out of 24 schools."
            body="At the 9th Tanzania Women Engineers Convention Exhibition (TAWECE 2024) at the JNICC in Dar es Salaam, Alpha High and Alpha Girls students presented five projects: a Smart Reading Table, Smart Blind Glasses, a Radar and a Smart Blind Stick from Alpha High, and Greenhouse Effects from Alpha Girls."
            source="Alpha Schools on Instagram, 22 August 2024"
            photos={[
              {
                src: taweceTrophy,
                alt: "The TAWECE 2024 second runner-up award plaque, engraved on a glass trophy",
                w: 720,
                h: 481,
              },
              {
                src: taweceTeam,
                alt: "Alpha students in uniform standing in front of the TAWECE 2024 banner",
                w: 719,
                h: 479,
              },
              {
                src: taweceDemo,
                alt: "A student demonstrating a project model to visitors at the exhibition stand",
                w: 720,
                h: 481,
              },
              {
                src: taweceAward,
                alt: "A student receiving a certificate on stage at the convention",
                w: 720,
                h: 481,
              },
            ]}
            layout="trophy"
          />

          <Moment
            id="tbc"
            title="On air at TBC."
            body="A visit to the Tanzania Broadcasting Corporation: the news desk, the studio cameras, the control room. In the school's words, an oasis for unearthing students' potential in media."
            source="Alpha Schools on Instagram, 6 August 2024"
            photos={[
              {
                src: tbcDesk,
                alt: "Alpha High students standing behind the TBC news desk in the studio",
                w: 1200,
                h: 1472,
              },
              {
                src: tbcCamera,
                alt: "A student operating a broadcast camera in the TBC studio",
                w: 1200,
                h: 1468,
              },
              {
                src: tbcControl,
                alt: "Students watching the monitors in the TBC control room",
                w: 1200,
                h: 1467,
              },
              {
                src: tbcOutside,
                alt: "The visiting group gathered outside the TBC building",
                w: 1200,
                h: 1467,
              },
            ]}
            layout="pair"
          />

          <Moment
            id="debate"
            title="Best Institution from East Africa."
            body="At the Tanzania National World Schools Debate Championship 2026, Alpha took two awards: Best Institution from East Africa, and Junior Plate winners."
            source="Alpha Schools on Instagram, 17 August 2026"
            photos={[
              {
                src: debateTeam,
                alt: "Alpha debaters in blue tracksuits holding their medals together",
                w: 1000,
                h: 1196,
              },
              {
                src: debatePlaque,
                alt: "The TCRO award plaque for Best Institution from East Africa",
                w: 900,
                h: 1080,
              },
              { src: debateTrophy, alt: "The Junior Plate winners' gold trophy", w: 809, h: 970 },
              {
                src: debateSpeaker,
                alt: "A student in a white headscarf speaking during a debate round",
                w: 1000,
                h: 1196,
              },
              {
                src: debateBoy,
                alt: "A student in a green shirt reading his notes while speaking",
                w: 1000,
                h: 1196,
              },
              { src: debateAward, alt: "A student receiving her medal on stage", w: 1000, h: 1196 },
            ]}
            layout="wall"
          />

          <Moment
            id="library"
            title="The library, Mikocheni."
            body="Shelves of set books and references, and quiet desks to work at. Reading is part of the timetable, not an extra."
            source="Alpha High, school photographs"
            photos={[
              {
                src: libraryShelves,
                alt: "Two students reaching for books on the tall library shelves",
                w: 1600,
                h: 1067,
              },
              {
                src: libraryBoy,
                alt: "A student reading between the library shelves",
                w: 1000,
                h: 1500,
              },
              {
                src: libraryGirl,
                alt: "A student holding a textbook in the library aisle",
                w: 1000,
                h: 1500,
              },
            ]}
          />

          <Moment
            id="tablets"
            title="Beyond textbooks."
            body="Tablets in class alongside the books: the school's way of merging traditional teaching with digital tools. Coding runs through the timetable, and the aviation programme is on it too."
            source="Alpha Schools on Instagram, 18 August 2023"
            photos={[
              {
                src: tablets,
                alt: "Two Alpha students in blue tracksuits working on a tablet together",
                w: 1200,
                h: 1500,
              },
              {
                src: studyGirl,
                alt: "A student in a blue polo shirt studying at a desk",
                w: 1200,
                h: 1200,
              },
              {
                src: studyClass,
                alt: "A class of students writing at their desks",
                w: 1200,
                h: 1200,
              },
            ]}
            layout="pair"
            links={[
              { to: "/coding", label: "Coding at Alpha", Icon: Laptop },
              { to: "/aviation", label: "The aviation programme", Icon: Plane },
            ]}
          />

          <Moment
            id="timexpo"
            title="Out at TIMEXPO."
            body="Alpha students at the Tanzania International Manufacturers Expo at Diamond Jubilee, at the Czech Republic company stand."
            source="Alpha Schools on Instagram, 21 October 2023"
            photos={[
              {
                src: timexpoTeam,
                alt: "Alpha students lined up in white shirts at the TIMEXPO exhibition",
                w: 897,
                h: 503,
              },
              {
                src: timexpoStand,
                alt: "A student examining a machine at an exhibition stand",
                w: 897,
                h: 502,
              },
            ]}
            layout="pair"
          />

          <ClubsPost />

          <Moment
            id="food"
            title="Four meals a day."
            body="Good food, properly served: four meals every day, with fruit and vegetables daily, and the right safety at the serving line."
            source="Alpha Schools on Instagram, 5 October 2021"
            photos={[
              {
                src: foodLunch,
                alt: "Students in blue tracksuits eating together at a dining table",
                w: 720,
                h: 481,
              },
              {
                src: foodServing,
                alt: "Students collecting their meals at the serving line",
                w: 720,
                h: 480,
              },
              {
                src: foodTray,
                alt: "Trays of rice and chicken in the serving counter",
                w: 720,
                h: 481,
              },
              { src: foodFruit, alt: "A tray of cut watermelon and fruit", w: 720, h: 481 },
            ]}
            layout="trophy"
          />

          <Moment
            id="charity"
            title="Alpha Aid."
            body="The school's charity event: students giving time to a community visit."
            source="Alpha High, school photographs"
            photos={[
              {
                src: charityVisit,
                alt: "An Alpha student in a blue uniform carrying a small child at the charity visit",
                w: 720,
                h: 1280,
              },
            ]}
            layout="portrait"
          />

          <Moment
            id="graduation"
            title="Form Four graduation day."
            body="Gowns, sashes, and the whole year together on the stage. Then Form Six, two years on: the climb finished."
            source="Alpha High, school photographs"
            photos={[
              {
                src: f4GradStage,
                alt: "The Form Four graduating class on stage in black gowns in front of the Alpha Schools banner",
                w: 1800,
                h: 1200,
              },
              {
                src: f4GradTrio,
                alt: "Three graduates in black outfits posing together",
                w: 1400,
                h: 933,
              },
              { src: f4GradBoys, alt: "Graduates in suits seated in the hall", w: 1400, h: 1066 },
              {
                src: f4GradGirl1,
                alt: "A graduate in a pink dress wearing her Class of 2026 sash",
                w: 900,
                h: 1176,
              },
            ]}
            layout="trophy"
          />

          <Moment
            id="form-six"
            title="Form Six, done."
            body="Alpha High's A-Level graduates in their gowns and hoods."
            source="Alpha High, school photographs"
            photos={[
              {
                src: gradsTree,
                alt: "Two Form Six graduates in gowns and caps under a tree",
                w: 1000,
                h: 1500,
              },
              { src: gradPortrait1, alt: "A Form Six graduate in cap and gown", w: 800, h: 1120 },
              { src: gradPortrait2, alt: "A Form Six graduate in cap and gown", w: 800, h: 1120 },
              { src: gradPortrait3, alt: "A Form Six graduate in cap and gown", w: 800, h: 1121 },
              {
                src: gradSashBoy,
                alt: "A graduate in a suit with a Form Six HGE sash",
                w: 800,
                h: 1200,
              },
              {
                src: gradSashGirl,
                alt: "A graduate wearing her Class of 2026 sash",
                w: 800,
                h: 1200,
              },
            ]}
            layout="wall"
          />

          <AdmissionPost />
        </main>

        <Rail />
      </div>

      <Staff staff={bundle.staff} />
      <ParentVoices school="alpha-high" accent="var(--color-deep-blue)" />
      <ApplyBanner />
      <AlphaHighFooter />
    </div>
  );
}

// ---------- Hero ----------

function Hero() {
  return (
    <CinematicHero
      lineOne="Excellence through challenge."
      lineTwo="Built for the long climb."
      blurb="Our flagship secondary in Mikocheni. NECTA rigour, with aviation and coding at the core. Boys and girls, Form 1 to Form 6."
      media={
        <HeroSlideshow
          pageKey="alpha-high"
          fallback={[
            { src: labPractical, alt: "Alpha High students running a practical in the laboratory" },
            { src: f4GradStage, alt: "The Form Four graduating class on stage" },
            { src: classroom, alt: "A teacher with students in an Alpha High classroom" },
          ]}
        />
      }
      actions={
        <>
          <GoldButton href="#academics">
            Subjects and combinations
            <ArrowRight className="h-4 w-4" aria-hidden />
          </GoldButton>
          <GhostButton to="/contact" onNavy>
            Book a school tour
          </GhostButton>
        </>
      }
      foot={<Highlights />}
    />
  );
}

/** Round photo shortcuts into the feed, the way a profile pins its stories. */
function Highlights() {
  return (
    <div className="relative border-t border-white/15 bg-[rgba(0,26,60,0.55)] backdrop-blur-sm">
      <ul
        className={`${SHELL} flex snap-x gap-5 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-7`}
      >
        {HIGHLIGHTS.map((h) => (
          <li key={h.href} className="shrink-0 snap-start">
            <a href={h.href} className="group flex flex-col items-center gap-1.5 text-white">
              <span
                className="grid h-16 w-16 place-items-center rounded-full p-[3px] transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none"
                style={{ background: GOLD }}
              >
                <img
                  src={h.src}
                  alt=""
                  width={64}
                  height={64}
                  loading="eager"
                  className="h-full w-full rounded-full border-2 border-[var(--color-deep-blue)] object-cover"
                />
              </span>
              <span style={{ ...T.body, fontWeight: 700 }}>{h.label}</span>
            </a>
          </li>
        ))}
      </ul>
      {/* On phones the strip runs past the edge; a fade says "more". */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-14 sm:hidden"
        style={{ background: "linear-gradient(to right, transparent, rgba(0,26,60,0.85))" }}
      />
    </div>
  );
}

// ---------- Feed cards ----------

function Card({
  id,
  children,
  pinned = false,
}: {
  id?: string;
  children: ReactNode;
  pinned?: boolean;
}) {
  return (
    <Reveal>
      <article
        id={id}
        style={ANCHOR}
        className={`overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-[var(--color-hairline)] shadow-[0_18px_40px_-28px_rgba(0,46,106,0.5)] ${
          pinned ? "border-t-[6px] border-[var(--color-gold)]" : ""
        }`}
      >
        {children}
      </article>
    </Reveal>
  );
}

function CardHead({
  title,
  body,
  source,
  pinned,
}: {
  title: string;
  body?: string;
  source?: string;
  pinned?: boolean;
}) {
  return (
    <div className="px-5 pt-5 sm:px-7 sm:pt-7">
      <h2 className="font-display text-[var(--color-deep-blue)]" style={T.section}>
        {pinned && (
          <span
            className="mr-2 inline-grid h-8 w-8 translate-y-[-2px] place-items-center rounded-full align-middle"
            style={{ background: GOLD }}
            aria-label="Pinned post"
          >
            <Pin className="h-4 w-4 text-[var(--color-deep-blue)]" aria-hidden />
          </span>
        )}
        {title}
      </h2>
      {body && (
        <p className="mt-2 text-[var(--color-ink)]/85" style={T.body}>
          {body}
        </p>
      )}
      {source && (
        <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
          {source}
        </p>
      )}
    </div>
  );
}

const Img = ({
  p,
  className = "",
  eager = false,
}: {
  p: Photo;
  className?: string;
  eager?: boolean;
}) => (
  <img
    src={p.src}
    alt={p.alt}
    width={p.w}
    height={p.h}
    loading={eager ? "eager" : "lazy"}
    decoding="async"
    className={`h-full w-full object-cover ${className}`}
  />
);

/**
 * One moment: a photo set with the school's own words beneath it.
 * Layouts: single (one wide photo, small ones under), pair (two tall),
 * trophy (one wide, three small), wall (a grid of portraits), portrait.
 */
function Moment({
  id,
  title,
  body,
  source,
  photos,
  layout = "single",
  links,
}: {
  id: string;
  title: string;
  body: string;
  source: string;
  photos: ReadonlyArray<Photo>;
  layout?: "single" | "pair" | "trophy" | "wall" | "portrait";
  links?: ReadonlyArray<{ to: "/coding" | "/aviation"; label: string; Icon: LucideIcon }>;
}) {
  const [first, ...rest] = photos;
  return (
    <Card id={id}>
      <div className="p-2 sm:p-3">
        {layout === "single" && (
          <div className="grid gap-2 sm:gap-3">
            <div className="aspect-[3/2] overflow-hidden rounded-[0.9rem]">
              <Img p={first} />
            </div>
            {rest.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {rest.slice(0, 2).map((p) => (
                  <div key={p.src} className="aspect-square overflow-hidden rounded-[0.9rem]">
                    <Img p={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {layout === "pair" && (
          <div className="grid gap-2 sm:gap-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {photos.slice(0, 2).map((p) => (
                <div key={p.src} className="aspect-[4/5] overflow-hidden rounded-[0.9rem]">
                  <Img p={p} />
                </div>
              ))}
            </div>
            {photos.length > 2 && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {photos.slice(2, 4).map((p) => (
                  <div key={p.src} className="aspect-[4/3] overflow-hidden rounded-[0.9rem]">
                    <Img p={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {layout === "trophy" && (
          <div className="grid gap-2 sm:gap-3">
            <div className="aspect-[3/2] overflow-hidden rounded-[0.9rem]">
              <Img p={first} />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {rest.slice(0, 3).map((p) => (
                <div key={p.src} className="aspect-square overflow-hidden rounded-[0.9rem]">
                  <Img p={p} />
                </div>
              ))}
            </div>
          </div>
        )}
        {layout === "wall" && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {photos.map((p, i) => (
              <div
                key={p.src}
                className={`${i === 0 ? "col-span-2 row-span-2" : ""} aspect-[4/5] overflow-hidden rounded-[0.9rem]`}
              >
                <Img p={p} />
              </div>
            ))}
          </div>
        )}
        {layout === "portrait" && (
          <div className="aspect-[4/5] overflow-hidden rounded-[0.9rem] sm:aspect-[3/2]">
            <Img p={first} className="object-top" />
          </div>
        )}
      </div>
      <CardHead title={title} body={body} source={source} />
      {links && (
        <div className="flex flex-wrap gap-2 px-5 pt-4 sm:px-7">
          {links.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-4 py-2 text-white transition-transform hover:-translate-y-[1px] motion-reduce:transition-none"
              style={{ ...T.body, fontWeight: 700, background: ACCENT }}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      )}
      <div className="h-5 sm:h-7" />
    </Card>
  );
}

/** The school's own mission, as a text post, on every viewport. */
function MissionPost() {
  return (
    <Card id="mission">
      <CardHead
        title="Education that grows the whole student."
        body="Established 19 March 2007, Alpha High was founded to enable students to achieve academic excellence through intellectual and physical challenge, and to become responsible citizens of a dynamic society."
      />
      <ul className="px-5 pb-6 pt-4 sm:px-7 sm:pb-7">
        {[
          "A source of intellectual, spiritual and cultural growth.",
          "Knowledge that meets individual needs.",
          "Critical and divergent thinking.",
          "All-rounded students.",
          "Attitudes that make students social, mobile, interactive, ambitious and self-directed.",
        ].map((m) => (
          <li
            key={m}
            className="flex gap-3 border-t border-[var(--color-hairline)] py-2.5 text-[var(--color-ink)]/85 last:border-b"
            style={T.body}
          >
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: GOLD }}
            />
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** The academics, pinned to the top of the feed, with working filters. */
function AcademicsPost() {
  return (
    <Card id="academics" pinned>
      <CardHead
        pinned
        title="Seventeen subjects at O-Level, twelve combinations at A-Level."
        body="Pick a form or a stream, or search a subject, and the lists narrow to what fits you."
      />
      <div className="px-5 py-5 sm:px-7 sm:py-7">
        <SubjectExplorer
          subjects={O_LEVEL_SUBJECTS}
          forms={FORM_OPTIONS}
          combos={A_COMBOS}
          accent={ACCENT}
          subjectsNote={
            /* The school has never said which of the seventeen are core; the
               one grouping invented here before had to be removed. See
               design/CONTENT-FROM-SCHOOL.md. */
            <UnconfirmedNote>
              [Which of these seventeen are core for every pupil, and which are offered as options —
              to be provided by the school.]
            </UnconfirmedNote>
          }
        />
        <p className="mt-5 text-[var(--color-ink-soft)]" style={T.body}>
          Not sure which combination fits? The academic team can talk a pupil through the options
          before Form Five.{" "}
          <Link
            to="/contact"
            className="font-bold text-[var(--color-deep-blue)] underline underline-offset-4"
          >
            Talk to our team
          </Link>
        </p>
      </div>
    </Card>
  );
}

/** Clubs, sport and the DJ decks, with the club photographs staff can replace. */
function ClubsPost() {
  const photos = useSuspenseQuery(photosQuery).data;
  return (
    <Card id="clubs">
      <div className="grid grid-cols-2 gap-2 p-2 sm:gap-3 sm:p-3">
        <div className="col-span-2 aspect-[16/9] overflow-hidden rounded-[0.9rem]">
          <Img
            p={{
              src: djClub2,
              alt: "An Alpha student in a blue tracksuit on the DJ decks with a laptop",
              w: 1080,
              h: 609,
            }}
          />
        </div>
        <div className="aspect-square overflow-hidden rounded-[0.9rem]">
          <Img
            p={{
              src: beachCleanup1,
              alt: "Environment club members collecting litter on the beach",
              w: 1080,
              h: 1080,
            }}
          />
        </div>
        <div className="aspect-square overflow-hidden rounded-[0.9rem]">
          <Img
            p={{
              src: beachCleanup2,
              alt: "The environment club in blue and teal tracksuits on the beach after the clean-up",
              w: 1080,
              h: 1080,
            }}
          />
        </div>
      </div>
      <CardHead
        title="The other half of an Alpha education."
        body="Ten student-led clubs, five sports, and the decks. The environment club's beach clean-up and the DJ club are above; every club has its own photograph below."
        source="Alpha Schools on Instagram, June 2024, and school photographs"
      />
      <ul
        className="mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-7"
        style={{
          maskImage: "linear-gradient(to right, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, black 90%, transparent)",
        }}
      >
        {CLUBS.map((c) => {
          const p = slotPhoto(photos, c.key)!;
          return (
            <li key={c.key} className="w-36 shrink-0 snap-start">
              <div className="aspect-[4/5] overflow-hidden rounded-[0.9rem]">
                <img
                  src={p.src}
                  alt={photos[c.key]?.alt_text ?? `${c.name} club at Alpha High`}
                  width={800}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <p
                className="mt-1.5 font-display text-[var(--color-deep-blue)]"
                style={{ ...T.body, fontWeight: 700 }}
              >
                {c.name}
              </p>
            </li>
          );
        })}
      </ul>
      <div className="px-5 pb-6 pt-4 sm:px-7 sm:pb-7">
        <p
          className="font-display text-[var(--color-deep-blue)]"
          style={{ ...T.body, fontWeight: 800 }}
        >
          Sport
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {SPORTS.map((s) => (
            <li
              key={s}
              className="rounded-[var(--radius-pill)] bg-[var(--color-off-white)] px-3 py-1 text-[var(--color-ink)] ring-1 ring-[var(--color-hairline)]"
              style={{ ...T.body, fontWeight: 600 }}
            >
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[var(--color-ink)]/85" style={T.body}>
          <strong className="text-[var(--color-deep-blue)]">Counselling.</strong> Alpha High runs a
          school counselling department, accessible to every student: confidential, professional,
          and built into school life.
        </p>
      </div>
    </Card>
  );
}

/** How a place is offered: the documented process, and what is still owed. */
function AdmissionPost() {
  return (
    <Card id="admission">
      <CardHead title="How a place at Alpha High is offered." />
      <div className="px-5 pb-6 pt-4 sm:px-7 sm:pb-7">
        <ol className="border-t border-[var(--color-hairline)]">
          {ADMISSION_STEPS.map((step, i) => (
            <li
              key={step}
              className="grid grid-cols-[2.25rem_1fr] items-baseline gap-3 border-b border-[var(--color-hairline)] py-3.5"
            >
              <span
                className="font-display text-[var(--color-deep-blue)] tabular-nums"
                style={{ ...T.section, lineHeight: 1 }}
              >
                {i + 1}
              </span>
              <p className="text-[var(--color-ink)]" style={T.body}>
                {step}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[var(--color-ink-soft)]" style={T.body}>
          These two figures are part of the admission process, not the cost of attending. [Fee
          structure per school &mdash; to be provided]
        </p>
        <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
          [Entry requirements &mdash; to be confirmed with academic offices]
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <GoldButton to="/admission">
            Get the application form
            <ArrowRight className="h-4 w-4" aria-hidden />
          </GoldButton>
          <GhostButton to="/contact">Book a school tour</GhostButton>
        </div>
      </div>
    </Card>
  );
}

/** Wide screens only: the highlights again, pinned beside the feed, and the apply button. */
function Rail() {
  return (
    <aside className="hidden min-w-0 lg:block">
      <div className="sticky top-[calc(var(--header-h)+4.5rem)] space-y-6">
        <div className="rounded-[1.25rem] bg-[var(--color-deep-blue)] p-6 text-white">
          <p className="font-display" style={T.cardTitle}>
            Alpha High, Mikocheni
          </p>
          <p className="mt-1 text-white/85" style={T.body}>
            Co-education, Form 1 to Form 6. Established 19 March 2007.
          </p>
          <ul className="mt-5 space-y-2">
            {HIGHLIGHTS.map((h) => (
              <li key={h.href}>
                <a
                  href={h.href}
                  className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-white/10"
                >
                  <img
                    src={h.src}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    className="h-10 w-10 rounded-full object-cover ring-2"
                    style={{ ["--tw-ring-color" as string]: GOLD }}
                  />
                  <span style={{ ...T.body, fontWeight: 700 }}>{h.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <Link
            to="/admission"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] py-3 text-[var(--color-accent-foreground)] transition-transform hover:-translate-y-[1px] motion-reduce:transition-none"
            style={{ ...T.body, fontWeight: 800, background: GOLD }}
          >
            Enroll Now
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}

// ---------- Staff ----------

function Staff({ staff }: { staff: SchoolBundle["staff"] }) {
  // seed Head Teacher if backend hasn't supplied anyone yet
  const list =
    staff.length > 0
      ? staff
      : [{ id: "seed-head", name: "Richard Gatere Maina", title: "Head Teacher", photo_url: null }];

  return (
    <section className="bg-[var(--color-off-white)]">
      <div className={`${SHELL} py-[var(--space-section-y)]`}>
        <Reveal direction="up" className="max-w-2xl">
          <h2 className="font-display" style={{ ...T.section, color: ACCENT }}>
            The people behind the climb.
          </h2>
        </Reveal>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <li key={p.id}>
              <Reveal direction="up">
                {/* With a photograph: a portrait card. Without one: a short
                    row that says so, rather than a tall empty panel. */}
                <article className="h-full overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-[var(--color-hairline)]">
                  {p.photo_url && (
                    <img
                      width={600}
                      height={800}
                      src={p.photo_url}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/5] w-full object-cover"
                    />
                  )}
                  <div className="p-5">
                    <h3 className="font-display" style={{ ...T.cardTitle, color: ACCENT }}>
                      {p.name}
                    </h3>
                    {p.title && (
                      <p className="mt-1 text-[var(--color-ink-soft)]" style={T.body}>
                        {p.title}
                      </p>
                    )}
                    {!p.photo_url && (
                      <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
                        [Photograph to be provided by the school]
                      </p>
                    )}
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------- Apply CTA banner ----------

function ApplyBanner() {
  return (
    <section style={{ background: GOLD }}>
      <div
        className={`${SHELL} flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center`}
      >
        <div>
          <h2 className="font-display tracking-tight" style={{ ...T.section, color: ACCENT }}>
            Applications for the next intake are open.
          </h2>
          <p className="mt-2 max-w-xl text-[var(--color-accent-foreground)]" style={T.body}>
            Visit Mikocheni, sit the assessment, join the climb.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admission"
            className="inline-flex min-h-[var(--btn-primary-min-h)] items-center gap-2 rounded-[var(--radius-pill)] px-7 text-white transition-transform hover:-translate-y-[1px] motion-reduce:transition-none"
            style={{ ...T.body, fontWeight: 800, background: ACCENT }}
          >
            Enroll Now
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            to="/contact"
            className="inline-flex min-h-[var(--btn-primary-min-h)] items-center rounded-[var(--radius-pill)] border-2 px-7 transition-colors hover:bg-white/40"
            style={{ ...T.body, fontWeight: 800, borderColor: ACCENT, color: ACCENT }}
          >
            Book a Visit
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------- Footer ----------

function AlphaHighFooter() {
  return (
    <>
      <SchoolFacilitiesSection slug="alpha-high" accent="var(--color-deep-blue)" />
      <SiteFooter />
    </>
  );
}
