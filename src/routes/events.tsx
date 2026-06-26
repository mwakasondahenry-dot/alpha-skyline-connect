import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events · Alpha Schools" }] }),
  component: makeStubRoute("Events", "Full events calendar — coming next."),
});
