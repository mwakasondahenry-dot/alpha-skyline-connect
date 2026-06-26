import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Plane, Code2, GraduationCap, ArrowRight, MapPin, CalendarDays } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { getHomeWhatsNew, type HomeWhatsNew } from "@/lib/alpha-content.functions";

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
          "Three schools, two campuses in Dar es Salaam. The first school in Tanzania to teach aviation. NECTA O-Level and A-Level with 11 combinations.",
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
    name: "Nursery & Primary",
    ages: "Ages 2–12",
    campus: "Kunduchi campus",
    blurb: "Warm, play-rich early years and a strong primary foundation.",
    accent: "var(--color-bright-blue)",
    to: "/schools/nursery-primary",
  },
  {
    slug: "alpha-high",
    name: "Alpha High",
    ages: "Form 1–6 · Mixed",
    campus: "Mikocheni campus",
    blurb: "NECTA O-Level & A-Level with aviation, coding and 11 A-Level combinations.",
    accent: "var(--color-deep-blue)",
    to: "/schools/alpha-high",
  },
  {
    slug: "alpha-girls",
    name: "Alpha Girls",
    ages: "Form 1–6 · Girls",
    campus: "Kunduchi campus",
    blurb: "A focused secondary for girls — same NECTA pathways, same aviation programme.",
    accent: "var(--color-blue-violet)",
    to: "/schools/alpha-girls",
  },
] as const;

const STATS = [
  { value: "3", label: "schools · 2 campuses" },
  { value: "Ages 2–18", label: "from Nursery to A-Level" },
  { value: "1st", label: "in Tanzania for aviation" },
  { value: "11", label: "A-Level combinations" },
] as const;

const SCHOOL_LABELS: Record<string, string> = {
  "group-wide": "Alpha Schools",
  "nursery-primary": "Nursery & Primary",
  "alpha-high": "Alpha High",
  "alpha-girls": "Alpha Girls",
};

