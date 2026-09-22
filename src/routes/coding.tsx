import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/coding")({
  head: () => ({
    ...seo({
      title: "Coding — Alpha Schools, Dar es Salaam",
      description:
        "Coding and digital skills at Alpha Schools in Dar es Salaam. Details of the programme are still to be supplied by the school and are not yet published.",
      path: "/coding",
      noindex: true,
    }),
  }),
  component: makeStubRoute("Coding & digital skills", "Coming next."),
});
