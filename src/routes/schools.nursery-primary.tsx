import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/schools/nursery-primary")({
  head: () => ({ meta: [{ title: "Nursery & Primary · Alpha Schools" }] }),
  component: makeStubRoute(
    "Nursery & Primary",
    "Ages 2–12 at the Kunduchi campus. Full page coming after homepage sign-off.",
  ),
});