function Home() {
  const { data } = useSuspenseQuery(whatsNewQuery);

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[var(--color-deep-blue)] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(60% 60% at 80% 20%, rgba(232,160,32,0.45) 0%, transparent 60%), radial-gradient(50% 50% at 10% 90%, rgba(30,127,194,0.55) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)]/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/30">
              <Plane className="h-3.5 w-3.5" /> 1st in Tanzania for aviation
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Learning that <span className="text-[var(--color-gold)]">takes off.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-white/85 sm:text-lg">
              Alpha Schools is three schools across two campuses in Dar es Salaam — from
              Nursery through A-Level. NECTA pathways with real aviation training and
              hands-on coding.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/admission"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-5 py-3 text-sm font-medium text-[#1a1a18] shadow-sm transition-transform hover:scale-[1.02]"
              >
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white ring-1 ring-white/25 transition-colors hover:bg-white/20"
              >
                Book a Visit
              </Link>
            </div>
          </div>

          {/* Photo collage placeholder — replace with consented student photos */}
          <div className="relative hidden lg:block">
            <div className="absolute right-0 top-2 h-56 w-44 rotate-3 rounded-2xl bg-gradient-to-br from-[var(--color-bright-blue)] to-[var(--color-deep-blue)] ring-1 ring-white/20" />
            <div className="absolute right-32 top-24 h-64 w-48 -rotate-2 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[#b9791a] ring-1 ring-white/20" />
            <div className="absolute right-12 top-56 h-44 w-56 rotate-1 rounded-2xl bg-gradient-to-br from-[var(--color-blue-violet)] to-[#241f5f] ring-1 ring-white/20" />
          </div>
        </div>
      </section>

      {/* FIND THE RIGHT CAMPUS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
              Three schools
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-[var(--color-deep-blue)] sm:text-4xl">
              Find the right campus.
            </h2>
          </div>
          <Link
            to="/about"
            className="hidden text-sm text-[var(--color-brand-blue)] underline-offset-4 hover:underline sm:inline"
          >
            About Alpha →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SCHOOLS.map((s) => (
            <Link
              key={s.slug}
              to={s.to}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-border transition-shadow hover:shadow-lg"
            >
              <div
                className="h-28"
                style={{ backgroundColor: s.accent }}
                aria-hidden
              />
              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.ages}
                </span>
                <h3 className="mt-2 font-display text-2xl text-[var(--color-deep-blue)]">
                  {s.name}
                </h3>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {s.campus}
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--color-ink)]/85">
                  {s.blurb}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand-blue)] transition-transform group-hover:translate-x-0.5">
                  Explore the School <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AVIATION FEATURE — solid panel beside the image, dark scrim ready (Part 6, fix #1) */}
      <section className="bg-[var(--color-deep-blue)] text-white">
        <div className="mx-auto grid max-w-7xl gap-0 px-0 lg:grid-cols-2">
          <div className="relative min-h-[280px] overflow-hidden lg:min-h-[460px]">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #0c447c 0%, #1e7fc2 55%, #e8a020 100%)",
              }}
            />
            <div aria-hidden className="absolute inset-0 bg-black/35" />
            <div className="relative flex h-full items-center justify-center p-10">
              <Plane className="h-24 w-24 text-white/85" strokeWidth={1.2} />
            </div>
          </div>
          <div className="bg-[var(--color-deep-blue)] p-10 lg:p-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)]/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/30">
              <Plane className="h-3.5 w-3.5" /> Flagship programme
            </span>
            <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
              The first school in Tanzania to teach aviation.
            </h2>
            <p className="mt-5 max-w-xl text-white/85">
              In partnership with the Kenya School of Flying (KSOF), Form 4 and Form 6 leavers
              can train toward a Private Pilot Licence with 40+ flying hours, 11 aviation
              modules, and a CAE 7000XR Level D full-flight simulator.
            </p>
            <Link
              to="/aviation"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-5 py-3 text-sm font-medium text-[#1a1a18] transition-transform hover:scale-[1.02]"
            >
              Explore Aviation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* STAT BAR (NECTA-only, no Cambridge) */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl text-[var(--color-deep-blue)] sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT'S NEW — live from Supabase */}
      <WhatsNew data={data} />

      {/* GALLERY PEEK */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
              Gallery
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-[var(--color-deep-blue)]">
              Life at Alpha.
            </h2>
          </div>
          <Link
            to="/gallery"
            className="text-sm text-[var(--color-brand-blue)] underline-offset-4 hover:underline"
          >
            See the gallery →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            "var(--color-bright-blue)",
            "var(--color-gold)",
            "var(--color-blue-violet)",
            "var(--color-deep-blue)",
            "var(--color-deep-blue)",
            "var(--color-blue-violet)",
            "var(--color-gold)",
            "var(--color-bright-blue)",
          ].map((c, i) => (
            <div
              key={i}
              className="aspect-[4/5] rounded-xl"
              style={{ backgroundColor: c }}
              aria-hidden
            />
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function WhatsNew({ data }: { data: HomeWhatsNew }) {
  const { news, events } = data;
  if (news.length === 0 && events.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
            What&rsquo;s new
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-[var(--color-deep-blue)] sm:text-4xl">
            News &amp; upcoming events.
          </h2>
        </div>
        <Link
          to="/news"
          className="text-sm text-[var(--color-brand-blue)] underline-offset-4 hover:underline"
        >
          All news →
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* News */}
        <div className="grid gap-5 sm:grid-cols-2">
          {news.length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground">
              No news posts yet — fresh stories will appear here.
            </p>
          ) : (
            news.map((n) => (
              <article
                key={n.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-border transition-shadow hover:shadow-md"
              >
                {n.cover_url ? (
                  <img
                    src={n.cover_url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/10] w-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="aspect-[16/10] w-full"
                    style={{ backgroundColor: "var(--color-bright-blue)" }}
                  />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-[var(--color-deep-blue)]/10 px-2 py-0.5 font-medium text-[var(--color-deep-blue)]">
                      {SCHOOL_LABELS[n.school_slug] ?? n.school_slug}
                    </span>
                    {n.published_at && (
                      <span>· {relativeDate(n.published_at)}</span>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-lg leading-snug text-[var(--color-deep-blue)]">
                    {n.title}
                  </h3>
                  {n.body && (
                    <p className="mt-2 line-clamp-3 text-sm text-[var(--color-ink)]/80">
                      {n.body}
                    </p>
                  )}
                </div>
              </article>
            ))
          )}
        </div>

        {/* Events */}
        <aside className="rounded-2xl bg-white p-6 ring-1 ring-border">
          <h3 className="font-display text-lg text-[var(--color-deep-blue)]">
            Upcoming events
          </h3>
          <ul className="mt-5 divide-y divide-border">
            {events.length === 0 ? (
              <li className="py-3 text-sm text-muted-foreground">
                No upcoming events scheduled.
              </li>
            ) : (
              events.map((e) => (
                <li key={e.id} className="flex gap-4 py-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--color-off-white)] text-center">
                    <CalendarDays className="h-5 w-5 text-[var(--color-brand-blue)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {formatEventDate(e.event_date)}
                      {e.location ? ` · ${e.location}` : ""}
                    </div>
                    <div className="mt-0.5 font-medium text-[var(--color-deep-blue)]">
                      {e.title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {SCHOOL_LABELS[e.school_slug] ?? e.school_slug}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </aside>
      </div>

      {/* Differentiators chip row (replaces fake testimonials per Part 6 fix #6) */}
      <div className="mt-14 grid gap-3 rounded-2xl bg-white p-6 ring-1 ring-border sm:grid-cols-3">
        <Chip icon={<Plane className="h-4 w-4" />} title="Aviation programme">
          KSOF partnership, PPL pathway, full-flight simulator.
        </Chip>
        <Chip icon={<Code2 className="h-4 w-4" />} title="Coding & digital">
          Computer literacy for all; computer studies examined.
        </Chip>
        <Chip icon={<GraduationCap className="h-4 w-4" />} title="NECTA results-led">
          CSEE + ACSEE with 11 A-Level combinations.
        </Chip>
      </div>
    </section>
  );
}

function Chip({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-deep-blue)] text-white">
        {icon}
      </span>
      <div>
        <div className="font-medium text-[var(--color-deep-blue)]">{title}</div>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function relativeDate(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} wk ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatEventDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}
