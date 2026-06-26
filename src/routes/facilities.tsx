import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/facilities")({
  head: () => ({ meta: [{ title: "Facilities · Alpha Schools" }] }),
  component: makeStubRoute("Facilities", "Campus facilities tour — coming next."),
});
