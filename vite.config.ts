// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { imagetools } from "vite-imagetools";

export default defineConfig({
  plugins: [
    // Build-time photograph resizing for src/lib/responsive-photos.ts. Only
    // imports that carry a query (?w=...&as=srcset) are touched; a plain
    // `import photo from "@/assets/x.webp"` still gives the original URL.
    // Resized files are cached under node_modules/.cache/imagetools.
    imagetools({
      cache: { dir: "./node_modules/.cache/imagetools" },
      // `?responsive` expands to the full recipe here rather than in the
      // glob query, because Vite's glob serialiser loses the semicolon list.
      defaultDirectives: (url) =>
        url.searchParams.has("responsive")
          ? new URLSearchParams({
              w: "400;800;1200;1600",
              format: "webp",
              quality: "75",
              as: "srcset",
            })
          : new URLSearchParams(),
    }),
  ],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
