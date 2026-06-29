import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdminAuth } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard · Alpha Schools Admin" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { session } = useAdminAuth();
  const email = session?.user?.email ?? "";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#0C447C]">Welcome back</h1>
        <p className="mt-1 text-sm text-[#2C2C2A]/70">
          Signed in as <span className="font-medium">{email}</span>
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashCard title="News" href="/admin/news" hint="Post updates" />
        <DashCard title="Events" href="/admin/events" hint="Add upcoming events" />
        <DashCard title="Activities Gallery" href="/admin/gallery" hint="School-life photos" />
        <DashCard title="Facilities Gallery" href="/admin/facility-photos" hint="Photos per facility" />
        <DashCard title="Staff" href="/admin/staff" hint="Manage team profiles" />
      </div>

      <div className="rounded-xl border border-dashed border-[#0C447C]/20 bg-white p-6 text-sm text-[#2C2C2A]/70">
        Counts and quick-add shortcuts will appear here once the content sections
        are connected in the next step.
      </div>
    </div>
  );
}

function DashCard({ title, href, hint }: { title: string; href: string; hint: string }) {
  return (
    <Link
      to={href}
      className="group rounded-xl border border-[#0C447C]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-[#E8A020]">{hint}</div>
      <div className="mt-1 text-lg font-bold text-[#0C447C] group-hover:underline">{title} →</div>
    </Link>
  );
}
