/** One former student: their own page on a phone, the panel beside the list from 1024px. */
import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, adminButtonClass } from "@/components/admin/kit";
import { PersonDetail } from "@/components/admin/alumni/person-detail";
import { useAlumniQuery } from "@/components/admin/alumni/use-alumni";
import { friendlyError } from "@/lib/admin/errors";

export const Route = createFileRoute("/admin/alumni/$key")({
  head: () => ({ meta: [{ title: "Former student · Alpha Schools Admin" }] }),
  component: PersonRoute,
});

function PersonRoute() {
  const { key } = Route.useParams();
  const search = Route.useSearch();
  const query = useAlumniQuery();
  const data = query.data;

  if (query.isPending) {
    return <p className="text-sm text-[var(--color-ink-soft)] lg:p-5">Loading…</p>;
  }
  if (query.error && !data) {
    return (
      <p role="alert" className="text-sm text-[var(--color-danger)] lg:p-5">
        {friendlyError(query.error)}
      </p>
    );
  }

  const person = data?.people.find((p) => p.key === key);
  if (!data || !person) {
    return (
      <EmptyState
        className="lg:m-5"
        title="This person is not in the list any more."
        body="Their invite or story may have been deleted. The Alumni list shows everyone there is."
        action={
          <Link to="/admin/alumni" search={search} className={adminButtonClass("secondary")}>
            All former students
          </Link>
        }
      />
    );
  }

  return (
    <PersonDetail
      key={person.key}
      person={person}
      invite={data.invites.find((i) => i.id === person.inviteId) ?? null}
      story={data.stories.find((s) => s.id === person.storyId) ?? null}
      search={search}
    />
  );
}
