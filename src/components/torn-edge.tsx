/**
 * TornEdge — organic hand-torn divider between two coloured sections.
 *
 * Pure SVG, no JS animation, no images. The shape is a rectangle whose
 * bottom is an irregular torn path in `topColor`, sitting on top of
 * `bottomColor`. A handful of `topColor` specks scattered below the edge
 * give the distressed ink-paper feel from the brief.
 *
 * Use as a band BETWEEN two sections, not inside them:
 *   <SectionA />
 *   <TornEdge topColor="#0C447C" bottomColor="#f7f5ef" />
 *   <SectionB />
 *
 * `intensity` tunes the edge roughness and speck density per brand:
 *   - "restrained" → Alpha High (serious flagship)
 *   - "balanced"   → Alpha Girls (confident)
 *   - "playful"    → Nursery & Primary + homepage (loud, energetic)
 */

type Intensity = "restrained" | "balanced" | "playful";

// Pre-computed irregular paths so the SVG stays cacheable and inert.
// Coordinate system: 1440 wide, 120 tall. Top edge straight, bottom torn.
const EDGE_PATHS: Record<Intensity, string> = {
  restrained:
    "M0 0 H1440 V72 L1410 76 1378 70 1342 80 1306 72 1268 84 1226 74 1188 86 1148 78 1108 90 1066 80 1024 92 982 82 938 94 894 84 850 96 804 86 760 98 716 88 672 100 626 90 582 102 538 92 494 104 450 94 406 106 362 96 318 108 274 98 230 110 186 100 142 112 98 102 54 114 22 104 0 110 Z",
  balanced:
    "M0 0 H1440 V64 L1418 78 1392 60 1360 86 1322 64 1284 92 1240 68 1200 96 1156 72 1112 100 1066 76 1020 104 974 78 928 108 880 82 832 112 784 84 736 116 686 84 638 118 588 86 540 116 490 84 442 114 392 82 344 112 296 80 248 110 198 78 150 108 102 76 56 106 24 80 0 100 Z",
  playful:
    "M0 0 H1440 V56 L1424 96 1396 54 1362 102 1320 58 1278 110 1230 60 1184 116 1132 62 1082 120 1030 64 980 116 928 60 876 112 824 58 772 116 718 62 664 118 610 60 556 116 502 58 448 114 394 60 342 112 288 56 236 110 184 54 134 108 84 60 36 104 12 74 0 96 Z",
};

// Speck clouds (relative coords inside the 1440x120 band, below the edge).
const SPECKS: Record<Intensity, ReadonlyArray<[number, number, number]>> = {
  restrained: [
    [120, 92, 2], [260, 100, 1.5], [410, 96, 2.2], [560, 104, 1.6],
    [720, 98, 2], [880, 102, 1.8], [1030, 96, 2.2], [1180, 100, 1.6], [1320, 104, 2],
  ],
  balanced: [
    [80, 92, 2.4], [170, 102, 1.6], [260, 96, 2], [340, 106, 1.4], [430, 94, 2.6],
    [520, 102, 1.8], [610, 96, 2.2], [700, 108, 1.6], [790, 94, 2.4], [880, 104, 1.8],
    [970, 96, 2.2], [1060, 106, 1.6], [1150, 94, 2.6], [1240, 102, 1.8], [1330, 96, 2.2],
    [200, 114, 1.2], [620, 116, 1.2], [1050, 115, 1.2],
  ],
  playful: [
    [40, 88, 3], [110, 102, 1.8], [180, 94, 2.4], [250, 108, 1.6], [320, 92, 3.2],
    [390, 104, 2], [460, 96, 2.6], [530, 110, 1.8], [600, 90, 3], [670, 102, 2.2],
    [740, 96, 2.8], [810, 108, 1.8], [880, 92, 3], [950, 104, 2.2], [1020, 96, 2.6],
    [1090, 108, 1.8], [1160, 92, 3.2], [1230, 104, 2.2], [1300, 96, 2.6], [1370, 108, 1.8],
    [80, 116, 1.4], [300, 114, 1.4], [560, 117, 1.4], [820, 115, 1.4], [1100, 117, 1.4],
    [1340, 115, 1.4], [220, 84, 2], [640, 82, 2], [1040, 84, 2],
  ],
};

const HEIGHT: Record<Intensity, string> = {
  restrained: "h-10 sm:h-14",
  balanced:   "h-14 sm:h-20",
  playful:    "h-16 sm:h-24",
};

export function TornEdge({
  topColor,
  bottomColor,
  intensity = "balanced",
  flip = false,
  className = "",
}: {
  topColor: string;
  bottomColor: string;
  intensity?: Intensity;
  /** Mirror vertically so the torn edge faces up instead of down. */
  flip?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`relative w-full overflow-hidden ${HEIGHT[intensity]} ${className}`}
      style={{ backgroundColor: bottomColor }}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={`block h-full w-full ${flip ? "-scale-y-100" : ""}`}
        aria-hidden
        focusable="false"
      >
        <path d={EDGE_PATHS[intensity]} fill={topColor} />
        {SPECKS[intensity].map(([cx, cy, r], i) => (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={r}
            ry={r * 0.7}
            fill={topColor}
          />
        ))}
      </svg>
    </div>
  );
}
