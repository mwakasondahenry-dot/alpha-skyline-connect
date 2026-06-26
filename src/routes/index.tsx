import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Plane, ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import { getHomeWhatsNew, type HomeWhatsNew } from "@/lib/alpha-content.functions";
import heroImage from "@/assets/hero-floatplane.jpg.asset.json";
import cadetsImage from "@/assets/alpha-cadets.png.asset.json";
import aviationUniformAsset from "@/assets/aviation-uniform.jpg.asset.json";


const FOUNDED_YEAR = 2007;
const YEARS_OPERATIONAL = new Date().getFullYear() - FOUNDED_YEAR;

const whatsNewQuery = queryOptions({
  queryKey: ["home", "whats-new"],
  queryFn: () => getHomeWhatsNew(),
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
  loader: ({ context }) => context.queryClient.ensureQueryData(whatsNewQuery),
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
  },
  {
    slug: "alpha-high",
    badge: "FORM 1 – 6",
    name: "Alpha High",
    campus: "MIXED · MIKOCHENI",
    blurb:
      "Our flagship secondary. NECTA pathways, aviation and coding at the core.",
    to: "/schools/alpha-high",
  },
  {
    slug: "alpha-girls",
    badge: "FORM 1 – 6",
    name: "Alpha Girls",
    campus: "GIRLS ONLY · KUNDUCHI",
    blurb:
      "A secondary built for girls to lead — same rigour, same aviation and coding, room to thrive.",
    to: "/schools/alpha-girls",
  },
] as const;

const START_PATHS = [
  { age: "AGE 2 – 5", title: "Just starting out", sub: "Nursery & early years", to: "/schools/nursery-primary", accent: "var(--color-bright-blue)" },
  { age: "AGE 6 – 12", title: "Primary years", sub: "Building strong foundations", to: "/schools/nursery-primary", accent: "var(--color-bright-blue)" },
  { age: "FORM 1 – 6", title: "Secondary, mixed", sub: "Alpha High, Mikocheni", to: "/schools/alpha-high", accent: "var(--color-deep-blue)" },
  { age: "FORM 1 – 6", title: "Secondary, girls", sub: "Alpha Girls, Kunduchi", to: "/schools/alpha-girls", accent: "var(--color-blue-violet)" },
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

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage.url}
          alt="Floatplane against an open blue sky"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        {/* Fade to black: heavy at bottom + left for legibility, lighter at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 sm:pt-20 lg:px-10 lg:pt-28">
          <div className="grid items-end gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="pb-8 lg:col-span-7 lg:pb-28">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur sm:text-[11px]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gold)]" />
                <span className="truncate">First high school in Tanzania to teach aviation</span>
              </span>
              <h1 className="mt-5 font-display text-5xl font-600 leading-[1.02] tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)] sm:mt-6 sm:text-6xl lg:text-7xl">
                Learning that<br />takes <span className="italic text-[var(--color-gold)]">off.</span>
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/85 sm:mt-6 sm:text-base">
                From nursery to A-Level across two Dar es Salaam campuses — one school where ambition has a runway.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
                <Link
                  to="/schools/alpha-high"
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--color-gold)] px-5 py-3 text-sm font-semibold text-[#1a1a18] shadow-sm transition-transform hover:scale-[1.02]"
                >
                  Explore Our Schools
                </Link>
                <Link
                  to="/aviation"
                  className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  Inside the aviation programme →
                </Link>
              </div>
            </div>
            <div className="relative lg:col-span-5">
              <div className="pointer-events-none absolute -inset-6 rounded-full bg-[var(--color-gold)]/8 blur-2xl" />
              <img
                src={cadetsImage.url}
                alt="Two Alpha Schools aviation cadets in uniform"
                className="relative z-10 mx-auto block h-auto w-full max-w-[280px] drop-shadow-[0_18px_30px_rgba(0,0,0,0.4)] sm:max-w-[360px] lg:max-w-[520px]"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>

      </section>

      {/* FIND THE RIGHT CAMPUS */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-8 lg:px-10">
        <Reveal direction="up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
            Three schools · One Alpha
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-600 tracking-tight text-[var(--color-ink)] sm:text-5xl">
            Find the right campus<br />for your child.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SCHOOLS.map((s, i) => (
            <Reveal key={s.slug} direction="up" delay={i * 100}>
              <article
                className="flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-[var(--color-deep-blue)]/10 transition-shadow hover:shadow-lg"
              >
                <span className="self-start rounded-md bg-[var(--color-gold)] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#1a1a18]">
                  {s.badge}
                </span>
                <h3 className="mt-16 font-display text-2xl font-600 text-[var(--color-deep-blue)]">
                  {s.name}
                </h3>
                <p className="mt-1.5 text-[11px] font-bold tracking-[0.14em] text-[var(--color-brand-blue)]">
                  {s.campus}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink)]/80">
                  {s.blurb}
                </p>
                <Link
                  to={s.to}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-brand-blue)] transition-transform hover:translate-x-0.5"
                >
                  Explore the School →
                </Link>
              </article>
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
              <h3 className="mt-2 font-display text-3xl font-600 leading-tight drop-shadow-md sm:text-4xl">
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
            <h3 className="mt-2 font-display text-3xl font-600 text-[var(--color-deep-blue)]">
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

      {/* STAT BAR */}
      <section className="relative overflow-hidden bg-[var(--color-deep-blue)] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-10 top-6 h-40 w-40 rounded-full bg-[var(--color-gold)] blur-3xl animate-pulse" />
          <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-[var(--color-bright-blue)] blur-3xl animate-pulse [animation-delay:1s]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 py-14 md:grid-cols-4 lg:px-10">
          {STATS.map((s, i) => (
            <Reveal key={i} direction="up" delay={i * 100} className="px-2">
              <div className="font-display text-5xl font-600 text-[var(--color-gold)] sm:text-6xl">
                <CountUp to={s.value} />{s.suffix ?? ""}
              </div>
              <div className="mt-2 text-sm leading-snug text-white/90">
                {s.label[0]}<br />{s.label[1]}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* OUR STORY */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-6 py-20 lg:grid-cols-[1fr_1.2fr] lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">Our story</p>
            <h2 className="mt-3 font-display text-4xl font-600 tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
              Since 19 March 2007.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[var(--color-ink)]/80">
              Alpha High School was founded on a solid vision: enabling students to achieve academic excellence through intellectual and physical challenges, and to function as responsible citizens of a dynamic society.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-ink)]/80">
              With that vision embraced by every staff member and carried swiftly to our students, Alpha has become the nurturing ground of professionals and leaders — locally and globally.
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-off-white)] p-8 ring-1 ring-[var(--color-deep-blue)]/10">
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
          </div>
        </div>
      </section>

      {/* WHERE DO YOU START */}
      <section className="bg-[var(--color-off-white)]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="text-center">
            <h2 className="font-display text-4xl font-600 tracking-tight text-[var(--color-ink)] sm:text-5xl">
              Where do you start?
            </h2>
            <p className="mt-3 text-sm text-[var(--color-ink)]/70">
              Tell us about your child and we'll point you to the right school.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {START_PATHS.map((p) => (
              <Link
                key={p.title}
                to={p.to}
                className="group rounded-xl bg-white p-5 ring-1 ring-[var(--color-deep-blue)]/10 transition-shadow hover:shadow-md"
                style={{ borderTop: `3px solid ${p.accent}` }}
              >
                <p className="text-[11px] font-bold tracking-[0.14em] text-[var(--color-brand-blue)]">
                  {p.age}
                </p>
                <h3 className="mt-2 font-display text-lg font-600 text-[var(--color-deep-blue)]">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-ink)]/75 transition-transform group-hover:translate-x-0.5">
                  {p.sub} →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S NEW */}
      <WhatsNew data={data} />

      {/* CTA BAND */}
      <section className="bg-[var(--color-gold)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-6 py-12 sm:flex-row sm:items-center lg:px-10">
          <div>
            <h2 className="font-display text-3xl font-600 text-[var(--color-deep-blue)] sm:text-4xl">
              Come and see Alpha for yourself.
            </h2>
            <p className="mt-2 text-sm text-[var(--color-deep-blue)]/85">
              Book a campus visit — we'll match you to the right school.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-deep-blue)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            Book a Visit →
          </Link>
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

