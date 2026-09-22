/**
 * Testimonials: parent quotes and alumni stories on one page.
 *
 * Built to the testimonials comp. Three things in that comp are deliberately
 * absent, for the reason design/README.md exists: its six quotes and names are
 * invented, its star ratings measure nothing this site collects, and its
 * "1,000+ alumni / 90%+ university progression" figures appear in no school
 * document. Real approved rows only, the confirmed figures only, and a section
 * that says it is waiting rather than filling itself with fiction.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Award, Building2, MapPin, Plane } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { T, SHELL } from "@/components/type-roles";
import { QuoteCarousel } from "@/components/testimonials/quote-carousel";
import { isAlumniStory, parentQuotes, type TestimonialItem } from "@/lib/alpha-content.functions";
import { testimonialsQuery } from "@/lib/testimonials-query";
import heroGraduate from "@/assets/h1-grad-girl.webp";
import shareBand from "@/assets/campus-girls.webp";

const FOUNDED = 2007;

const SCHOOL_LABELS: Record<string, string> = {
  "group-wide": "Alpha Schools",
  "nursery-primary": "Nursery & Primary",
  "alpha-high": "Alpha High",
  "alpha-girls": "Alpha Girls",
};

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    ...seo({
      title: "Testimonials — Alpha Schools, Dar es Salaam",
      description:
        "Parents and alumni of Alpha Schools in Dar es Salaam, in their own words: what the schools have meant for their families and where they led.",
      path: "/testimonials",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(testimonialsQuery),
  errorComponent: ({ error }) => (
    <div className="p-12 text-center text-muted-foreground" style={T.body}>
      Couldn't load testimonials: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-12 text-center">Not found.</div>,
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const { data } = useSuspenseQuery(testimonialsQuery);
  const parents = parentQuotes(data);
  const alumni = data
    .filter(isAlumniStory)
    .slice()
    .sort((a, b) => (b.grad_year ?? 0) - (a.grad_year ?? 0));

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />
      <Hero />

      <nav aria-label="Jump to a section" className={`${SHELL} -mt-7 relative z-10`}>
        <div className="mx-auto flex w-fit gap-1 rounded-[var(--radius-btn)] bg-white p-1 shadow-[var(--card-shadow)] ring-1 ring-[var(--color-deep-blue)]/10">
          <JumpLink to="#parents">Parents</JumpLink>
          <JumpLink to="#alumni">Alumni</JumpLink>
        </div>
      </nav>

      <section id="parents" className={`${SHELL} scroll-mt-24 py-[var(--space-section-y)]`}>
        <SectionHead
          kicker="Parent testimonials"
          title="Trusted by"
          accent="Families"
          intro="Parents share what Alpha has meant for their children, inside and outside the classroom."
        />
        {parents.length > 0 ? (
          <div className="mt-[var(--space-block-y)]">
            <QuoteCarousel
              items={parents}
              label="Parent testimonials"
              meta={(t) => [t.relationship ?? `Parent, ${schoolOf(t)}`]}
            />
          </div>
        ) : (
          <Waiting>Parent stories will appear here as families share them.</Waiting>
        )}
      </section>

      <section
        id="alumni"
        className="scroll-mt-24 border-y border-[var(--color-hairline)] bg-[var(--color-surface)]"
      >
        <div className={`${SHELL} py-[var(--space-section-y)]`}>
          <SectionHead
            kicker="Alumni stories"
            title="Where they are"
            accent="now"
            intro="Former students on how their years at Alpha shaped what came next, at university, at work and in life."
          />
          {alumni.length > 0 ? (
            <div className="mt-[var(--space-block-y)]">
              <QuoteCarousel items={alumni} label="Alumni stories" meta={alumniMeta} />
            </div>
          ) : (
            <Waiting>Alumni stories will appear here as they arrive.</Waiting>
          )}
        </div>
      </section>

      <Achievements />
      <ShareYourStory />
      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-deep-blue)] text-[var(--color-surface)]">
      <img
        src={heroGraduate}
        alt=""
        aria-hidden
        decoding="async"
        className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-[75%_25%] opacity-70 md:w-3/5 md:opacity-100"
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(100deg, var(--color-deep-blue) 0%, var(--color-deep-blue) 38%, color-mix(in srgb, var(--color-deep-blue) 70%, transparent) 60%, color-mix(in srgb, var(--color-deep-blue) 20%, transparent) 100%)",
        }}
      />
      <div className={`${SHELL} py-[calc(var(--space-section-y)*1.1)]`}>
        <div className="max-w-xl">
          <p className="flex items-center gap-3 text-[var(--color-gold)]" style={T.label}>
            <span
              aria-hidden
              className="inline-block h-[3px] w-8 shrink-0 rounded-full bg-[var(--color-gold)]"
            />
            Our community
          </p>
          <h1 className="mt-4 font-display tracking-tight" style={T.hero}>
            <span className="block">Real people.</span>
            <span className="block text-[var(--color-gold)]">Lasting impact.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[var(--color-surface)]/95" style={T.body}>
            From parents and alumni, in their own words: what Alpha Schools has meant for their
            families and where it has taken them.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

function JumpLink({ to, children }: { to: string; children: string }) {
  return (
    <a
      href={to}
      className="rounded-[var(--radius-btn)] px-5 py-2.5 font-semibold text-[var(--color-deep-blue)] transition-colors duration-150 hover:bg-[var(--color-brand-blue)] hover:text-white motion-reduce:transition-none"
      style={T.body}
    >
      {children}
    </a>
  );
}

function SectionHead({
  kicker,
  title,
  accent,
  intro,
}: {
  kicker: string;
  title: string;
  accent: string;
  intro: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-3 text-[var(--color-brand-blue)]" style={T.label}>
        <span
          aria-hidden
          className="inline-block h-[3px] w-8 shrink-0 rounded-full bg-[var(--color-gold)]"
        />
        {kicker}
      </p>
      <h2
        className="mt-3 font-display tracking-tight text-balance text-[var(--color-deep-blue)]"
        style={T.section}
      >
        {title} <span className="text-[var(--color-brand-blue)]">{accent}</span>
      </h2>
      <p className="mt-3 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
        {intro}
      </p>
    </div>
  );
}

function Waiting({ children }: { children: string }) {
  return (
    <p className="mt-6 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
      {children}
    </p>
  );
}

const schoolOf = (t: TestimonialItem) =>
  SCHOOL_LABELS[t.school_slug ?? "group-wide"] ?? "Alpha Schools";

/** "Alpha High, class of 2018" then "Pilot at Air Tanzania", from whichever parts exist. */
function alumniMeta(t: TestimonialItem): string[] {
  const school = [schoolOf(t), t.grad_year ? `class of ${t.grad_year}` : null]
    .filter(Boolean)
    .join(", ");
  const now = [t.relationship, t.company].filter(Boolean).join(" at ");
  return [school, now].filter(Boolean) as string[];
}

