import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/schools/alpha-girls")({
  head: () => ({ meta: [{ title: "Alpha Girls · Alpha Schools" }] }),
  component: makeStubRoute(
    "Alpha Girls",
    "Girls' secondary at the Kunduchi campus, Form 1–6. Coming next.",
  ),
});
