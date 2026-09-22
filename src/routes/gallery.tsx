import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    ...seo({
      title: "Gallery — Alpha Schools, Dar es Salaam",
      description:
        "Photographs of school life across the Alpha campuses in Mikocheni and Kunduchi, Dar es Salaam. The gallery is still being prepared by the school.",
      path: "/gallery",
      noindex: true,
    }),
  }),
  component: makeStubRoute("Gallery", "Campus photos — coming next."),
});
