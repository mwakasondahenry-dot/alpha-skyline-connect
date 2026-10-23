/**
 * One story: its own page on a phone, the panel beside the list from 1024px.
 * `/admin/stories/new` is the same screen, empty, for a story typed in by hand.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, adminButtonClass } from "@/components/admin/kit";
import { StoryDetail } from "@/components/admin/stories/story-detail";
import { useSignedPhotos, useStoriesQuery } from "@/components/admin/stories/use-stories";
import { friendlyError } from "@/lib/admin/errors";

export const Route = createFileRoute("/admin/stories/$id")({
  head: () => ({ meta: [{ title: "Story · Alpha Schools Admin" }] }),
  component: StoryRoute,
});

function StoryRoute() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const query = useStoriesQuery();
  const stories = query.data;
  const signed = useSignedPhotos(stories);

  if (id === "new") {
    return (
      <StoryDetail
        key="new"
        story={null}
        stories={stories ?? []}
        signed={signed}
        backTab={tab ?? "hidden"}
      />
    );
  }

  if (query.isPending) {
    return <p className="text-sm text-[var(--color-ink-soft)] lg:p-5">Loading the story…</p>;
  }
  if (query.error && !stories) {
    return (
      <p role="alert" className="text-sm text-[var(--color-danger)] lg:p-5">
        {friendlyError(query.error)}
      </p>
    );
  }

  const story = stories?.find((s) => s.id === id);
  if (!story) {
    return (
      <EmptyState
        className="lg:m-5"
        title="This story is not here any more."
        body="It may have been deleted. The list shows every story there is."
        action={
          <Link to="/admin/stories" search={{ tab }} className={adminButtonClass("secondary")}>
            All stories
          </Link>
        }
      />
    );
  }

  return (
    <StoryDetail
      key={story.id}
      story={story}
      stories={stories ?? []}
      signed={signed}
      backTab={tab ?? story.status}
    />
  );
}
