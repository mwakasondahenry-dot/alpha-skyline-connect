import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Quote } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import { getTestimonials, type TestimonialItem } from "@/lib/alpha-content.functions";

const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: () => getTestimonials(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Parent Testimonials — Alpha Schools, Dar es Salaam" },
      {
        name: "description",
        content:
          "What Alpha Schools families say about life at our nursery, primary and secondary campuses in Dar es Salaam.",
      },
      { property: "og:title", content: "Parent Testimonials — Alpha Schools" },
      {
        property: "og:description",
        content: "Words from Alpha Schools parents across Nursery & Primary, Alpha High and Alpha Girls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(testimonialsQuery),
  errorComponent: ({ error }) => (
    <div className="p-12 text-center text-sm text-muted-foreground">
      Couldn't load testimonials: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-12 text-center">Not found.</div>,
  component: TestimonialsPage,
});

const PLACEHOLDERS: TestimonialItem[] = [
  {
    id: "placeholder-1",
    author_name: "[Parent name — to be confirmed]",
    relationship: "Parent, Alpha High",
    quote: "[Parent testimonial — to be provided by the school]",
    photo_url: null,
    school_slug: "alpha-high",
  },
  {
    id: "placeholder-2",
    author_name: "[Parent name — to be confirmed]",
    relationship: "Parent, Nursery & Primary",
    quote: "[Parent testimonial — to be provided by the school]",
    photo_url: null,
    school_slug: "nursery-primary",
  },
  {
    id: "placeholder-3",
    author_name: "[Parent name — to be confirmed]",
    relationship: "Parent, Alpha Girls",
    quote: "[Parent testimonial — to be provided by the school]",
    photo_url: null,
    school_slug: "alpha-girls",
  },
];

const SCHOOL_LABELS: Record<string, string> = {
  "group-wide": "All Schools",
  "nursery-primary": "Nursery & Primary",
  "alpha-high": "Alpha High",
  "alpha-girls": "Alpha Girls",
};

function TestimonialsPage() {
  const { data } = useSuspenseQuery(testimonialsQuery);
  const items = data.length > 0 ? data : PLACEHOLDERS;
  const isPlaceholder = data.length === 0;

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      <section className="alpha-band-blue relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            In their words
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-black leading-tight sm:text-6xl">
            Parent Testimonials
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
            Your Child's Education is Our Priority — and the families who trust us with it say it best.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        {isPlaceholder && (
          <p className="mb-8 rounded-lg border border-dashed border-[var(--color-brand-blue)]/40 bg-white px-4 py-3 text-sm text-[var(--color-ink-soft)]">
            Placeholder content — real parent testimonials can be added any time from the admin portal.
          </p>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.id} direction="up" delay={i * 80}>
              <figure className="flex h-full flex-col rounded-2xl bg-white p-7 shadow-md ring-1 ring-[var(--color-deep-blue)]/10 transition-transform duration-500 hover:-translate-y-1">
                <Quote className="h-8 w-8 text-[var(--color-gold)]" aria-hidden />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-[var(--color-ink)]/85">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-[var(--color-hairline)] pt-5">
                  {t.photo_url ? (
                    <img
                      src={t.photo_url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[var(--color-gold)]/50"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-brand-blue)]/10 font-display text-sm font-bold text-[var(--color-deep-blue)]"
                    >
                      {t.author_name.trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-display text-sm font-bold text-[var(--color-deep-blue)]">
                      {t.author_name}
                    </span>
                    <span className="block truncate text-xs text-[var(--color-ink-soft)]">
                      {t.relationship ?? SCHOOL_LABELS[t.school_slug ?? "group-wide"] ?? ""}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="alpha-band-blue">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-6 py-14 sm:flex-row sm:items-center lg:px-10">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Come and see Alpha for yourself.</h2>
            <p className="mt-2 text-sm text-white/80">Book a campus visit — we'll match you to the right school.</p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[#1a1a18] shadow-lg transition-transform hover:scale-[1.02]"
          >
            Book a Visit →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
