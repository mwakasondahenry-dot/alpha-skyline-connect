/**
 * Pure helpers for the public news pages (/news and /news/$id).
 *
 * Kept out of the route files so they can be tested without a router, and
 * so the list, the article and the home page agree on how a date, a school
 * and an excerpt are written.
 */

/** Human name for a news row's school_slug. Never shows a slug to a parent. */
export const NEWS_SCHOOL_LABEL: Record<string, string> = {
  "group-wide": "Alpha Schools",
  "nursery-primary": "Alpha Nursery & Primary",
  "alpha-high": "Alpha High",
  "alpha-girls": "Alpha Girls",
};

export function newsSchoolLabel(slug: string | null | undefined): string {
  if (!slug) return "Alpha Schools";
  return NEWS_SCHOOL_LABEL[slug] ?? "Alpha Schools";
}

/**
 * "1 October 2026". Pinned to Dar es Salaam time so the server (UTC) and a
 * parent's phone (EAT) print the same day and the page hydrates cleanly.
 * Returns null for a missing or unreadable date rather than "Invalid Date".
 */
export function formatNewsDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Dar_es_Salaam",
  });
}

/**
 * The opening of an article as one line of plain text, cut at a word
 * boundary and ended with an ellipsis when it was cut. Line breaks collapse
 * to spaces so a body that opens with a heading line still reads as prose.
 */
export function newsExcerpt(body: string | null | undefined, max = 155): string {
  const flat = (body ?? "").replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const head = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${head.replace(/[\s.,;:!?–—-]+$/, "")}…`;
}

/**
 * The body split into paragraphs on blank lines. Single line breaks inside
 * a paragraph are kept (the page renders them with whitespace-pre-line), so
 * a list typed one item per line stays one item per line.
 */
export function newsParagraphs(body: string | null | undefined): string[] {
  return (body ?? "")
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True for a canonical UUID. Anything else never reaches the database. */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * True for an http(s) URL. A cover_url is typed by staff in the admin; only
 * a web address is ever rendered as an image source or a link.
 */
export function isHttpUrl(value: string | null | undefined): value is string {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}
