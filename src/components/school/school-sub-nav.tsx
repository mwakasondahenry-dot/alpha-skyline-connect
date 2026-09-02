/**
 * In-page wayfinding for the school pages.
 *
 * The three school pages run 8,800-11,200px. Nursery & Primary used to carry
 * four in-page anchors in its own header; that header was removed because it
 * shipped no mobile navigation at all, and the anchors went with it. This is
 * the replacement, shared by all three pages rather than rebuilt per page.
 *
 * Sticky beneath the site header. The 4.25rem offset is the measured height of
 * SiteHeader (68px: 44px of content plus py-3 and its border). It is the one
 * magic number here — if the header's height ever changes this needs to follow,
 * so it is worth promoting to a token the moment a second consumer needs it.
 *
 * Horizontally scrollable at 375px so any number of anchors fits on one line
 * without wrapping or shrinking below the 44px touch target.
 */
export function SchoolSubNav({
  items,
}: {
  items: ReadonlyArray<{ label: string; href: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label="On this page"
      className="sticky top-[4.25rem] z-30 border-b border-[var(--color-hairline)] bg-[var(--color-surface)]/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-[var(--container-max)] gap-1 overflow-x-auto px-[var(--container-gutter)] py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((i) => (
          <li key={i.href} className="shrink-0">
            <a
              href={i.href}
              className="inline-flex min-h-[var(--btn-primary-min-h)] items-center whitespace-nowrap rounded-[var(--radius-btn)] px-3 text-[var(--color-ink-soft)] transition-colors duration-150 hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-deep-blue)] active:scale-[0.97] motion-reduce:transition-none"
              style={{
                fontSize: "var(--text-label)",
                fontWeight: "var(--weight-label)",
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase",
              }}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
