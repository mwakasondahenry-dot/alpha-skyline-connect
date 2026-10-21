import { useEffect, useRef, useState } from "react";
import { Baby, Backpack, GraduationCap, type LucideIcon } from "lucide-react";
import { T } from "@/components/type-roles";

/** One rung of the 2-to-12 ladder: a class name and where it lives on the page. */
export type Rung = { label: string; href: string };

/** The school's own class sequence, from its campus banner. */
export const NURSERY_RUNGS: ReadonlyArray<Rung> = [
  { label: "Day Care", href: "#early-years" },
  { label: "Baby Class", href: "#early-years" },
  { label: "Middle Class", href: "#early-years" },
  { label: "Pre-Unit", href: "#early-years" },
];
export const PRIMARY_RUNGS: ReadonlyArray<Rung> = Array.from({ length: 7 }, (_, i) => ({
  label: `Grade ${i + 1}`,
  href: "#primary",
}));
export const ALL_RUNGS = [...NURSERY_RUNGS, ...PRIMARY_RUNGS];
const N = ALL_RUNGS.length;
const N_NURSERY = NURSERY_RUNGS.length;

const isNursery = (i: number) => i < N_NURSERY;
/** Stage colour: bright blue for nursery, gold for primary. */
const stageFill = (i: number) => (isNursery(i) ? "var(--color-bright-blue)" : "var(--color-gold)");
/** The icon the climber wears on rung i: a baby, a school bag, then a cap. */
const climberIcon = (i: number): LucideIcon =>
  isNursery(i) ? Baby : i === N - 1 ? GraduationCap : Backpack;

/** A springy ease with a little overshoot, so the climber hops. */
const HOP = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const EMPTY = "color-mix(in srgb, var(--color-deep-blue) 12%, transparent)";

/**
 * Where the reader is on the 2-to-12 ladder, as a position from 0 to N
 * (fractional, so the climber moves continuously). Nursery's four rungs
 * span the nursery section and primary's seven span the primary section,
 * so the ruler always names the stage actually on screen. Measured at the
 * middle of the viewport; one passive listener, batched per frame.
 */
function useClimb(nurseryId: string, primaryId: string) {
  const [pos, setPos] = useState(0);
  const [inView, setInView] = useState(false);
  const frame = useRef(0);

  useEffect(() => {
    const nursery = document.getElementById(nurseryId);
    const primary = document.getElementById(primaryId);
    if (!nursery || !primary) return;
    const through = (el: HTMLElement, mid: number) => {
      const r = el.getBoundingClientRect();
      return Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)));
    };
    const measure = () => {
      frame.current = 0;
      const vh = window.innerHeight;
      const mid = vh * 0.5;
      const pn = through(nursery, mid);
      const pp = through(primary, mid);
      setPos(pp > 0 ? N_NURSERY + pp * (N - N_NURSERY) : pn * N_NURSERY);
      const top = nursery.getBoundingClientRect().top;
      const bottom = primary.getBoundingClientRect().bottom;
      setInView(top < vh * 0.6 && bottom > vh * 0.4);
    };
    const onScroll = () => {
      if (!frame.current) frame.current = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [nurseryId, primaryId]);

  const active = Math.min(N - 1, Math.floor(pos));
  return { pos, active, started: pos > 0.02, inView };
}

/** Scrolls to a rung's stage. Every rung in one stage shares its anchor. */
function jump(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  const el = document.querySelector(href);
  if (!el) return;
  e.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", href);
}

/** The round badge that climbs the chart. */
function Climber({ rung, size }: { rung: number; size: number }) {
  const Icon = climberIcon(rung);
  const nursery = isNursery(rung);
  return (
    <span
      className="grid place-items-center rounded-full border-[3px] border-white shadow-[0_8px_18px_-8px_rgba(0,46,106,0.7)]"
      style={{ width: size, height: size, background: nursery ? "var(--color-bright-blue)" : "var(--color-gold)" }}
    >
      <Icon
        aria-hidden
        className="h-1/2 w-1/2"
        style={{ color: nursery ? "white" : "var(--color-deep-blue)" }}
        strokeWidth={2.5}
      />
    </span>
  );
}

