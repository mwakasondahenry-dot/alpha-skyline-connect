import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About · Alpha Schools" }] }),
  component: makeStubRoute("About Alpha", "Mission, vision, values and the crest — coming next."),
});
