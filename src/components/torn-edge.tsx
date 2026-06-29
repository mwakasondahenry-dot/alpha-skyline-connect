/**
 * TornEdge — organic hand-torn divider between two coloured sections.
 *
 * The edge is generated from a seeded PRNG so every instance can be a
 * different irregular path (pass a distinct `seed` per placement). Each
 * segment is one of: a soft torn bump (quadratic curve), a sharp jag, a
 * micro chip, or — occasionally — a deep torn chunk missing. Scattered
 * fibre flecks sit below the edge in the section colour; tiny "holes"
 * sit just inside the edge in the opposite colour, like the bits of
 * paper that came away with the tear.
 *
 * Pure SVG, no JS animation, no images. Path + specks are computed once
 * per (seed, intensity) and memoised.
 *
 *   <SectionA />
 *   <TornEdge topColor="#0C447C" bottomColor="#f7f5ef" seed={17} />
 *   <SectionB />
 */

import { useMemo } from "react";

type Intensity = "restrained" | "balanced" | "playful";

const W = 1440;
const H = 120;

// Per-intensity tuning. Amplitude is how far the edge can swing vertically;
// chunkChance is how often a deep "ripped chunk" appears.
const TUNING: Record<
  Intensity,
  {
    baseY: number;
    amp: number;
    minStep: number;
    maxStep: number;
    chunkChance: number;
    fibres: number;
    holes: number;
    heightClass: string;
  }
> = {
  restrained: {
    baseY: 70, amp: 14, minStep: 28, maxStep: 70,
    chunkChance: 0.04, fibres: 14, holes: 6,
    heightClass: "h-10 sm:h-14",
  },
  balanced: {
    baseY: 64, amp: 22, minStep: 22, maxStep: 64,
    chunkChance: 0.07, fibres: 22, holes: 10,
    heightClass: "h-14 sm:h-20",
  },
  playful: {
    baseY: 56, amp: 32, minStep: 18, maxStep: 58,
    chunkChance: 0.11, fibres: 34, holes: 16,
    heightClass: "h-16 sm:h-24",
  },
};

// Mulberry32 — tiny deterministic PRNG.
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Built = {
  path: string;
  fibres: Array<{ cx: number; cy: number; rx: number; ry: number; rot: number }>;
  holes: Array<{ cx: number; cy: number; rx: number; ry: number; rot: number }>;
};