/**
 * The opening screen's height chart, across the hero's foot: a block per
 * class, each a step taller than the last, bright blue for the four nursery
 * classes and gold for Grade 1 to 7. They spring up one after another as the
 * hero assembles. Only the ends carry ages: the sources disagree on the
 * exact age primary begins.
 */
export function HeightChart() {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setGrown(true), 500);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <figure aria-label="From age 2 to 12: Nursery (Day Care to Pre-Unit), then Primary Grade 1 to 7">
      <div className="grid gap-x-3" style={{ gridTemplateColumns: `${N_NURSERY}fr ${N - N_NURSERY}fr` }}>
        <a
          href="#early-years"
          onClick={(e) => jump(e, "#early-years")}
          className="font-display text-[var(--color-bright-blue)] hover:underline"
          style={{ ...T.cardTitle, fontWeight: 900 }}
        >
          Nursery
        </a>
        <a
          href="#primary"
          onClick={(e) => jump(e, "#primary")}
          className="font-display text-[var(--color-deep-blue)] hover:underline"
          style={{ ...T.cardTitle, fontWeight: 900 }}
        >
          Primary · Grade 1 to 7
        </a>
      </div>

      <div className="mt-3 flex items-end gap-[3px] sm:gap-1.5" aria-hidden>
        {ALL_RUNGS.map((r, i) => (
          <span
            key={r.label}
            className={`flex-1 origin-bottom rounded-[6px] transition-transform duration-500 motion-reduce:transition-none ${
              i === N_NURSERY ? "ml-2 sm:ml-3" : ""
            }`}
            style={{
              height: `${0.9 + i * 0.16}rem`,
              background: stageFill(i),
              transform: `scaleY(${grown ? 1 : 0.15})`,
              transitionTimingFunction: HOP,
              transitionDelay: `${i * 60}ms`,
            }}
          />
        ))}
      </div>

      <div
        className="mt-2 flex items-center justify-between font-display text-[var(--color-deep-blue)]"
        style={{ ...T.body, fontWeight: 800 }}
      >
        <span className="flex items-center gap-1.5">
          <Baby aria-hidden className="h-4 w-4 text-[var(--color-bright-blue)]" /> Age 2
        </span>
        <span className="flex items-center gap-1.5">
          Age 12 <GraduationCap aria-hidden className="h-4 w-4" />
        </span>
      </div>
    </figure>
  );
}

/**
 * The ladder's companion on wide screens: a kids' height chart on a white
 * card, sticky beside the stages. A bar per class fills in stage colour as
 * the reader passes it, the current class grows and is named, and a climber
 * badge hops along the chart. Every class is a link to its stage.
 */
