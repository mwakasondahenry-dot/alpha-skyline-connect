type HomeOrderable = {
  featured?: boolean | null;
  featured_order?: number | null;
  created_at: string;
};

const newestFirst = (a: HomeOrderable, b: HomeOrderable) =>
  b.created_at.localeCompare(a.created_at);

/**
 * Order for the home page's "In their words": stories marked "Feature on
 * home" lead, by their chosen number (unnumbered after numbered, newest
 * first); every other story follows, newest first. Does not mutate input.
 */
export function orderForHome<T extends HomeOrderable>(items: T[]): T[] {
  const featured = items.filter((t) => t.featured === true);
  const rest = items.filter((t) => t.featured !== true);
  featured.sort((a, b) => {
    const an = a.featured_order;
    const bn = b.featured_order;
    if (an != null && bn != null && an !== bn) return an - bn;
    if (an != null && bn == null) return -1;
    if (an == null && bn != null) return 1;
    return newestFirst(a, b);
  });
  rest.sort(newestFirst);
  return [...featured, ...rest];
}
