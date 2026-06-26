import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/aviation")({
  head: () => ({ meta: [{ title: "Aviation · Alpha Schools" }] }),
  component: makeStubRoute(
    "Aviation programme",
    "The first school in Tanzania to teach aviation. Full flagship page coming next.",
  ),
});