function buildEdge(seed: number, intensity: Intensity): Built {
  const t = TUNING[intensity];
  const rand = mulberry32(seed * 9301 + 49297);
  const r = (a: number, b: number) => a + rand() * (b - a);

  // Walk x left → right, picking irregular segments.
  const points: Array<{ x: number; y: number; kind: "curve" | "jag" | "chip" | "chunk" }> = [];
  let x = 0;
  let y = t.baseY + r(-t.amp * 0.4, t.amp * 0.4);
  points.push({ x: 0, y, kind: "curve" });

  while (x < W) {
    const step = r(t.minStep, t.maxStep);
    x = Math.min(W, x + step);
    const roll = rand();
    let kind: "curve" | "jag" | "chip" | "chunk";
    if (roll < t.chunkChance) kind = "chunk";
    else if (roll < t.chunkChance + 0.18) kind = "jag";
    else if (roll < t.chunkChance + 0.32) kind = "chip";
    else kind = "curve";

    // Irregular y: pull strongly away from previous y so it never feels periodic.
    const swing = r(-t.amp, t.amp);
    let ny = t.baseY + swing;
    // Sometimes spike further down (extra torn) or up (paper still hanging).
    if (kind === "jag") ny = t.baseY + r(t.amp * 0.4, t.amp * 1.4) * (rand() < 0.5 ? -1 : 1);
    if (kind === "chunk") ny = t.baseY + t.amp * r(1.3, 2.2); // deep gouge downward
    points.push({ x, y: ny, kind });
    y = ny;
  }
  // Ensure last point lands at W.
  if (points[points.length - 1].x < W) points.push({ x: W, y: t.baseY, kind: "curve" });

  // Build path: start top-left, across the top, down the right side, then
  // walk the torn edge back to (0, points[0].y) and close.
  let d = `M0 0 H${W} V${points[points.length - 1].y} `;
  for (let i = points.length - 2; i >= 0; i--) {
    const cur = points[i];
    const next = points[i + 1];
    if (cur.kind === "curve") {
      // Quadratic with off-centre control for asymmetry.
      const cx = (cur.x + next.x) / 2 + r(-12, 12);
      const cy = Math.min(cur.y, next.y) - r(0, t.amp * 0.5);
      d += `Q ${cx.toFixed(1)} ${cy.toFixed(1)}, ${cur.x.toFixed(1)} ${cur.y.toFixed(1)} `;
    } else if (cur.kind === "jag") {
      // Sharp two-segment notch via an intermediate point.
      const mx = cur.x + (next.x - cur.x) * r(0.35, 0.65);
      const my = cur.y + (next.y - cur.y) * r(0.2, 0.5) + r(-t.amp * 0.4, t.amp * 0.4);
      d += `L ${mx.toFixed(1)} ${my.toFixed(1)} L ${cur.x.toFixed(1)} ${cur.y.toFixed(1)} `;
    } else if (cur.kind === "chip") {
      // Tiny missing chip: dip then climb.
      const mx1 = cur.x + (next.x - cur.x) * 0.35;
      const mx2 = cur.x + (next.x - cur.x) * 0.65;
      const dipY = Math.max(cur.y, next.y) + r(3, 8);
      d += `L ${mx2.toFixed(1)} ${dipY.toFixed(1)} L ${mx1.toFixed(1)} ${dipY.toFixed(1)} L ${cur.x.toFixed(1)} ${cur.y.toFixed(1)} `;
    } else {
      // Deep ripped chunk: drop down sharply on one side, rough across, climb back.
      const mx1 = cur.x + (next.x - cur.x) * r(0.2, 0.4);
      const mx2 = cur.x + (next.x - cur.x) * r(0.6, 0.8);
      const deepY = cur.y + r(-2, 4);
      const ridgeY = deepY - r(2, 6);
      d += `L ${mx2.toFixed(1)} ${deepY.toFixed(1)} L ${mx1.toFixed(1)} ${ridgeY.toFixed(1)} L ${cur.x.toFixed(1)} ${cur.y.toFixed(1)} `;
    }
  }
  d += "Z";

  // Fibres: topColor flecks scattered just below the edge baseline.
  const fibres = Array.from({ length: t.fibres }, () => {
    const fx = r(4, W - 4);
    // Place below the torn baseline; deeper specks are smaller (further fibre dust).
    const depth = r(0, H - t.baseY - 4);
    const fy = t.baseY + t.amp * 0.3 + depth;
    const size = r(0.6, 2.6) * (1 - depth / (H * 1.2));
    return { cx: fx, cy: fy, rx: size, ry: size * r(0.5, 0.9), rot: r(0, 180) };
  });

  // Holes: tiny bottomColor flecks just inside the torn area (above baseline).
  const holes = Array.from({ length: t.holes }, () => {
    const hx = r(8, W - 8);
    const hy = t.baseY - r(2, t.amp * 0.9);
    const size = r(0.5, 1.8);
    return { cx: hx, cy: hy, rx: size, ry: size * r(0.5, 1), rot: r(0, 180) };
  });

  return { path: d, fibres, holes };
}

export function TornEdge({
  topColor,
  bottomColor,
  intensity = "balanced",
  flip = false,
  seed = 1,
  className = "",
}: {
  topColor: string;
  bottomColor: string;
  intensity?: Intensity;
  /** Mirror vertically so the torn edge faces up instead of down. */
  flip?: boolean;
  /** Distinct seed → distinct irregular path. Vary across the site. */
  seed?: number;
  className?: string;
}) {
  const built = useMemo(() => buildEdge(seed, intensity), [seed, intensity]);
  const t = TUNING[intensity];

  return (
    <div
      aria-hidden
      className={`relative w-full overflow-hidden ${t.heightClass} ${className}`}
      style={{ backgroundColor: bottomColor }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className={`block h-full w-full ${flip ? "-scale-y-100" : ""}`}
        aria-hidden
        focusable="false"
      >
        <path d={built.path} fill={topColor} />
        {built.holes.map((h, i) => (
          <ellipse
            key={`h${i}`}
            cx={h.cx}
            cy={h.cy}
            rx={h.rx}
            ry={h.ry}
            fill={bottomColor}
            transform={`rotate(${h.rot} ${h.cx} ${h.cy})`}
          />
        ))}
        {built.fibres.map((f, i) => (
          <ellipse
            key={`f${i}`}
            cx={f.cx}
            cy={f.cy}
            rx={Math.max(0.3, f.rx)}
            ry={Math.max(0.2, f.ry)}
            fill={topColor}
            transform={`rotate(${f.rot} ${f.cx} ${f.cy})`}
          />
        ))}
      </svg>
    </div>
  );
}
