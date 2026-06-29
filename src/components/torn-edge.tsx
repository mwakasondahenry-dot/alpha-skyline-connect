/**
 * TornEdge — smooth, gently curved divider between two coloured sections.
 *
 * Despite the name (kept for compatibility), this renders a soft, modern
 * wave: a single smooth cubic Bézier curve between two coloured blocks.
 * No jags, no specks, no straight horizontal line — just a calm flowing
 * boundary that works site-wide.
 *
 *   <SectionA />
 *   <TornEdge topColor="#0C447C" bottomColor="#f7f5ef" seed={17} />
 *   <SectionB />
 */

import { useMemo } from "react";

type Intensity = "restrained" | "balanced" | "playful";

const W = 1440;
const H = 120;

const TUNING: Record<Intensity, { baseY: number; amp: number; heightClass: string }> = {
  restrained: { baseY: 60, amp: 14, heightClass: "h-8 sm:h-12" },
  balanced:   { baseY: 60, amp: 22, heightClass: "h-10 sm:h-16" },
  playful:    { baseY: 60, amp: 32, heightClass: "h-12 sm:h-20" },
};

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

function buildWave(seed: number, intensity: Intensity): string {
  const t = TUNING[intensity];
  const rand = mulberry32(seed * 9301 + 49297);
  const r = (a: number, b: number) => a + rand() * (b - a);

  // 3–4 control points across the width, each offset gently from baseY.
  const segments = 3;
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= segments; i++) {
    const x = (W / segments) * i;
    const y = t.baseY + r(-t.amp, t.amp);
    points.push({ x, y });
  }

  // Smooth cubic Béziers between successive points; control handles share
  // a horizontal slope so each junction stays tangent — no kinks.
  let d = `M0 0 H${W} V${points[points.length - 1].y.toFixed(1)} `;
  for (let i = points.length - 1; i > 0; i--) {
    const p1 = points[i];
    const p0 = points[i - 1];
    const dx = (p1.x - p0.x) / 2;
    const c1x = p1.x - dx;
    const c1y = p1.y;
    const c2x = p0.x + dx;
    const c2y = p0.y;
    d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} `;
  }
  d += "Z";
  return d;
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
  flip?: boolean;
  seed?: number;
  className?: string;
}) {
  const path = useMemo(() => buildWave(seed, intensity), [seed, intensity]);
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
        <path d={path} fill={topColor} />
      </svg>
    </div>
  );
}
