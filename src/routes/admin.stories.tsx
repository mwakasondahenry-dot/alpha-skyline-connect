/**
 * Stories: every testimonial by state (Waiting, Live, Hidden, Declined), and
 * the story detail beside the list on a desktop (≥ 1024px) or as its own page
 * on a phone. The Invite people page is a child too, but stands alone.
 *
 * The list never blanks while it refreshes (previous data is kept), and tabs
 * and rows do not animate in; only a story that leaves a list does.
 */
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import * as Tabs from "@radix-ui/react-tabs";
import { Plus, Send } from "lucide-react";
import { CountBadge, EmptyState, adminButtonClass, useOutcome } from "@/components/admin/kit";
import { FeaturedStrip } from "@/components/admin/stories/featured-strip";
import { StoryCard } from "@/components/admin/stories/story-card";
import {
  CONFLICT,
  StoriesUiProvider,
  useSignedPhotos,
  useStoriesQuery,
  useStoriesUi,
  useStoryData,
} from "@/components/admin/stories/use-stories";
import { friendlyError } from "@/lib/admin/errors";
import { swapFeaturedOrder, type AdminStory } from "@/lib/admin/stories-data";
import { STATUS_LABEL, type StoryStatus } from "@/lib/admin/story-status";
import {
  STORY_TABS,
  isStoryTab,
  possessive,
  shownPhoto,
  storiesForTab,
  tabCounts,
} from "@/lib/admin/stories-view";

type StoriesSearch = { tab?: StoryStatus };

export const Route = createFileRoute("/admin/stories")({
  head: () => ({ meta: [{ title: "Stories · Alpha Schools Admin" }] }),
  validateSearch: (search: Record<string, unknown>): StoriesSearch =>
    isStoryTab(search.tab) ? { tab: search.tab } : {},
  component: StoriesLayout,
});

