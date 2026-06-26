import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/scholarships")({
  head: () => ({ meta: [{ title: "Scholarships · Alpha Schools" }] }),
  component: makeStubRoute("Scholarships", "Bursary and scholarship details — coming next."),
});
