import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";
import { noindexHead } from "@/lib/seo";
import { loginRedirect, safeRedirect } from "@/lib/admin/drafts";
import { useAdminCounts } from "@/lib/admin/counts";
import { OutcomeProvider } from "@/components/admin/kit";
import { Sidebar } from "@/components/admin/shell/sidebar";
import { BottomBar } from "@/components/admin/shell/bottom-bar";
import { MoreSheet } from "@/components/admin/shell/more-sheet";

export const Route = createFileRoute("/admin")({
  ssr: false,
  /* Applies to every /admin/* page: a child route sets its own title and
     nothing else, so the robots tag from this layout is what they all serve.
     robots.txt disallows /admin as well, which is belt and braces — the tree
     is behind a login wall and has nothing worth crawling either way. */
  head: () => noindexHead("Admin · Alpha Schools"),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminGate />
    </AdminAuthProvider>
  );
}

function trimSlash(p: string) {
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

function AdminGate() {
  const { ready, session, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => trimSlash(s.location.pathname) });
  const redirectParam = useRouterState({
    select: (s) => (s.location.search as { redirect?: unknown }).redirect,
  });
  const isLoginPage = pathname === "/admin/login";

  // A deliberate sign-out goes to a plain login page; an expired session
  // remembers where it was so sign-in can return there.
  const leaving = useRef(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!session && !isLoginPage) {
      const href = leaving.current ? "/admin/login" : loginRedirect(pathname);
      leaving.current = false;
      navigate({ href, replace: true });
    } else if (session && isLoginPage) {
      navigate({
        href: safeRedirect(typeof redirectParam === "string" ? redirectParam : null),
        replace: true,
      });
    }
  }, [ready, session, isLoginPage, pathname, redirectParam, navigate]);

  async function handleSignOut() {
    leaving.current = true;
    setSigningOut(true);
    try {
      await signOut();
      // The next person to sign in on this phone must not see these counts.
      queryClient.removeQueries({ queryKey: ["admin"] });
    } finally {
      setSigningOut(false);
    }
  }

  if (!ready) {
    return <GateMessage>Loading admin…</GateMessage>;
  }

  // Login page renders without the shell.
  if (isLoginPage) return <Outlet />;

  // Awaiting redirect to login.
  if (!session) {
    return <GateMessage>Redirecting to sign in…</GateMessage>;
  }

  return (
    <Shell
      pathname={pathname}
      email={session.user.email ?? ""}
      onSignOut={() => void handleSignOut()}
      signingOut={signingOut}
    />
  );
}

function GateMessage({ children }: { children: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-off-white)]">
      <p role="status" className="text-sm text-[var(--color-deep-blue)]">
        {children}
      </p>
    </div>
  );
}

function Shell({
  pathname,
  email,
  onSignOut,
  signingOut,
}: {
  pathname: string;
  email: string;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const counts = useAdminCounts();
  const [moreOpen, setMoreOpen] = useState(false);

  // A page change (a link in the sheet, Back) closes the More sheet.
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    // data-admin scopes the kit's dialog and sheet motion. On a phone the
    // outcome line sits above the 4rem bottom bar; from 768px it moves to
    // the top right and ignores this.
    <div
      data-admin=""
      className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)] [--admin-outcome-bottom:4.75rem] md:[--admin-outcome-bottom:1rem]"
    >
      <OutcomeProvider>
        <a
          href="#admin-main"
          className="sr-only z-50 rounded-[var(--radius-btn)] bg-[var(--color-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-deep-blue)] shadow-[var(--shadow-card)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Sidebar
          pathname={pathname}
          counts={counts}
          email={email}
          onSignOut={onSignOut}
          signingOut={signingOut}
        />
        <main
          id="admin-main"
          tabIndex={-1}
          className="pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] focus:outline-none md:pb-0 md:pl-64"
        >
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:py-10">
            <Outlet />
          </div>
        </main>
        <BottomBar
          pathname={pathname}
          counts={counts}
          moreOpen={moreOpen}
          onMore={() => setMoreOpen(true)}
        />
        <MoreSheet
          open={moreOpen}
          onOpenChange={setMoreOpen}
          pathname={pathname}
          email={email}
          onSignOut={onSignOut}
          signingOut={signingOut}
        />
      </OutcomeProvider>
    </div>
  );
}
