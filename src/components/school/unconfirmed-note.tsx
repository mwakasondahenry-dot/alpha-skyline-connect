/**
 * Marks content supplied by the school that has not yet been confirmed in
 * writing.
 *
 * design/README.md requires content the school still owes to stay visible and
 * clearly marked rather than quietly invented or quietly dropped. The same
 * principle applies one step earlier: content the school has supplied but not
 * yet signed off should be readable, and honestly labelled, not presented as
 * settled fact.
 *
 * Deliberately quiet — a hairline and a small label, not a warning banner. It
 * is a note to the school and to whoever reviews the page, and it should not
 * read to a parent as though something is wrong.
 */
export function UnconfirmedNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-4 border-l-2 border-[var(--color-hairline)] pl-4 text-[var(--color-ink-soft)]"
      style={{
        fontSize: "var(--text-label)",
        lineHeight: "var(--leading-body)",
        fontWeight: "var(--weight-body)",
      }}
    >
      {children}
    </p>
  );
}
