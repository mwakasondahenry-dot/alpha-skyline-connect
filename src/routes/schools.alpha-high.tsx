import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/schools/alpha-high")({
  head: () => ({ meta: [{ title: "Alpha High · Alpha Schools" }] }),
  component: makeStubRoute(
    "Alpha High",
    "Form 1–6 at the Mikocheni campus. Secondary template coming next.",
  ),
});