/* ------------------------------------------------------------------ *
 * Achievements band
 *
 * The comp's "1,000+ alumni" and "90%+ university progression" are not
 * built: they appear in no school document. These four are derivable from
 * confirmed facts, and the years figure is calculated, never hardcoded.
 * ------------------------------------------------------------------ */

function Achievements() {
  const years = new Date().getFullYear() - FOUNDED;
  const items = [
    { figure: `${years}+`, label: "Years since 2007", Icon: Award },
    { figure: "3", label: "Schools in Dar es Salaam", Icon: Building2 },
    { figure: "2", label: "Campuses, Kunduchi and Mikocheni", Icon: MapPin },
    { figure: "1", label: "Aviation programme", Icon: Plane },
  ];
  return (
    <section className="alpha-band-blue">
      <div className={`${SHELL} py-[var(--space-section-y)]`}>
        <h2 className="text-center font-display tracking-tight text-balance" style={T.section}>
          Three schools. One family.
        </h2>
        <ul className="mt-[var(--space-block-y)] grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s) => (
            <li key={s.label} className="text-center">
              <s.Icon className="mx-auto h-6 w-6 text-[var(--color-gold)]" aria-hidden />
              <p className="mt-3 font-display text-3xl font-black text-[var(--color-gold)]">
                {s.figure}
              </p>
              <p className="mt-1 text-white/85" style={T.body}>
                {s.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Share your story
 * ------------------------------------------------------------------ */

function ShareYourStory() {
  const cta =
    "inline-flex items-center justify-center rounded-[var(--radius-btn)] px-5 py-3 font-display transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] motion-reduce:transition-none";
  return (
    <section className="bg-[var(--color-surface)]">
      <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <img
          src={shareBand}
          alt="Alpha Girls students with their certificates and medals"
          loading="lazy"
          decoding="async"
          className="h-56 w-full object-cover md:h-full"
        />
        <div className="px-[var(--container-gutter)] py-[var(--space-section-y)] md:pl-12">
          <p className="flex items-center gap-3 text-[var(--color-brand-blue)]" style={T.label}>
            <span
              aria-hidden
              className="inline-block h-[3px] w-8 shrink-0 rounded-full bg-[var(--color-gold)]"
            />
            Share your story
          </p>
          <h2
            className="mt-3 max-w-xl font-display tracking-tight text-balance text-[var(--color-deep-blue)]"
            style={T.section}
          >
            Your experience can help another family decide
          </h2>
          <p className="mt-3 max-w-xl text-[var(--color-ink-soft)]" style={T.body}>
            Are you an Alpha parent, or did you study here? Tell us in about five minutes. A member
            of staff reads every story before it is published.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/parents/story"
              className={`${cta} bg-[var(--color-gold)] text-[var(--color-accent-foreground)]`}
              style={{ ...T.body, fontWeight: "var(--btn-primary-weight)" }}
            >
              Parents, share your story
            </Link>
            <Link
              to="/alumni/story"
              className={`${cta} border border-[var(--color-deep-blue)]/20 bg-white text-[var(--color-deep-blue)]`}
              style={T.body}
            >
              Alumni, share your story
            </Link>
          </div>
          <p className="mt-4 text-[var(--color-ink-soft)]" style={T.body}>
            Rather talk to us first?{" "}
            <Link to="/contact" className="font-semibold text-[var(--color-brand-blue)] underline">
              Get in touch
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
