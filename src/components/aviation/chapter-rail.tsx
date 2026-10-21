import { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import { SHELL } from "@/components/type-roles";

export type Chapter = { id: string; place: string };

/** Height of the rail. Chapters use it for their scroll offset and sticky photo. */
export const RAIL_H = "3.5rem";

/**
 * The three places a student moves through, as one line under the header.
 * It sticks while the chapters are on screen and a gold plane flies to the
 * chapter being read. One IntersectionObserver, transform-only motion, and no
 * motion at all under prefers-reduced-motion.
 */
export function ChapterRail({ chapters }: { chapters: ReadonlyArray<Chapter> }) {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const els = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0 || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(els.indexOf(e.target as HTMLElement));
        }
      },
      // A thin band across the middle of the screen: whichever chapter
      // crosses it is the one being read.
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [chapters]);

  const n = chapters.length;
  // Before the first chapter the plane waits at the start of the line.
  const at = active < 0 ? 0 : (active + 0.5) / n;

  return (
    <nav
      aria-label="Aviation programme chapters"
      className="sticky top-[var(--header-h)] z-30 border-b border-white/10 bg-[var(--color-deep-blue)] text-white"
      style={{ height: RAIL_H }}
    >
      <div className={`${SHELL} relative flex h-full items-stretch`}>
        <ol className="grid h-full flex-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {chapters.map((c, i) => (
            <li key={c.id} className="flex">
              <a
                href={`#${c.id}`}
                aria-current={i === active ? "step" : undefined}
                className={`flex w-full items-center justify-center gap-2 font-display transition-colors duration-300 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--color-gold)] ${
                  i === active ? "text-[var(--color-gold)]" : "text-white/75 hover:text-white"
                }`}
                style={{ fontSize: "0.9375rem", fontWeight: 700 }}
              >
                <span className="tabular-nums text-white/55">{i + 1}</span>
                {c.place}
              </a>
            </li>
          ))}
        </ol>

        {/* The flight line along the rail's foot: a faint track, the distance
            flown in gold, and the plane at its head. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-[var(--container-gutter)] bottom-0 h-[2px] bg-white/15">
          <div
            className="h-full origin-left bg-[var(--color-gold)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{ transform: `scaleX(${at})` }}
          />
          <div
            className="absolute bottom-0 left-0 w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(${at * 100}%)` }}
          >
            <Plane
              className={`-ml-2 -mb-[7px] h-4 w-4 rotate-45 text-[var(--color-gold)] transition-opacity duration-300 ${
                active < 0 ? "opacity-0" : "opacity-100"
              }`}
              fill="currentColor"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
