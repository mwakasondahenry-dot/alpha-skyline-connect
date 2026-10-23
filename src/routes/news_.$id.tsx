/**
 * One published news article, at /news/<id>.
 *
 * The trailing underscore on `news_` keeps this page out of the /news
 * page's layout (that page has no <Outlet />); the URL is still /news/$id.
 * The same pattern as admission_.apply.$form.tsx.
 *
 * An id that is not a UUID, does not exist, or belongs to an unpublished
 * row is a 404 with a way back to the list.
 */
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { seo } from "@/lib/seo";
import { breadcrumbLd, newsArticleLd } from "@/lib/structured-data";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { getNewsArticle, type PublicNewsItem } from "@/lib/alpha-content.functions";
import {
  formatNewsDate,
  isHttpUrl,
  newsExcerpt,
  newsParagraphs,
  newsSchoolLabel,
} from "@/lib/news";
import { T, SHELL } from "@/components/type-roles";

export const Route = createFileRoute("/news_/$id")({
  loader: async ({ params }) => {
    const article = await getNewsArticle({ data: { id: params.id } });
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) => {
    const article = loaderData as PublicNewsItem | undefined;
    if (!article) {
      return {
        meta: [
          { title: "Article not found | Alpha Schools" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const path = `/news/${article.id}`;
    const description = newsExcerpt(article.body, 155);
    const cover = isHttpUrl(article.cover_url) ? article.cover_url : null;
    return seo({
      title: `${article.title} | Alpha Schools`,
      description,
      path,
      type: "article",
      image: cover ?? undefined,
      ld: [
        newsArticleLd({ ...article, cover_url: cover }, description),
        breadcrumbLd([
          { name: "News", path: "/news" },
          { name: article.title, path },
        ]),
      ],
    });
  },
  component: ArticlePage,
  notFoundComponent: ArticleNotFound,
  errorComponent: ArticleError,
});

function BackToNews({ onNavy = false }: { onNavy?: boolean }) {
  return (
    <Link
      to="/news"
      className={`inline-flex min-h-11 items-center gap-2 font-display ${
        onNavy
          ? "text-white/85 hover:text-[var(--color-gold)]"
          : "text-[var(--color-brand-blue)] hover:underline"
      }`}
      style={{ ...T.body, fontWeight: 800 }}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      All news
    </Link>
  );
}

function ArticlePage() {
  const article = Route.useLoaderData() as PublicNewsItem;
  const date = formatNewsDate(article.published_at);
  const paragraphs = newsParagraphs(article.body);
  const cover = isHttpUrl(article.cover_url) ? article.cover_url : null;

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      <article>
        <header className="bg-gradient-to-b from-[var(--color-deep-blue)] to-[var(--color-deep-blue-dark)] pt-6 pb-[var(--space-section-y)] text-white">
          <div className={SHELL}>
            <div className="max-w-[52rem]">
              <BackToNews onNavy />
              <h1 className="mt-4 font-display [text-wrap:balance]" style={T.section}>
                {article.title}
              </h1>
              <p className="mt-4 text-white/80" style={T.label}>
                {date ? (
                  <>
                    <time dateTime={article.published_at ?? undefined}>{date}</time>
                    <span aria-hidden> · </span>
                  </>
                ) : null}
                {newsSchoolLabel(article.school_slug)}
              </p>
            </div>
          </div>
        </header>

        <div className={`${SHELL} py-[var(--space-block-y)]`}>
          <div className="max-w-[52rem]">
            {cover ? <WholeCover src={cover} /> : null}

            <div
              className={`${cover ? "mt-[var(--space-block-y)]" : ""} max-w-[44rem] space-y-5 text-[var(--color-ink)]`}
              style={T.body}
            >
              {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-[var(--space-block-y)] border-t border-[var(--color-hairline)] pt-6 pb-[var(--space-block-y)]">
              <BackToNews />
            </div>
          </div>
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}

/**
 * The cover shown whole, never cropped: the picture is contained in a 16:10
 * frame and a blurred, dimmed copy of the same file fills whatever edges are
 * left, so a portrait poster and a landscape photo both sit in the same slot.
 * Both layers are one URL, so it downloads once. It is the first thing under
 * the headline, so it loads eagerly. A poster's small print is unreadable at
 * phone width, so the frame and the line under it open the original file.
 */
function WholeCover({ src }: { src: string }) {
  return (
    <figure>
      <a
        href={src}
        target="_blank"
        rel="noopener"
        className="relative isolate block aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-[var(--color-deep-blue)] shadow-[var(--shadow-banner)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-blue)]"
      >
        <img
          src={src}
          alt=""
          aria-hidden
          width={1600}
          height={1000}
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full scale-125 object-cover opacity-60 blur-xl"
        />
        <img
          src={src}
          alt=""
          width={1600}
          height={1000}
          decoding="async"
          fetchPriority="high"
          className="block h-full w-full object-contain"
        />
      </a>
      <figcaption className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
        <a
          href={src}
          target="_blank"
          rel="noopener"
          className="underline underline-offset-4 hover:text-[var(--color-deep-blue)]"
        >
          Open the full-size image
        </a>
      </figcaption>
    </figure>
  );
}

function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />
      <section className={`${SHELL} py-[var(--space-section-y)]`}>
        <h1 className="font-display text-[var(--color-deep-blue)]" style={T.section}>
          This article is not available
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
          It may have been taken down, or the link may be mistyped.
        </p>
        <div className="mt-6">
          <BackToNews />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

/** A failed database read: not a 404, and said plainly. */
function ArticleError() {
  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />
      <section className={`${SHELL} py-[var(--space-section-y)]`}>
        <h1 className="font-display text-[var(--color-deep-blue)]" style={T.section}>
          This article could not be loaded
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
          Something went wrong on our side. Please try again in a minute, or see the other news in
          the meantime.
        </p>
        <div className="mt-6">
          <BackToNews />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
