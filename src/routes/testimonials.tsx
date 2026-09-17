import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Quote } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import { getTestimonials, parentQuotes } from "@/lib/alpha-content.functions";

import { T, SHELL } from "@/components/type-roles";

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
    <div className="p-12 text-center text-muted-foreground" style={T.body}>
      Couldn't load testimonials: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-12 text-center">Not found.</div>,
  component: TestimonialsPage,
});

const SCHOOL_LABELS: Record<string, string> = {
  "group-wide": "All Schools",
  "nursery-primary": "Nursery & Primary",
  "alpha-high": "Alpha High",
  "alpha-girls": "Alpha Girls",
};

function TestimonialsPage() {
  const { data } = useSuspenseQuery(testimonialsQuery);
  /* This page is Parent Testimonials. Alumni stories live in the same table
     and are shown on /alumni, so they are filtered out here rather than
     appearing under a heading that misdescribes them. Newest first, so
     stories parents send in lead. No placeholder quotes, ever. */
  const items = parentQuotes(data);

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      <section className="alpha-band-blue relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-[var(--space-section-y)] lg:px-10">
          <p className="text-[var(--color-gold)]" style={T.label}>
            In their words
          </p>
          <h1 className="mt-3 max-w-3xl font-display leading-tight" style={T.section}>
            Parent Testimonials
          </h1>
          <p className="mt-5 max-w-2xl text-white/85" style={T.body}>
            Your Child's Education is Our Priority — and the families who trust us with it say it best.
          </p>
        </div>
      </section>

      <section className={`${SHELL} py-[var(--space-section-y)]`}>
        {items.length === 0 && (
          <p className="max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
            Stories from Alpha parents will appear here as families share them.
          </p>
        )}
        <div className="grid gap-6 [&>*]:min-w-0 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.id} direction="up" delay={i * 80}>
              <figure className="flex h-full flex-col rounded-2xl bg-white p-7 shadow-md ring-1 ring-[var(--color-deep-blue)]/10 transition-transform duration-500 hover:-translate-y-1">
                <Quote className="h-8 w-8 text-[var(--color-gold)]" aria-hidden />
                <blockquote className="mt-4 flex-1 text-[var(--color-ink)]/85" style={T.body}>
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
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-brand-blue)]/10 font-display font-bold text-[var(--color-deep-blue)]" style={T.body}
                    >
                      {t.author_name.trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-display font-bold text-[var(--color-deep-blue)]" style={T.body}>
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
            <h2 className="font-display" style={T.section}>Come and see Alpha for yourself.</h2>
            <p className="mt-2 text-white/80" style={T.body}>Book a campus visit — we'll match you to the right school.</p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-gold)] px-6 py-3 font-semibold text-[var(--color-accent-foreground)] shadow-lg transition-transform hover:scale-[1.02]" style={T.body}
          >
            Book a Visit →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
