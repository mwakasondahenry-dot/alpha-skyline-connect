/** One message: its own page on a phone, the panel beside the list from 1024px. */
import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, adminButtonClass } from "@/components/admin/kit";
import { EnquiryDetail } from "@/components/admin/inbox/enquiry-detail";
import { useEnquiriesQuery } from "@/components/admin/inbox/use-inbox";
import { friendlyError } from "@/lib/admin/errors";
import { tabOfStatus } from "@/lib/admin/inbox-view";

export const Route = createFileRoute("/admin/inbox/$id")({
  head: () => ({ meta: [{ title: "Message · Alpha Schools Admin" }] }),
  component: EnquiryRoute,
});

function EnquiryRoute() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const query = useEnquiriesQuery();
  const list = query.data;

  if (query.isPending) {
    return <p className="text-sm text-[var(--color-ink-soft)] lg:p-5">Loading the message…</p>;
  }
  if (query.error && !list) {
    return (
      <p role="alert" className="text-sm text-[var(--color-danger)] lg:p-5">
        {friendlyError(query.error)}
      </p>
    );
  }

  const enquiry = list?.find((e) => e.id === id);
  if (!enquiry) {
    return (
      <EmptyState
        className="lg:m-5"
        title="This message is not here any more."
        body="It may have been deleted. The inbox shows every message there is."
        action={
          <Link to="/admin/inbox" search={{ tab }} className={adminButtonClass("secondary")}>
            All messages
          </Link>
        }
      />
    );
  }

  return (
    <EnquiryDetail
      key={enquiry.id}
      enquiry={enquiry}
      backTab={tab ?? tabOfStatus(enquiry.status)}
    />
  );
}
