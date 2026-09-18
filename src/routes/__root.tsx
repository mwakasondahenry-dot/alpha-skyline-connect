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
import { reportLovableError } from "../lib/lovable-error-reporting";
import { UrgentAnnouncements } from "../components/urgent-announcements";
import { RevealWatcher } from "../components/reveal";

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
      { title: "Alpha Schools" },
      {
        name: "description",
        content:
          "Three schools, two campuses in Dar es Salaam. [Aviation positioning statement — wording to be confirmed]",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Alpha Schools" },
      { name: "twitter:title", content: "Alpha Schools" },
      { name: "description", content: "Alpha Schools website showcases educational offerings, campus finder, news, and events." },
      { property: "og:description", content: "Alpha Schools website showcases educational offerings, campus finder, news, and events." },
      { name: "twitter:description", content: "Alpha Schools website showcases educational offerings, campus finder, news, and events." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/9fsIYijJomVf9VXNEbIilVCAzqB2/social-images/social-1782718904373-5R5A4481.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/9fsIYijJomVf9VXNEbIilVCAzqB2/social-images/social-1782718904373-5R5A4481.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/webp", href: alphaLogo },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800;900&family=Hanken+Grotesk:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    /* The head script below adds class="rv-on" and data-rv-ready here
       before hydration, so React would otherwise report an attribute
       mismatch it cannot patch. Scoped to this element only. */
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Scroll-reveal opt-in. src/styles.css only hides a [data-reveal]
            block while this class is on <html>, so the server-rendered HTML
            is fully visible on its own — a reader with no JS, or one whose
            bundle fails, never sees a blank page. The timer is the second
            half of that guarantee: RevealWatcher stamps data-rv-ready when it
            mounts, and if that never happens within 1.2s the class is dropped
            and every block falls back to visible. A slow phone must never be
            left looking at a blank section, so that window is short.

            It also never hides anything when the page loads in a background
            tab: IntersectionObserver does not deliver callbacks there, so the
            reveal would have nothing to trigger it and the content would sit
            invisible until the reader came back to the tab.

            It has to run here, in the head, rather than on hydration: hiding
            has to be in effect before first paint or a revealed block would
            flash visible and then vanish. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html:
              'var e=document.documentElement;' +
              'if(document.visibilityState==="visible"){e.classList.add("rv-on");' +
              'setTimeout(function(){if(!e.hasAttribute("data-rv-ready"))' +
              'e.classList.remove("rv-on")},1200);}',
          }}
        />
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
      <RevealWatcher />
      <Outlet />
      <UrgentAnnouncements />
    </QueryClientProvider>
  );
}
