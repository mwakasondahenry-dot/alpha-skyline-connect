import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/coding")({
  head: () => ({ meta: [{ title: "Coding · Alpha Schools" }] }),
  component: makeStubRoute("Coding & digital skills", "Coming next."),
});
