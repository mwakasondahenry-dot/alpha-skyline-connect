/**
 * Responsive variants for every bundled photograph.
 *
 * The photographs in src/assets are 1400 to 1920 pixels wide, and until
 * 2026-10-22 every tile on the site loaded that full file: a wall of eight
 * graduate portraits at 150 pixels each still cost eight 90 KB downloads.
 * Alpha High alone sent 2.75 MB of pictures. On a mid-range phone on mobile
 * data, that is the "parts of the page take a while to appear" complaint.
 *
 * vite-imagetools (vite.config.ts) resizes each photograph at build time into
 * 400, 800, 1200 and 1600 pixel widths; the `?responsive` query below is
 * expanded to that recipe by the plugin's defaultDirectives. This module maps
 * a photograph's bundled URL, the string a plain
 * `import photo from "@/assets/x.webp"` gives, to its srcset string, so
 * <Photo> can add `srcset`/`sizes` without changing a single import.
 *
 * Both globs resolve to the same files, so the keys line up by path. The
 * plugin never upscales: a 1400-wide source gets 400, 800, 1200 and 1400.
 */
const urls = import.meta.glob("/src/assets/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const srcsets = import.meta.glob("/src/assets/*.webp", {
  eager: true,
  import: "default",
  query: { responsive: "" },
}) as Record<string, string>;

const bySrc = new Map<string, string>();
for (const path of Object.keys(urls)) {
  const set = srcsets[path];
  if (typeof set === "string" && set.length > 0) bySrc.set(urls[path], set);
}

/**
 * The srcset for a bundled photograph's URL, or undefined for anything else
 * (a Supabase storage URL, a YouTube poster, an SVG).
 */
export function srcSetFor(src: string | undefined): string | undefined {
  return src ? bySrc.get(src) : undefined;
}
