import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/admission")({
  head: () => ({ meta: [{ title: "Admission · Alpha Schools" }] }),
  component: makeStubRoute("How to apply", "Five-step admission process — coming next."),
});
