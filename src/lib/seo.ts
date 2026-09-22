/**
 * One source of truth for the site's address and its per-page head tags.
 *
 * Canonical URLs, og:url and the social image all have to be absolute, and
 * every one of them has to agree with the others or the canonical stops
 * meaning anything. They are built from SITE_URL here rather than written out
 * per route, so moving the site is one edit.
 *
 * Naming, per AGENTS.md: ALPHA is the brand and belongs in titles, meta
 * descriptions and social cards. ALFA EDUCATION CENTRE is the legal entity and
 * appears only in the footer, the postal address and the legal name in
 * structured data. LEGAL_NAME is exported for that second use, not this one.
 */

import type React from "react";

/** No trailing slash: every path is appended directly. */
export const SITE_URL = "https://alphaschools.co.tz";

export const SITE_NAME = "Alpha Schools";
export const LEGAL_NAME = "ALFA EDUCATION CENTRE";

/**
 * Lives in public/, not src/assets/, deliberately. Bundled assets get a
 * content hash in their filename that changes on any rebuild, which would
 * break every share card already in circulation. This URL is stable.
 */
export const OG_IMAGE = `${SITE_URL}/og/alpha-schools.jpg`;

/** Absolute URL for a route path. `/` stays `/`, everything else is bare. */
export function absoluteUrl(path: string): string {
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export type SeoOptions = {
  /** The full <title>. Under 60 characters so Google does not truncate it. */
  title: string;
  /** 140–160 characters, written for a parent searching, not for a crawler. */
  description: string;
  /** Route path, e.g. "/schools/alpha-high". Canonical and og:url come from it. */
  path: string;
  /** Absolute URL. Defaults to the site card. */
  image?: string;
  /** "article" for news and events; anything else is a page. */
  type?: "website" | "article";
  /** Keeps a page out of the index without hiding the links on it. */
  noindex?: boolean;
  /**
   * JSON-LD nodes for this page, from src/lib/structured-data.ts.
   *
   * They ride in the meta array rather than in head().scripts because the
   * router special-cases a "script:ld+json" meta entry: it serialises the
   * object and HTML-escapes it into a <script type="application/ld+json">.
   * Passing the object rather than a string is what keeps a stray quote in a
   * database-driven event title from breaking out of the tag.
   */
  ld?: Array<object>;
};

/**
 * The meta shape the router accepts. The router understands a
 * "script:ld+json" entry but React's own meta typing does not, so a JSON-LD
 * node is cast to this on the way in.
 */
type MetaTag = React.JSX.IntrinsicElements["meta"];

/**
 * The meta and link tags for one route, ready to spread into head().
 *
 * The router keeps the first tag it sees for a given name/property walking
 * from the deepest match upwards, so whatever a route returns here wins over
 * the defaults in __root.tsx without either side having to know about the
 * other.
 */
export function seo({ title, description, path, image, type = "website", noindex, ld }: SeoOptions) {
  const url = absoluteUrl(path);
  const img = image ?? OG_IMAGE;

  return {
    meta: [
      { title },
      { name: "description", content: description },

      { property: "og:type", content: type },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: img },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "en_TZ" },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: img },

      ...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),

      ...(ld ?? []).map((node) => ({ "script:ld+json": node }) as unknown as MetaTag),
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/**
 * For pages that must never be indexed at all — admin, and the alumni
 * submission form. nofollow as well as noindex: there is nothing behind them
 * worth crawling, and the admin tree is all one login wall.
 */
export function noindexHead(title: string) {
  return {
    meta: [{ title }, { name: "robots", content: "noindex, nofollow" }],
  };
}
