import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "News & events · Alpha Schools" }] }),
  component: makeStubRoute("News & events", "Full listing coming next."),
});