function trimSlash(p: string) {
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

function StoriesLayout() {
  const pathname = useRouterState({ select: (s) => trimSlash(s.location.pathname) });
  if (pathname === "/admin/stories/invite") return <Outlet />;
  const detailId = pathname.startsWith("/admin/stories/")
    ? decodeURIComponent(pathname.slice("/admin/stories/".length))
    : null;
  return (
    <StoriesUiProvider>
      <StoriesScreen detailId={detailId} />
    </StoriesUiProvider>
  );
}

function StoriesScreen({ detailId }: { detailId: string | null }) {
  const { tab = "waiting" } = Route.useSearch();
  const navigate = useNavigate();
  const query = useStoriesQuery();
  const stories = query.data;
  const signed = useSignedPhotos(stories);
  const counts = stories ? tabCounts(stories) : null;

  function setTab(next: string) {
    if (!isStoryTab(next)) return;
    void navigate({
      to: detailId ? "/admin/stories/$id" : "/admin/stories",
      params: detailId ? { id: detailId } : undefined,
      search: { tab: next },
      replace: true,
    });
  }

  return (
    <div className="space-y-5">
      {/* On a phone an open story is its own page: the list waits underneath. */}
      <div className={detailId ? "hidden lg:block" : undefined}>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--color-deep-blue)]">
              Stories
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              What parents and former students have written. Nothing goes on the website until you
              publish it.
            </p>
          </div>
          <Link to="/admin/stories/invite" className={adminButtonClass("secondary")}>
            <Send aria-hidden className="h-4 w-4" strokeWidth={2} />
            Invite people
          </Link>
        </header>
      </div>

      <Tabs.Root value={tab} onValueChange={setTab} activationMode="manual">
        <div className={detailId ? "hidden lg:block" : undefined}>
          <Tabs.List
            aria-label="Stories by state"
            className="-mx-4 flex overflow-x-auto border-b border-[var(--color-hairline)] px-4 sm:mx-0 sm:px-0"
          >
            {STORY_TABS.map((t) => (
              <Tabs.Trigger
                key={t}
                value={t}
                className="-mb-px inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-deep-blue)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-gold)] data-[state=active]:border-[var(--color-deep-blue)] data-[state=active]:text-[var(--color-deep-blue)] sm:px-4"
              >
                {STATUS_LABEL[t]}
                {counts ? (
                  t === "waiting" ? (
                    <CountBadge n={counts.waiting} label="waiting" />
                  ) : (
                    <span className="tabular-nums font-normal">
                      <span aria-hidden>{counts[t]}</span>
                      <span className="sr-only">, {counts[t]} stories</span>
                    </span>
                  )
                ) : null}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>

        <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <div className={detailId ? "hidden lg:block" : undefined}>
            {STORY_TABS.map((t) => (
              <Tabs.Content key={t} value={t} className="focus-visible:outline-none">
                {query.isPending ? (
                  <p className="text-sm text-[var(--color-ink-soft)]">Loading stories…</p>
                ) : query.error && !stories ? (
                  <p role="alert" className="text-sm text-[var(--color-danger)]">
                    {friendlyError(query.error)}
                  </p>
                ) : stories ? (
                  <StoryTab tab={t} stories={stories} signed={signed} selectedId={detailId} />
                ) : null}
              </Tabs.Content>
            ))}
          </div>

          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:rounded-[var(--radius-card)] lg:border lg:border-[var(--color-hairline)] lg:bg-[var(--color-surface)] lg:shadow-[var(--shadow-card)]">
            {detailId ? (
              <Outlet />
            ) : (
              <p className="hidden px-6 py-16 text-center text-sm text-[var(--color-ink-soft)] lg:block">
                Choose a story to read it here.
              </p>
            )}
          </div>
        </div>
      </Tabs.Root>
    </div>
  );
}

function StoryTab({
  tab,
  stories,
  signed,
  selectedId,
}: {
  tab: StoryStatus;
  stories: AdminStory[];
  signed: Record<string, string>;
  selectedId: string | null;
}) {
  const navigate = useNavigate();
  const outcome = useOutcome();
  const ui = useStoriesUi();
  const data = useStoryData();
  const { featured, rest } = storiesForTab(stories, tab);
  const photoOf = (s: AdminStory) => shownPhoto(s, signed);

  function open(s: AdminStory) {
    void navigate({ to: "/admin/stories/$id", params: { id: s.id }, search: { tab } });
  }

  async function moveFeatured(index: number, direction: -1 | 1) {
    const a = featured[index];
    const b = featured[index + direction];
    if (!a || !b || !data.client) return;
    if (a.featured_order == null || b.featured_order == null) {
      ui.setError(a.id, friendlyError(CONFLICT));
      await data.refreshStory(a.id);
      return;
    }
    const aOrder = a.featured_order;
    const bOrder = b.featured_order;
    const ok = await data.run(a.id, () =>
      swapFeaturedOrder(data.client!, { id: a.id, order: aOrder }, { id: b.id, order: bOrder }),
    );
    if (!ok) {
      await data.refreshStory(b.id);
      return;
    }
    data.patch(a.id, { featured_order: bOrder });
    data.patch(b.id, { featured_order: aOrder });
    outcome.show({
      text: `Moved ${possessive(a.author_name)} story ${direction < 0 ? "up" : "down"} on the home page.`,
    });
  }

  const newStory =
    tab === "live" || tab === "hidden" ? (
      <Link
        to="/admin/stories/$id"
        params={{ id: "new" }}
        search={{ tab }}
        className={adminButtonClass("secondary")}
      >
        <Plus aria-hidden className="h-4 w-4" strokeWidth={2} />
        New story
      </Link>
    ) : null;

  if (featured.length === 0 && rest.length === 0) {
    if (tab === "waiting") return <CaughtUp />;
    const copy: Record<Exclude<StoryStatus, "waiting">, { title: string; body: string }> = {
      live: {
        title: "No stories on the website yet.",
        body: "Stories you publish from Waiting appear here.",
      },
      hidden: {
        title: "No hidden stories.",
        body: "Stories taken off the website, and stories typed in by hand, wait here.",
      },
      declined: {
        title: "No declined stories.",
        body: "Stories you decline are kept here, so they can be restored.",
      },
    };
    return (
      <EmptyState
        headingLevel={2}
        title={copy[tab].title}
        body={copy[tab].body}
        action={newStory}
      />
    );
  }

  return (
    <div className="space-y-5">
      {newStory ? <div className="flex justify-end">{newStory}</div> : null}
      {tab === "live" ? (
        <FeaturedStrip
          stories={featured}
          photoOf={photoOf}
          selectedId={selectedId}
          onOpen={open}
          onMove={(i, d) => void moveFeatured(i, d)}
        />
      ) : null}
      {rest.length > 0 ? (
        <section
          aria-label={tab === "live" && featured.length > 0 ? "Other live stories" : undefined}
        >
          {tab === "live" && featured.length > 0 ? (
            <h2 className="mb-2 font-display text-base font-bold text-[var(--color-deep-blue)]">
              Also on the website
            </h2>
          ) : null}
          <ul className="space-y-2">
            {rest.map((s) => (
              <li key={s.id}>
                <StoryCard
                  story={s}
                  photo={photoOf(s)}
                  selected={selectedId === s.id}
                  onOpen={() => open(s)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/** The one delight moment: the last waiting story handled. The check draws once. */
function CaughtUp() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-hairline)] bg-[var(--color-surface)] px-6 py-10 text-center">
      <svg
        aria-hidden
        viewBox="0 0 48 48"
        className="h-12 w-12"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="24" cy="24" r="24" fill="var(--color-gold)" />
        <path
          d="M14 25l7 7 13-15"
          pathLength={1}
          stroke="var(--color-accent-foreground)"
          strokeWidth={4}
          className="admin-draw"
        />
      </svg>
      <h2 className="font-display text-base font-bold text-[var(--color-deep-blue)]">
        All caught up
      </h2>
      <p className="max-w-sm text-sm leading-relaxed text-[var(--color-ink-soft)]">
        No stories are waiting. New ones from the invite links arrive here.
      </p>
    </div>
  );
}
