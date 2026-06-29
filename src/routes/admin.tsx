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
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5EF]">
        <div className="text-sm text-[#0C447C]">Loading admin…</div>
      </div>
    );
  }

  // Login page renders without the shell.
  if (isLoginPage) return <Outlet />;

  // Awaiting redirect to login.
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5EF]">
        <div className="text-sm text-[#0C447C]">Redirecting to sign in…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#2C2C2A]">
      <header className="border-b border-[#0C447C]/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link to="/admin" className="text-base font-semibold text-[#0C447C]">
            Alpha Schools <span className="text-[#E8A020]">Admin</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <AdminNavLink to="/admin">Dashboard</AdminNavLink>
            <AdminNavLink to="/admin/news">News</AdminNavLink>
            <AdminNavLink to="/admin/events">Events</AdminNavLink>
            <AdminNavLink to="/admin/gallery">Gallery</AdminNavLink>
            <AdminNavLink to="/admin/staff">Staff</AdminNavLink>
            <button
              type="button"
              onClick={() => {
                void signOut();
              }}
              className="ml-2 rounded-md border border-[#0C447C]/20 px-3 py-1.5 text-[#0C447C] transition hover:bg-[#0C447C] hover:text-white"
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
      className="rounded-md px-3 py-1.5 text-[#2C2C2A] transition hover:bg-[#0C447C]/5"
      activeProps={{ className: "rounded-md px-3 py-1.5 bg-[#0C447C] text-white" }}
    >
      {children}
    </Link>
  );
}
