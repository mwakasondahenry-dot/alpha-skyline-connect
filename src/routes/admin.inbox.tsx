/**
 * Inbox: enquiries from the website's contact form, under New (still to
 * answer) and Done, with the message beside the list on a desktop (≥ 1024px)
 * or as its own page on a phone. Parents are promised a reply within one
 * working day, so New is a queue to empty.
 *
 * The list never blanks while it refreshes (previous data is kept), and tabs
 * and rows do not animate in; only a message that leaves a list does.
 */
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import * as Tabs from "@radix-ui/react-tabs";
import {
  CountBadge,
  EmptyState,
  RowStateProvider,
  adminDetailPanelClass,
  adminListDetailGridClass,
  adminTabListClass,
  adminTabTriggerClass,
} from "@/components/admin/kit";
import { EnquiryCard } from "@/components/admin/inbox/enquiry-card";
import { useEnquiriesQuery } from "@/components/admin/inbox/use-inbox";
import { friendlyError } from "@/lib/admin/errors";
import type { Enquiry } from "@/lib/admin/inbox-data";
import {
  INBOX_TABS,
  INBOX_TAB_LABEL,
  enquiriesForTab,
  inboxTabCounts,
  isInboxTab,
  type InboxTab,
} from "@/lib/admin/inbox-view";

type InboxSearch = { tab?: InboxTab };

export const Route = createFileRoute("/admin/inbox")({
  head: () => ({ meta: [{ title: "Inbox · Alpha Schools Admin" }] }),
  validateSearch: (search: Record<string, unknown>): InboxSearch =>
    isInboxTab(search.tab) ? { tab: search.tab } : {},
  component: InboxLayout,
});

function trimSlash(p: string) {
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

function InboxLayout() {
  const pathname = useRouterState({ select: (s) => trimSlash(s.location.pathname) });
  const detailId = pathname.startsWith("/admin/inbox/")
    ? decodeURIComponent(pathname.slice("/admin/inbox/".length))
    : null;
  return (
    <RowStateProvider>
      <InboxScreen detailId={detailId} />
    </RowStateProvider>
  );
}

function InboxScreen({ detailId }: { detailId: string | null }) {
  const { tab = "new" } = Route.useSearch();
  const navigate = useNavigate();
  const query = useEnquiriesQuery();
  const list = query.data;
  const counts = list ? inboxTabCounts(list) : null;

  function setTab(next: string) {
    if (!isInboxTab(next)) return;
    void navigate({
      to: detailId ? "/admin/inbox/$id" : "/admin/inbox",
      params: detailId ? { id: detailId } : undefined,
      search: { tab: next },
      replace: true,
    });
  }

  return (
    <div className="space-y-5">
      {/* On a phone an open message is its own page: the list waits underneath. */}
      <div className={detailId ? "hidden lg:block" : undefined}>
        <header>
          <h1 className="font-display text-2xl font-bold text-[var(--color-deep-blue)]">Inbox</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
            Enquiries from the contact form on the website. Parents are told to expect a reply
            within one working day.
          </p>
        </header>
      </div>

      <Tabs.Root value={tab} onValueChange={setTab} activationMode="manual">
        <div className={detailId ? "hidden lg:block" : undefined}>
          <Tabs.List aria-label="Enquiries" className={adminTabListClass}>
            {INBOX_TABS.map((t) => (
              <Tabs.Trigger key={t} value={t} className={adminTabTriggerClass}>
                {INBOX_TAB_LABEL[t]}
                {counts ? (
                  t === "new" ? (
                    <CountBadge n={counts.new} label="to answer" />
                  ) : (
                    <span className="tabular-nums font-normal">
                      <span aria-hidden>{counts.done}</span>
                      <span className="sr-only">, {counts.done} messages</span>
                    </span>
                  )
                ) : null}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>

        <div className={adminListDetailGridClass}>
          <div className={detailId ? "hidden lg:block" : undefined}>
            {INBOX_TABS.map((t) => (
              <Tabs.Content key={t} value={t} className="focus-visible:outline-none">
                {query.isPending ? (
                  <p className="text-sm text-[var(--color-ink-soft)]">Loading messages…</p>
                ) : query.error && !list ? (
                  <p role="alert" className="text-sm text-[var(--color-danger)]">
                    {friendlyError(query.error)}
                  </p>
                ) : list ? (
                  <InboxTabList tab={t} list={list} selectedId={detailId} />
                ) : null}
              </Tabs.Content>
            ))}
          </div>

          <div className={adminDetailPanelClass}>
            {detailId ? (
              <Outlet />
            ) : (
              <p className="hidden px-6 py-16 text-center text-sm text-[var(--color-ink-soft)] lg:block">
                Choose a message to read it here.
              </p>
            )}
          </div>
        </div>
      </Tabs.Root>
    </div>
  );
}

const EMPTY: Record<InboxTab, { title: string; body: string }> = {
  new: {
    title: "No messages waiting for an answer.",
    body: "Enquiries sent from the contact form on the website arrive here.",
  },
  done: {
    title: "Nothing marked as done yet.",
    body: "Messages you mark as done are kept here.",
  },
};

function InboxTabList({
  tab,
  list,
  selectedId,
}: {
  tab: InboxTab;
  list: Enquiry[];
  selectedId: string | null;
}) {
  const navigate = useNavigate();
  const items = enquiriesForTab(list, tab);

  if (items.length === 0) {
    return <EmptyState headingLevel={2} title={EMPTY[tab].title} body={EMPTY[tab].body} />;
  }
  return (
    <ul className="space-y-2">
      {items.map((e) => (
        <li key={e.id}>
          <EnquiryCard
            enquiry={e}
            selected={selectedId === e.id}
            onOpen={() =>
              void navigate({ to: "/admin/inbox/$id", params: { id: e.id }, search: { tab } })
            }
          />
        </li>
      ))}
    </ul>
  );
}
