/**
 * Public alumni page. Approved entries only.
 *
 * When nothing is approved the list section is not rendered at all — no
 * placeholder names, no invented quotes. That is the same rule the parent
 * testimonial sections follow, and design/README.md calls it non-negotiable:
 * the mockup's "Brian K., Class of 2020" is not a real person.
 *
 * The page itself still renders, because the school needs somewhere to point
 * alumni at. It just says the wall is empty rather than filling it with
 * fiction.
 *
 * There is deliberately no link to /alumni/story here. That form is unlisted
 * and shared by hand.
 */
import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/structured-data";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Quote } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { T, SHELL } from "@/components/type-roles";
import {
  getAlumniStories,
  type TestimonialItem,
} from "@/lib/alpha-content.functions";

const alumniQuery = queryOptions({
  queryKey: ["alumni-stories"],
  queryFn: () => getAlumniStories(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/alumni/")({
  head: () => ({
    ...seo({
      title: "Alumni — Alpha Schools, Dar es Salaam",
      description:
        "Alpha has taught in Dar es Salaam since 2007. Former pupils of Alpha High and Alpha Girls describe where their education has taken them since.",
      path: "/alumni",
      ld: [breadcrumbLd([{ name: "Alumni", path: "/alumni" }])],
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(alumniQuery),
  component: AlumniPage,
});

/** "Software engineer at Vodacom" from whichever parts exist. */
function role(t: TestimonialItem) {
  return [t.relationship, t.company].filter(Boolean).join(" at ");
}

function AlumniPage() {
  const { data: stories } = useSuspenseQuery(alumniQuery);

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      <section className="alpha-band-blue relative overflow-hidden">
        <div className={`${SHELL} relative py-[var(--space-section-y)]`}>
          <p className="text-[var(--color-gold)]" style={T.label}>
            Where they are now
          </p>
          <h1
            className="mt-3 max-w-3xl font-display leading-tight"
            style={T.section}
          >
            Alpha Alumni
          </h1>
          <p className="mt-5 max-w-2xl text-white/85" style={T.body}>
            Alpha has been teaching in Dar es Salaam since 2007. These are some
            of the people who went through it, in their own words.
          </p>
        </div>
      </section>

      {/* design/README.md + AGENTS.md: the section disappears entirely rather
          than rendering placeholder people. */}
      {stories.length > 0 && (
        <section className={`${SHELL} py-[var(--space-section-y)]`}>
          <ul className="grid gap-[var(--space-card-gap)] md:grid-cols-2 lg:grid-cols-3">
            {stories.map((t, i) => (
              <li key={t.id} suppressHydrationWarning data-reveal data-reveal-delay={i % 3 ? 80 : undefined}>
                <figure className="flex h-full flex-col rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] shadow-[var(--card-shadow)]">
                  <Quote
                    className="h-7 w-7 shrink-0 text-[var(--color-gold)]"
                    aria-hidden
                  />
                  <blockquote
                    className="mt-4 flex-1 text-[var(--color-ink)]/85"
                    style={T.body}
                  >
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-[var(--color-hairline)] pt-5">
                    {t.photo_url && (
                      <img
                        width={48}
                        height={48}
                        src={t.photo_url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                    )}
                    <span className="min-w-0">
                      <span className="block font-display text-[var(--color-deep-blue)]">
                        {t.author_name}
                      </span>
                      {role(t) && (
                        <span
                          className="block text-[var(--color-ink-soft)]"
                          style={T.body}
                        >
                          {role(t)}
                        </span>
                      )}
                      <span
                        className="mt-0.5 block text-[var(--color-ink-soft)]"
                        style={T.label}
                      >
                        Class of {t.grad_year}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stories.length === 0 && (
        <section className={`${SHELL} py-[var(--space-section-y)]`}>
          <p
            className="rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] text-[var(--color-ink-soft)] shadow-[var(--card-shadow)]"
            style={T.body}
          >
            No alumni stories have been published yet. If you studied at Alpha
            and would like to be here, contact the school and we will send you
            the form.
          </p>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
