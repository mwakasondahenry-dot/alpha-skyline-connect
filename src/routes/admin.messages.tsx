import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The old Contact messages table. It became the Inbox, where enquiries are
 * read and answered; bookmarks and old links land there.
 */
export const Route = createFileRoute("/admin/messages")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/inbox", replace: true });
  },
});
