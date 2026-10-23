import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronRight, Images, Inbox, MessageSquareQuote, type LucideIcon } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { totalNeedingAttention, useAdminCounts } from "@/lib/admin/counts";
import { formatAdminDate, schoolLabel } from "@/lib/admin/format";
import type { AdminStory } from "@/lib/admin/stories-data";
import { EmptyState } from "@/components/admin/kit";
import { linkTo } from "@/components/admin/shell/nav";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Today · Alpha Schools Admin" }] }),
  component: AdminToday,
});

type RecentStory = Pick<
  AdminStory,
  "id" | "author_name" | "relationship" | "school_slug" | "decided_at"
>;

function useRecentlyPublished() {
  const { client, session } = useAdminAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["admin", "today", "recent-live"],
    enabled: !!client && !!userId,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<RecentStory[]> => {
      const { data, error } = await client!
        .from("testimonials")
        .select("id,author_name,relationship,school_slug,decided_at")
        .eq("status", "live")
        .order("decided_at", { ascending: false, nullsFirst: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as RecentStory[];
    },
  });
}

function AdminToday() {
  const counts = useAdminCounts();
  const recent = useRecentlyPublished();
  const allClear = !counts.loading && !counts.error && totalNeedingAttention(counts) === 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-[var(--color-deep-blue)]">Today</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          {allClear ? "Nothing needs you right now." : "What is waiting for someone at the school."}
        </p>
      </header>

      {counts.error ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          The counts could not be loaded. Check the internet connection; they will try again in a
          minute.
        </p>
      ) : null}

      <ul className="grid gap-3 md:grid-cols-3" aria-busy={counts.loading || undefined}>
        <CountCard
          to="/admin/stories"
          icon={MessageSquareQuote}
          n={counts.storiesWaiting}
          loading={counts.loading}
          label="Stories waiting"
          hint="Read each one, then publish or decline."
        />
        <CountCard
          to="/admin/inbox"
          icon={Inbox}
          n={counts.inboxNew}
          loading={counts.loading}
          label="New enquiries"
          hint="Messages from the contact form."
        />
        <CountCard
          to="/admin/photos"
          icon={Images}
          n={counts.photosEmpty}
          loading={counts.loading}
          label="Photo positions still empty"
          hint="Places on the school pages with no photo yet."
        />
      </ul>

      <section aria-labelledby="recent-heading" className="space-y-3">
        <h2
          id="recent-heading"
          className="font-display text-lg font-bold text-[var(--color-deep-blue)]"
        >
          Recently published stories
        </h2>
        {recent.error ? (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            The recent stories could not be loaded. Check the internet connection and reload the
            page.
          </p>
        ) : recent.isPending ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : recent.data && recent.data.length > 0 ? (
          <ul className="divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
            {recent.data.map((s) => (
              <li key={s.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-4 py-3">
                <span className="font-semibold text-[var(--color-deep-blue)]">{s.author_name}</span>
                <span className="text-sm text-[var(--color-ink-soft)]">
                  {[s.relationship, schoolLabel(s.school_slug)].filter(Boolean).join(" · ")}
                </span>
                {s.decided_at ? (
                  <span className="ml-auto text-sm tabular-nums text-[var(--color-ink-soft)]">
                    {formatAdminDate(s.decided_at)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            headingLevel={3}
            title="No stories published yet."
            body="Stories you publish from Stories appear here."
          />
        )}
      </section>
    </div>
  );
}

function CountCard({
  to,
  icon: Icon,
  n,
  loading,
  label,
  hint,
}: {
  to: string;
  icon: LucideIcon;
  n: number;
  loading: boolean;
  label: string;
  hint: string;
}) {
  return (
    <li>
      <Link
        to={linkTo(to)}
        className="admin-hover flex min-h-11 items-center gap-4 rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] md:h-full md:flex-col md:items-start md:gap-3 md:p-5"
      >
        <span className="grid h-[var(--disc-size-sm)] w-[var(--disc-size-sm)] shrink-0 place-items-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-deep-blue)]">
          <Icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold tabular-nums leading-none text-[var(--color-deep-blue)]">
              {loading ? (
                <>
                  <span aria-hidden>–</span>
                  <span className="sr-only">Loading</span>
                </>
              ) : (
                n
              )}
            </span>
            <span className="font-semibold text-[var(--color-deep-blue)]">{label}</span>
          </span>
          <span className="mt-1 block text-sm leading-snug text-[var(--color-ink-soft)]">
            {hint}
          </span>
        </span>
        <ChevronRight
          aria-hidden
          className="h-5 w-5 shrink-0 text-[var(--color-ink-soft)] md:hidden"
          strokeWidth={2}
        />
      </Link>
    </li>
  );
}
