import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Alpha Schools" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminGate />
    </AdminAuthProvider>
  );
}

function AdminGate() {
  const { ready, session, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!ready) return;
    if (!session && !isLoginPage) {
      navigate({ to: "/admin/login", replace: true });
    } else if (session && isLoginPage) {
      navigate({ to: "/admin", replace: true });
    }
  }, [ready, session, isLoginPage, navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-off-white)]">
        <div className="text-sm text-[var(--color-deep-blue)]">Loading admin…</div>
      </div>
    );
  }

  // Login page renders without the shell.
  if (isLoginPage) return <Outlet />;

  // Awaiting redirect to login.
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-off-white)]">
        <div className="text-sm text-[var(--color-deep-blue)]">Redirecting to sign in…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <header className="border-b border-[var(--color-deep-blue)]/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link to="/admin" className="text-base font-semibold text-[var(--color-deep-blue)]">
            Alpha Schools <span className="text-[var(--color-gold)]">Admin</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <AdminNavLink to="/admin">Dashboard</AdminNavLink>
            <AdminNavLink to="/admin/news">News</AdminNavLink>
            <AdminNavLink to="/admin/events">Events</AdminNavLink>
            <AdminNavLink to="/admin/gallery">Activities</AdminNavLink>
            <AdminNavLink to="/admin/facility-photos">Facilities Gallery</AdminNavLink>
            <AdminNavLink to="/admin/hero-slides">Hero slides</AdminNavLink>
            <AdminNavLink to="/admin/testimonials">Testimonials</AdminNavLink>
            <AdminNavLink to="/admin/staff">Staff</AdminNavLink>

            <button
              type="button"
              onClick={() => {
                void signOut();
              }}
              className="ml-2 rounded-md border border-[var(--color-deep-blue)]/20 px-3 py-1.5 text-[var(--color-deep-blue)] transition hover:bg-[var(--color-deep-blue)] hover:text-white"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

function AdminNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/admin" }}
      className="rounded-md px-3 py-1.5 text-[var(--color-ink)] transition hover:bg-[var(--color-deep-blue)]/5"
      activeProps={{ className: "rounded-md px-3 py-1.5 bg-[var(--color-deep-blue)] text-white" }}
    >
      {children}
    </Link>
  );
}
