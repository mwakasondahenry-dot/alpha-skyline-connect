import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery · Alpha Schools" }] }),
  component: makeStubRoute("Gallery", "Campus photos — coming next."),
});
