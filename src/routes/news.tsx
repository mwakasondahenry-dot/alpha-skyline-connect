import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { seo } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/structured-data";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Photo } from "@/components/photo";
import { getAllNews, type PublicNewsItem } from "@/lib/alpha-content.functions";
import { formatNewsDate, newsExcerpt, newsSchoolLabel } from "@/lib/news";
import { T, SHELL } from "@/components/type-roles";

export const Route = createFileRoute("/news")({
  head: () => ({
    ...seo({
      title: "School News from Dar es Salaam | Alpha Schools",
      description:
        "News and announcements from Alpha Nursery & Primary, Alpha High and Alpha Girls in Dar es Salaam, newest first, as each school publishes them for parents.",
      path: "/news",
      ld: [breadcrumbLd([{ name: "News", path: "/news" }])],
    }),
  }),
  loader: () => getAllNews(),
  component: NewsPage,
});

function NewsPage() {
  const items = Route.useLoaderData() as PublicNewsItem[];

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      <section className="bg-gradient-to-b from-[var(--color-deep-blue)] to-[var(--color-deep-blue-dark)] py-[var(--space-section-y)] text-white">
        <div className={SHELL}>
          <h1 className="font-display [text-wrap:balance]" style={T.section}>
            News from Alpha Schools
          </h1>
          <p className="mt-4 max-w-2xl text-white/85" style={T.body}>
            Announcements from the three schools, newest first. Dates for open days, meetings and
            other events are on{" "}
            <Link
              to="/events"
              className="font-semibold underline underline-offset-4 hover:text-[var(--color-gold)]"
            >
              the events page
            </Link>
            .
          </p>
        </div>
      </section>

      <section className={`${SHELL} py-[var(--space-section-y)]`}>
        {items.length === 0 ? (
          <p
            className="max-w-2xl rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--card-bg)] p-[var(--space-card-pad-sm)] text-[var(--color-ink-soft)] shadow-[var(--card-shadow)] sm:p-[var(--space-card-pad)]"
            style={T.body}
          >
            No news has been published yet. Upcoming events are on{" "}
            <Link
              to="/events"
              className="font-semibold text-[var(--color-brand-blue)] underline underline-offset-4"
            >
              the events page
            </Link>
            .
          </p>
        ) : (
          <ul className="grid gap-[var(--space-card-gap)] sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <NewsCard key={item.id} item={item} lead={i === 0} />
            ))}
          </ul>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

/**
 * One article as a card. The newest (`lead`) spans the row on desktop with
 * its picture beside the text, so a short list does not read as one small
 * card stranded at the left of an empty grid.
 */
function NewsCard({ item, lead }: { item: PublicNewsItem; lead: boolean }) {
  const date = formatNewsDate(item.published_at);
  const excerpt = newsExcerpt(item.body, 220);

  return (
    <li className={lead ? "sm:col-span-2 lg:col-span-3" : undefined}>
      <Link
        to="/news/$id"
        params={{ id: item.id }}
        className={`group flex h-full flex-col overflow-hidden ${lead && item.cover_url ? "lg:grid lg:grid-cols-[1.25fr_1fr]" : ""} rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] transition-[box-shadow,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[var(--card-shadow-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-blue)] motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
      >
        {item.cover_url ? (
          <div className="aspect-[16/10] overflow-hidden bg-[var(--color-surface-muted)]">
            <Photo
              width={1600}
              height={1000}
              src={item.cover_url}
              sizes={
                lead
                  ? "(min-width: 1024px) 55vw, 100vw"
                  : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              }
              alt=""
              loading={lead ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div
          className={`flex flex-1 flex-col p-[var(--space-card-pad-sm)] ${lead ? "lg:justify-center lg:p-[var(--space-card-pad)]" : ""}`}
        >
          <p className="text-[var(--color-ink-soft)]" style={T.label}>
            {date ? (
              <>
                <time dateTime={item.published_at ?? undefined}>{date}</time>
                <span aria-hidden> · </span>
              </>
            ) : null}
            {newsSchoolLabel(item.school_slug)}
          </p>
          <h2
            className="mt-2 font-display text-[var(--color-deep-blue)] [text-wrap:balance]"
            style={T.cardTitle}
          >
            {item.title}
          </h2>
          {excerpt ? (
            <p className="mt-2 line-clamp-2 text-[var(--color-ink-soft)]" style={T.body}>
              {excerpt}
            </p>
          ) : null}
          <span
            className={`inline-flex items-center gap-1.5 pt-4 font-display text-[var(--color-brand-blue)] ${lead ? "mt-auto lg:mt-2" : "mt-auto"}`}
            style={{ ...T.body, fontWeight: 800 }}
          >
            Read the article
            <ArrowRight
              className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden
            />
          </span>
        </div>
      </Link>
    </li>
  );
}
