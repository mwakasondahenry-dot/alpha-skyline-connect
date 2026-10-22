import { useEffect, useRef, useState } from "react";
import { T } from "@/components/type-roles";
import { DIVISIONS, squares, type Division, type Sitting } from "@/lib/girls-results";

/** Division colours on the deep sea-green ground. */
const FILL: Record<Division, string> = {
  I: "var(--color-gold)",
  II: "#ffffff",
  III: "rgba(255,255,255,0.45)",
  IV: "rgba(255,255,255,0.22)",
  "0": "transparent",
};

const EXAM_NAME: Record<Sitting["exam"], string> = {
  CSEE: "Form Four · CSEE",
  ACSEE: "Form Six · ACSEE",
};

/**
 * One square per candidate, coloured by division, best first. The squares
 * fill in once when the chart scrolls into view; under reduced motion, or
 * without IntersectionObserver, they are simply there. Pointing at or
 * focusing a division in the legend lights its squares and dims the rest.
 */
export function ResultsChart({ sitting, columns = 15 }: { sitting: Sitting; columns?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  // Visible by default: server HTML, a failed bundle and reduced motion all
  // show the squares. Only once the page has loaded, and only when the chart
  // is still below the fold, are they hidden to be filled in on arrival.
  const [armed, setArmed] = useState(false);
  const [focus, setFocus] = useState<Division | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      el.getBoundingClientRect().top < window.innerHeight
    ) {
      return;
    }
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(false);
          io.disconnect();
        }
      },
      /* Fill in while the chart is still a quarter-viewport below the fold,
         so the squares are already there when the reader reaches them. */
      { rootMargin: "0px 0px 25% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const shown = !armed;

  const sq = squares(sitting);
  const present = DIVISIONS.filter((d) => sitting.divisions[d] > 0);
  const summary = present.map((d) => `Division ${d}: ${sitting.divisions[d]}`).join(", ");

  return (
    <figure
      ref={ref}
      aria-label={`${EXAM_NAME[sitting.exam]} ${sitting.year}: ${sitting.candidates} candidates, ${sitting.passed} passed. ${summary}.`}
    >
      <div
        aria-hidden
        className="grid gap-[5px] sm:gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {sq.map((d, i) => (
          <span
            key={i}
            className="aspect-square rounded-[4px] transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none"
            style={{
              background: FILL[d],
              transform: shown ? "scale(1)" : "scale(0)",
              transitionDelay: shown ? `${Math.min(i * 22, 900)}ms` : "0ms",
              opacity: focus && focus !== d ? 0.18 : 1,
            }}
          />
        ))}
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Divisions">
        {present.map((d) => (
          <li key={d}>
            <button
              type="button"
              onMouseEnter={() => setFocus(d)}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus(d)}
              onBlur={() => setFocus(null)}
              className="flex items-center gap-2 rounded-md text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-gold)]"
              style={{ ...T.body, fontWeight: 700 }}
            >
              <span
                aria-hidden
                className="h-3.5 w-3.5 rounded-[3px]"
                style={{ background: FILL[d] }}
              />
              Division {d}
              <span className="tabular-nums text-white/75" style={{ fontWeight: 600 }}>
                {sitting.divisions[d]}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </figure>
  );
}
