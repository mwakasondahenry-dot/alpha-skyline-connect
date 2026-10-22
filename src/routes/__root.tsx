import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import alphaLogo from "@/assets/alpha-logo.webp";
import mulishWoff2 from "@fontsource-variable/mulish/files/mulish-latin-wght-normal.woff2?url";
import hankenWoff2 from "@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { UrgentAnnouncements } from "../components/urgent-announcements";
import { OG_IMAGE, SITE_NAME } from "@/lib/seo";

const DEFAULT_TITLE = "Alpha Schools: Private Schools in Dar es Salaam, Nursery to A-Level";
const DEFAULT_DESCRIPTION =
  "Three private schools in Dar es Salaam: a nursery and primary school from age 2, a co-education secondary school in Mikocheni and a girls' secondary school in Kunduchi, all teaching to NECTA.";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },

      /* Site-wide fallbacks only. Every public route calls seo() in its own
         head() and overrides all of these; what is left here is what an
         un-decorated route (admin, the 404) would otherwise serve.

         There used to be two name="description" tags in this array. The
         router keeps the last one it walks in a route's list, so the generic
         one won and the other never shipped — which was the lucky half of the
         bug. The losing one carried the text
         "[Aviation positioning statement — wording to be confirmed]", a
         placeholder for a claim the client has not approved (see
         design/CONTENT-FROM-SCHOOL.md). Placeholders belong in visible page
         content where the school can see what it still owes, never in a meta
         tag where they would reach search results. */
      { title: DEFAULT_TITLE },
      { name: "description", content: DEFAULT_DESCRIPTION },

      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: DEFAULT_TITLE },
      { property: "og:description", content: DEFAULT_DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "en_TZ" },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: DEFAULT_TITLE },
      { name: "twitter:description", content: DEFAULT_DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/webp", href: alphaLogo },
      /* The two type faces, self-hosted (see styles.css). Preloading the
         latin files means the text is drawn in its own face on first paint
         instead of swapping in after the stylesheet is parsed. Mulish is
         --font-display (every h1-h4, .font-display); Hanken Grotesk is
         --font-sans, the body face. Both are variable fonts, so every weight
         the site uses comes from the one file. */
      { rel: "preload", as: "font", type: "font/woff2", href: hankenWoff2, crossOrigin: "anonymous" },
      { rel: "preload", as: "font", type: "font/woff2", href: mulishWoff2, crossOrigin: "anonymous" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {/* eslint-disable-next-line react/no-danger */}
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `<!--
ALPHA SCHOOLS - DIRECTION CONTRACT (seed 8ce3a0b9, superseded by a brief pin)

THESIS: A school that proves itself with structure, not adjectives. It refuses
the full-bleed-photo-plus-three-cards arrangement by making every claim land in
a shaped panel a parent can read at a glance on a phone.

OWN-WORLD: Deep navy fields cut by a single gold arc; white page, rounded cards
with hairline borders; icon discs alternating gold and navy; short gold rules
under section heads; two-tone display headline, white line then gold line.
Photography sits inside curved masks, never behind type.

STORY: A parent arrives comparing three schools, sees which one this is within
one screen, understands the aviation programme is real and operational, and
can enquire in one tap.

FIRST VIEWPORT: Navy panel left, photo right behind a gold arc. Eyebrow, the
two-tone headline, one sentence, two buttons, and a three-chip credential strip
pinned to the panel foot. Primary action gold with dark ink, top-left of the
button pair.

FORM: Brief-pinned (design/approach reference), which beats the roll; the
dealt assignment was Stadium Scoreboard, candidate 4 of 7.

MOTION: buttons only, per motion-audits/2026-09-02 - press active:scale(.97)
at 120ms, hover lift 150ms, transform and opacity only, full
prefers-reduced-motion collapse.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md
-->`,
          }}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <UrgentAnnouncements />
    </QueryClientProvider>
  );
}