function WhatsNew({ data }: { data: HomeWhatsNew }) {
  const { news, events } = data;
  if (news.length === 0 && events.length === 0) return null;

  return (
    <section className="bg-[var(--color-off-white)]">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-4 lg:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
              What's new
            </p>
            <h2 className="mt-2 font-display text-4xl font-600 tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
              Announcements &amp; upcoming events
            </h2>
            <p className="mt-3 text-sm text-[var(--color-ink)]/70">
              The latest from across Alpha Schools — updated as it happens.
            </p>
          </div>
          <Link to="/news" className="hidden text-sm font-semibold text-[var(--color-brand-blue)] hover:underline sm:inline">
            View all →
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-ink)]/60">Recent news</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {news.map((n) => (
                <article key={n.id} className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-[var(--color-deep-blue)]/10 transition-shadow hover:shadow-md">
                  {n.cover_url ? (
                    <img src={n.cover_url} alt="" loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
                  ) : (
                    <div aria-hidden className="aspect-[16/10] w-full bg-[var(--color-bright-blue)]/30" />
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center gap-2 text-[11px] text-[var(--color-ink)]/60">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${SCHOOL_BADGE[n.school_slug] ?? "bg-[var(--color-deep-blue)] text-white"}`}>
                        {SCHOOL_LABELS[n.school_slug] ?? n.school_slug}
                      </span>
                      {n.published_at && <span>Posted {relativeDate(n.published_at)}</span>}
                    </div>
                    <h3 className="mt-3 font-display text-base font-600 leading-snug text-[var(--color-deep-blue)]">
                      {n.title}
                    </h3>
                    {n.body && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-ink)]/75">
                        {n.body}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-ink)]/60">Upcoming events</p>
            <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-[var(--color-deep-blue)]/10">
              <ul className="divide-y divide-[var(--color-deep-blue)]/10">
                {events.map((e) => (
                  <li key={e.id} className="flex gap-4 py-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-[var(--color-off-white)] ring-1 ring-[var(--color-deep-blue)]/10">
                      <span className="font-display text-xl font-600 leading-none text-[var(--color-deep-blue)]">
                        {eventDay(e.event_date)}
                      </span>
                      <span className="text-[9px] font-bold tracking-wider text-[var(--color-brand-blue)]">
                        {eventMonth(e.event_date)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-sm font-600 text-[var(--color-deep-blue)]">{e.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-[11px]">
                        <span className={`rounded px-2 py-0.5 font-bold uppercase tracking-wider ${SCHOOL_BADGE[e.school_slug] ?? "bg-[var(--color-deep-blue)] text-white"}`}>
                          {SCHOOL_LABELS[e.school_slug] ?? e.school_slug}
                        </span>
                        {e.location && <span className="text-[var(--color-ink)]/60">· {e.location}</span>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/events" className="mt-3 block text-center text-sm font-semibold text-[var(--color-brand-blue)] hover:underline">
                View the full calendar →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
