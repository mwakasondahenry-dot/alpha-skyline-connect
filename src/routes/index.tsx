import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Plane, ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { TornEdge } from "@/components/torn-edge";
import { Reveal } from "@/components/reveal";
import { getHomeWhatsNew, getHomeUpcomingEvents, type HomeWhatsNew, type HomeEventItem } from "@/lib/alpha-content.functions";
import heroCollage from "@/assets/hero-collage.png.asset.json";
import aviationUniformAsset from "@/assets/aviation-uniform.jpg.asset.json";
import campusNurseryImage from "@/assets/campus-nursery.jpg.asset.json";
import campusHighImage from "@/assets/campus-high.jpg.asset.json";
import campusGirlsImage from "@/assets/campus-girls.jpg.asset.json";


const FOUNDED_YEAR = 2007;
const YEARS_OPERATIONAL = new Date().getFullYear() - FOUNDED_YEAR;

const whatsNewQuery = queryOptions({
  queryKey: ["home", "whats-new"],
  queryFn: () => getHomeWhatsNew(),
  staleTime: 5 * 60 * 1000,
});

const upcomingEventsQuery = queryOptions({
  queryKey: ["home", "upcoming-events"],
  queryFn: () => getHomeUpcomingEvents(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alpha Schools — Learning that takes off · Dar es Salaam" },
      {
        name: "description",
        content:
          "Three schools, two campuses in Dar es Salaam. The first school in Tanzania to teach aviation. NECTA O-Level and A-Level.",
      },
      { property: "og:title", content: "Alpha Schools — Learning that takes off" },
      {
        property: "og:description",
        content:
          "Nursery & Primary, Alpha High, Alpha Girls. The first school in Tanzania to teach aviation.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(whatsNewQuery),
      context.queryClient.ensureQueryData(upcomingEventsQuery),
    ]),
  errorComponent: ({ error }) => (
    <div className="p-12 text-center text-sm text-muted-foreground">
      Couldn't load the homepage: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-12 text-center">Not found.</div>,
  component: Home,
});

const SCHOOLS = [
  {
    slug: "nursery-primary",
    badge: "AGE 2 – 12",
    name: "Nursery & Primary",
    campus: "COMBINED CAMPUS",
    blurb:
      "Where curiosity starts. Play-led early years into a strong, structured primary foundation.",
    to: "/schools/nursery-primary",
    image: campusNurseryImage.url,
    alt: "Young Alpha primary students in green sports kit",
  },
  {
    slug: "alpha-high",
    badge: "FORM 1 – 6",
    name: "Alpha High",
    campus: "MIXED · MIKOCHENI",
    blurb:
      "Our flagship secondary. NECTA pathways, aviation and coding at the core.",
    to: "/schools/alpha-high",
    image: campusHighImage.url,
    alt: "Alpha High aviation students in safety vests at JNIA",
  },
  {
    slug: "alpha-girls",
    badge: "FORM 1 – 6",
    name: "Alpha Girls",
    campus: "GIRLS ONLY · KUNDUCHI",
    blurb:
      "A secondary built for girls to lead — same rigour, same aviation and coding, room to thrive.",
    to: "/schools/alpha-girls",
    image: campusGirlsImage.url,
    alt: "Alpha Girls debate team celebrating with medals and certificates",
  },
] as const;


const STATS: ReadonlyArray<{ value: number; suffix?: string; prefix?: string; display?: string; label: [string, string] }> = [
  { value: YEARS_OPERATIONAL, suffix: "+", label: ["years shaping", "leaders since 2007"] },
  { value: 3, label: ["schools across", "Dar es Salaam"] },
  { value: 1, suffix: "st", label: ["in Tanzania to", "teach aviation"] },
  { value: 2, label: ["campuses —", "Kunduchi & Mikocheni"] },
] as const;

const SCHOOL_LABELS: Record<string, string> = {
  "group-wide": "All Schools",
  "nursery-primary": "Nursery & Primary",
  "alpha-high": "Alpha High",
  "alpha-girls": "Alpha Girls",
};

const SCHOOL_BADGE: Record<string, string> = {
  "group-wide": "bg-[var(--color-deep-blue)] text-white",
  "nursery-primary": "bg-[var(--color-bright-blue)] text-white",
  "alpha-high": "bg-[var(--color-deep-blue)] text-white",
  "alpha-girls": "bg-[var(--color-blue-violet)] text-white",
};

function CountUp({ to, duration = 1400 }: { to: number; duration?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (started.current) return;
      if (entries.some((e) => e.isIntersecting)) {
        started.current = true;
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(to * eased);
          if (p < 1) requestAnimationFrame(step);
          else setN(to);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  const display = to % 1 === 0 ? Math.round(n).toString() : n.toFixed(1);
  return <span ref={ref}>{display}</span>;
}

function Home() {
  const { data } = useSuspenseQuery(whatsNewQuery);
  const { data: upcomingEvents } = useSuspenseQuery(upcomingEventsQuery);

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      {/* HERO — full screen B&W collage */}
      <section className="relative isolate flex min-h-screen w-full items-center overflow-hidden bg-black">
        <img
          src={heroCollage.url}
          alt="Alpha Schools students across nursery, primary, secondary and aviation"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "grayscale(100%) contrast(1.18) brightness(0.78) saturate(0)" }}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        {/* Cinematic overlays for legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        <div className="pointer-events-none absolute -left-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[var(--color-gold)]/20 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-2xl">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur sm:text-[11px]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gold)]" />
              <span className="truncate">Nursery · Primary · Secondary · Aviation</span>
            </span>
            <h1 className="mt-6 font-display text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-8xl">
              Your potential,<br /><span className="italic text-[var(--color-gold)]">unlocked.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              Three schools across Dar es Salaam — nursery, primary and secondary — founded in 2007 on one belief: your education is our priority. Strong national academics, coding, and the first aviation programme in any Tanzanian school.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/admission"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--color-gold)] px-6 py-3.5 text-sm font-semibold text-[#1a1a18] shadow-lg transition-transform hover:scale-[1.02]"
              >
                Enroll Now
              </Link>
              <Link
                to="/aviation"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Inside the aviation programme →
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Scroll</span>
            <span className="block h-8 w-px animate-pulse bg-white/60" />
          </div>
        </div>
      </section>

      <TornEdge topColor="#000000" bottomColor="#f7f5ef" intensity="playful" seed={7} />


      {/* FIND THE RIGHT CAMPUS */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-8 lg:px-10">

        <Reveal direction="up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
            Three schools · One Alpha
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-5xl">
            Find the right campus<br />for your child.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SCHOOLS.map((s, i) => (
            <Reveal key={s.slug} direction="up" delay={i * 100}>
              <Link
                to={s.to}
                className="group relative flex h-[460px] flex-col justify-end overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Background image */}
                <img
                  src={s.image}
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10 transition-opacity duration-500 group-hover:from-black/95 group-hover:via-black/60" />
                {/* Top badge */}
                <span className="absolute left-5 top-5 z-10 rounded-md bg-[var(--color-gold)] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#1a1a18] shadow-md">
                  {s.badge}
                </span>
                {/* Bottom content */}
                <div className="relative z-10 p-6 text-white">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--color-gold)]">
                    {s.campus}
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold leading-tight">
                    {s.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/85">
                    {s.blurb}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-transform group-hover:translate-x-1">
                    Explore the School
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* AVIATION + CODING split */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Reveal direction="left" className="relative min-h-[280px] overflow-hidden rounded-2xl">
            <img
              src={aviationUniformAsset.url}
              alt="Alpha Schools aviation cadet in uniform at the airport"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/20" />
            <div className="relative flex h-full flex-col justify-end p-8 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/85">The Alpha Difference</p>
              <h3 className="mt-2 font-display text-3xl font-semibold leading-tight drop-shadow-md sm:text-4xl">
                Aviation, taught here.
              </h3>
              <p className="mt-3 max-w-md text-sm text-white/90 drop-shadow">
                Ground school, simulator hours and first principles of flight — the first programme of its kind in any Tanzanian school.
              </p>
              <Link
                to="/aviation"
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-md bg-[var(--color-gold)] px-4 py-2.5 text-sm font-semibold text-[#1a1a18] shadow-lg transition-transform hover:scale-[1.02]"
              >
                Inside the programme →
              </Link>
            </div>
          </Reveal>

          <Reveal direction="right" className="rounded-2xl bg-white p-8 ring-1 ring-[var(--color-deep-blue)]/10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-brand-blue)]">Right behind it</p>
            <h3 className="mt-2 font-display text-3xl font-semibold text-[var(--color-deep-blue)]">
              Coding &amp; digital skills
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]/80">
              Real programming from primary up — logic, robotics and building things that work.
            </p>
            <Link to="/coding" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-brand-blue)] hover:translate-x-0.5">
              See the curriculum →
            </Link>
          </Reveal>
        </div>
      </section>

      <TornEdge topColor="#f7f5ef" bottomColor="#0c447c" intensity="playful" seed={23} />

      {/* STAT BAR */}
      <section className="relative overflow-hidden bg-[var(--color-deep-blue)] text-white">

        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-10 top-6 h-40 w-40 rounded-full bg-[var(--color-gold)] blur-3xl animate-pulse" />
          <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-[var(--color-bright-blue)] blur-3xl animate-pulse [animation-delay:1s]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 py-14 md:grid-cols-4 lg:px-10">
          {STATS.map((s, i) => (
            <Reveal key={i} direction="up" delay={i * 100} className="px-2">
              <div className="font-display text-5xl font-semibold text-[var(--color-gold)] sm:text-6xl">
                <CountUp to={s.value} />{s.suffix ?? ""}
              </div>
              <div className="mt-2 text-sm leading-snug text-white/90">
                {s.label[0]}<br />{s.label[1]}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <TornEdge topColor="#0c447c" bottomColor="#ffffff" intensity="playful" seed={41} />

      {/* OUR STORY */}
      <section className="bg-white">

        <div className="mx-auto grid max-w-7xl items-start gap-12 px-6 py-20 lg:grid-cols-[1fr_1.2fr] lg:px-10">
          <Reveal direction="left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">Our story</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
              Since 19 March 2007.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[var(--color-ink)]/80">
              Alpha High School was founded on a solid vision: enabling students to achieve academic excellence through intellectual and physical challenges, and to function as responsible citizens of a dynamic society.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-ink)]/80">
              With that vision embraced by every staff member and carried swiftly to our students, Alpha has become the nurturing ground of professionals and leaders — locally and globally.
            </p>
          </Reveal>
          <Reveal direction="right" className="rounded-2xl bg-[var(--color-off-white)] p-8 ring-1 ring-[var(--color-deep-blue)]/10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-brand-blue)]">Our mission</p>
            <ul className="mt-4 space-y-4">
              {[
                "Provide education that is the source of intellectual, spiritual and cultural growth.",
                "Enable students to acquire knowledge that supports and meets individual needs.",
                "Develop students' critical and divergent thinking.",
                "Encourage students to be all-rounded.",
                "Inculcate the attitude to be social, mobile, interactive, ambitious and self-directed.",
              ].map((m) => (
                <li key={m} className="flex gap-3 text-sm leading-relaxed text-[var(--color-ink)]/85">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gold)]" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <TornEdge topColor="#ffffff" bottomColor="#f7f5ef" intensity="playful" seed={58} />

      {/* UPDATES + EVENTS */}
      <WhatsNew news={data.news} events={upcomingEvents} />


      <TornEdge topColor="#0c447c" bottomColor="#e8a020" intensity="playful" seed={72} />

      {/* CTA BAND */}
      <section className="bg-[var(--color-gold)]">

        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-6 py-12 sm:flex-row sm:items-center lg:px-10">
          <Reveal direction="left">
            <h2 className="font-display text-3xl font-semibold text-[var(--color-deep-blue)] sm:text-4xl">
              Come and see Alpha for yourself.
            </h2>
            <p className="mt-2 text-sm text-[var(--color-deep-blue)]/85">
              Book a campus visit — we'll match you to the right school.
            </p>
          </Reveal>
          <Reveal direction="right">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-deep-blue)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              Book a Visit →
            </Link>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function relativeDate(iso: string) {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function eventDay(iso: string) {
  return new Date(iso).getDate().toString().padStart(2, "0");
}
function eventMonth(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short" }).toUpperCase();
}

function WhatsNew({ news, events }: { news: HomeWhatsNew["news"]; events: HomeEventItem[] }) {
  return (
    <>
      <UpdatesSlideshow news={news} />
      <TornEdge topColor="#f7f5ef" bottomColor="#0c447c" intensity="playful" seed={91} />
      <EventsRail events={events} />
    </>
  );
}



function UpdatesSlideshow({ news }: { news: HomeWhatsNew["news"] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = news.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 5500);
    return () => clearInterval(t);
  }, [paused, count]);

  return (
    <section className="bg-[var(--color-off-white)]">
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-10">
        <Reveal direction="up" className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
              Updates
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
              The latest from Alpha.
            </h2>
          </div>
          <Link to="/news" className="hidden text-sm font-semibold text-[var(--color-brand-blue)] hover:underline sm:inline">
            View all →
          </Link>
        </Reveal>

        {count === 0 ? (
          <div className="mt-8 grid place-items-center rounded-3xl border border-dashed border-[var(--color-deep-blue)]/15 bg-white px-6 py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-brand-blue)]/10 text-2xl">📰</div>
            <h3 className="mt-4 font-display text-xl font-semibold text-[var(--color-deep-blue)]">No updates yet</h3>
            <p className="mt-2 max-w-md text-sm text-[var(--color-ink)]/65">
              Fresh news from across Alpha will appear here as soon as it's published. Check back soon.
            </p>
          </div>
        ) : (


        <div
          className="relative mt-8 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-[var(--color-deep-blue)]/10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${idx * 100}%)` }}
          >
            {news.map((n) => (
              <article key={n.id} className="grid w-full shrink-0 grid-cols-1 md:grid-cols-2">
                <div className="relative aspect-[16/11] md:aspect-auto md:min-h-[420px]">
                  {n.cover_url ? (
                    <img src={n.cover_url} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[var(--color-deep-blue)] via-[var(--color-bright-blue)] to-[var(--color-gold)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10" />
                </div>
                <div className="flex flex-col justify-center gap-4 p-8 sm:p-10 lg:p-14">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={`rounded px-2 py-0.5 font-bold uppercase tracking-wider ${SCHOOL_BADGE[n.school_slug] ?? "bg-[var(--color-deep-blue)] text-white"}`}>
                      {SCHOOL_LABELS[n.school_slug] ?? n.school_slug}
                    </span>
                    {n.published_at && (
                      <span className="text-[var(--color-ink)]/60">Posted {relativeDate(n.published_at)}</span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl font-semibold leading-tight text-[var(--color-deep-blue)] sm:text-3xl lg:text-4xl">
                    {n.title}
                  </h3>
                  {n.body && (
                    <p className="line-clamp-4 text-sm leading-relaxed text-[var(--color-ink)]/75 sm:text-base">
                      {n.body}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          {count > 1 && (
            <>
              <button
                aria-label="Previous update"
                onClick={() => setIdx((i) => (i - 1 + count) % count)}
                className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--color-deep-blue)] shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-105 hover:bg-white"
              >
                ‹
              </button>
              <button
                aria-label="Next update"
                onClick={() => setIdx((i) => (i + 1) % count)}
                className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--color-deep-blue)] shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-105 hover:bg-white"
              >
                ›
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {news.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === idx ? "w-8 bg-[var(--color-gold)]" : "w-1.5 bg-white/70 hover:bg-white"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        )}
      </div>

    </section>
  );
}

function EventsRail({ events }: { events: HomeEventItem[] }) {
  return (
    <section className="relative overflow-hidden bg-[var(--color-deep-blue)] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[var(--color-gold)] blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[var(--color-bright-blue)] blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal direction="up" className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
              Upcoming
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              What's coming up next.
            </h2>
          </div>
          <Link to="/events" className="hidden text-sm font-semibold text-[var(--color-gold)] hover:underline sm:inline">
            Full calendar →
          </Link>
        </Reveal>

        {events.length === 0 ? (
          <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-white/20 bg-white/[0.05] px-6 py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-gold)]/20 text-2xl">📅</div>
            <h3 className="mt-4 font-display text-xl font-semibold text-white">No upcoming events scheduled</h3>
            <p className="mt-2 max-w-md text-sm text-white/65">
              We're between events right now. The next one will appear here as soon as it's announced.
            </p>
          </div>
        ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e, i) => (
            <Reveal key={e.id} direction="up" delay={i * 90}>
              <article
                className="group relative h-full overflow-hidden rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/15 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.12] hover:ring-[var(--color-gold)]/50"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--color-gold)]/20 blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:bg-[var(--color-gold)]/30"
                />
                <div className="relative flex items-start gap-5">
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[#d68f1c] text-[#1a1a18] shadow-lg ring-1 ring-white/30 transition-transform duration-500 group-hover:rotate-[-4deg] group-hover:scale-105">
                    <span className="font-display text-3xl font-black leading-none">
                      {eventDay(e.event_date)}
                    </span>
                    <span className="absolute bottom-2 text-[9px] font-bold tracking-[0.18em]">
                      {eventMonth(e.event_date)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${SCHOOL_BADGE[e.school_slug] ?? "bg-white/20 text-white"}`}>
                      {SCHOOL_LABELS[e.school_slug] ?? e.school_slug}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-white">
                      {e.title}
                    </h3>
                    {e.location && (
                      <p className="mt-2 text-xs text-white/70">📍 {e.location}</p>
                    )}
                  </div>
                </div>
                <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    {new Date(e.event_date).toLocaleDateString(undefined, { weekday: "long" })}
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-gold)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 translate-x-2">
                    Details →
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        )}

      </div>
    </section>
  );
}