export function GrowthRuler({ nurseryId, primaryId }: { nurseryId: string; primaryId: string }) {
  const { pos, active, started } = useClimb(nurseryId, primaryId);
  const ROW = 2.25; // rem per rung

  return (
    <nav
      aria-label="Classes from age 2 to 12"
      className="rounded-[1.75rem] bg-white p-4 pr-5 shadow-[0_18px_40px_-22px_rgba(0,46,106,0.55)] ring-1 ring-[var(--color-deep-blue)]/10"
    >
      <p className="flex items-center gap-1.5 font-display text-[var(--color-deep-blue)]" style={{ ...T.body, fontWeight: 900 }}>
        <Baby aria-hidden className="h-4 w-4 text-[var(--color-bright-blue)]" /> Age 2
      </p>

      <div className="relative mt-3" style={{ height: `${N * ROW}rem` }}>
        <div
          aria-hidden
          className="absolute left-0 top-0 z-10 transition-transform duration-500 motion-reduce:transition-none"
          style={{
            transform: `translateY(calc(${Math.min(pos, N - 0.5) * ROW}rem - 50%))`,
            transitionTimingFunction: HOP,
            opacity: started ? 1 : 0,
          }}
        >
          <Climber rung={active} size={36} />
        </div>

        <ol className="absolute inset-0 grid" style={{ gridTemplateRows: `repeat(${N}, 1fr)` }}>
          {ALL_RUNGS.map((r, i) => {
            const on = started && i === active;
            const passed = started && i <= active;
            return (
              <li key={r.label} className="flex items-center gap-3 pl-11">
                <span
                  aria-hidden
                  className="h-[0.9rem] shrink-0 rounded-full transition-all duration-500 motion-reduce:transition-none"
                  style={{
                    width: on ? "1.75rem" : passed ? "1.25rem" : "0.75rem",
                    background: passed ? stageFill(i) : EMPTY,
                    transitionTimingFunction: HOP,
                  }}
                />
                <a
                  href={r.href}
                  onClick={(e) => jump(e, r.href)}
                  aria-current={on ? "step" : undefined}
                  className="origin-left whitespace-nowrap font-display transition-transform duration-300 motion-reduce:transition-none hover:text-[var(--color-bright-blue)]"
                  style={{
                    ...T.body,
                    fontWeight: on ? 900 : 600,
                    color: on ? "var(--color-deep-blue)" : "var(--color-ink-soft)",
                    transform: on ? "scale(1.08)" : "none",
                    transitionTimingFunction: HOP,
                  }}
                >
                  {r.label}
                </a>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="mt-3 flex items-center gap-1.5 font-display text-[var(--color-deep-blue)]" style={{ ...T.body, fontWeight: 900 }}>
        <GraduationCap aria-hidden className="h-4 w-4" /> Age 12
      </p>
    </nav>
  );
}

/**
 * The same chart on phones: a strip pinned under the sub-nav while the
 * ladder is on screen. Eleven bars fill in stage colour, the climber hops
 * along them, and the current class is named. Tapping a bar jumps to its
 * stage.
 */
export function MobileRuler({ nurseryId, primaryId }: { nurseryId: string; primaryId: string }) {
  const { pos, active, started, inView } = useClimb(nurseryId, primaryId);
  const current = ALL_RUNGS[active];
  const pct = (Math.min(pos, N - 0.5) / N) * 100;
  return (
    <div
      className={`sticky z-20 border-b border-[var(--color-deep-blue)]/10 bg-white/95 px-[var(--container-gutter)] pb-2.5 pt-2 backdrop-blur transition-opacity duration-200 motion-reduce:transition-none lg:hidden ${
        inView ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{ top: "calc(var(--header-h) + 3.5rem)" }}
    >
      <p className="flex items-baseline justify-between font-display">
        <span style={{ ...T.body, fontWeight: 900, color: "var(--color-deep-blue)" }}>
          {started ? current.label : "Day Care"}
        </span>
        <span className="text-[var(--color-ink-soft)]" style={{ ...T.body, fontWeight: 600 }}>
          Age 2 – 12
        </span>
      </p>
      <div className="relative mt-3">
        <div
          aria-hidden
          className="absolute -top-[0.55rem] z-10 -translate-x-1/2 transition-[left] duration-500 motion-reduce:transition-none"
          style={{ left: `${pct}%`, transitionTimingFunction: HOP, opacity: started ? 1 : 0 }}
        >
          <Climber rung={active} size={28} />
        </div>
        <ol className="flex gap-[3px]" aria-label="Classes from age 2 to 12">
          {ALL_RUNGS.map((r, i) => {
            const passed = started && i <= active;
            return (
              <li key={r.label} className="flex-1">
                <a
                  href={r.href}
                  onClick={(e) => jump(e, r.href)}
                  aria-label={r.label}
                  aria-current={started && i === active ? "step" : undefined}
                  className="block py-1.5"
                >
                  <span
                    className="block h-2.5 rounded-full transition-colors duration-300 motion-reduce:transition-none"
                    style={{ background: passed ? stageFill(i) : EMPTY }}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
